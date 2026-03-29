from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)


class PersonalityQuestion(Base):
    __tablename__ = "personality_questions"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    emoji = Column(String)
    trait = Column(String)
    option1_label = Column(String)
    option1_emoji = Column(String)
    option2_label = Column(String)
    option2_emoji = Column(String)
    option3_label = Column(String)
    option3_emoji = Column(String)
    option4_label = Column(String)
    option4_emoji = Column(String)
    

class StressQuestion(Base):
    __tablename__ = "stress_questions"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    emoji = Column(String)


class StressRecord(Base):
    __tablename__ = "stress_records"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    stress_level = Column(String)
    stress_score = Column(Integer)
    personality_type = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)