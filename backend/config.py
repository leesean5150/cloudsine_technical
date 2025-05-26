from pydantic_settings import BaseSettings
from pydantic import PostgresDsn

class Settings(BaseSettings):
    """
    use pydantic settings for parsing environment file
    """
    
    DATABASE_URL: PostgresDsn
    VIRUSTOTAL_API_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
