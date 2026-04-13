from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL_VISION: str = "gpt-4o"
    OPENAI_MODEL_TEXT: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 2000
    PORT: int = 8000
    DEBUG: bool = False
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "https://your-frontend.vercel.app",
    ]
    SCRAPE_TIMEOUT_SECONDS: int = 15
    MAX_HTML_SIZE_BYTES: int = 2_000_000
    MAX_UPLOAD_SIZE_MB: int = 10

    class Config:
        env_file = ".env"

settings = Settings()