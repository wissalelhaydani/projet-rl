from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from google import genai
import os
from dotenv import load_dotenv
import json
from rl_agent import mise_a_jour, get_etat
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class Profil(BaseModel):
    nom: str
    niveau: str
    domaine: str
    competences: List[str]

class Feedback(BaseModel):
    etudiant_id: str
    projet: str
    action: str

def construire_prompt(profil: Profil) -> str:
    return f"""Tu es un conseiller expert pour étudiants en ingénierie.

Profil étudiant :
- Nom : {profil.nom}
- Niveau : {profil.niveau}
- Domaine préféré : {profil.domaine}
- Compétences : {", ".join(profil.competences)}

Génère exactement 3 idées de projets adaptées à ce profil.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, avec ce format :

{{
  "projets": [
    {{
      "titre": "Nom du projet",
      "description": "2 phrases max",
      "stack": ["tech1", "tech2", "tech3"],
      "dataset": "Nom ou source du dataset",
      "difficulte": "débutant | intermédiaire | avancé",
      "roadmap": ["Semaine 1 : ...", "Semaine 2 : ...", "Semaine 3 : ..."]
    }}
  ]
}}"""

@app.get("/")
def accueil():
    return {"message": "API RL + Gemini — opérationnelle"}

@app.post("/recommander")
def recommander(profil: Profil):
    prompt = construire_prompt(profil)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    texte = response.text.strip()

    if texte.startswith("```"):
        texte = texte.split("```")[1]
        if texte.startswith("json"):
            texte = texte[4:]
    texte = texte.strip()

    try:
        projets = json.loads(texte)
    except json.JSONDecodeError:
        return {"erreur": "Réponse invalide", "brut": texte}

    return {
        "etudiant": profil.nom,
        "niveau": profil.niveau,
        "domaine": profil.domaine,
        "recommandations": projets["projets"]
    }


@app.post("/feedback")
def feedback(fb: Feedback):
    # Domaine et compétences du projet (dans un vrai projet,
    # tu les récupères depuis la base — ici on simplifie)
    domaines_projets = {
        "Chatbot": "IA", "Dashboard": "Data",
        "API REST": "Web", "IDS": "Cyber"
    }
    comps_projets = {
        "Chatbot": ["Python", "PyTorch"],
        "Dashboard": ["Python", "SQL"],
        "API REST": ["Python", "FastAPI"],
        "IDS": ["Python", "Java"]
    }

    domaine = domaines_projets.get(fb.projet, "IA")
    comps = comps_projets.get(fb.projet, ["Python"])

    resultat = mise_a_jour(fb.etudiant_id, domaine, comps, fb.action)

    return {
        "etudiant": fb.etudiant_id,
        "projet": fb.projet,
        "action": fb.action,
        **resultat
    }

@app.get("/etat/{etudiant_id}")
def etat(etudiant_id: str):
    return get_etat(etudiant_id)