from __future__ import annotations

from flask import Blueprint


# Deprecated test UI removed intentionally. Keep blueprint for compatibility with no routes.
test_ui_bp = Blueprint("test_ui", __name__)


