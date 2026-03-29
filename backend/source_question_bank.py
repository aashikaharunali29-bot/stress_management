from __future__ import annotations

import re
from functools import lru_cache
from typing import Any

import requests

IPIP_50_URL = "https://ipip.ori.org/new_ipip-50-item-scale.htm"

PERSONALITY_OPTIONS = [
    {"label": "Very Inaccurate", "value": 1},
    {"label": "Moderately Inaccurate", "value": 2},
    {"label": "Neither Accurate Nor Inaccurate", "value": 3},
    {"label": "Moderately Accurate", "value": 4},
    {"label": "Very Accurate", "value": 5},
]

IPIP_FACTOR_MAP = {
    "1": "Extraversion",
    "2": "Agreeableness",
    "3": "Conscientiousness",
    "4": "Emotional_Stability",
    "5": "Openness",
}

def _decode_ipip_html(content: bytes) -> str:
    if b"\x00" in content:
        return content.decode("utf-16le", errors="ignore")
    return content.decode("cp1252", errors="ignore")


def _clean_html_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<.*?>", "", value)).strip()


@lru_cache(maxsize=1)
def fetch_ipip_items() -> list[dict[str, Any]]:
    response = requests.get(IPIP_50_URL, timeout=30)
    response.raise_for_status()
    html = _decode_ipip_html(response.content)

    pattern = re.compile(
        r"<tr>\s*<td width=\"26\">\s*<p>(\d+)\.</p>\s*</td>\s*"
        r"<td width=\"192\">\s*<p>(.*?)</p>\s*</td>.*?"
        r"<td width=\"41\">\s*<p>\((\d)([+-])\)\s*</p>\s*</td>\s*</tr>",
        re.S,
    )
    items = []
    for number, text, factor, direction in pattern.findall(html):
        items.append(
            {
                "id": int(number),
                "text": _clean_html_text(text),
                "factor": IPIP_FACTOR_MAP[factor],
                "direction": direction,
            }
        )

    if len(items) < 40:
        raise RuntimeError("Unable to parse enough IPIP items from official source")
    return items


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
