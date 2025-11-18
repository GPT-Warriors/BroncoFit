from pydantic_settings import BaseSettings
from typing import Optional
import sys


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
except Exception as e:
    print("\n" + "="*60)
    print("ERROR: Failed to load configuration")
    print("="*60)
    print(f"\n{str(e)}\n")
    print("Make sure you have a .env file with all required variables:")
    print("  - JWT_SECRET_KEY")
    print("  - GEMINI_API_KEY")
    print("\nSee .env.example for a template.")
    print("="*60 + "\n")
    sys.exit(1)

