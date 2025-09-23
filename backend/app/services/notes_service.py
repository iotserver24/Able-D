from __future__ import annotations

from datetime import datetime
from typing import Dict, Optional

from pymongo.collection import Collection

from .db import get_db


def _notes() -> Collection:
    return get_db()["notes"]


def ensure_indexes() -> None:
    col = _notes()
    col.create_index([("school", 1), ("class", 1), ("subject", 1), ("topic", 1)], name="school_class_subject_topic")
    col.create_index("uploadedBy")
    col.create_index("createdAt")


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def save_note(
    *,
    school: str,
    class_name: str,
    subject: str,
    topic: str,
    text: str,
    uploaded_by: Optional[str],
    source_type: str,
    original_filename: Optional[str] = None,
    extra_meta: Optional[Dict] = None,
) -> Dict:
    ensure_indexes()
    doc: Dict = {
        "school": school.strip(),
        "class": class_name.strip(),
        "subject": subject.strip(),
        "topic": topic.strip(),
        "text": text,
        "uploadedBy": uploaded_by,
        "sourceType": source_type,
        "originalFilename": original_filename,
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
    }
    if extra_meta:
        doc["meta"] = extra_meta

    # Persist to MongoDB; if insertion fails, propagate the exception so callers can return an error
    res = _notes().insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc



