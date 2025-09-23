# Backend Merge Conflicts Resolution (requirements.txt, app/__init__.py)

This doc records the merge conflict fixes applied to the backend and how to verify them locally.

## What changed

- requirements.txt
  - Removed merge markers and kept both sets of dependencies:
    - Kept Firebase Admin SDK: `firebase-admin>=6.5.0`
    - Kept AI clients: `google-genai`, `google-generativeai`
- app/__init__.py
  - Removed merge markers and retained all relevant blueprints and imports:
    - `teacher_upload_bp`, `test_ui_bp`, and `ai_bp` are all imported and registered.

## Rationale

- The backend uses Firebase features and also includes AI routes; both dependency sets and blueprints are required for full functionality.

## How to verify (Windows)

1) Install/refresh dependencies (inside `backend/`):

```powershell
# Using existing venv
./venv/Scripts/python.exe -m pip install -r requirements.txt
```

2) Smoke test the Flask app factory registers routes:

Option A (PowerShell):
```powershell
cd backend
$env:PYTHONPATH='.'
./venv/Scripts/python.exe -c "from app import create_app; app=create_app(); print('OK', len(list(app.url_map.iter_rules())))"
```

Option B (cmd.exe):
```bat
cd /d backend
venv\Scripts\python.exe -c "import sys; sys.path.append('.'); from app import create_app; app=create_app(); print('OK', len(list(app.url_map.iter_rules())))"
```

You should see output starting with `OK` and a number of registered routes.

3) Optionally run the dev server to ensure startup works:
```powershell
$env:FLASK_APP='flask_app.py'
./venv/Scripts/python.exe -m flask run
```

## Notes

- No frontend files were modified (per repository rule). All changes were limited to backend files.
