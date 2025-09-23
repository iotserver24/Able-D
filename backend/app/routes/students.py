from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt

from ..services.notes_service import list_topics, get_note


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


