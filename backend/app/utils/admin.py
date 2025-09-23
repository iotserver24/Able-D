"""
Admin utilities for database management and system administration.
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity


def admin_required(f):
    """
    Decorator to require admin privileges.
    
    This decorator checks if the current user has admin privileges.
    For now, it's a simple implementation that can be extended
    with proper role-based access control.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = get_jwt_identity()
        
        if not current_user:
            return jsonify({"error": "Authentication required"}), 401
        
        # Check if user has admin role
        user_role = current_user.get("role")
        if user_role != "admin":
            return jsonify({"error": "Admin privileges required"}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def teacher_or_admin_required(f):
    """
    Decorator to require teacher or admin privileges.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = get_jwt_identity()
        
        if not current_user:
            return jsonify({"error": "Authentication required"}), 401
        
        # Check if user has teacher or admin role
        user_role = current_user.get("role")
        if user_role not in ["teacher", "admin"]:
            return jsonify({"error": "Teacher or admin privileges required"}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function
