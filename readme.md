#  ProjectRL — AI-Powered Project Recommender

## 📌 What is ProjectRL?

ProjectRL is an intelligent recommendation engine for developers and students. Instead of static project lists, it learns from your interactions (likes, skips, completions, saves) to surface the most relevant projects for your **level**, **domain**, and **skillset** — powered by an **Actor-Critic (A2C) Reinforcement Learning** model.

Think of it as **Netflix for developer projects**, where the recommendation engine gets smarter with every click.


## 🏗️ Project Architecture

```
projectrl/
│
├── frontend/                  # Next.js 14 App
│   ├── app/
│   │   ├── page.js            # Main router / layout
│   │   └── globals.css        # Design tokens & global styles
│   └── components/
│       ├── Auth.js            # Login / Register
│       ├── ProfilForm.js      # Student profile form
│       ├── ProjetsList.js     # Project cards + filters
│       ├── EtatRL.js          # RL state panel (sidebar)
│       ├── GrapheRL.js        # Learning curve chart
│       └── StatsAdmin.js      # Admin dashboard (tabs)
│
├── backend/                   # FastAPI Python API
│   ├── main.py                # All REST endpoints
│   ├── database.py            # SQLAlchemy models & DB setup
│   ├── rl_agent.py            # Actor-Critic RL engine
│   └── .env                   # DATABASE_URL config
│
└── README.md                  # ← you are here
```

---

## 🔄 How the RL System Works

```
User sees project
      │
      ▼
User gives feedback (like / skip / done / save / not_interested)
      │
      ▼
┌─────────────────────────────────────────┐
│           Actor-Critic TD(0)            │
│                                         │
│  Critic:  V(s) ← V(s) + α * r          │
│  Actor:   interest[domain] += α*A*mult  │
│  Skills:  competence[skill] updated     │
│  Advantage: A = r + γ*V(s') - V(s)     │
└─────────────────────────────────────────┘
      │
      ▼
Next recommendation re-scored with updated state
```

**Reward table:**

| Action | Reward |
|---|---|
| `done` (completed) | +2.0 |
| `like` | +1.0 |
| `save` | +0.5 |
| `skip` | -0.5 |
| `not_interested` | -1.0 |
| `ignore` | 0.0 |

---

## 👥 User Roles

### 🎓 Student
- Fill in profile (name, level, domain, skills)
- Receive personalized AI project recommendations
- Interact with feedback buttons → model updates live
- Track RL state: V(s), interest vector, skills matrix
- View learning curve graph

### ⚙️ Admin
- View global analytics dashboard
- Browse & manage the full project catalog
- Add new projects (CRUD form)
- Monitor RL hyperparameters and reward distribution
- See action breakdown charts (pie, bar)



## 🗄️ Database Schema

```sql
-- User profiles + RL state
profiles (
  id          TEXT PRIMARY KEY,   -- username
  mot_de_passe TEXT,
  role        TEXT,               -- 'student' | 'admin'
  niveau      TEXT,
  domaine     TEXT,
  competences JSON,               -- list of skills
  domaine_interet    JSON,        -- { "IA": 0.7, "Web": 0.3, ... }
  competence_score   JSON,        -- { "Python": 0.8, ... }
  V           FLOAT,              -- Critic value function
  total_feedbacks    INTEGER,
  total_reward       FLOAT,
  historique  JSON                -- last 100 interactions
)

-- Project catalog
projets (
  titre       TEXT PRIMARY KEY,
  description TEXT,
  stack       JSON,               -- ["Python", "FastAPI"]
  dataset     TEXT,
  difficulte  TEXT,               -- débutant | intermédiaire | avancé
  domaine     TEXT,               -- IA | Web | Data | Cyber | Commerce | Marketing
  niveaux     JSON,               -- ["M1", "M2"]
  competences JSON                -- skills learned
)
```

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (App Router)
- React 18 + Recharts
- Custom CSS design system (no Tailwind dependency)

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy ORM
- Pydantic v2 models

**Database**
- PostgreSQL 16
- python-dotenv for config

**RL Engine**
- Pure Python Actor-Critic TD(0)
- Stateful per-user learning (no external ML library required)
- Persisted in PostgreSQL JSON columns

---