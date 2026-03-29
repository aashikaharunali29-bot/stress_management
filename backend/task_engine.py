from __future__ import annotations

import hashlib
import os
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()

TASKS_API_URL = os.getenv("TASKS_API_URL", "").strip()
BORED_API_RANDOM_URL = os.getenv(
    "BORED_API_RANDOM_URL", "https://bored-api.appbrewery.com/random"
).strip()

RELATIONSHIP_TASK_LIBRARY = {
    "social": [
        {
            "title": "Send a gentle check-in message",
            "desc": "Reach out to one person you trust with a simple honest line like 'I have had a heavy day and wanted to say hi.' Small contact reduces isolation and protects relationships before stress turns into distance.",
            "emoji": "💬",
            "category": "social",
        },
        {
            "title": "Plan one repair conversation",
            "desc": "Choose one relationship that feels tense and decide on a calm time to talk. Planning the conversation lowers avoidance and helps you show up with more care than reactivity.",
            "emoji": "🤝",
            "category": "social",
        },
        {
            "title": "Ask for support clearly",
            "desc": "Tell someone exactly what would help today such as listening, a walk, or a short call. Clear requests make connection easier and reduce resentment on both sides.",
            "emoji": "🫶",
            "category": "social",
        },
    ],
    "relaxation": [
        {
            "title": "Pause before replying",
            "desc": "Take a calm-down break before answering any emotionally charged message. This creates space between stress and reaction so your relationships feel safer.",
            "emoji": "🌿",
            "category": "mindful",
        },
        {
            "title": "Do a two-minute grounding reset",
            "desc": "Relax your shoulders, slow your breath, and notice five things around you. Regulating your body first makes it easier to stay kind and steady with the people around you.",
            "emoji": "🧘",
            "category": "mindful",
        },
        {
            "title": "Write the unsent version first",
            "desc": "If you feel triggered, write your first reaction privately and do not send it. This protects the relationship while helping you understand what you actually need to say.",
            "emoji": "✍️",
            "category": "mindful",
        },
    ],
    "education": [
        {
            "title": "Learn one conflict-softening phrase",
            "desc": "Practice a line like 'Can we restart this?' or 'I want to understand before I respond.' Small communication tools can quickly lower tension in real conversations.",
            "emoji": "📘",
            "category": "reflection",
        },
        {
            "title": "Name your stress trigger",
            "desc": "Identify what usually makes you withdraw, snap, or over-explain in relationships. Awareness helps you interrupt the pattern before it becomes damage.",
            "emoji": "🧠",
            "category": "reflection",
        },
        {
            "title": "Reframe one story",
            "desc": "Notice one assumption you are making about someone today and replace it with a kinder interpretation. This supports calmer, more accurate connection.",
            "emoji": "🔍",
            "category": "reflection",
        },
    ],
    "busywork": [
        {
            "title": "Clear one stress hotspot",
            "desc": "Tidy one small area that usually raises friction at home or work. Reducing background chaos can make your interactions feel less sharp and reactive.",
            "emoji": "🧺",
            "category": "reset",
        },
        {
            "title": "Protect one no-phone moment",
            "desc": "Choose one meal, call, or five-minute chat today to keep phone-free. Full attention often matters more to relationships than long conversations.",
            "emoji": "📵",
            "category": "reset",
        },
        {
            "title": "Reduce one future conflict",
            "desc": "Handle one small unfinished task that could create tension later. Lowering hidden stress gives you more patience with people you care about.",
            "emoji": "🗂",
            "category": "reset",
        },
    ],
    "music": [
        {
            "title": "Make a regulate-and-reconnect playlist",
            "desc": "Pick a few songs that help you settle before a conversation or after conflict. Having a reset ritual makes it easier to return to relationships with warmth.",
            "emoji": "🎵",
            "category": "mindful",
        },
        {
            "title": "Take a music-based reset walk",
            "desc": "Use one song to breathe and walk before you revisit a stressful interaction. This can lower emotional intensity enough to respond more thoughtfully.",
            "emoji": "🎧",
            "category": "mindful",
        },
    ],
    "charity": [
        {
            "title": "Offer one small act of care",
            "desc": "Do one thoughtful thing for someone close to you without making it big or performative. Small prosocial acts can rebuild closeness when stress has made you feel distant.",
            "emoji": "💞",
            "category": "social",
        },
        {
            "title": "Practice appreciation out loud",
            "desc": "Tell one person something specific you value about them today. Appreciation is a strong antidote to stress-driven negativity in relationships.",
            "emoji": "🌼",
            "category": "social",
        },
    ],
    "diy": [
        {
            "title": "Create a calm corner",
            "desc": "Set up one small space where you can reset before difficult conversations. A visible calming ritual helps prevent carrying stress into relationships.",
            "emoji": "🪴",
            "category": "reset",
        },
        {
            "title": "Build a relationship reminder card",
            "desc": "Write down three things to remember when you are overwhelmed: breathe, ask, do not assume. Use it when tension rises so you act from intention instead of overload.",
            "emoji": "🧩",
            "category": "reflection",
        },
    ],
    "cooking": [
        {
            "title": "Share a simple ritual",
            "desc": "Invite someone to tea, fruit, or a quick snack with no heavy agenda. Low-pressure rituals create connection without demanding a big emotional talk.",
            "emoji": "🍵",
            "category": "social",
        },
        {
            "title": "Nourish before you discuss",
            "desc": "Eat or hydrate before a sensitive conversation if you have been running on empty. Regulation is harder when your body is depleted, and relationships feel that.",
            "emoji": "🥣",
            "category": "mindful",
        },
    ],
    "recreational": [
        {
            "title": "Schedule a light moment together",
            "desc": "Invite someone important into one low-stakes activity like a short walk, tea break, or silly video. Shared ease can reopen closeness after stressful days.",
            "emoji": "🌤",
            "category": "social",
        },
        {
            "title": "Reconnect through play",
            "desc": "Choose one tiny playful act today like a kind meme, inside joke, or short walk. Positive moments help relationships recover from stress accumulation.",
            "emoji": "🎈",
            "category": "social",
        },
    ],
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


def _library_for_activity(activity_type: str) -> list[dict[str, Any]]:
    return RELATIONSHIP_TASK_LIBRARY.get(
        activity_type,
        RELATIONSHIP_TASK_LIBRARY["recreational"],
    )


def _personalize_description(
    base_desc: str,
    stress_level: str,
    personality_type: str,
    activity: dict[str, Any],
) -> str:
    focus = RELATIONSHIP_FOCUS.get(stress_level, RELATIONSHIP_FOCUS["Medium"])
    participants = activity.get("participants", 1)
    social_note = (
        " It works well as a solo reset before you reconnect."
        if participants == 1
        else " It can also be shared with someone you trust."
    )
    return (
        f"{base_desc} This is tailored for {focus} and a {personality_type.lower()} style."
        f"{social_note}"
    )


def _estimate_duration(activity: dict[str, Any]) -> str:
    duration = activity.get("duration")
    if isinstance(duration, int):
        return f"{duration} min"
    if isinstance(duration, str) and duration.strip():
        raw = duration.strip()
        return raw if "min" in raw or "hour" in raw or "day" in raw or "week" in raw else f"{raw} min"
    return "10-20 min"


def _build_task_from_activity(
    activity: dict[str, Any],
    stress_level: str,
    personality_type: str,
) -> dict[str, Any]:
    activity_type = activity.get("type", "recreational")
    library = _library_for_activity(activity_type)
    seed = f"{activity.get('key', '')}:{activity.get('activity', '')}:{personality_type}:{stress_level}"
    template_index = int(hashlib.sha256(seed.encode("utf-8")).hexdigest(), 16) % len(library)
    template = library[template_index]

    return {
        "title": template["title"],
        "desc": _personalize_description(
            template["desc"], stress_level, personality_type, activity
        ),
        "emoji": template["emoji"],
        "duration": _estimate_duration(activity),
        "category": template["category"],
    }


def get_tasks(level: str, personality_type: str = "Balanced Individual") -> list[dict[str, Any]]:
    if TASKS_API_URL:
        return _fetch_external_task_api(level, personality_type)

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

    tasks = [
        _build_task_from_activity(activity, level, personality_type)
        for activity in activity_pool[:5]
    ]
    return tasks
