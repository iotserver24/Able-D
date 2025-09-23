import os
from datetime import timedelta


class Config:
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_EXPIRES_HOURS", "12")))

    # Mongo (Azure Cosmos DB for MongoDB API)
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "abled")

    # Firebase Admin
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
    FIREBASE_CREDENTIALS_FILE = os.getenv("FIREBASE_CREDENTIALS_FILE")  # path to service account json
    FIREBASE_CREDENTIALS_BASE64 = os.getenv("FIREBASE_CREDENTIALS_BASE64")  # base64 of service account json

