from __future__ import annotations

import os
from typing import Any

import requests
from dotenv import load_dotenv

from ai_client import post_gemini_json, post_openai_json

load_dotenv()

TASKS_API_URL = os.getenv("TASKS_API_URL", "").strip()
BORED_API_RANDOM_URL = os.getenv(
    "BORED_API_RANDOM_URL", "https://bored-api.appbrewery.com/random"
).strip()

_ACTIVITY_EMOJI = {
    "social": "🤝",
    "relaxation": "🌿",
    "education": "📚",
    "busywork": "🧹",
    "music": "🎵",
    "charity": "💞",
    "cooking": "🍲",
    "recreational": "🌤️",
    "diy": "🛠️",
}

RELATIONSHIP_FOCUS = {
    "High": "repair and emotional safety",
    "Medium": "steady communication and support",
    "Low": "maintenance and gentle connection",
}


def _fetch_random_activity() -> dict[str, Any]:
    response = requests.get(BORED_API_RANDOM_URL, timeout=5)
    response.raise_for_status()
    return response.json()


def _fetch_external_task_api(level: str, personality_type: str) -> list[dict[str, Any]]:
    response = requests.post(
        TASKS_API_URL,
        json={"stress_level": level, "personality_type": personality_type},
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    return data.get("tasks", data)


def _estimate_duration(activity: dict[str, Any]) -> str:
    duration = activity.get("duration")
    if isinstance(duration, int):
        return f"{duration} min"
    if isinstance(duration, str) and duration.strip():
        raw = duration.strip()
        if any(token in raw for token in ("min", "hour", "day", "week")):
            return raw
        return f"{raw} min"
    return "10-20 min"


def _build_task_from_activity(
    activity: dict[str, Any],
    stress_level: str,
    personality_type: str,
) -> dict[str, Any]:
    activity_text = str(activity.get("activity", "")).strip()
    activity_type = str(activity.get("type", "recreational")).strip().lower() or "recreational"
    participants = activity.get("participants", 1)
    focus = RELATIONSHIP_FOCUS.get(stress_level, RELATIONSHIP_FOCUS["Medium"])

    social_note = (
        "Do it solo first if you need a calm reset."
        if participants == 1
        else "If it fits, invite someone you trust."
    )

    title = activity_text if activity_text else "Do a small reset activity"
    desc = (
        f"Try: {activity_text or 'a small reset activity'}. "
        f"This supports {focus} for a {personality_type.lower()} style. "
        f"{social_note}"
    )

    return {
        "title": title[:80],
        "desc": desc,
        "emoji": _ACTIVITY_EMOJI.get(activity_type, "✨"),
        "duration": _estimate_duration(activity),
        "category": "social" if activity_type == "social" else "mindful",
    }


def _generate_ai_tasks(
    level: str,
    personality_type: str,
    *,
    count: int = 5,
    avoid_titles: list[str] | None = None,
) -> list[dict[str, Any]]:
    avoid_titles = [t.strip() for t in (avoid_titles or []) if isinstance(t, str) and t.strip()]
    prompt = f"""
Generate exactly {count} personalized micro-tasks for stress management.
This app is relationship-focused: emotional regulation, communication, gentle reconnection.

Return JSON with:
- source: "ai_tasks"
- tasks: array of exactly {count} objects

Each task object must have:
- title (<= 60 chars)
- desc (<= 280 chars, practical, not clinical)
- emoji (single emoji)
- duration (e.g. "5 min", "15-20 min")
- category: one of ["social","mindful","reflection","reset"]

Personalization:
- stress_level = {level}
- personality_type = {personality_type}
Avoid repeating these previous task titles (if any):
{avoid_titles}

Rules:
- No medical claims. No diagnosis language.
- Avoid repeating the same structure across tasks.
- Make them doable today.
"""

    try:
        data = post_openai_json(
            messages=[
                {"role": "system", "content": "Return JSON only. No markdown."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=900,
            temperature=0.9,
        )
    except Exception:
        data = post_gemini_json(prompt=prompt, temperature=0.9)

    tasks = data.get("tasks")
    if not isinstance(tasks, list) or len(tasks) != count:
        raise RuntimeError("AI did not return the expected tasks payload")
    return tasks


def get_tasks(
    level: str,
    personality_type: str = "Balanced Individual",
    context: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    if TASKS_API_URL:
        return _fetch_external_task_api(level, personality_type)

    # Prefer AI-generated tasks (dynamic every call). If keys are not configured
    # or the model call fails, fall back to dynamic tasks derived from the Bored API.
    avoid_titles: list[str] = []
    if isinstance(context, dict):
        raw = context.get("recent_task_titles") or context.get("avoid_task_titles") or []
        if isinstance(raw, list):
            avoid_titles = [str(x) for x in raw if x]

    try:
        data = _generate_ai_tasks(level, personality_type, count=5, avoid_titles=avoid_titles)
        return data
    except Exception:
        pass

    activity_pool: list[dict[str, Any]] = []
    seen_keys: set[str] = set()

    for _ in range(12):
        try:
            activity = _fetch_random_activity()
        except requests.RequestException:
            continue
        unique_key = str(activity.get("key") or activity.get("activity", "")).strip().lower()
        if not unique_key or unique_key in seen_keys:
            continue
        seen_keys.add(unique_key)
        activity_pool.append(activity)
        if len(activity_pool) >= 7:
            break

    if not activity_pool:
        raise RuntimeError("No activities returned from the external task API")

    return [
        _build_task_from_activity(activity, level, personality_type)
        for activity in activity_pool[:5]
    ]
