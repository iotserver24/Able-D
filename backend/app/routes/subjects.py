from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..services.subject_service import list_subjects_for_class_and_school


subjects_bp = Blueprint("subjects", __name__)


@subjects_bp.route("/subjects", methods=["GET"])  # GET /api/subjects?class=10
@jwt_required()
def list_subjects():
    identity = get_jwt_identity() or {}
    role = identity.get("role")

    # Only allow students and teachers; others forbidden
    if role not in {"student", "teacher"}:
        return jsonify({"error": "Forbidden"}), 403

    # Source of truth for school:
    # - For students: school from JWT identity (set at login)
    # - For teachers: school should be part of JWT identity after login/register
    school = identity.get("school")

    # Class is provided as query param but not trusted for cross-school access.
    # Students may also have class in token; if not provided as query, fall back to token.
    class_q = (request.args.get("class") or request.args.get("className") or "").strip()
    if role == "student" and not class_q:
        class_q = (identity.get("class") or "")

    if not school:
        return jsonify({"error": "Missing school in identity"}), 400
    if not class_q:
        return jsonify({"error": "class is required"}), 400

    subjects = list_subjects_for_class_and_school(school=school, class_name=class_q)
    return jsonify({"items": subjects}), 200


