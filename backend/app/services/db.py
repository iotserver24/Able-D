from __future__ import annotations

import threading
from typing import Optional

from flask import current_app
from pymongo import MongoClient


_client_lock = threading.Lock()
_client: Optional[MongoClient] = None


def get_mongo_client() -> MongoClient:
    global _client
    if _client is not None:
        return _client
    with _client_lock:
        if _client is None:
            mongo_uri = current_app.config["MONGO_URI"]
            _client = MongoClient(mongo_uri)
    return _client


def get_db():
    client = get_mongo_client()
    db_name = current_app.config["MONGO_DB_NAME"]
    return client[db_name]


