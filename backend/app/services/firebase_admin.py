from __future__ import annotations

import base64
import json
import os
from typing import Optional

import firebase_admin
from firebase_admin import credentials
from flask import Flask


def _load_credentials_from_env() -> Optional[credentials.Certificate]:
    # Prefer explicit file path if provided
    creds_file = os.getenv("FIREBASE_CREDENTIALS_FILE")
    if creds_file and os.path.isfile(creds_file):
        return credentials.Certificate(creds_file)

    # Fallback to base64-encoded JSON
    creds_b64 = os.getenv("FIREBASE_CREDENTIALS_BASE64")
    if creds_b64:
        try:
            decoded = base64.b64decode(creds_b64)
            data = json.loads(decoded.decode("utf-8"))
            return credentials.Certificate(data)
        except Exception:
            return None

    return None


def initialize_firebase_admin(app: Flask) -> None:
    if firebase_admin._apps:
        return
    cred = _load_credentials_from_env()
    if cred is None:
        # Allow app to run without Firebase for local/dev if not configured
        return
    firebase_admin.initialize_app(cred, {
        "projectId": os.getenv("FIREBASE_PROJECT_ID")
    })


