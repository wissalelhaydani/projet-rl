# 🎨 ProjectRL — Frontend

##  File Structure

```
frontend/
├── app/
│   ├── page.js            # Root page — routing, state, layout
│   └── globals.css        # Design tokens, resets, animations
└── components/
    ├── Auth.js            # Login / Register screens
    ├── ProfilForm.js      # Student profile input form
    ├── ProjetsList.js     # Project cards with filter bar
    ├── EtatRL.js          # RL state sidebar panel
    ├── GrapheRL.js        # Learning curve chart (Recharts)
    └── StatsAdmin.js      # Admin dashboard with tabs
```


## 🧩 Component Reference

### `Auth.js` — Authentication

Full-page login/register experience.

**Features:**
- Tab switcher: "Se connecter" / "S'inscrire"
- Role selector cards (Student / Admin) on register
- Password strength indicator (5-level bar)
- Animated alert banners (success / error)
- Spinner button states
- `pulseRing` animation on active role card


---

### `ProfilForm.js` — Student Profile

Compact sidebar form for entering student details.

**Fields:**
- **Nom** — free text
- **Niveau** — free text + `<datalist>` suggestions (L1–M2)
- **Domaine** — free text + suggestions (IA, Web, Data, Cyber, Commerce, Marketing)
- **Compétences** — comma-separated free text


---

### `ProjetsList.js` — Project Cards

Main content area — filterable, searchable project grid.

**Sub-components:**

| Component | Purpose |
|---|---|
| `ProjectCard` | Full project card with all metadata and action buttons |
| `FilterBar` | Search input + domain filter pills + difficulty select |
| `ActionBtn` | Individual feedback button (like/skip/done/save/not-interested) |
| `Badge` | Colored tag chip (difficulty, domain, level) |
| `StackPill` | Technology tag (muted style) |
| `SectionHeader` | Divider label with count ("Recommandés pour toi — 4 projets") |
| `EmptyState` | Shown when no projects or no filter match |


---

### `EtatRL.js` — RL State Panel

Sidebar widget displaying the user's current RL state.

**Sub-components:**

| Component | Purpose |
|---|---|
| `Metric` | KPI card (V(s), total reward, avg reward, actions count) |
| `InterestBar` | Per-domain interest bar with gradient fill |
| `SkillsMatrix` | Hover-interactive skills table with level badges |
| `RecentActivity` | Last 3 interactions with reward color coding |


`EtatShape`:
```js
{
  V: number,
  total_feedbacks: number,
  total_reward: number,
  domaine_interet: { [domain: string]: number },    // 0.0–1.0
  competence_score: { [skill: string]: number },    // 0.0–1.0
  historique: HistoriqueEntry[]
}
```

**Skill level thresholds:**

| Score | Label | Color |
|---|---|---|
| ≥ 0.7 | Expert | `--green` |
| ≥ 0.5 | Avancé | `--blue` |
| ≥ 0.3 | Intermédiaire | `--amber` |
| < 0.3 | Débutant | `--muted` |

---

### `GrapheRL.js` — Learning Curve

Recharts `LineChart` showing RL learning progression over time.

**Displays:**
- `V(s)` — Critic value (solid violet line)
- `Récompense` — Per-step reward (dashed green)
- `Avantage A` — TD advantage (dashed amber)

**Bottom stat cards:** Last V(s), best reward, total feedbacks


 empty state if `historique` is empty or not provided.

---

### `StatsAdmin.js` — Admin Dashboard

Three-tab dashboard for admin users.

**Tabs:**

####  Vue Globale (`OverviewTab`)
- 4 KPI cards: students, feedbacks, avg reward, project count
- Recharts `PieChart` — domain distribution
- Recharts `BarChart` — action distribution

####  Projets (`ProjectsTab`)
- Full project catalog list with search filter
- Difficulty color dot indicator
- Add project form (toggleable, validated)
- Fetches `/projets` directly from the API

#### 🧠 Monitoring RL (`RLMonitoringTab`)
- Hyperparameter reference cards (ALPHA, GAMMA, V bounds, etc.)
- Reward table (action → reward mapping)
- Simulated learning curve chart (for visualization when no real data is available)


---

### `page.js` — Root Page

Main application shell managing all global state and routing logic.

**State managed here:**
```js
user          // Session data or null
adminStats    // Fetched on admin login
recommandations  // Current recommendation list
etat          // User's RL state object
loading       // Boolean for recommendation fetch
apiOk         // Backend health check result
sidebarOpen   // Sidebar toggle state
```

---


## 📡 API Integration

All API calls use `fetch` with the `NEXT_PUBLIC_API_URL` base URL.

---