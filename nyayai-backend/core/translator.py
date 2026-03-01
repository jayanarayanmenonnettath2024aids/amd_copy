from utils.logger import app_logger
from deep_translator import GoogleTranslator

def translate_to_english(text: str) -> str:
    """Translates native text to English."""
    if not text:
        return ""
    try:
        app_logger.info("Translating text to English...")
        # Chunk text if necessary, deep_translator handles up to 5k chars natively usually
        return GoogleTranslator(source='auto', target='en').translate(text)
    except Exception as e:
        app_logger.error(f"Translation to English failed: {e}")
        return text

def translate_to_native(text: str, lang: str) -> str:
    """Translates English text to a native language."""
    if not text or lang.lower() == "english":
        return text
        
    target_lang = "hi" if lang.lower() == "hindi" else lang.lower()
    try:
        app_logger.info(f"Translating text to {target_lang}...")
        return GoogleTranslator(source='en', target=target_lang).translate(text)
    except Exception as e:
        app_logger.error(f"Translation to native failed: {e}")
        return text
