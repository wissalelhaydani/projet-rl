# projet1-rl
# ⚙️ ProjectRL — Backend

##  File Structure

```
backend/
├── main.py          # All API routes & scoring logic
├── database.py      # SQLAlchemy models, engine, session factory
├── rl_agent.py      # Actor-Critic TD(0) RL engine
├── requirements.txt # Python dependencies
└── .env             # Environment variables (not committed)
```

## 🌐 API Reference (`main.py`)

### Auth

#### `POST /register`
Create a new user account.

```json
// Request
{ "username": "alice", "password": "secret", "role": "student" }

// Response (success)
{ "status": "success", "message": "Compte student créé avec succès !" }

// Response (error)
{ "status": "error", "message": "Cet identifiant est déjà pris." }
```

#### `POST /login`
Authenticate and retrieve session data.

```json
// Request
{ "username": "alice", "password": "secret" }

// Response
{ "status": "success", "username": "alice", "role": "student", "domaine": "IA", "niveau": "M1" }
```

---

### Recommendations

#### `POST /recommander`
Get personalized project recommendations using the RL scoring function.

```json
// Request
{
  "nom": "alice",
  "niveau": "M1",
  "domaine": "IA",
  "competences": ["Python", "Machine-Learning"]
}

// Response
{
  "etudiant": "alice",
  "recommandations": [ /* top 5 ProjetDB objects */ ]
}
```

**Scoring function** (`scorer_projet`):

| Signal | Weight |
|---|---|
| Domain match | +2.0 |
| Level match | +1.5 |
| Skill overlap (per shared skill) | +0.5 |
| RL domain interest | ×2.0 |
| RL competence score (per skill) | ×0.3 |
| Exploration noise | +[0, 0.3] |

---

### Feedback

#### `POST /feedback`
Submit a user interaction. This triggers the RL update.

```json
// Request
{ "etudiant_id": "alice", "projet": "Agent RL pour jeu Snake", "action": "like" }

// Response
{
  "recompense": 1.0,
  "avantage": 0.432,
  "V_nouveau": 0.603,
  "domaine_interet": { "IA": 0.71, ... },
  "competence_score": { "Python": 0.56, ... },
  "total_feedbacks": 7,
  "moyenne_reward": 0.57
}
```

Valid `action` values: `like`, `skip`, `done`, `save`, `not_interested`, `ignore`

---

### RL State

#### `GET /etat/{etudiant_id}`
Retrieve the full RL state for a user.

```json
{
  "id": "alice",
  "domaine_interet": { "IA": 0.71, "Web": 0.29, ... },
  "competence_score": { "Python": 0.56, "NLP": 0.4, ... },
  "V": 0.603,
  "total_feedbacks": 7,
  "total_reward": 4.0,
  "historique": [ /* last 20 entries */ ]
}
```

---

### Projects

#### `GET /projets`
List projects with optional query filters.

| Param | Type | Example |
|---|---|---|
| `domaine` | string | `?domaine=IA` |
| `difficulte` | string | `?difficulte=avancé` |
| `niveau` | string | `?niveau=M1` |
| `search` | string | `?search=python` |
| `limit` | int | `?limit=20` |

#### `POST /projets`
Add a new project to the catalog.

```json
{
  "titre": "My Project",
  "description": "...",
  "stack": ["Python", "FastAPI"],
  "dataset": "Custom",
  "difficulte": "intermédiaire",
  "domaine": "Web",
  "niveaux": ["M1"],
  "competences": ["Python", "Backend"]
}
```

#### `POST /projets/seed`
Populate the database with the 22-project default catalog. Safe to call multiple times (idempotent check included).

#### `GET /projets/trending`
Returns up to 6 projects ranked by positive interaction count across all users.

---

### Admin

#### `GET /admin/stats`
Returns aggregated analytics for the admin dashboard.

```json
{
  "total_etudiants": 42,
  "global_feedbacks": 318,
  "avg_reward": 0.74,
  "repartition_domaines": [{ "name": "IA", "value": 18 }, ...],
  "action_counts": { "like": 120, "done": 55, "skip": 80, ... }
}
```

---

## 🧠 RL Engine (`rl_agent.py`)

### Hyperparameters

| Parameter | Value | Description |
|---|---|---|
| `ALPHA` | 0.30 | Learning rate |
| `GAMMA` | 0.90 | Discount factor |
| `V_MIN` | -2.0 | Value function lower bound |
| `V_MAX` | +5.0 | Value function upper bound |

### `mise_a_jour()` — Core update loop

Called on every `/feedback` request. Runs the full Actor-Critic TD(0) update:

```
1. r  = RECOMPENSES[action]
2. V' = clamp(V + α*r, V_MIN, V_MAX)          ← Critic update
3. A  = r + γ*V' - V                           ← Advantage (TD error)
4. interest[domain] += α * A * actor_mult      ← Actor update
5. competence[skill] adjusted per reward sign  ← Skills update
6. history.append({action, domain, r, A, V'})  ← Audit log
```

**Actor multipliers by action:**

| Action | Multiplier |
|---|---|
| `done` | +0.20 |
| `like` | +0.15 |
| `save` | +0.10 |
| `skip` | -0.08 |
| `not_interested` | -0.15 |
| `ignore` | 0.0 |

**Skills discovery:**
- `done` → new skill gets score 0.4 (validated)
- `like` → new skill gets score 0.2 (interested)
- `save` → new skill gets score 0.15 (weak signal)
- Skills below 0.1 are pruned from the active list

### `get_etat()` — State reader

Returns the user's current RL state from the database. Returns the last 20 history entries for graph rendering.

---

