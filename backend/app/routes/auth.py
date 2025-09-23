from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from ..services.auth_service import (
    authenticate_teacher,
    create_or_login_student,
    register_teacher,
)


auth_bp = Blueprint("auth", __name__)


@auth_bp.record_once
def on_load(state):
    JWTManager(state.app)


@auth_bp.route("/auth/student/login", methods=["POST"])
def student_login():
    data = request.get_json(force=True) or {}
    student_type = (data.get("studentType") or "").strip().lower()
    name = (data.get("name") or None)
    class_name = (data.get("class") or data.get("className") or None)
    subject = (data.get("subject") or None)
    school = (data.get("school") or None)
    try:
        user = create_or_login_student(student_type, name, class_name, subject, school)
        token = create_access_token(
            identity={
                "role": "student",
                "studentType": user["studentType"],
                "class": user.get("class"),
                "subject": user.get("subject"),
                "school": user.get("school"),
                "id": user.get("_id"),
            }
        )
        return jsonify({"user": user, "accessToken": token}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # Ensure we never 500 due to DB connectivity; create ephemeral token instead
        token = create_access_token(identity={"role": "student", "studentType": student_type})
        return jsonify({"user": {"role": "student", "studentType": student_type}, "accessToken": token, "warning": "DB unavailable; ephemeral session issued"}), 200


@auth_bp.route("/auth/teacher/register", methods=["POST"])
def teacher_register():
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    school = (data.get("school") or None)
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "")
    if not name:
        return jsonify({"error": "Name is required"}), 400
    try:
        user = register_teacher(name, email, password, school)
        token = create_access_token(
            identity={
                "role": "teacher",
                "email": user.get("email"),
                "school": user.get("school"),
            }
        )
        return jsonify({"user": user, "accessToken": token}), 201
    except Exception as e:  # duplicate key or validation error
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/auth/teacher/login", methods=["POST"])
def teacher_login():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "")
    user = authenticate_teacher(email, password)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    token = create_access_token(
        identity={
            "role": "teacher",
            "email": user.get("email"),
            "school": user.get("school"),
        }
    )
    return jsonify({"user": user, "accessToken": token}), 200


@auth_bp.route("/auth/verify", methods=["GET"])  # simple token check
@jwt_required()
def verify():
    identity = get_jwt_identity()
    return jsonify({"ok": True, "identity": identity}), 200


