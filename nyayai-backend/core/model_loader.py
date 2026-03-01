from llama_cpp import Llama
from config import GGUF_MODEL_PATH, USE_PROTOTYPE_LOOPHOLE, PROTOTYPE_MODEL_PATH, USE_OPENROUTER, OPENROUTER_API_KEYS, OPENROUTER_MODEL
from utils.logger import app_logger

import os
import requests
import json
import random

llm = None
_current_key_idx = 0

def get_openrouter_key():
    """Round-robin load balancer for OpenRouter API keys."""
    global _current_key_idx
    if not OPENROUTER_API_KEYS:
        return None
    key = OPENROUTER_API_KEYS[_current_key_idx]
    _current_key_idx = (_current_key_idx + 1) % len(OPENROUTER_API_KEYS)
    return key

def get_llm():
    global llm
    if llm is None:
        try:
            model_to_load = PROTOTYPE_MODEL_PATH if USE_PROTOTYPE_LOOPHOLE else GGUF_MODEL_PATH
            
            if not model_to_load.exists():
                app_logger.warning(f"Model not found at {model_to_load}. Inference will fail.")
                if USE_PROTOTYPE_LOOPHOLE:
                    app_logger.warning("Please download a standard LLaMA Instruct GGUF model and place it at data/models/prototype_model.gguf")
            else:
                app_logger.info(f"Loading GGUF model from {model_to_load}")
                llm = Llama(
                    model_path=str(model_to_load),
                    n_ctx=4096,
                    n_threads=8,
                    temperature=0.2,
                    top_p=0.9,
                    repeat_penalty=1.1,
                    verbose=False,
                    # Optional: uncomment if you want to force a specific chat format, otherwise it auto-detects
                    # chat_format="llama-2" 
                )
        except Exception as e:
            app_logger.error(f"Failed to load LLM: {str(e)}")
    return llm

async def run_openrouter_llm(messages: list) -> str:
    """Runs a chat completion through the OpenRouter REST API with key load balancing."""
    api_key = get_openrouter_key()
    if not api_key:
        return "ERROR: OpenRouter is enabled but no API keys were provided in OPENROUTER_API_KEYS."
    
    app_logger.info(f"Routing to OpenRouter API (Model: {OPENROUTER_MODEL})...")
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "NyayAI Offline Assistant Setup"
            },
            json={
                "model": OPENROUTER_MODEL,
                "messages": messages,
                "temperature": 0.2,
                "top_p": 0.9,
                "max_tokens": 1024
            }
        )
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()
    except requests.exceptions.HTTPError as e:
        app_logger.error(f"OpenRouter API HTTP Error: {str(e)}")
        if e.response is not None:
            app_logger.error(f"OpenRouter Raw Payload: {e.response.text}")
        return "ERROR: OpenRouter API Inference failed."
    except Exception as e:
        app_logger.error(f"OpenRouter Unexpected Error: {str(e)}")
        return "ERROR: OpenRouter API Inference failed due to an unexpected error."

async def run_llm(messages: list) -> str:
    """Runs a chat completion through either OpenRouter or the loaded local LLM based on config."""
    if USE_OPENROUTER:
        return await run_openrouter_llm(messages)
        
    model = get_llm()
    if not model:
        failed_path = "prototype_model.gguf" if USE_PROTOTYPE_LOOPHOLE else "nyayai_legal.gguf"
        return f"ERROR: LLM is not loaded. Please ensure {failed_path} exists in data/models/."
    
    try:
        app_logger.info("Running LLM Chat Inference...")
        response = model.create_chat_completion(
            messages=messages,
            max_tokens=1024
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        app_logger.error(f"Chat Inference error: {str(e)}")
        # Fallback to standard text generation if model doesn't support chat formatting metadata
        try:
            app_logger.info("Falling back to standard text completion...")
            prompt = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in messages]) + "\nAssistant: "
            response = model(prompt, max_tokens=1024)
            return response["choices"][0]["text"].strip()
        except Exception as fallback_e:
            app_logger.error(f"Fallback inference also failed: {str(fallback_e)}")
            return "ERROR: Inference failed."
