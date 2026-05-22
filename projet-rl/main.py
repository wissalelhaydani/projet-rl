from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import random

from database import init_db, get_db, ProjetDB, ProfilDB
from rl_agent import mise_a_jour, get_etat

app = FastAPI(title="ProjectRL API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    init_db()

# ── Pydantic models ───────────────────────────────────────────────────────────
class Profil(BaseModel):
    nom: str
    niveau: str
    domaine: str
    competences: List[str]

class Feedback(BaseModel):
    etudiant_id: str
    projet: str
    action: str  # like | skip | done | save | not_interested | ignore

class NouveauProjet(BaseModel):
    titre: str
    description: str
    stack: List[str]
    dataset: str
    difficulte: str
    domaine: str
    niveaux: List[str]
    competences: List[str]

class InscriptionRequest(BaseModel):
    username: str
    password: str
    role: str = "student"

class ConnexionRequest(BaseModel):
    username: str
    password: str

# ── Scoring function ─────────────────────────────────────────────────────────
def scorer_projet(projet: ProjetDB, profil: Profil, etat: dict) -> float:
    score = 0.0

    # Domain match
    if projet.domaine == profil.domaine:
        score += 2.0

    # Level match
    if profil.niveau in (projet.niveaux or []):
        score += 1.5

    # Skill overlap
    comps_communes = set(profil.competences) & set(projet.competences or [])
    score += len(comps_communes) * 0.5

    # RL interest signal
    interet = etat.get("domaine_interet", {}).get(projet.domaine, 0.3)
    score += interet * 2.0

    # RL competence signal (new)
    comp_scores = etat.get("competence_score", {})
    for comp in (projet.competences or []):
        score += comp_scores.get(comp, 0) * 0.3

    # Exploration noise
    score += random.uniform(0, 0.3)

    return score

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def accueil():
    return {"message": "ProjectRL API v2.0 — opérationnelle", "status": "ok"}

# GET all projects (with optional filters)
@app.get("/projets")
def get_projets(
    domaine: Optional[str] = Query(None),
    difficulte: Optional[str] = Query(None),
    niveau: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(60),
    db: Session = Depends(get_db)
):
    query = db.query(ProjetDB)
    if domaine:
        query = query.filter(ProjetDB.domaine == domaine)
    if difficulte:
        query = query.filter(ProjetDB.difficulte == difficulte)
    projets = query.limit(limit).all()

    if search:
        q = search.lower()
        projets = [
            p for p in projets
            if q in p.titre.lower()
            or q in (p.description or '').lower()
            or any(q in s.lower() for s in (p.stack or []))
        ]

    if niveau:
        projets = [p for p in projets if niveau in (p.niveaux or [])]

    return projets

# Trending projects (most interacted via feedbacks)
@app.get("/projets/trending")
def trending_projets(db: Session = Depends(get_db)):
    """Return projects sorted by number of 'like' and 'done' feedbacks"""
    projets = db.query(ProjetDB).all()
    etudiants = db.query(ProfilDB).all()

    # Count positive interactions per project
    projet_scores = {}
    for etudiant in etudiants:
        for h in (etudiant.historique or []):
            domaine = h.get("domaine", "")
            if h.get("action") in ("like", "done", "save") and h.get("recompense", 0) > 0:
                projet_scores[domaine] = projet_scores.get(domaine, 0) + h.get("recompense", 0)

    sorted_projets = sorted(projets, key=lambda p: projet_scores.get(p.domaine, 0), reverse=True)
    return sorted_projets[:6]

# Seed initial catalog
@app.post("/projets/seed")
def seed_projets(db: Session = Depends(get_db)):
    if db.query(ProjetDB).count() == 0:
        for p in KATALOG_INITIAL:
            db.add(ProjetDB(**p))
        db.commit()
        return {"message": f"{len(KATALOG_INITIAL)} projets insérés avec succès !"}
    return {"message": f"Catalogue contient déjà {db.query(ProjetDB).count()} projets."}

# Add a single project
@app.post("/projets")
def ajouter_projet(projet: NouveauProjet, db: Session = Depends(get_db)):
    # Check for duplicates
    existing = db.query(ProjetDB).filter(ProjetDB.titre == projet.titre).first()
    if existing:
        return {"message": f"Le projet '{projet.titre}' existe déjà.", "status": "exists"}
    db_projet = ProjetDB(**projet.dict())
    db.add(db_projet)
    db.commit()
    return {"message": f"Projet '{projet.titre}' ajouté !", "status": "created"}

# Recommend
@app.post("/recommander")
def recommander(profil: Profil, db: Session = Depends(get_db)):
    etat = get_etat(db, profil.nom)
    projets_bdd = db.query(ProjetDB).all()
    projets_tries = sorted(
        projets_bdd,
        key=lambda p: scorer_projet(p, profil, etat),
        reverse=True,
    )
    return {
        "etudiant": profil.nom,
        "niveau": profil.niveau,
        "domaine": profil.domaine,
        "recommandations": projets_tries[:5],  # Return top 5 instead of 3
    }

# Feedback — accepts 5 action types
@app.post("/feedback")
def feedback(fb: Feedback, db: Session = Depends(get_db)):
    valid_actions = {"like", "skip", "done", "save", "not_interested", "ignore"}
    if fb.action not in valid_actions:
        return {"status": "error", "message": f"Action invalide. Valeurs: {valid_actions}"}

    projet_info = db.query(ProjetDB).filter(ProjetDB.titre == fb.projet).first()
    domaine = projet_info.domaine if projet_info else "IA"
    comps = projet_info.competences if projet_info else ["Python"]

    resultat = mise_a_jour(db, fb.etudiant_id, domaine, comps, fb.action)
    return {
        "etudiant": fb.etudiant_id,
        "projet": fb.projet,
        "action": fb.action,
        **resultat,
    }

# RL state
@app.get("/etat/{etudiant_id}")
def etat(etudiant_id: str, db: Session = Depends(get_db)):
    return get_etat(db, etudiant_id)

# Register
@app.post("/register")
def inscription(req: InscriptionRequest, db: Session = Depends(get_db)):
    if db.query(ProfilDB).filter(ProfilDB.id == req.username).first():
        return {"status": "error", "message": "Cet identifiant est déjà pris."}
    nouveau = ProfilDB(
        id=req.username,
        mot_de_passe=req.password,  # TODO: hash with bcrypt in production
        role=req.role,
        domaine_interet={"IA": 0.5, "Web": 0.3, "Data": 0.4, "Cyber": 0.2, "Commerce": 0.3, "Marketing": 0.3},
        competence_score={"Python": 0.5, "React": 0.2, "SQL": 0.3, "Marketing-Digital": 0.3, "Pricing": 0.3},
        historique=[],
    )
    db.add(nouveau)
    db.commit()
    return {"status": "success", "message": f"Compte {req.role} créé avec succès !"}

# Login
@app.post("/login")
def connexion(req: ConnexionRequest, db: Session = Depends(get_db)):
    user = db.query(ProfilDB).filter(ProfilDB.id == req.username).first()
    if not user or user.mot_de_passe != req.password:
        return {"status": "error", "message": "Identifiants incorrects."}
    return {
        "status": "success",
        "username": user.id,
        "role": user.role,
        "domaine": user.domaine,
        "niveau": user.niveau,
    }

# Admin stats (enriched)
@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    etudiants = db.query(ProfilDB).filter(ProfilDB.role == "student").all()
    total = len(etudiants)

    if total == 0:
        return {"total_etudiants": 0, "global_feedbacks": 0, "avg_reward": 0, "repartition_domaines": [], "action_counts": {}}

    global_feedbacks = sum(e.total_feedbacks or 0 for e in etudiants)
    total_reward = sum(e.total_reward or 0 for e in etudiants)
    avg_reward = round(total_reward / total, 2)

    domaines_count = {}
    for e in etudiants:
        dom = e.domaine or "Non spécifié"
        domaines_count[dom] = domaines_count.get(dom, 0) + 1

    # Count action types across all historiques
    action_counts = {}
    for e in etudiants:
        for h in (e.historique or []):
            a = h.get("action", "")
            action_counts[a] = action_counts.get(a, 0) + 1

    return {
        "total_etudiants": total,
        "global_feedbacks": global_feedbacks,
        "avg_reward": avg_reward,
        "repartition_domaines": [{"name": k, "value": v} for k, v in domaines_count.items()],
        "action_counts": action_counts,
    }

# ── Catalogue ─────────────────────────────────────────────────────────────────
KATALOG_INITIAL = [
    # IA
    {"titre": "Chatbot FAQ universitaire", "description": "Un assistant qui répond aux questions des étudiants sur les cours.", "stack": ["Python", "NLTK", "Flask"], "dataset": "FAQ Interne", "difficulte": "intermédiaire", "domaine": "IA", "niveaux": ["L3", "M1", "M2"], "competences": ["Python", "NLP"]},
    {"titre": "Agent RL pour jeu Snake", "description": "Un agent qui apprend à jouer à Snake tout seul avec Q-Learning.", "stack": ["Python", "PyTorch", "Pygame"], "dataset": "Simulation", "difficulte": "intermédiaire", "domaine": "IA", "niveaux": ["L3", "M1", "M2"], "competences": ["Python", "PyTorch", "RL"]},
    {"titre": "Recommandeur de films", "description": "Système de recommandation basé sur le filtrage collaboratif.", "stack": ["Python", "Pandas", "Surprise"], "dataset": "MovieLens 100K", "difficulte": "intermédiaire", "domaine": "IA", "niveaux": ["L3", "M1", "M2"], "competences": ["Python", "SQL", "Scikit-Learn"]},
    {"titre": "Classification d'images Médicales", "description": "Détection de pathologies sur des radios X par réseau de neurones convolutif.", "stack": ["Python", "TensorFlow", "Keras"], "dataset": "NIH Chest X-rays", "difficulte": "avancé", "domaine": "IA", "niveaux": ["M1", "M2"], "competences": ["Python", "Deep-Learning", "Computer-Vision"]},
    {"titre": "Analyse de sentiments Twitter", "description": "Classification de tweets en temps réel (positif/négatif) avec BERT.", "stack": ["Python", "Transformers", "FastAPI"], "dataset": "Twitter Sentiment140", "difficulte": "avancé", "domaine": "IA", "niveaux": ["M1", "M2"], "competences": ["Python", "NLP", "Transformers"]},
    {"titre": "Détection de faux billets", "description": "Algorithme de régression logistique et clustering pour identifier les contrefaçons.", "stack": ["Python", "Scikit-Learn"], "dataset": "Données géométriques billets", "difficulte": "débutant", "domaine": "IA", "niveaux": ["L2", "L3"], "competences": ["Python", "Machine-Learning"]},
    {"titre": "Segmentation client RFM", "description": "Clustering K-Means pour grouper les clients selon leurs habitudes d'achat.", "stack": ["Python", "Scikit-Learn", "Seaborn"], "dataset": "UCI Retail Dataset", "difficulte": "débutant", "domaine": "IA", "niveaux": ["L2", "L3"], "competences": ["Python", "Machine-Learning"]},
    {"titre": "Trading bot algorithmique", "description": "Agent de Deep Q-Learning prenant des décisions d'achat/vente d'actions.", "stack": ["Python", "Gymnasium", "Stable-Baselines3"], "dataset": "Yahoo Finance API", "difficulte": "avancé", "domaine": "IA", "niveaux": ["M1", "M2"], "competences": ["Python", "RL"]},
    # Data
    {"titre": "Dashboard ventes e-commerce", "description": "Visualisation interactive des ventes avec filtres par région.", "stack": ["Python", "Pandas", "Streamlit"], "dataset": "Kaggle — E-commerce Sales", "difficulte": "débutant", "domaine": "Data", "niveaux": ["L2", "L3", "M1"], "competences": ["Python", "SQL", "Data-Viz"]},
    {"titre": "Pipeline ETL de Logs Serveur", "description": "Extraction, transformation et chargement automatisés de fichiers de logs.", "stack": ["Python", "Apache-Airflow", "PostgreSQL"], "dataset": "Logs Apache", "difficulte": "avancé", "domaine": "Data", "niveaux": ["M1", "M2"], "competences": ["Python", "SQL", "Data-Engineering"]},
    {"titre": "Prédiction du churn Télécom", "description": "Anticiper quels abonnés vont résilier leur forfait le mois prochain.", "stack": ["Python", "XGBoost", "Pandas"], "dataset": "Telco Churn Dataset", "difficulte": "intermédiaire", "domaine": "Data", "niveaux": ["M1", "M2"], "competences": ["Python", "Machine-Learning"]},
    {"titre": "Pipeline Streaming avec Kafka", "description": "Traitement de flux de transactions financières en temps réel.", "stack": ["Python", "Apache-Kafka", "Spark"], "dataset": "Simulateur bancaire", "difficulte": "avancé", "domaine": "Data", "niveaux": ["M2"], "competences": ["Python", "Data-Engineering"]},
    # Web
    {"titre": "API REST gestion étudiants", "description": "Backend complet avec authentification, CRUD et docs.", "stack": ["Python", "FastAPI", "PostgreSQL"], "dataset": "Synthétique", "difficulte": "intermédiaire", "domaine": "Web", "niveaux": ["L3", "M1"], "competences": ["Python", "FastAPI", "SQL", "Backend"]},
    {"titre": "Plateforme Blog responsive", "description": "Un site de blogging moderne avec système de commentaires.", "stack": ["JavaScript", "React", "Node.js"], "dataset": "MongoDB Cloud", "difficulte": "intermédiaire", "domaine": "Web", "niveaux": ["L3", "M1"], "competences": ["JavaScript", "React", "Node.js", "Frontend", "Backend"]},
    {"titre": "Site E-Commerce vêtement", "description": "Boutique en ligne avec panier et intégration de paiement Stripe.", "stack": ["TypeScript", "Next.js", "Prisma"], "dataset": "PostgreSQL local", "difficulte": "avancé", "domaine": "Web", "niveaux": ["M1", "M2"], "competences": ["TypeScript", "React", "Next.js", "Frontend", "Backend"]},
    {"titre": "Application de discussion en direct", "description": "Messagerie instantanée avec salons de discussion publics/privés.", "stack": ["JavaScript", "Socket.io", "Express"], "dataset": "RAM Redis", "difficulte": "intermédiaire", "domaine": "Web", "niveaux": ["L3", "M1"], "competences": ["JavaScript", "Node.js", "Websockets"]},
    # Cyber
    {"titre": "Système de détection d'intrusion", "description": "Détecte les anomalies réseau en temps réel.", "stack": ["Python", "Scikit-Learn", "Wireshark"], "dataset": "KDD Cup 99", "difficulte": "avancé", "domaine": "Cyber", "niveaux": ["M1", "M2"], "competences": ["Python", "Cybersécurité", "Réseau"]},
    {"titre": "Générateur et gestionnaire de mots de passe", "description": "Coffre-fort local chiffré en AES-256 avec clé maître dérivée.", "stack": ["Python", "Cryptography"], "dataset": "Fichier local binaire", "difficulte": "intermédiaire", "domaine": "Cyber", "niveaux": ["L3", "M1"], "competences": ["Python", "Cryptographie"]},
    {"titre": "Honeypot SSH Éducatif", "description": "Faux serveur SSH pour capturer les identifiants tentés par les bots internet.", "stack": ["Python", "Paramiko"], "dataset": "Tentatives en direct", "difficulte": "avancé", "domaine": "Cyber", "niveaux": ["M1", "M2"], "competences": ["Python", "Réseau", "Cybersécurité"]},
    # Commerce
    {"titre": "Optimisation des prix de vente", "description": "Algorithme de dynamic pricing pour ajuster les prix selon la demande.", "stack": ["Python", "Scikit-Learn"], "dataset": "Historique ventes magasin", "difficulte": "intermédiaire", "domaine": "Commerce", "niveaux": ["M1", "M2"], "competences": ["Python", "Machine-Learning", "Pricing"]},
    {"titre": "Plateforme Marketplace B2B", "description": "Mise en relation de grossistes et de détaillants avec gestion des devis.", "stack": ["TypeScript", "Next.js", "PostgreSQL"], "dataset": "PostgreSQL Cloud", "difficulte": "avancé", "domaine": "Commerce", "niveaux": ["M1", "M2"], "competences": ["TypeScript", "Backend", "SQL"]},
    # Marketing
    {"titre": "Planificateur de contenu IA", "description": "Génération automatique et planification de posts LinkedIn/Instagram adaptés à une marque.", "stack": ["Python", "OpenAI-API", "FastAPI"], "dataset": "Prompts prédéfinis", "difficulte": "avancé", "domaine": "Marketing", "niveaux": ["M1", "M2"], "competences": ["Python", "LLM", "API"]},
    {"titre": "Outil d'A/B Testing automatisé", "description": "Analyse statistique de la performance de deux versions d'une Landing Page.", "stack": ["Python", "SciPy", "Flask"], "dataset": "Logs clics utilisateurs", "difficulte": "intermédiaire", "domaine": "Marketing", "niveaux": ["L3", "M1"], "competences": ["Python", "Statistiques"]},
]