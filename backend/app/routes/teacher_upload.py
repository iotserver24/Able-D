from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from ..services.extract_text_service import get_extractor
from ..services.stt_service import get_stt_client
from ..utils.audio import ensure_wav_pcm16_mono_16k
from ..services.notes_service import save_note
from ..services.ai_service import GeminiService
from ..services.tts_service import synthesize_text_to_mp3
from ..services.catbox_service import upload_file_to_catbox
import os
import tempfile
from pymongo.errors import PyMongoError


teacher_upload_bp = Blueprint("teacher_upload", __name__)


@teacher_upload_bp.post("/teacher/upload")
@jwt_required()
def teacher_upload():
    identity = get_jwt_identity()  # now email string
    claims = get_jwt() or {}
    role = claims.get("role")
    if role != "teacher":
        return jsonify({"error": "Forbidden"}), 403

    # Required metadata
    school = (request.form.get("school") or identity.get("school") or "").strip()
    class_name = (request.form.get("class") or request.form.get("className") or "").strip()
    subject = (request.form.get("subject") or "").strip()
    topic = (request.form.get("topic") or request.form.get("name") or "").strip()

    if not school:
        return jsonify({"error": "school is required"}), 400
    if not class_name:
        return jsonify({"error": "class is required"}), 400
    if not subject:
        return jsonify({"error": "subject is required"}), 400
    if not topic:
        return jsonify({"error": "topic is required"}), 400

    # Accept exactly one of: 'file' (document), 'audio', or 'text' (direct text)
    file = request.files.get("file")
    audio = request.files.get("audio")
    direct_text = (request.form.get("text") or "").strip()

    provided_count = sum([
        1 if file else 0,
        1 if audio else 0,
        1 if direct_text else 0,
    ])
    if provided_count == 0:
        return jsonify({"error": "Provide exactly one of 'file', 'audio', or 'text'"}), 400
    if provided_count > 1:
        return jsonify({"error": "Provide only one of 'file', 'audio', or 'text'"}), 400

    text: str = ""
    source_type: str
    original_filename: str | None = None

    # Resolve base text depending on source
    if direct_text:
        text = direct_text
        source_type = "text"
        original_filename = None
    else:
        with TemporaryDirectory() as tmpdir:
            if file:
                original_filename = file.filename
                tmp_path = Path(tmpdir) / file.filename
                file.save(str(tmp_path))
                extractor = get_extractor()
                results = extractor.extract(tmp_path)
                text = next(iter(results.values()), "")
                source_type = "document"
            else:
                original_filename = audio.filename if audio else None
                tmp_path = Path(tmpdir) / (audio.filename if audio else "audio")
                audio.save(str(tmp_path))
                path_to_use, _ = ensure_wav_pcm16_mono_16k(tmp_path)
                stt_client = get_stt_client(language=(request.form.get("language") or "en-US"))
                success, result = stt_client.transcribe(str(path_to_use))
                if not success:
                    return jsonify({"error": result}), 400
                text = result
                source_type = "audio"

    # Post-processing: generate dyslexie variant, synthesize TTS, and upload MP3 to Catbox
    variants = {}

    # 1) Dyslexie-adapted text via AI
    try:
        ai_service = GeminiService()
        ai_result = ai_service.generate_adaptive_notes(text=text, student_type="dyslexie")
        variants["dyslexie"] = ai_result.get("content") or ai_result.get("content", "")
        # Store AI tips optionally
        tips = ai_result.get("tips")
        if tips:
            variants.setdefault("meta", {})
            variants["meta"]["dyslexieTips"] = tips
    except RuntimeError as e:
        # Non-fatal: continue without dyslexie variant
        variants["dyslexieError"] = str(e)
    except ValueError as e:
        variants["dyslexieError"] = str(e)

    # 2) TTS: synthesize audio MP3, then upload to Catbox
    audio_url = None
    output_dir = os.getenv("OUTPUT_DIR", "./audio_output")
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    tmp_mp3 = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False, dir=output_dir, prefix='upload_tts_')
    tmp_mp3_path = Path(tmp_mp3.name)
    tmp_mp3.close()
    try:
        ok, msg = synthesize_text_to_mp3(text=text, out_path=tmp_mp3_path, voice=None)
        if ok and tmp_mp3_path.exists() and tmp_mp3_path.stat().st_size > 0:
            up_ok, up_msg = upload_file_to_catbox(tmp_mp3_path)
            if up_ok:
                audio_url = up_msg
            else:
                variants["audioUploadError"] = up_msg
        else:
            variants["audioSynthesisError"] = msg
    except OSError as e:
        variants["audioError"] = str(e)
    finally:
        if tmp_mp3_path.exists():
            try:
                tmp_mp3_path.unlink()
            except OSError:
                # Best-effort cleanup
                pass

    if audio_url:
        variants["audioUrl"] = audio_url

    try:
        note = save_note(
            school=school,
            class_name=class_name,
            subject=subject,
            topic=topic,
            text=text,
            uploaded_by=identity,
            source_type=source_type,
            original_filename=original_filename,
            extra_meta={"language": request.form.get("language")} if source_type == "audio" else None,
            variants=variants or None,
        )
    except PyMongoError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    return jsonify({"note": note}), 201



