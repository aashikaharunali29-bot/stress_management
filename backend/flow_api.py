from __future__ import annotations

import os
import random
from typing import Any

from fastapi import APIRouter, HTTPException

from ai_client import post_gemini_json, post_openai_json
from relief_library import RELIEF_LIBRARY, build_youtube_embed_url

router = APIRouter()

def _generate(prompt: str) -> dict[str, Any]:
    try:
        return post_openai_json(
            messages=[
                {"role": "system", "content": "Return JSON only."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=900,
            temperature=0.9,
        )
    except Exception:
        try:
            return post_gemini_json(prompt=prompt, temperature=0.9)
        except Exception:
            return {}


def _offline_games(language: str, mood: str) -> dict[str, Any]:
    return _offline_games_v2(language=language, mood=mood, previous_type=None)


def _build_water_sort_game(*, rng: random.Random) -> dict[str, Any]:
    # Keep this solvable with 3 tubes by using 2 colors + 1 empty tube.
    colors = ["R", "G", "B", "Y"]
    rng.shuffle(colors)
    c0, c1 = colors[0], colors[1]
    tube_a = [c0, c1, c0, c1]
    tube_b = [c1, c0, c1, c0]
    tube_c: list[str] = []
    tubes = [tube_a, tube_b, tube_c]
    rng.shuffle(tubes)
    return {
        "id": f"water_sort_{rng.randint(1000, 9999)}",
        "title": "Water sort mini-game",
        "type": "water_sort",
        "instruction": "Tap a tube, then tap another tube to pour. You can only pour onto the same color or an empty tube.",
        "reward": "Calm points",
        "payload": {
            "capacity": 4,
            "tubes": tubes,
            "palette": {
                "R": "#dc6d43",
                "G": "#2f7f74",
                "B": "#3b82f6",
                "Y": "#f0b15e",
            },
            "goal": "Make each non-empty tube a single color.",
        },
    }


def _is_valid_water_sort_game(game: dict[str, Any]) -> bool:
    if not isinstance(game, dict):
        return False
    if game.get("type") != "water_sort":
        return False
    payload = game.get("payload")
    if not isinstance(payload, dict):
        return False
    capacity = payload.get("capacity")
    tubes = payload.get("tubes")
    if not isinstance(capacity, int) or capacity < 2 or capacity > 6:
        return False
    if not isinstance(tubes, list) or not tubes:
        return False
    if not any(isinstance(t, list) and len(t) == 0 for t in tubes):
        # Need at least one empty tube to be solvable.
        return False
    colors: set[str] = set()
    for tube in tubes:
        if not isinstance(tube, list):
            return False
        if len(tube) > capacity:
            return False
        for item in tube:
            if not isinstance(item, str) or not item:
                return False
            colors.add(item)
    # Rough solvability guard: need at least (#colors + 1) tubes.
    if len(colors) >= len(tubes):
        return False
    return True


def _build_puzzle_game(*, rng: random.Random) -> dict[str, Any]:
    # Simple dynamic arithmetic sequence
    start = rng.choice([2, 3, 4, 5])
    step = rng.choice([2, 3, 4])
    seq = [start + step * i for i in range(5)]
    missing_index = rng.choice([2, 3])
    answer = str(seq[missing_index])
    display = [str(v) for v in seq]
    display[missing_index] = "?"
    options = {answer}
    while len(options) < 4:
        options.add(str(int(answer) + rng.choice([-6, -4, -2, 2, 4, 6])))
    option_list = list(options)
    rng.shuffle(option_list)
    return {
        "id": f"puzzle_{rng.randint(1000, 9999)}",
        "title": "Finish the pattern",
        "type": "puzzle",
        "instruction": "Pick the missing number to complete the pattern.",
        "reward": "Focus reset",
        "payload": {
            "sequence": display,
            "options": option_list,
            "answer": answer,
            "explain": f"It increases by +{step}.",
        },
    }


def _build_spot_difference_game(*, rng: random.Random) -> dict[str, Any]:
    # A simple "scene" with 3 differences (missing/changed/moved) for real gameplay.
    # Keep a stable viewBox so the frontend can map click coordinates reliably.
    w, h = 240, 160

    base = {
        "bg": "#ffffff",
        "ink": "#14302b",
        "soft": "#e2ddd1",
        "accent": "#dc6d43",
        "mint": "#2f7f74",
        "sky": "#f6efe2",
    }

    # Differences are defined as hit targets in viewBox coordinates.
    diffs = [
        {"x": 56, "y": 44, "r": 16},   # sun color changes
        {"x": 172, "y": 58, "r": 16},  # leaf missing
        {"x": 132, "y": 116, "r": 16}, # mug moved slightly
    ]

    def scene_svg(*, variant: str) -> str:
        # variant: "A" (original) or "B" (with 3 diffs)
        sun_fill = base["accent"] if variant == "B" else "#f0b15e"
        leaf_opacity = "0" if variant == "B" else "1"
        mug_dx = 10 if variant == "B" else 0

        return (
            f"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}' viewBox='0 0 {w} {h}'>"
            f"<rect width='{w}' height='{h}' rx='18' fill='{base['sky']}'/>"
            # Sun
            f"<circle cx='56' cy='44' r='18' fill='{sun_fill}' stroke='{base['ink']}' stroke-opacity='.12'/>"
            # Cloud
            f"<g fill='{base['soft']}' stroke='{base['ink']}' stroke-opacity='.08'>"
            f"<circle cx='130' cy='46' r='14'/>"
            f"<circle cx='146' cy='42' r='12'/>"
            f"<circle cx='158' cy='48' r='10'/>"
            f"<rect x='118' y='46' width='58' height='18' rx='9'/>"
            f"</g>"
            # Plant pot + leaf
            f"<g transform='translate(160 78)'>"
            f"<rect x='0' y='26' width='44' height='26' rx='8' fill='{base['soft']}' stroke='{base['ink']}' stroke-opacity='.10'/>"
            f"<path d='M22 10 C 10 14, 10 32, 22 34 C 34 32, 34 14, 22 10 Z' fill='{base['mint']}' opacity='{leaf_opacity}'/>"
            f"</g>"
            # Table
            f"<rect x='28' y='120' width='184' height='14' rx='7' fill='{base['soft']}'/>"
            # Mug (moved in variant B)
            f"<g transform='translate({96 + mug_dx} 90)'>"
            f"<rect x='0' y='10' width='48' height='38' rx='10' fill='#ffffff' stroke='{base['ink']}' stroke-opacity='.14'/>"
            f"<path d='M48 18 C 60 18, 60 40, 48 40' fill='none' stroke='{base['ink']}' stroke-opacity='.18' stroke-width='6' stroke-linecap='round'/>"
            f"</g>"
            f"</svg>"
        )

    return {
        "id": f"spot_diff_{rng.randint(1000, 9999)}",
        "title": "Spot the difference",
        "type": "spot_difference",
        "instruction": "Compare the two images. Click the right image to find 3 differences.",
        "reward": "Attention reset",
        "payload": {
            "left_svg": scene_svg(variant="A"),
            "right_svg": scene_svg(variant="B"),
            "viewBox": {"w": w, "h": h},
            "diffs": diffs,
            "goal_count": 3,
        },
    }


def _offline_games_v2(*, language: str, mood: str, previous_type: str | None) -> dict[str, Any]:
    rng = random.Random()
    builders = [
        ("water_sort", _build_water_sort_game),
        ("puzzle", _build_puzzle_game),
        ("spot_difference", _build_spot_difference_game),
    ]
    choices = [b for b in builders if b[0] != previous_type] or builders
    game_type, builder = rng.choice(choices)
    game = builder(rng=rng)
    return {"games": [game], "source": "offline_fallback"}


def _offline_relief(level: str, language: str) -> dict[str, Any]:
    if level == "High":
        items = [
            {"title": "Funny clip break", "type": "video", "action": "Open the in-app humor feed and watch a short clip for 2 minutes."},
            {"title": "ASMR pause", "type": "audio", "action": "Play a calming ASMR audio for 3 minutes with headphones on."},
            {"title": "Cooking calm", "type": "video", "action": "Watch a soothing cooking clip and breathe slowly until your body settles."},
            {"title": "Cold water reset", "type": "reset", "action": "Splash cool water on your face, then exhale slowly for 30 seconds."},
        ]
        random.Random(abs(hash((level, language))) % 10_000).shuffle(items)
        return {"source": "offline_fallback", "items": items[:3]}
    return {
        "source": "offline_fallback",
        "items": [
            {"title": "Breathing reset", "type": "audio", "action": "Listen to a 90-second breathing guide inside the app."},
            {"title": "Light humor", "type": "video", "action": "Watch a short lighthearted clip to interrupt the stress loop."},
        ],
    }


@router.get("/games")
def games(
    language: str = "en",
    mood: str = "steady",
    email: str = "",
    previous_type: str = "",
    previous_types: str = "",
):
    previous_set = {t.strip() for t in (previous_types or "").split(",") if t.strip()}
    if previous_type:
        previous_set.add(previous_type)
    prompt = f"""
Create 1 mobile-friendly interactive mini-game for a working professional.
The goal is stress relief and focus reset AFTER personality questions and BEFORE stress questions.
Language: {language}
Mood: {mood}

Return JSON:
{{
  "source":"ai_games",
  "games":[
    {{
      "id":"...",
      "title":"...",
      "type":"water_sort|puzzle|spot_difference",
      "instruction":"...",
      "reward":"...",
      "payload": {{
        "...":"..."
      }}
    }}
  ]
}}

Rules:
- Make it solvable quickly (< 2 minutes).
- Use EXACTLY one of these payload shapes:

water_sort payload:
{{
  "capacity":4,
  "tubes":[["R","G","R","G"],["B","Y","B","Y"],[]],
  "palette":{{"R":"#dc6d43","G":"#2f7f74","B":"#3b82f6","Y":"#f0b15e"}},
  "goal":"Make each non-empty tube a single color."
}}

puzzle payload:
{{"sequence":["2","4","?","8","10"],"options":["6","7","9","12"],"answer":"6","explain":"Counts by +2."}}

spot_difference payload:
{{
  "left_svg":"<svg...>",
  "right_svg":"<svg...>",
  "viewBox":{{"w":120,"h":120}},
  "diffs":[{{"x":30,"y":30,"r":12}},{{"x":60,"y":60,"r":12}},{{"x":90,"y":90,"r":12}}],
  "goal_count":3
}}

Avoid repeating any of these previous types if provided: {sorted(previous_set) or "none"}.
    """
    try:
        data = _generate(prompt)
        games = data.get("games")
        if isinstance(games, list) and games:
            game = games[0]
            if isinstance(game, dict) and game.get("type") in previous_set and len(games) > 1:
                game = next(
                    (g for g in games if isinstance(g, dict) and g.get("type") not in previous_set),
                    game,
                )
            if isinstance(game, dict) and game.get("type") == "water_sort" and not _is_valid_water_sort_game(game):
                return _offline_games_v2(language=language, mood=mood, previous_type=previous_type or None)
            return {"games": [game], "source": data.get("source", "ai_games")}
        return _offline_games_v2(language=language, mood=mood, previous_type=previous_type or None)
    except Exception as exc:
        return _offline_games_v2(language=language, mood=mood, previous_type=previous_type or None)


@router.post("/chat")
def chat(payload: dict[str, Any]):
    message = payload.get("message", "")
    language = payload.get("language", "en")
    prompt = f"""
You are a supportive AI stress-management coach for working professionals.
Reply in {language}.
Keep it short, warm, and practical.
    User message: {message}
    """
    try:
        data = _generate(prompt)
        if data.get("reply"):
            return {"reply": data["reply"], "source": data.get("source", "api")}
        return {"reply": "I'm here with you. Take one small breath, then tell me what feels heaviest right now.", "source": "offline_fallback"}
    except Exception as exc:
        return {"reply": "I'm here with you. Take one small breath, then tell me what feels heaviest right now.", "source": "offline_fallback"}


@router.post("/translate")
def translate(payload: dict[str, Any]):
    text = payload.get("text", "")
    target_language = payload.get("target_language", "en")
    prompt = f"""
Translate this into {target_language}. Keep the meaning natural and concise.
Text: {text}
Return JSON: {{"translated_text":"..."}}
    """
    try:
        data = _generate(prompt)
        if data.get("translated_text"):
            return {"translated_text": data["translated_text"], "source": data.get("source", "api")}
        return {"translated_text": text, "source": "offline_fallback"}
    except Exception as exc:
        return {"translated_text": text, "source": "offline_fallback"}


@router.get("/relief")
def relief(
    level: str = "Low",
    language: str = "en",
    personality_type: str = "Balanced Individual",
    previous_id: str = "",
    previous_ids: str = "",
):
    # Use a curated in-app playable library (embed URLs) so we can autoplay inside the app.
    library = [
        {
            "id": item.id,
            "title": item.title,
            "provider": item.provider,
            "embed_url": build_youtube_embed_url(
                video_id=item.video_id,
                start=item.clip_start_sec,
                end=item.clip_end_sec,
            ),
            "duration_sec": max(10, item.clip_end_sec - item.clip_start_sec),
            "tags": list(item.tags),
        }
        for item in RELIEF_LIBRARY
    ]

    previous_set = {i.strip() for i in (previous_ids or "").split(",") if i.strip()}
    if previous_id:
        previous_set.add(previous_id)

    prompt = f"""
Create immediate stress relief options for a working professional.
Stress level: {level}
Personality type: {personality_type}
Language: {language}

Choose exactly 1 item from the provided library so the app can play it inline.
Avoid repeating any of these previous ids if provided: {sorted(previous_set) or "none"}.
Keep it short: duration_sec must be between 60 and 240 seconds.

Return JSON:
{{
  "items":[
    {{
      "id":"one_of_library_id",
      "title":"...",
      "provider":"youtube",
      "embed_url":"...",
      "duration_sec": 90,
      "why":"1 short sentence"
    }}
  ]
}}

Library (use only these; do not invent URLs):
{library}
"""
    try:
        data = _generate(prompt)
        items = data.get("items")
        if isinstance(items, list) and items:
            allowed = {item["id"]: item for item in library}
            normalized: list[dict[str, Any]] = []
            for raw in items:
                if not isinstance(raw, dict):
                    continue
                item_id = str(raw.get("id", "")).strip()
                if not item_id or item_id not in allowed:
                    continue
                base = allowed[item_id]
                normalized.append(
                    {
                        "id": item_id,
                        "title": raw.get("title") or base["title"],
                        "provider": base["provider"],
                        "embed_url": base["embed_url"],
                        "duration_sec": base["duration_sec"],
                        "why": str(raw.get("why", "")).strip(),
                    }
                )
            if normalized:
                filtered = [it for it in normalized if it["id"] not in previous_set] or normalized
                return {"items": filtered[:1], "source": data.get("source", "api")}

        rng = random.Random()
        pool = [item for item in library if item["id"] not in previous_set] or library
        rng.shuffle(pool)
        return {"items": pool[:1], "source": "offline_library"}
    except Exception:
        rng = random.Random()
        pool = [item for item in library if item["id"] not in previous_set] or library
        rng.shuffle(pool)
        return {"items": pool[:1], "source": "offline_library"}
