from pydantic import BaseModel
from typing import List


class UserCreate(BaseModel):
    email: str
    password: str


class StressInput(BaseModel):
    answers: List[int]


class PersonalityQuestionPayload(BaseModel):
    id: int | None = None
    text: str | None = None
    trait: str


class FacialSignalPayload(BaseModel):
    consent: bool = False
    stress_signal: float | None = None
    dominant_expression: str | None = None
    sample_count: int = 0


class FullAssessmentInput(BaseModel):
    email: str
    personality_answers: List[int]
    stress_answers: List[int]
    personality_traits: List[str] | None = None
    personality_questions: List[PersonalityQuestionPayload] | None = None
    facial_signal: FacialSignalPayload | None = None
