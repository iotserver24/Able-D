from pathlib import Path
from tempfile import TemporaryDirectory

from flask import Blueprint, jsonify, request

from ..services.extract_text_service import get_extractor


extract_text_bp = Blueprint("extract_text", __name__)


@extract_text_bp.post("/extract-text")
def extract_text_route():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    with TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir) / file.filename
        file.save(str(tmp_path))

        extractor = get_extractor()
        results = extractor.extract(tmp_path)
        text = next(iter(results.values()), "")
        return jsonify({
            "filename": file.filename,
            "text": text,
        })


