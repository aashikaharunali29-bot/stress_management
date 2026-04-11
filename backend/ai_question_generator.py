from __future__ import annotations

import json
import random
from typing import Any

from ai_client import post_gemini_json, post_openai_json


def generate_dynamic_assessment_questions(email: str, context: dict[str, Any]) -> dict[str, Any]:
    prompt = f"""
Generate exactly 3 question objects for a mindful stress and personality check-in.
The app focuses on relationship stress, emotional regulation, and practical coping.

Return JSON with:
- source: "openai_dynamic"
- personality_questions: array of exactly 2 objects
- stress_questions: array with exactly 1 object

Personality question rules:
- Each object has id, text, emoji, trait, options
- trait must be one of: Extraversion, Agreeableness, Conscientiousness, Emotional_Stability, Openness
- options must be an array of exactly 4 objects
- each option has label, emoji, value
- values must be integers 1 to 4

Stress question rules:
- Each object has id, text, emoji, trait, scale
- trait must be Emotional_Stability
- scale must be an array of exactly 5 objects
- each scale option has label, emoji, value
- values must be integers 1 to 5

Style:
- relationship focused
- friendly and warm
- practical and not clinical
- keep the language short and easy to answer on mobile

    User context:
email={email}
context={json.dumps(context, ensure_ascii=False)}
"""

    try:
        data = post_openai_json(
            messages=[
                {
                    "role": "system",
                    "content": "You generate JSON only. Do not include markdown.",
                },
                {"role": "user", "content": prompt},
            ],
        )
    except Exception:
        data = post_gemini_json(prompt=prompt)
    if "personality_questions" not in data or "stress_questions" not in data:
        raise RuntimeError("OpenAI did not return the expected assessment payload")
    return data


def generate_gamified_personality_questions(email: str, context: dict[str, Any]) -> list[dict[str, Any]]:
    data = generate_dynamic_assessment_questions(email, context)
    return data.get("personality_questions", [])


def generate_offline_assessment_questions(email: str, context: dict[str, Any]) -> dict[str, Any]:
    # "Offline" here means "no LLM available". We still try to avoid hardcoded
    # questions by sampling public-domain IPIP items when reachable.
    from ipip_bank import fetch_ipip_items

    rng = random.Random()
    personality_options = [
        {"label": "Not like me", "emoji": "○", "value": 1},
        {"label": "A little", "emoji": "◔", "value": 2},
        {"label": "Somewhat", "emoji": "◑", "value": 3},
        {"label": "Very much", "emoji": "●", "value": 4},
    ]

    try:
        items = fetch_ipip_items()
        by_factor: dict[str, list[dict[str, Any]]] = {}
        for item in items:
            by_factor.setdefault(item["factor"], []).append(item)

        personality_items = [
            rng.choice(by_factor.get("Extraversion", items)),
            rng.choice(by_factor.get("Agreeableness", items)),
        ]
        stress_items = by_factor.get("Emotional_Stability", items)
        stress_item = rng.choice(stress_items)

        personality_questions = [
            {
                "id": index,
                "text": item["text"],
                "emoji": "🧠",
                "trait": item["factor"],
                "options": personality_options,
            }
            for index, item in enumerate(personality_items, start=1)
        ]

        return {
            "source": "ipip_offline_fallback",
            "personality_questions": personality_questions,
            "stress_questions": [
                {
                    "id": 1,
                    "text": stress_item["text"],
                    "emoji": "🌡️",
                    "trait": "Emotional_Stability",
                }
            ],
        }
    except Exception:
        return {
            "source": "local_offline_fallback",
            "personality_questions": [
                {
                    "id": 1,
                    "text": "When stress rises, I can still stay kind and steady with people I care about.",
                    "emoji": "🤝",
                    "trait": "Agreeableness",
                    "options": personality_options,
                },
                {
                    "id": 2,
                    "text": "Talking things through with someone I trust helps me reset.",
                    "emoji": "💬",
                    "trait": "Extraversion",
                    "options": personality_options,
                },
            ],
            "stress_questions": [
                {
                    "id": 1,
                    "text": "In the last few days, I have felt tense or emotionally overloaded.",
                    "emoji": "🌡️",
                    "trait": "Emotional_Stability",
                }
            ],
        }
