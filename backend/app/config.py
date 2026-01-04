"""
Configuration settings for the backend
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # Upload settings
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB

    class Config:
        env_file = ".env"
        extra = "ignore"   # 🔥 FIXES debug error

settings = Settings()

