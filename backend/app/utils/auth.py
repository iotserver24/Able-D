from __future__ import annotations

from functools import wraps
from typing import Callable, Optional

from firebase_admin import auth as fb_auth
from flask import Request, jsonify, request


def verify_firebase_token(func: Callable):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header: Optional[str] = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 403
        id_token = auth_header.split(" ", 1)[1].strip()
        try:
            decoded = fb_auth.verify_id_token(id_token)
        except Exception as e:
            return jsonify({"error": "Unauthorized", "detail": str(e)}), 403
        # Attach decoded token to request context via flask.g if needed
        request.firebase_user = decoded  # type: ignore[attr-defined]
        return func(*args, **kwargs)

    return wrapper


