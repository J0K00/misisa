from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.config import DATABASE_URL

engine = create_engine("postgresql://postgres:password@localhost:5432/misisa_db")  # echo=True pour afficher les requêtes SQL dans la console
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
