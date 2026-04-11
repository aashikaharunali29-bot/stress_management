from __future__ import annotations

from typing import Any

from ipip_bank import IPIP_50_URL, fetch_ipip_items

PERSONALITY_OPTIONS = [
    {"label": "Very Inaccurate", "value": 1},
    {"label": "Moderately Inaccurate", "value": 2},
    {"label": "Neither Accurate Nor Inaccurate", "value": 3},
    {"label": "Moderately Accurate", "value": 4},
    {"label": "Very Accurate", "value": 5},
]

def build_personality_questions() -> list[dict[str, Any]]:
    factor_buckets: dict[str, list[dict[str, Any]]] = {}
    for item in fetch_ipip_items():
        factor_buckets.setdefault(item["factor"], []).append(item)

    selected_items: list[dict[str, Any]] = [
        factor_buckets["Extraversion"][1],
        factor_buckets["Agreeableness"][0],
    ]

    questions = []
    for index, item in enumerate(selected_items, start=1):
        options = []
        for option in PERSONALITY_OPTIONS:
            value = option["value"]
            if item["direction"] == "-":
                value = 6 - value
            options.append({**option, "value": value})

        questions.append(
            {
                "id": index,
                "text": item["text"],
                "emoji": "🧠",
                "trait": item["factor"],
                "source": "IPIP",
                "source_url": IPIP_50_URL,
                "options": options,
            }
        )
    return questions


def build_stress_questions() -> list[dict[str, Any]]:
    stress_items = [
        item for item in fetch_ipip_items() if item["factor"] == "Emotional_Stability"
    ][:1]
    questions = []
    for index, item in enumerate(stress_items, start=1):
        questions.append(
            {
                "id": index,
                "text": item["text"],
                "emoji": "😟" if item["direction"] == "-" else "😌",
                "trait": item["factor"],
                "direction": item["direction"],
                "source": "IPIP",
                "source_url": IPIP_50_URL,
            }
        )
    return questions


def build_assessment_questions() -> dict[str, Any]:
    personality_questions = build_personality_questions()
    stress_questions = build_stress_questions()
    return {
        "source": "ipip_public_domain",
        "personality_questions": personality_questions,
        "stress_questions": stress_questions,
    }
