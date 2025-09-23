#!/usr/bin/env python3
from flask import Flask
import os
from dotenv import load_dotenv
from flask_cors import CORS

from .config import Config
from .routes.health import health_bp
from .routes.extract_text import extract_text_bp
from .routes.stt import stt_bp
from .routes.tts import tts_bp


def create_app() -> Flask:
    # Load env from backend/.env (one directory up from this file)
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    load_dotenv(dotenv_path=env_path)

    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS (adjust origins if needed)
    CORS(app)

    # Blueprints
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(extract_text_bp, url_prefix="/api")
    app.register_blueprint(stt_bp, url_prefix="/api")
    app.register_blueprint(tts_bp, url_prefix="/api")

    return app


