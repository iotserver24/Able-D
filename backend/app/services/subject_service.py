from __future__ import annotations

from typing import List, Dict

from pymongo.collection import Collection

from .db import get_db


def _subjects() -> Collection:
    return get_db()["subjects"]


def ensure_indexes() -> None:
    col = _subjects()
    col.create_index([("school", 1), ("class", 1)])
    col.create_index("subjectName")


def list_subjects_for_class_and_school(school: str, class_name: str) -> List[Dict]:
    if not school or not class_name:
        return []
    ensure_indexes()
    cursor = _subjects().find(
        {"school": school, "class": class_name},
        {"_id": 0, "subjectName": 1, "addedBy": 1, "class": 1, "school": 1},
    ).sort("subjectName", 1)
    return list(cursor)


