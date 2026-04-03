import json

from ollama import Client

from app.config import OLLAMA_HOST, OLLAMA_MODEL


class OllamaClient:
    def __init__(self):
        self.client = Client(host=OLLAMA_HOST)

    def chat_json(self, prompt: str) -> dict:
        response = self.client.chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
            format="json",
        )
        return json.loads(response["message"]["content"])
