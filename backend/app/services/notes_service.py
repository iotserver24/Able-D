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
    variants: Optional[Dict] = None,
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
    if variants:
        # Store additional representations for clients: base, dyslexie, audioUrl, etc.
        doc["variants"] = variants

    # Persist to MongoDB; if insertion fails, propagate the exception so callers can return an error
    res = _notes().insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc


def list_topics(school: str, class_name: str, subject: str) -> list[str]:
    """Return sorted distinct topics for the given school/class/subject."""
    ensure_indexes()
    cursor = _notes().find(
        {"school": school.strip(), "class": class_name.strip(), "subject": subject.strip()},
        {"topic": 1, "_id": 0},
    )
    topics = sorted({doc.get("topic", "") for doc in cursor if doc.get("topic")})
    return topics


def get_note(school: str, class_name: str, subject: str, topic: str) -> Optional[Dict]:
    """Fetch a single note by key; returns None if not found. Stringify _id if present."""
    ensure_indexes()
    doc = _notes().find_one({
        "school": school.strip(),
        "class": class_name.strip(),
        "subject": subject.strip(),
        "topic": topic.strip(),
    })
    if not doc:
        return None
    # normalize _id to string
    obj_id = doc.get("_id")
    if obj_id is not None:
        try:
            doc["_id"] = str(obj_id)
        except (TypeError, ValueError):
            doc["_id"] = f"{obj_id}"
    return doc

