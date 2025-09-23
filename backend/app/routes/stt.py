from pathlib import Path
from tempfile import TemporaryDirectory

from flask import Blueprint, jsonify, request

from ..services.stt_service import get_stt_client
from ..utils.audio import ensure_wav_pcm16_mono_16k


stt_bp = Blueprint("stt", __name__)


@stt_bp.post("/stt")
def stt_route():
    if "audio" not in request.files:
        return jsonify({"error": "No audio part"}), 400
    audio = request.files["audio"]
    if not audio or audio.filename == "":
        return jsonify({"error": "No selected audio"}), 400

    language = request.form.get("language", "en-US")
    stt_client = get_stt_client(language=language)

    with TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir) / audio.filename
        audio.save(str(tmp_path))

        # Convert if needed for SDK compatibility
        path_to_use, is_temp = ensure_wav_pcm16_mono_16k(tmp_path)

        success, result = stt_client.transcribe(str(path_to_use))
        if not success:
            return jsonify({"error": result}), 400
        return jsonify({
            "filename": audio.filename,
            "language": language,
            "text": result,
        })


