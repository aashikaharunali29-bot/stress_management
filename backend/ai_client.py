from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()


def parse_json(content: str) -> Any:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start = content.find("{")
        end = content.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(content[start:end])
        raise


def post_openai_json(
    *,
    messages: list[dict[str, str]],
    max_tokens: int = 1200,
    temperature: float = 0.8,
) -> Any:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        },
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    return parse_json(data["choices"][0]["message"]["content"])


def post_gemini_json(*, prompt: str, temperature: float = 0.8) -> Any:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    response = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}",
        headers={"Content-Type": "application/json"},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json",
            },
        },
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    return parse_json(data["candidates"][0]["content"]["parts"][0]["text"])

