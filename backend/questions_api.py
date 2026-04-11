from __future__ import annotations

import os
from typing import Any

import requests
from dotenv import load_dotenv
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import SessionLocal
from models import StressRecord
from source_question_bank import build_assessment_questions
from ai_question_generator import generate_dynamic_assessment_questions, generate_offline_assessment_questions
from task_engine import get_tasks

load_dotenv(Path(__file__).with_name(".env"))

router = APIRouter()

ASSESSMENT_QUESTIONS_API_URL = os.getenv("ASSESSMENT_QUESTIONS_API_URL", "").strip()
PERSONALITY_QUESTIONS_API_URL = os.getenv("PERSONALITY_QUESTIONS_API_URL", "").strip()
STRESS_QUESTIONS_API_URL = os.getenv("STRESS_QUESTIONS_API_URL", "").strip()
TASKS_API_URL = os.getenv("TASKS_API_URL", "").strip()

TRAIT_NAMES = {
    "Extraversion",
    "Agreeableness",
    "Conscientiousness",
    "Emotional_Stability",
    "Openness",
}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _call_json_api(url: str, payload: dict[str, Any] | None = None) -> Any:
    method = requests.post if payload else requests.get
    kwargs: dict[str, Any] = {"timeout": 30}
    if payload:
        kwargs["json"] = payload
    response = method(url, **kwargs)
    response.raise_for_status()
    return response.json()


def _get_user_context(email: str, db: Session) -> dict[str, Any]:
    last = (
        db.query(StressRecord)
        .filter(StressRecord.user_email == email)
        .order_by(StressRecord.timestamp.desc())
        .first()
    )
    if not last:
        return {"assessments_taken": 0}

    return {
        "previous_level": last.stress_level,
        "previous_score": last.stress_score,
        "personality_type": last.personality_type,
        "assessments_taken": db.query(StressRecord)
        .filter(StressRecord.user_email == email)
        .count(),
    }


def _normalize_personality_questions(questions: list[Any]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for index, question in enumerate(questions, start=1):
        options = question.get("options", [])
        if len(options) < 4:
            raise ValueError(f"Personality question {index} must have at least 4 options")

        trait = question.get("trait")
        if trait not in TRAIT_NAMES:
            raise ValueError(f"Personality question {index} has invalid trait: {trait}")

        normalized_options = []
        for option_index, option in enumerate(options, start=1):
            normalized_options.append(
                {
                    "label": option.get("label", "").strip(),
                    "emoji": option.get("emoji", "").strip(),
                    "value": option.get("value", option_index),
                }
            )

        normalized.append(
            {
                "id": question.get("id", index),
                "text": question.get("text", "").strip(),
                "emoji": question.get("emoji", "").strip(),
                "trait": trait,
                "options": normalized_options,
            }
        )

    if not normalized:
        raise ValueError("No personality questions returned from API")
    return normalized


def _normalize_stress_questions(questions: list[Any]) -> list[dict[str, Any]]:
    normalized = [
        {
            "id": question.get("id", index),
            "text": question.get("text", "").strip(),
            "emoji": question.get("emoji", "").strip(),
        }
        for index, question in enumerate(questions, start=1)
    ]
    if not normalized:
        raise ValueError("No stress questions returned from API")
    return normalized


def _normalize_tasks(tasks: list[Any]) -> list[dict[str, Any]]:
    normalized = [
        {
            "title": task.get("title", "").strip(),
            "desc": task.get("desc", "").strip(),
            "emoji": task.get("emoji", "").strip(),
            "duration": task.get("duration", "").strip(),
            "category": task.get("category", "").strip(),
        }
        for task in tasks
    ]
    if not normalized:
        raise ValueError("No tasks returned from API")
    return normalized


def _generate_questions_via_api(email: str, context: dict[str, Any]) -> dict[str, Any]:
    payload = {"email": email, "context": context}

    if ASSESSMENT_QUESTIONS_API_URL:
        data = _call_json_api(ASSESSMENT_QUESTIONS_API_URL, payload)
    else:
        personality_data = None
        stress_data = None

        if PERSONALITY_QUESTIONS_API_URL:
            personality_data = _call_json_api(PERSONALITY_QUESTIONS_API_URL, payload)
        if STRESS_QUESTIONS_API_URL:
            stress_data = _call_json_api(STRESS_QUESTIONS_API_URL, payload)

        if personality_data or stress_data:
            data = {
                "personality_questions": (
                    personality_data.get("questions", personality_data)
                    if personality_data
                    else []
                ),
                "stress_questions": (
                    stress_data.get("questions", stress_data)
                    if stress_data
                    else []
                ),
            }
        else:
            try:
                data = generate_dynamic_assessment_questions(email, context)
            except Exception:
                data = generate_offline_assessment_questions(email, context)

    personality_questions = _normalize_personality_questions(
        data.get("personality_questions", [])
    )
    stress_questions = _normalize_stress_questions(data.get("stress_questions", []))

    return {
        "source": data.get("source", "api"),
        "personality_questions": personality_questions,
        "stress_questions": stress_questions,
    }


def _generate_tasks_via_api(
    stress_level: str,
    personality_type: str,
    email: str,
    db: Session,
    *,
    avoid_task_titles: list[str] | None = None,
) -> dict[str, Any]:
    context = _get_user_context(email, db) if email else {"assessments_taken": 0}
    if avoid_task_titles:
        context["avoid_task_titles"] = [str(t) for t in avoid_task_titles if str(t).strip()]
    payload = {
        "email": email,
        "stress_level": stress_level,
        "personality_type": personality_type,
        "context": context,
    }

    if TASKS_API_URL:
        data = _call_json_api(TASKS_API_URL, payload)
        tasks = data.get("tasks", data)
    else:
        tasks = get_tasks(stress_level, personality_type, context=context)

    return {"tasks": _normalize_tasks(tasks), "source": "api"}


@router.get("/assessment/{email}")
def get_dynamic_assessment(email: str, db: Session = Depends(get_db)):
    try:
        return _generate_questions_via_api(email, _get_user_context(email, db))
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to fetch dynamic assessment questions: {exc}",
        ) from exc


@router.get("/personality")
def get_personality_questions(
    email: str = Query("guest@example.com"), db: Session = Depends(get_db)
):
    try:
        data = _generate_questions_via_api(email, _get_user_context(email, db))
        return {"source": data["source"], "questions": data["personality_questions"]}
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to fetch dynamic personality questions: {exc}",
        ) from exc


@router.get("/stress")
def get_stress_questions(
    email: str = Query("guest@example.com"), db: Session = Depends(get_db)
):
    try:
        data = _generate_questions_via_api(email, _get_user_context(email, db))
        return {"source": data["source"], "questions": data["stress_questions"]}
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to fetch dynamic stress questions: {exc}",
        ) from exc


@router.get("/ai/{email}")
def get_ai_questions(email: str, db: Session = Depends(get_db)):
    try:
        return _generate_questions_via_api(email, _get_user_context(email, db))
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to fetch dynamic AI questions: {exc}",
        ) from exc


@router.post("/ai-tasks")
def get_ai_tasks(payload: dict[str, Any], db: Session = Depends(get_db)):
    stress_level = payload.get("stress_level")
    personality_type = payload.get("personality_type")
    email = payload.get("email", "")
    recent_task_titles = payload.get("recent_task_titles") or []

    if not stress_level or not personality_type:
        raise HTTPException(
            status_code=422,
            detail="stress_level and personality_type are required",
        )

    try:
        avoid_titles: list[str] | None = None
        if isinstance(recent_task_titles, list) and recent_task_titles:
            avoid_titles = [str(t) for t in recent_task_titles if str(t).strip()]
        result = _generate_tasks_via_api(
            stress_level, personality_type, email, db, avoid_task_titles=avoid_titles
        )
        # Best-effort: feed a client-provided "recent titles" list into the generator next time.
        # (We don't persist tasks server-side in this demo app.)
        if isinstance(recent_task_titles, list) and recent_task_titles:
            # Attach to the response so frontend can keep rotating cleanly.
            result["avoid_task_titles_echo"] = [str(t) for t in recent_task_titles if t]
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to fetch dynamic personalized tasks: {exc}",
        ) from exc
