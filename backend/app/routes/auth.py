from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from ..utils.auth import verify_firebase_token

from ..services.auth_service import (
    authenticate_teacher,
    authenticate_student_by_email,
    register_student,
    register_teacher,
)

auth_bp = Blueprint("auth", __name__)


# JWT Manager is initialized in the main app, not here


@auth_bp.route("/auth/student/register", methods=["POST"])
def student_register():
    data = request.get_json(force=True) or {}
    student_type = (data.get("studentType") or "").strip().lower()
    name = (data.get("name") or None)
    class_name = (data.get("class") or data.get("className") or None)
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "")
    
    # Hardcoded values
    school = "DemoSchool"  # Hardcoded school/college
    subject = "science"    # Hardcoded subject (one of: english, science, social)
    
    # Validation
    if not name or not name.strip():
        return jsonify({"error": "Name is required"}), 400
    if not class_name or not class_name.strip():
        return jsonify({"error": "Class is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    try:
        user = register_student(student_type, name, class_name, subject, school, email, password)
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
        return jsonify({"user": user, "accessToken": token}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # Ensure we never 500 due to DB connectivity; create ephemeral token instead
        token = create_access_token(identity={"role": "student", "studentType": student_type})
        return jsonify({"user": {"role": "student", "studentType": student_type}, "accessToken": token, "warning": "DB unavailable; ephemeral session issued"}), 200


@auth_bp.route("/auth/student/login", methods=["POST"])
def student_login():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        user = authenticate_student_by_email(email, password)
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
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
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/auth/teacher/register", methods=["POST"])
def teacher_register():
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "")
    
    # Hardcoded values
    school = "DemoSchool"  # Hardcoded school/college
    
    # Validation
    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    try:
        user = register_teacher(name, email, password, school)
        token = create_access_token(
            identity=user.get("email"),
            additional_claims={"role": "teacher", "school": user.get("school")},
        )
        return jsonify({"user": user, "accessToken": token}), 201
    except Exception as e:
        # Ensure we never 500 due to DB connectivity; create ephemeral token instead
        token = create_access_token(identity=email, additional_claims={"role": "teacher", "school": school})
        return jsonify({
            "user": {"role": "teacher", "email": email, "school": school},
            "accessToken": token,
            "warning": "DB unavailable; ephemeral session issued",
        }), 200


@auth_bp.route("/auth/teacher/login", methods=["POST"])
def teacher_login():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        user = authenticate_teacher(email, password)
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        token = create_access_token(
            identity=user.get("email"),
            additional_claims={"role": "teacher", "school": user.get("school")},
        )
        return jsonify({"user": user, "accessToken": token}), 200
    except Exception:
        # Fallback when MongoDB is not available: issue ephemeral token
        token = create_access_token(identity=email, additional_claims={"role": "teacher"})
        return jsonify({"user": {"role": "teacher", "email": email}, "accessToken": token, "warning": "DB unavailable; ephemeral session issued"}), 200


@auth_bp.route("/auth/verify", methods=["GET", "OPTIONS"])
@jwt_required()
def verify_token():
    """Verify JWT token and return user info"""
    identity = get_jwt_identity()
    if identity:
        return jsonify({"valid": True, "user": identity}), 200
    return jsonify({"valid": False}), 401


@auth_bp.route("/auth/firebase/verify", methods=["GET"])  # verify Firebase ID token
@verify_firebase_token
def verify_firebase():
    # request.firebase_user is set by decorator
    from flask import request
    firebase_user = getattr(request, "firebase_user", {})
    return jsonify({"ok": True, "firebase": {
        "uid": firebase_user.get("uid"),
        "email": firebase_user.get("email"),
        "provider": firebase_user.get("firebase", {}).get("sign_in_provider"),
    }}), 200


