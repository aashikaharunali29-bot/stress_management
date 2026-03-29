"""
Legacy seed script retained only for cleanup.
This project now fetches questions dynamically from API sources at runtime.
"""

from database import SessionLocal, engine
from models import Base, PersonalityQuestion, StressQuestion

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    db.query(PersonalityQuestion).delete()
    db.query(StressQuestion).delete()
    db.commit()
    db.close()
    print("Removed any locally seeded question rows.")
    print("No hardcoded question data is inserted anymore.")


if __name__ == "__main__":
    seed()
