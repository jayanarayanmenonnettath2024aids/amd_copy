import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(override=True)

# Base Directory Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Sub-directories
MODELS_DIR = DATA_DIR / "models"
UPLOADS_DIR = DATA_DIR / "uploads"
RAG_INDEX_DIR = DATA_DIR / "rag_index"

# Ensure directories exist
for directory in [MODELS_DIR, UPLOADS_DIR, RAG_INDEX_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Application Settings
MAX_UPLOAD_SIZE_MB = 10
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

# Model Settings
GGUF_MODEL_PATH = MODELS_DIR / "nyayai_legal.gguf"

# Prototype Loophole Settings
# If true, uses a local standard Instruct model for prototype evaluation instead of the dummy nyayai_legal.gguf
USE_PROTOTYPE_LOOPHOLE = os.getenv("USE_PROTOTYPE_LOOPHOLE", "True") == "True"
PROTOTYPE_MODEL_PATH = MODELS_DIR / "prototype_model.gguf"

# OpenRouter External Inference Fallback
USE_OPENROUTER = os.getenv("USE_OPENROUTER", "False") == "True"
# Read individual keys for easier configuration management
key1 = os.getenv("OPENROUTER_API_KEY_1", "").strip()
key2 = os.getenv("OPENROUTER_API_KEY_2", "").strip()
OPENROUTER_API_KEYS = [k for k in (key1, key2) if k]
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")

# Database Configuration
DATABASE_URL = str(BASE_DIR / "nyayai.db")
