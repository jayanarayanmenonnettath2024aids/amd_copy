import requests
import json
import sys

# Test keys from the user's .env file
keys = [
    "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",
    "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"
]

for i, key in enumerate(keys):
    print(f"\n--- Testing Key {i+1} ---")
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {key}",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "NyayAI Offline Assistant Setup"
        },
        json={
            "model": "meta-llama/llama-3.3-70b-instruct:free",
            "messages": [{"role": "user", "content": "Hello"}],
            "temperature": 0.2,
            "top_p": 0.9,
            "max_tokens": 1024
        }
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
