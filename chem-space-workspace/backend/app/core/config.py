"""
Chem-Space Workspace Configuration
Centralized settings management using Pydantic Settings.
"""
from functools import lru_cache
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Chem-Space Workspace"
    app_version: str = "0.1.0"
    debug: bool = True
    environment: str = "development"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    frontend_url: str = "http://localhost:5173"

    # Database
    database_url: str = "sqlite+aiosqlite:///./chemspace_workspace.db"

    # LLM Providers
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o"
    openai_base_url: str = "https://api.openai.com/v1"

    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-3-5-sonnet-20241022"
    anthropic_base_url: str = "https://api.anthropic.com"

    google_api_key: Optional[str] = None
    google_model: str = "gemini-1.5-pro"

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"

    # Chemistry External Services
    pubchem_base_url: str = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
    chembl_base_url: str = "https://www.ebi.ac.uk/chembl/api/data"

    # NVIDIA BioNeMo NIMs
    ngc_api_key: Optional[str] = None
    boltz2_nim_url: str = "https://health.api.nvidia.com/v1/biology/boltz2"
    diffdock_nim_url: str = "https://health.api.nvidia.com/v1/biology/diffdock"
    genmol_nim_url: str = "https://health.api.nvidia.com/v1/biology/genmol"
    molmim_nim_url: str = "https://health.api.nvidia.com/v1/biology/molmim"

    # Workflow Engine
    workflow_max_concurrent_tasks: int = 4
    workflow_default_timeout_seconds: int = 300
    workflow_max_retries: int = 3
    workflow_retry_delay_seconds: int = 5

    # Security
    secret_key: str = "your-secret-key-change-in-production"
    api_key_header: str = "X-API-Key"

    # CORS
    allowed_origins: List[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://localhost:3000"]
    )

    # Logging
    log_level: str = "INFO"

    @property
    def has_llm_provider(self) -> bool:
        """Check if at least one LLM provider is configured."""
        return any([
            self.openai_api_key,
            self.anthropic_api_key,
            self.google_api_key,
        ])

    @property
    def has_nvidia_nim(self) -> bool:
        """Check if NVIDIA NIMs are configured."""
        return self.ngc_api_key is not None


@lru_cache
def get_settings() -> Settings:
    return Settings()