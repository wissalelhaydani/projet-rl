from sqlalchemy import create_engine, Column, String, Float, Integer, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres123@localhost:5432/projet_rl"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Table des profils étudiants
class ProfilDB(Base):
    __tablename__ = "profils"

    id = Column(String, primary_key=True)  # nom étudiant
    mot_de_passe = Column(String, nullable=False) 
    role = Column(String, default="student")
    
    niveau = Column(String, default="M1")
    domaine = Column(String, default="IA")
    competences = Column(JSON, default=list)
    domaine_interet = Column(JSON, default=dict)
    competence_score = Column(JSON, default=dict)
    V = Column(Float, default=0.0)
    total_feedbacks = Column(Integer, default=0)
    total_reward = Column(Float, default=0.0)
    historique = Column(JSON, default=list)

class ProjetDB(Base):
    __tablename__ = "projets"

    titre = Column(String, primary_key=True)
    description = Column(String)
    stack = Column(JSON, default=list)
    dataset = Column(String)
    difficulte = Column(String)
    domaine = Column(String)
    niveaux = Column(JSON, default=list)
    competences = Column(JSON, default=list)

# Crée les tables automatiquement
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()