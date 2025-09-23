from __future__ import annotations

import os
from pathlib import Path
import tempfile

from flask import Blueprint, jsonify, request, send_file, Response

from ..services.tts_service import synthesize_text_to_mp3


tts_bp = Blueprint("tts", __name__)


@tts_bp.route("/tts", methods=["POST"])  # POST /api/tts
def tts_route():
    data = request.get_json(force=True) or {}
    text = (data.get("text") or "").strip()
    voice = (data.get("voice") or None)
    
    if not text:
        return jsonify({"error": "'text' is required"}), 400

    # Create output directory if it doesn't exist
    output_dir = os.getenv("OUTPUT_DIR", "./audio_output")
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Use a unique temporary file to avoid conflicts
    temp_file = tempfile.NamedTemporaryFile(
        suffix='.mp3', 
        delete=False,
        dir=output_dir,
        prefix='tts_'
    )
    out_file = Path(temp_file.name)
    temp_file.close()  # Close the file handle so TTS service can write to it

    try:
        # Generate the MP3 file
        ok, msg = synthesize_text_to_mp3(text=text, out_path=out_file, voice=voice)
        if not ok:
            # Clean up temp file on error
            if out_file.exists():
                out_file.unlink()
            return jsonify({"error": msg}), 400

        # Verify the file exists and has content
        if not out_file.exists():
            return jsonify({"error": "MP3 file was not created"}), 500
        
        if out_file.stat().st_size == 0:
            out_file.unlink()
            return jsonify({"error": "MP3 file is empty"}), 500

        # Return the MP3 file as binary data
        # Use send_file with proper parameters to ensure correct delivery
        return send_file(
            str(out_file),
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name='speech.mp3',
            max_age=0  # Don't cache
        )
        
    except Exception as e:
        # Clean up temp file on any error
        if out_file.exists():
            try:
                out_file.unlink()
            except:
                pass
        return jsonify({"error": f"Server error: {str(e)}"}), 500


