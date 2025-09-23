from __future__ import annotations

import re
import secrets
from datetime import datetime
from typing import Optional, Tuple

from passlib.hash import bcrypt
from pymongo.collection import Collection

from .db import get_db


def _users() -> Collection:
    return get_db()["users"]


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def normalize_email(email: str) -> str:
    return email.strip().lower()


def is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def ensure_indexes() -> None:
    users = _users()
    users.create_index("email", unique=True, sparse=True)
    users.create_index([("role", 1), ("studentType", 1)])


def create_or_login_student(
    student_type: str,
    name: Optional[str] = None,
    class_name: Optional[str] = None,
    subject: Optional[str] = None,
    school: Optional[str] = None,
) -> dict:
    student_type = student_type.strip().lower()
    # Align with frontend constants in frontend/app/constants/studentTypes.js
    legacy_to_new = {
        "blind": "visually_impaired",
        "deaf": "hearing_impaired",
        "cant_speak": "speech_impaired",
        "special": "slow_learner",
    }
    new_allowed = {"visually_impaired", "hearing_impaired", "speech_impaired", "slow_learner"}
    if student_type in legacy_to_new:
        student_type = legacy_to_new[student_type]
    if student_type not in new_allowed:
        raise ValueError("Invalid student type")

    anonymous_id = secrets.token_hex(8)
    user_doc = {
        "role": "student",
        "studentType": student_type,
        "name": name or f"Student-{anonymous_id}",
        "class": class_name,
        "subject": subject,
        "school": school,
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
        "anonymousId": anonymous_id,
    }
    try:
        res = _users().insert_one(user_doc)
        user_doc["_id"] = str(res.inserted_id)
    except Exception:
        # Fallback when MongoDB is not available: return ephemeral user
        user_doc["_id"] = None
    return user_doc


def register_teacher(name: str, email: str, password: str, school: Optional[str] = None) -> dict:
    email_n = normalize_email(email)
    if not is_valid_email(email_n):
        raise ValueError("Invalid email")
    if len(password) < 6:
        raise ValueError("Password too short")

    ensure_indexes()

    password_hash = bcrypt.hash(password)
    doc = {
        "role": "teacher",
        "name": name.strip(),
        "email": email_n,
        "school": (school or None),
        "passwordHash": password_hash,
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
    }
    try:
        res = _users().insert_one(doc)
        doc["_id"] = str(res.inserted_id)
    except Exception:
        # Fallback when MongoDB is not available
        doc["_id"] = None
    
    # Hide password hash in responses
    doc.pop("passwordHash", None)
    return doc


def authenticate_teacher(email: str, password: str) -> Optional[dict]:
    email_n = normalize_email(email)
    user = _users().find_one({"email": email_n, "role": "teacher"})
    if not user:
        return None
    password_hash = user.get("passwordHash")
    if not password_hash or not bcrypt.verify(password, password_hash):
        return None
    user["_id"] = str(user["_id"])  # type: ignore[index]
    user.pop("passwordHash", None)
    return user


def register_student(
    student_type: str,
    name: str,
    class_name: str,
    subject: str,
    school: str,
    email: str,
    password: str,
) -> dict:
    """Register a new student with email and password"""
    email_n = normalize_email(email)
    if not is_valid_email(email_n):
        raise ValueError("Invalid email")
    if len(password) < 6:
        raise ValueError("Password too short")

    ensure_indexes()

    # Check if email already exists
    existing_user = _users().find_one({"email": email_n})
    if existing_user:
        raise ValueError("Email already registered")

    # Validate student type
    legacy_to_new = {
        "blind": "visually_impaired",
        "deaf": "hearing_impaired",
        "cant_speak": "speech_impaired",
        "special": "slow_learner",
    }
    new_allowed = {"visually_impaired", "hearing_impaired", "speech_impaired", "slow_learner"}
    if student_type in legacy_to_new:
        student_type = legacy_to_new[student_type]
    if student_type not in new_allowed:
        raise ValueError("Invalid student type")

    password_hash = bcrypt.hash(password)
    anonymous_id = secrets.token_hex(8)
    
    user_doc = {
        "role": "student",
        "studentType": student_type,
        "name": name.strip(),
        "class": class_name.strip(),
        "subject": subject.strip(),
        "school": school.strip(),
        "email": email_n,
        "passwordHash": password_hash,
        "anonymousId": anonymous_id,
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
    }
    
    try:
        res = _users().insert_one(user_doc)
        user_doc["_id"] = str(res.inserted_id)
    except Exception:
        # Fallback when MongoDB is not available: return ephemeral user
        user_doc["_id"] = None
    
    # Hide password hash in response
    user_doc.pop("passwordHash", None)
    return user_doc


def authenticate_student_by_email(email: str, password: str) -> Optional[dict]:
    """Authenticate a student by email and password"""
    email_n = normalize_email(email)
    user = _users().find_one({"email": email_n, "role": "student"})
    if not user:
        return None
    
    password_hash = user.get("passwordHash")
    if not password_hash or not bcrypt.verify(password, password_hash):
        return None
    
    user["_id"] = str(user["_id"])  # type: ignore[index]
    user.pop("passwordHash", None)
    return user


def authenticate_student(student_id: Optional[str] = None, anonymous_id: Optional[str] = None) -> Optional[dict]:
    """Authenticate a student by their ID or anonymous ID (legacy function)"""
    if not student_id and not anonymous_id:
        return None
    
    from bson import ObjectId
    
    # Try to find by student ID first, then anonymous ID
    query = {"role": "student"}
    if student_id:
        try:
            # Convert string ID to ObjectId for MongoDB query
            query["_id"] = ObjectId(student_id)
        except Exception:
            # If ObjectId conversion fails, the ID is invalid
            return None
    elif anonymous_id:
        query["anonymousId"] = anonymous_id
    
    user = _users().find_one(query)
    if not user:
        return None
    
    user["_id"] = str(user["_id"])  # type: ignore[index]
    return user


