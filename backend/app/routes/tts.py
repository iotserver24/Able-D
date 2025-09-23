from __future__ import annotations

import os
from pathlib import Path

from flask import Blueprint, jsonify, request

from ..services.tts_service import synthesize_text_to_mp3


tts_bp = Blueprint("tts", __name__)


@tts_bp.route("/tts", methods=["POST"])  # POST /api/tts
def tts_route():
    data = request.get_json(force=True) or {}
    text = (data.get("text") or "").strip()
    voice = (data.get("voice") or None)
    if not text:
        return jsonify({"error": "'text' is required"}), 400

    output_dir = os.getenv("OUTPUT_DIR", "./audio_output")
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    out_file = Path(output_dir) / "tts_output.mp3"

    ok, msg = synthesize_text_to_mp3(text=text, out_path=out_file, voice=voice)
    if not ok:
        return jsonify({"error": msg}), 400

    return jsonify({"ok": True, "path": str(out_file)}), 200


