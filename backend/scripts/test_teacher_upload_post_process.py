from __future__ import annotations

from app.services.notes_service import save_note


def run():
    # Simulated extracted text
    text = "The mitochondria is the powerhouse of the cell."

    # Fake variants as if produced by AI and TTS+Catbox
    variants = {
        "dyslexie": "Mitochondria help make energy for the cell. They act like tiny power stations.",
        "audioUrl": "https://files.catbox.moe/example.mp3",
        "meta": {"dyslexieTips": "Read slowly. Focus on key words like 'energy' and 'cell'."},
    }

    note = save_note(
        school="TestSchool",
        class_name="10",
        subject="Science",
        topic="Biology",
        text=text,
        uploaded_by="test@example.com",
        source_type="document",
        original_filename="test.pdf",
        variants=variants,
    )
    print({"inserted": True, "_id": note.get("_id"), "variants_keys": list(note.get("variants", {}).keys())})


if __name__ == "__main__":
    run()


