from __future__ import annotations

import io
from types import SimpleNamespace

from app import create_app
from flask_jwt_extended import create_access_token


def main() -> int:
    app = create_app()
    app.config["TESTING"] = True
    # Ensure JWT works in tests
    if not app.config.get("JWT_SECRET_KEY"):
        app.config["JWT_SECRET_KEY"] = "test-secret"

    with app.app_context():
        token = create_access_token(identity={"role": "teacher", "email": "t@example.com", "school": "ABC"})

    # Lazy imports after app is ready
    from app.services import notes_service
    from app.routes import teacher_upload as teacher_upload_module

    # Mock extractor to avoid heavy parsing; return deterministic text
    class DummyExtractor:
        def extract(self, path):
            return {"dummy": "hello from extractor"}

    original_get_extractor = teacher_upload_module.get_extractor
    teacher_upload_module.get_extractor = lambda: DummyExtractor()

    # Mock notes collection to force DB error on insert
    class FailingCollection:
        def insert_one(self, doc):
            raise RuntimeError("forced insert failure for test")

    original_notes_func = notes_service._notes
    notes_service._notes = lambda: FailingCollection()

    try:
        client = app.test_client()
        data = {
            "school": "ABC",
            "class": "10",
            "subject": "Math",
            "topic": "Algebra",
            "file": (io.BytesIO(b"%PDF-1.4 minimal"), "notes.pdf"),
        }
        resp = client.post(
            "/api/teacher/upload",
            data=data,
            headers={"Authorization": f"Bearer {token}"},
            content_type="multipart/form-data",
        )
        print("Status:", resp.status_code)
        print("Body:", resp.json)
        # Expect 500 with database error
        assert resp.status_code == 500, f"expected 500, got {resp.status_code}"
        assert resp.json and "error" in resp.json and "Database error" in resp.json["error"], "missing database error message"
        print("OK: teacher/upload returns 500 on DB failure")
        return 0
    finally:
        # Restore originals
        teacher_upload_module.get_extractor = original_get_extractor
        notes_service._notes = original_notes_func


if __name__ == "__main__":
    raise SystemExit(main())


