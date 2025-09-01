from pydantic import BaseSettings

class Settings(BaseSettings):
    max_failed_attempts: int
    session_timeout_minutes: int
    token_expiry_minutes: int
    secret_key: str
    algorithm: str

    class Config:
        env_file = ".env"

settings = Settings()
