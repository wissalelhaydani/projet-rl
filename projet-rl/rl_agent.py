from sqlalchemy.orm import Session
from database import ProfilDB

# ── Hyperparamètres ───────────────────────────────────────────────────────────
ALPHA = 0.30      # Learning rate
GAMMA = 0.90      # Discount factor
V_MIN, V_MAX = -2.0, 5.0

# ── Table des récompenses (5 actions) ────────────────────────────────────────
RECOMPENSES = {
    "like":           1.0,   # Intéressé
    "done":           2.0,   # Complété — signal le plus fort
    "save":           0.5,   # Sauvegardé pour plus tard
    "skip":          -0.5,   # Pas intéressé maintenant
    "not_interested": -1.0,  # Rejet fort — pénalise le domaine
    "ignore":         0.0,   # Aucune action
}

# Multiplicateurs de mise à jour Actor selon l'action
ACTOR_MULTIPLIERS = {
    "like":           0.15,
    "done":           0.20,
    "save":           0.10,
    "skip":          -0.08,
    "not_interested": -0.15,
    "ignore":          0.0,
}

def clamp(val: float, mn: float = 0.0, mx: float = 1.0) -> float:
    return max(mn, min(mx, val))

# ── Profile initialization ────────────────────────────────────────────────────
def get_or_create_profil(db: Session, etudiant_id: str) -> ProfilDB:
    profil = db.query(ProfilDB).filter(ProfilDB.id == etudiant_id).first()

    if profil and (not profil.domaine_interet or len(profil.domaine_interet) == 0):
        profil.domaine_interet = {
            "IA": 0.5, "Web": 0.3, "Data": 0.4,
            "Cyber": 0.2, "Commerce": 0.3, "Marketing": 0.3,
        }
        profil.competence_score = {
            "Python": 0.5, "React": 0.2, "SQL": 0.3,
            "Marketing-Digital": 0.3, "Pricing": 0.3,
        }
        db.commit()
        db.refresh(profil)

    return profil

# ── Core RL update (Actor-Critic TD(0)) ─────────────────────────────────────
def mise_a_jour(
    db: Session,
    etudiant_id: str,
    projet_domaine: str,
    projet_competences: list,
    action: str,
) -> dict:

    r = RECOMPENSES.get(action, 0.0)
    profil = get_or_create_profil(db, etudiant_id)

    # ── Critic — TD update ───────────────────────────────────────────────────
    V_ancien = profil.V
    V_nouveau = clamp(V_ancien + ALPHA * r, V_MIN, V_MAX)
    avantage = r + GAMMA * V_nouveau - V_ancien

    # ── Actor — domain interest update ───────────────────────────────────────
    domaine_interet = dict(profil.domaine_interet or {})
    actor_mult = ACTOR_MULTIPLIERS.get(action, 0.0)

    if projet_domaine in domaine_interet:
        domaine_interet[projet_domaine] = clamp(
            domaine_interet[projet_domaine] + ALPHA * avantage * actor_mult
        )

    # If "not_interested", slightly reduce neighbor domains (exploration penalty)
    if action == "not_interested":
        for dom in domaine_interet:
            if dom != projet_domaine:
                # Tiny spillover: we didn't interact positively with any domain
                domaine_interet[dom] = clamp(domaine_interet[dom] - 0.005)

    # ── Skills Matrix update ──────────────────────────────────────────────────
    competence_score = dict(profil.competence_score or {})

    for comp in projet_competences:
        if comp in competence_score:
            if r > 0:
                delta = 0.05
            elif r < 0:
                delta = -0.02
            else:
                delta = 0
            competence_score[comp] = clamp(
                competence_score[comp] + ALPHA * delta
            )
        else:
            # Discover new skills through interaction
            if action == "done":
                competence_score[comp] = 0.4   # Validated: acquired
            elif action == "like":
                competence_score[comp] = 0.2   # Interested: weak base
            elif action == "save":
                competence_score[comp] = 0.15  # Saved: minimal signal

    # Remove skills below threshold (forgotten / never developed)
    profil.competences = [k for k, v in competence_score.items() if v > 0.1]

    # ── History ───────────────────────────────────────────────────────────────
    historique = list(profil.historique or [])
    historique.append({
        "action":    action,
        "domaine":   projet_domaine,
        "recompense": r,
        "avantage":  round(avantage, 3),
        "V":         round(V_nouveau, 3),
    })
    # Keep only last 100 entries to avoid bloat
    if len(historique) > 100:
        historique = historique[-100:]

    # ── Persist ──────────────────────────────────────────────────────────────
    profil.V                = V_nouveau
    profil.domaine_interet  = domaine_interet
    profil.competence_score = competence_score
    profil.total_feedbacks  = (profil.total_feedbacks or 0) + 1
    profil.total_reward     = (profil.total_reward or 0.0) + r
    profil.historique       = historique
    db.commit()

    return {
        "recompense":     r,
        "avantage":       round(avantage, 3),
        "V_nouveau":      round(V_nouveau, 3),
        "domaine_interet": domaine_interet,
        "competence_score": competence_score,
        "total_feedbacks": profil.total_feedbacks,
        "moyenne_reward":  round(profil.total_reward / profil.total_feedbacks, 2),
    }

# ── State getter ──────────────────────────────────────────────────────────────
def get_etat(db: Session, etudiant_id: str) -> dict:
    profil = get_or_create_profil(db, etudiant_id)
    return {
        "id":               profil.id,
        "domaine_interet":  profil.domaine_interet  or {},
        "competence_score": profil.competence_score or {},
        "V":                profil.V or 0.0,
        "total_feedbacks":  profil.total_feedbacks  or 0,
        "total_reward":     profil.total_reward     or 0.0,
        "historique":       (profil.historique or [])[-20:],  # Last 20 for graph
    }