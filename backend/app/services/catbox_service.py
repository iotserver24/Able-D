from __future__ import annotations

from pathlib import Path
from typing import Tuple

import requests


CATBOX_API_ENDPOINT = "https://catbox.moe/user/api.php"


def upload_file_to_catbox(file_path: Path) -> Tuple[bool, str]:
    """
    Upload a file to catbox.moe anonymously.

    Returns (success, url_or_error).
    On success, the second value is the public URL.
    On failure, the second value is an error message.
    """
    try:
        if not file_path.exists() or not file_path.is_file():
            return False, "File does not exist"

        with file_path.open("rb") as f:
            files = {"fileToUpload": (file_path.name, f)}
            data = {"reqtype": "fileupload"}
            resp = requests.post(CATBOX_API_ENDPOINT, data=data, files=files, timeout=60)
        if resp.status_code != 200:
            return False, f"Catbox HTTP {resp.status_code}: {resp.text[:200]}"

        url = (resp.text or "").strip()
        # Catbox returns the URL directly on success
        if url.startswith("http") and ("catbox" in url or "litterbox" in url):
            return True, url
        return False, f"Unexpected Catbox response: {url[:200]}"
    except requests.RequestException as e:
        return False, f"Catbox request failed: {e}"
    except OSError as e:
        return False, f"File error: {e}"


