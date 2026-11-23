from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_key: str = "change-me-in-production"
    chroma_persist_dir: str = "/data/chroma"
    redis_url: str = "redis://localhost:6379/0"
    searxng_url: str = "http://searxng:8080"

    # LLM provider: "tpu" (Kaggle TPU, primary), "llamacpp" (local), "deepseek", "openai_compatible"
    llm_provider: str = "tpu"
    llm_base_url: str = "http://llamacpp:8080/v1"
    llm_model: str = "qwen3-14b"

    # DeepSeek settings
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"
    deepseek_base_url: str = "https://api.deepseek.com/v1"

    # OpenAI-compatible settings
    openai_base_url: str = ""
    openai_model: str = ""
    openai_api_key: str = ""

    # Kaggle TPU settings
    tpu_base_url: str = ""
    tpu_model: str = "gemma-2-9b-it"


settings = Settings()
