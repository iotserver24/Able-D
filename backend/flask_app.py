#!/usr/bin/env python3
"""
Minimal Flask API exposing document extraction and speech-to-text.

Endpoints:
- GET /api/health                 → Simple health check
- POST /api/extract-text          → Upload a file and get extracted text
- POST /api/stt                   → Upload an audio file and get transcription

Uses existing modules:
- document_extractor.SimpleDocumentExtractor
- stt.SimpleMicrosoftSTT
"""

import os
from pathlib import Path
from tempfile import TemporaryDirectory

from flask import Flask, jsonify, request
from flask_cors import CORS

from document_extractor import SimpleDocumentExtractor
from stt import SimpleMicrosoftSTT


def create_app() -> Flask:
    app = Flask(__name__)

    # Basic config
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB upload limit

    # Enable CORS for all origins (adjust if needed)
    CORS(app)

    extractor = SimpleDocumentExtractor()

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.post("/api/extract-text")
    def extract_text_endpoint():
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files["file"]
        if not file or file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Save to temp and run extractor
        with TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir) / file.filename
            file.save(str(tmp_path))

            results = extractor.extract(tmp_path)
            # results is { filepath: text }
            # Return just the text and filename
            text = next(iter(results.values()), "")
            return jsonify({
                "filename": file.filename,
                "text": text,
            })

    @app.post("/api/stt")
    def stt_endpoint():
        if "audio" not in request.files:
            return jsonify({"error": "No audio part"}), 400
        audio = request.files["audio"]
        if not audio or audio.filename == "":
            return jsonify({"error": "No selected audio"}), 400

        language = request.form.get("language", "en-US")

        # Initialize STT (reads AZURE_SPEECH_KEY/REGION from env by default)
        try:
            stt_client = SimpleMicrosoftSTT(language=language)
        except Exception as e:
            return jsonify({"error": f"STT init failed: {e}"}), 500

        with TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir) / audio.filename
            audio.save(str(tmp_path))

            success, result = stt_client.transcribe(str(tmp_path))
            if not success:
                return jsonify({"error": result}), 400
            return jsonify({
                "filename": audio.filename,
                "language": language,
                "text": result,
            })

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)


