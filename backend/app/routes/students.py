from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt

from ..services.notes_service import list_topics, get_note
from ..services.ai_service import GeminiService
from ..services.stt_service import get_stt_client
from ..services.tts_service import synthesize_text_to_mp3
from ..services.catbox_service import upload_file_to_catbox
from ..utils.audio import ensure_wav_pcm16_mono_16k
import tempfile
from pathlib import Path
import os


students_bp = Blueprint("students", __name__)


@students_bp.get("/students/topics")  # GET /api/students/topics?school=...&class=...&subject=...
@jwt_required()
def get_topics():
    claims = get_jwt() or {}
    role = claims.get("role")
    if role not in {"student", "teacher"}:
        return jsonify({"error": "Forbidden"}), 403

    school = (request.args.get("school") or claims.get("school") or "").strip()
    class_name = (request.args.get("class") or request.args.get("className") or "").strip()
    subject = (request.args.get("subject") or "").strip()
    if not school or not class_name or not subject:
        return jsonify({"error": "school, class, subject are required"}), 400

    topic_names = list_topics(school=school, class_name=class_name, subject=subject)
    # Convert topic names to Topic objects expected by frontend
    topics = [
        {
            "topic": topic_name,
            "school": school,
            "class": class_name,
            "subject": subject
        }
        for topic_name in topic_names
    ]
    return jsonify({"items": topics}), 200


@students_bp.get("/students/notes")  # GET /api/students/notes?school=...&class=...&subject=...&topic=...
@jwt_required()
def get_tailored_note():
    claims = get_jwt() or {}
    role = claims.get("role")
    if role not in {"student", "teacher"}:
        return jsonify({"error": "Forbidden"}), 403

    school = (request.args.get("school") or claims.get("school") or "").strip()
    class_name = (request.args.get("class") or request.args.get("className") or "").strip()
    subject = (request.args.get("subject") or "").strip()
    topic = (request.args.get("topic") or "").strip()
    student_type = (request.args.get("studentType") or request.args.get("student_type") or "").strip().lower()

    if not school or not class_name or not subject or not topic:
        return jsonify({"error": "school, class, subject, topic are required"}), 400

    note = get_note(school=school, class_name=class_name, subject=subject, topic=topic)
    if not note:
        return jsonify({"error": "Not found"}), 404

    # Tailor content
    content = note.get("text")
    variants = note.get("variants") or {}
    if student_type == "dyslexie" and variants.get("dyslexie"):
        content = variants.get("dyslexie")
    audio_url = variants.get("audioUrl")
    tips = (variants.get("meta") or {}).get("dyslexieTips")

    return jsonify({
        "note": {
            "school": note.get("school"),
            "class": note.get("class"),
            "subject": note.get("subject"),
            "topic": note.get("topic"),
            "studentType": student_type or None,
            "content": content,
            "audioUrl": audio_url,
            "tips": tips,
            "_id": note.get("_id"),
            "updatedAt": note.get("updatedAt"),
        }
    }), 200


@students_bp.post("/students/qna")  # POST /api/students/qna
@jwt_required()
def generate_qna():
    claims = get_jwt() or {}
    role = claims.get("role")
    if role not in {"student", "teacher"}:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(force=True) or {}
    school = (data.get("school") or claims.get("school") or "").strip()
    class_name = (data.get("class") or data.get("className") or "").strip()
    subject = (data.get("subject") or "").strip()
    topic = (data.get("topic") or "").strip()
    student_type = (data.get("studentType") or data.get("student_type") or "").strip().lower()
    question = (data.get("question") or "").strip()

    if not school or not class_name or not subject or not topic:
        return jsonify({"error": "school, class, subject, topic are required"}), 400
    if not student_type:
        return jsonify({"error": "studentType is required"}), 400
    if not question:
        return jsonify({"error": "question is required"}), 400

    note = get_note(school=school, class_name=class_name, subject=subject, topic=topic)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    # choose content per student type
    content = note.get("text")
    variants = note.get("variants") or {}
    if student_type == "dyslexie" and variants.get("dyslexie"):
        content = variants.get("dyslexie")

    service = GeminiService()
    result = service.generate_adaptive_qna(notes=str(content or ""), student_type=student_type, question=question)
    return jsonify(result), 200


@students_bp.post("/students/qna-audio")  # POST /api/students/qna-audio (multipart)
@jwt_required()
def qna_audio():
    claims = get_jwt() or {}
    role = claims.get("role")
    if role not in {"student", "teacher"}:
        return jsonify({"error": "Forbidden"}), 403

    school = (request.form.get("school") or claims.get("school") or "").strip()
    class_name = (request.form.get("class") or request.form.get("className") or "").strip()
    subject = (request.form.get("subject") or "").strip()
    topic = (request.form.get("topic") or "").strip()
    student_type = (request.form.get("studentType") or request.form.get("student_type") or "").strip().lower()
    language = (request.form.get("language") or "en-US").strip()
    audio = request.files.get("audio")

    if not school or not class_name or not subject or not topic:
        return jsonify({"error": "school, class, subject, topic are required"}), 400
    if not student_type:
        return jsonify({"error": "studentType is required"}), 400
    if not audio:
        return jsonify({"error": "audio is required"}), 400

    # Fetch note content
    note = get_note(school=school, class_name=class_name, subject=subject, topic=topic)
    if not note:
        return jsonify({"error": "Note not found"}), 404
    base_content = note.get("text")
    variants = note.get("variants") or {}
    if student_type == "dyslexie" and variants.get("dyslexie"):
        base_content = variants.get("dyslexie")

    # STT the question
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir) / (audio.filename or "audio")
        audio.save(str(tmp_path))
        wav_path, _ = ensure_wav_pcm16_mono_16k(tmp_path)
        stt = get_stt_client(language=language)
        ok, question_text = stt.transcribe(str(wav_path))
        if not ok:
            return jsonify({"error": question_text}), 400

    # AI QnA
    service = GeminiService()
    qna = service.generate_adaptive_qna(notes=str(base_content or ""), student_type=student_type, question=question_text)
    answer_text = qna.get("answer") or ""

    # TTS the answer → upload to Catbox
    output_dir = os.getenv("OUTPUT_DIR", "./audio_output")
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    tmp_mp3 = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False, dir=output_dir, prefix='qna_tts_')
    mp3_path = Path(tmp_mp3.name)
    tmp_mp3.close()
    audio_url = None
    try:
        ok, msg = synthesize_text_to_mp3(text=answer_text, out_path=mp3_path, voice=None)
        if ok and mp3_path.exists() and mp3_path.stat().st_size > 0:
            up_ok, up_msg = upload_file_to_catbox(mp3_path)
            if up_ok:
                audio_url = up_msg
            else:
                qna["audioUploadError"] = up_msg
        else:
            qna["audioSynthesisError"] = msg
    finally:
        try:
            if mp3_path.exists():
                mp3_path.unlink()
        except OSError:
            pass

    if audio_url:
        qna["audioUrl"] = audio_url

    # Include transcribed question for reference
    qna["question"] = question_text
    return jsonify(qna), 200


