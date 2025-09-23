from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from firebase_admin import auth as fb_auth
from ..services.auth_service import get_user_by_firebase_uid, create_firebase_user
from ..utils.auth import verify_firebase_token

firebase_auth_bp = Blueprint("firebase_auth", __name__)


@firebase_auth_bp.route("/auth/firebase/check-profile", methods=["GET"])
@verify_firebase_token
def check_firebase_profile():
    """Check if a Firebase authenticated user has a profile in our database"""
    try:
        # Get Firebase user from request (set by decorator)
        firebase_user = getattr(request, "firebase_user", {})
        uid = firebase_user.get("uid")
        email = firebase_user.get("email")
        
        if not uid:
            return jsonify({"error": "Invalid Firebase token"}), 401
        
        # Check if user exists in our database
        user = get_user_by_firebase_uid(uid)
        
        if user:
            # User exists, return profile
            # Create JWT token for our backend
            token_identity = {
                "role": user.get("role", "student"),
                "email": user.get("email"),
                "firebase_uid": uid
            }
            
            if user.get("role") == "student":
                token_identity.update({
                    "studentType": user.get("studentType"),
                    "class": user.get("class"),
                    "subject": user.get("subject"),
                    "school": user.get("school"),
                })
            elif user.get("role") == "teacher":
                token_identity.update({
                    "school": user.get("school"),
                })
            
            access_token = create_access_token(identity=token_identity)
            
            return jsonify({
                "profileExists": True,
                "user": user,
                "accessToken": access_token
            }), 200
        else:
            # User doesn't exist
            return jsonify({
                "profileExists": False,
                "firebaseUser": {
                    "uid": uid,
                    "email": email,
                    "displayName": firebase_user.get("name"),
                }
            }), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@firebase_auth_bp.route("/auth/firebase/complete-profile", methods=["POST"])
@verify_firebase_token
def complete_firebase_profile():
    """Complete profile for a Firebase authenticated user"""
    try:
        # Get Firebase user from request (set by decorator)
        firebase_user = getattr(request, "firebase_user", {})
        uid = firebase_user.get("uid")
        
        if not uid:
            return jsonify({"error": "Invalid Firebase token"}), 401
        
        # Get profile data from request
        data = request.get_json(force=True) or {}
        
        role = data.get("role", "student").strip().lower()
        name = data.get("name", "").strip()
        school = data.get("school", "").strip()
        email = data.get("email") or firebase_user.get("email")
        
        # Validation
        if not name:
            return jsonify({"error": "Name is required"}), 400
        if not school:
            return jsonify({"error": "School is required"}), 400
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Prepare user data
        user_data = {
            "firebase_uid": uid,
            "email": email,
            "name": name,
            "school": school,
            "role": role,
            "auth_provider": "microsoft"
        }
        
        # Add role-specific fields
        if role == "student":
            student_type = data.get("studentType", "regular").strip().lower()
            class_name = data.get("class", "").strip()
            subject = data.get("subject", "").strip()
            
            if not class_name:
                return jsonify({"error": "Class is required for students"}), 400
            if not subject:
                return jsonify({"error": "Subject is required for students"}), 400
            
            user_data.update({
                "studentType": student_type,
                "class": class_name,
                "subject": subject
            })
        
        # Create user in database
        user = create_firebase_user(user_data)
        
        if user:
            # Create JWT token for our backend
            token_identity = {
                "role": role,
                "email": email,
                "firebase_uid": uid
            }
            
            if role == "student":
                token_identity.update({
                    "studentType": user_data.get("studentType"),
                    "class": user_data.get("class"),
                    "subject": user_data.get("subject"),
                    "school": user_data.get("school"),
                })
            elif role == "teacher":
                token_identity.update({
                    "school": user_data.get("school"),
                })
            
            access_token = create_access_token(identity=token_identity)
            
            return jsonify({
                "user": user,
                "accessToken": access_token
            }), 201
        else:
            return jsonify({"error": "Failed to create user profile"}), 500
            
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@firebase_auth_bp.route("/auth/firebase/verify", methods=["GET"])
@verify_firebase_token
def verify_firebase():
    """Verify Firebase ID token and return user info"""
    # Get Firebase user from request (set by decorator)
    firebase_user = getattr(request, "firebase_user", {})
    
    return jsonify({
        "ok": True,
        "firebase": {
            "uid": firebase_user.get("uid"),
            "email": firebase_user.get("email"),
            "provider": firebase_user.get("firebase", {}).get("sign_in_provider"),
        }
    }), 200


@firebase_auth_bp.route("/auth/firebase/refresh", methods=["POST"])
@verify_firebase_token
def refresh_firebase_token():
    """Refresh access token for Firebase authenticated user"""
    try:
        # Get Firebase user from request (set by decorator)
        firebase_user = getattr(request, "firebase_user", {})
        uid = firebase_user.get("uid")
        
        if not uid:
            return jsonify({"error": "Invalid Firebase token"}), 401
        
        # Get user from database
        user = get_user_by_firebase_uid(uid)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Create new JWT token
        token_identity = {
            "role": user.get("role", "student"),
            "email": user.get("email"),
            "firebase_uid": uid
        }
        
        if user.get("role") == "student":
            token_identity.update({
                "studentType": user.get("studentType"),
                "class": user.get("class"),
                "subject": user.get("subject"),
                "school": user.get("school"),
            })
        elif user.get("role") == "teacher":
            token_identity.update({
                "school": user.get("school"),
            })
        
        access_token = create_access_token(identity=token_identity)
        
        return jsonify({
            "accessToken": access_token,
            "user": user
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
