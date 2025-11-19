import logging
from pydantic_settings import BaseSettings
from typing import Optional
import sys

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # MongoDB Configuration
    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "broncofit"

    # JWT Configuration
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Gemini AI Configuration
    gemini_api_key: str

    class Config:
        env_file = ".env"
        case_sensitive = False


try:
    settings = Settings()
except Exception:
    logger.exception(
        "Failed to load configuration. Ensure JWT_SECRET_KEY and GEMINI_API_KEY are set."
    )
    sys.exit(1)

