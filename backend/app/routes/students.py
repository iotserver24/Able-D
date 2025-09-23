from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt

from ..services.notes_service import list_topics, get_note
from ..services.ai_service import GeminiService


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

    topics = list_topics(school=school, class_name=class_name, subject=subject)
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


