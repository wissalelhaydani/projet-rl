import json
import os

ALPHA = 0.3   # taux d'apprentissage
GAMMA = 0.9   # facteur de discount

# Profils sauvegardés en mémoire (clé = nom étudiant)
profils_etudiants = {}

def get_profil(etudiant_id: str) -> dict:
    if etudiant_id not in profils_etudiants:
        profils_etudiants[etudiant_id] = {
            "domaine_interet": {
                "IA": 0.5, "Web": 0.3,
                "Data": 0.4, "Cyber": 0.2
            },
            "competence_score": {
                "Python": 0.5, "React": 0.2,
                "SQL": 0.3, "PyTorch": 0.2,
                "FastAPI": 0.2, "Java": 0.3
            },
            "V": 0.0,           # valeur estimée (Critic)
            "total_feedbacks": 0,
            "total_reward": 0.0,
            "historique": []
        }
    return profils_etudiants[etudiant_id]

def clamp(val, mn=0.0, mx=1.0):
    return max(mn, min(mx, val))

def mise_a_jour(etudiant_id: str, projet_domaine: str,
                projet_competences: list, action: str) -> dict:

    recompenses = {
        "like": 1.0, "skip": -0.5,
        "done": 2.0, "ignore": 0.0
    }
    r = recompenses.get(action, 0.0)

    profil = get_profil(etudiant_id)

    # --- Critic : calcul de l'avantage TD ---
    V_ancien = profil["V"]
    V_nouveau = clamp(V_ancien + ALPHA * r, -2.0, 5.0)
    avantage = r + GAMMA * V_nouveau - V_ancien
    profil["V"] = V_nouveau

    # --- Actor : mise à jour du domaine ---
    if projet_domaine in profil["domaine_interet"]:
        profil["domaine_interet"][projet_domaine] = clamp(
            profil["domaine_interet"][projet_domaine] + ALPHA * avantage * 0.15
        )

    # --- Mise à jour des compétences ---
    for comp in projet_competences:
        if comp in profil["competence_score"]:
            delta = 0.05 if r > 0 else -0.02
            profil["competence_score"][comp] = clamp(
                profil["competence_score"][comp] + ALPHA * delta
            )

    # --- Historique ---
    profil["total_feedbacks"] += 1
    profil["total_reward"] += r
    profil["historique"].append({
        "action": action,
        "domaine": projet_domaine,
        "recompense": r,
        "avantage": round(avantage, 3),
        "V": round(V_nouveau, 3)
    })

    return {
        "recompense": r,
        "avantage": round(avantage, 3),
        "V_nouveau": round(V_nouveau, 3),
        "domaine_interet": profil["domaine_interet"],
        "total_feedbacks": profil["total_feedbacks"],
        "moyenne_reward": round(profil["total_reward"] / profil["total_feedbacks"], 2)
    }

def get_etat(etudiant_id: str) -> dict:
    return get_profil(etudiant_id)