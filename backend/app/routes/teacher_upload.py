from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..services.extract_text_service import get_extractor
from ..services.stt_service import get_stt_client
from ..utils.audio import ensure_wav_pcm16_mono_16k
from ..services.notes_service import save_note


teacher_upload_bp = Blueprint("teacher_upload", __name__)


@teacher_upload_bp.post("/teacher/upload")
@jwt_required()
def teacher_upload():
    identity = get_jwt_identity() or {}
    role = identity.get("role")
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

    # Accept either 'file' (document) or 'audio'
    file = request.files.get("file")
    audio = request.files.get("audio")
    if not file and not audio:
        return jsonify({"error": "Either 'file' or 'audio' must be provided"}), 400
    if file and audio:
        return jsonify({"error": "Provide only one of 'file' or 'audio'"}), 400

    text: str = ""
    source_type: str
    original_filename: str | None = None

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

    note = save_note(
        school=school,
        class_name=class_name,
        subject=subject,
        topic=topic,
        text=text,
        uploaded_by=identity.get("email") or identity.get("id"),
        source_type=source_type,
        original_filename=original_filename,
        extra_meta={"language": request.form.get("language")} if source_type == "audio" else None,
    )

    return jsonify({"note": note}), 201



