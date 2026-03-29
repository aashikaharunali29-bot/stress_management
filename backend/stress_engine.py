from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import StressInput, FullAssessmentInput
from task_engine import get_tasks
from database import SessionLocal
from models import StressRecord
from datetime import datetime

router = APIRouter()
last_level = "Low"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def calc_personality_type(personality_answers: list, traits: list) -> str:
    if not personality_answers or not traits:
        return "Balanced Individual"

    trait_scores = {}

    for score, trait in zip(personality_answers, traits):
        trait_scores[trait] = trait_scores.get(trait, 0) + score

    dominant_trait = max(trait_scores, key=trait_scores.get)

    personality_map = {
        "Extraversion": "Social Connector",
        "Agreeableness": "Collaborative Supporter",
        "Conscientiousness": "Resilient Performer",
        "Emotional_Stability": "Emotionally Grounded",
        "Openness": "Adaptive Thinker",
    }

    return personality_map.get(dominant_trait, "Balanced Individual")


def extract_traits(data: FullAssessmentInput) -> list:
    if data.personality_questions:
        return [question.trait for question in data.personality_questions]
    if data.personality_traits:
        return data.personality_traits
    return []

def calc_stress(stress_answers: list, personality: str, facial_signal=None) -> dict:
    if not stress_answers:
        stress_answers = [3]

    modifiers = {
        "Emotionally Grounded": -0.4,
        "Resilient Performer": -0.2,
        "Balanced Individual": 0,
        "Adaptive Thinker": 0.1,
        "Social Connector": 0.15,
        "Collaborative Supporter": 0.2,
    }
    adjusted_average = (sum(stress_answers) / len(stress_answers)) + modifiers.get(personality, 0)
    camera_assisted = False

    if facial_signal and facial_signal.consent and facial_signal.stress_signal is not None and facial_signal.sample_count >= 3:
        adjusted_average += max(0, min(1, facial_signal.stress_signal)) * 0.8
        camera_assisted = True

    score = max(1, min(100, int(adjusted_average * 20)))

    if adjusted_average < 2.4:
        level, pct, msg = "Low", max(18, score), "Your system looks fairly steady right now. Focus on small relationship rituals that help you stay connected."
    elif adjusted_average < 3.6:
        level, pct, msg = "Medium", max(40, score), "Stress is present and may affect your patience or tone. Gentle repair and grounding tasks can help today."
    else:
        level, pct, msg = "High", max(72, score), "Your stress load looks elevated. Start with emotional safety, slower communication, and one calming reset before difficult conversations."

    return {
        "stress_level": level,
        "score": score,
        "percentage": min(pct, 100),
        "message": msg,
        "personality_type": personality,
        "color": {"Low": "#22c55e", "Medium": "#f59e0b", "High": "#ef4444"}[level],
        "camera_assisted": camera_assisted,
        "dominant_expression": facial_signal.dominant_expression if facial_signal and facial_signal.consent else None,
    }


@router.get("/level")
def get_level():
    return {"level": last_level}


@router.post("/analyze")
def analyze_stress(data: StressInput):
    """Legacy simple endpoint"""
    global last_level
    score = sum(data.answers)
    last_level = "Low" if score <= 5 else "Medium" if score <= 10 else "High"
    return {"stress_level": last_level}


@router.post("/full-analyze")
def full_analyze(data: FullAssessmentInput, db: Session = Depends(get_db)):
    """Main endpoint: takes personality + stress answers, returns scored result"""
    global last_level
    personality = calc_personality_type(data.personality_answers, extract_traits(data))
    result = calc_stress(data.stress_answers, personality, data.facial_signal)
    last_level = result["stress_level"]

    db.add(StressRecord(
        user_email=data.email,
        stress_level=result["stress_level"],
        stress_score=result["score"],
        personality_type=personality,
        timestamp=datetime.utcnow()
    ))
    db.commit()
    return result


@router.get("/history/{email}")
def get_history(email: str, db: Session = Depends(get_db)):
    records = db.query(StressRecord)\
        .filter(StressRecord.user_email == email)\
        .order_by(StressRecord.timestamp.desc())\
        .limit(7).all()
    return {
        "history": [
            {
                "date": r.timestamp.strftime("%b %d"),
                "level": r.stress_level,
                "score": r.stress_score,
                "personality": r.personality_type
            }
            for r in records
        ]
    }


@router.get("/tasks/{level}")
def tasks(level: str, personality_type: str = "Balanced Individual"):
    return {"tasks": get_tasks(level, personality_type)}
