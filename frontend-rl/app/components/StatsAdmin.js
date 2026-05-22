'use client'
import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
const PIE_COLORS = ['#7c6aff','#22d3a0','#f59e0b','#ef4444','#3b82f6','#ec4899']

const DIFF_COLORS = {
  débutant: 'var(--green)', intermédiaire: 'var(--amber)', avancé: 'var(--red)'
}

// ── Shared components ─────────────────────────────────────────────────────────
function KPICard({ label, value, color, trend }) {
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '20px 24px', flex: 1, minWidth: 160,
    }}>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: color || 'var(--text)', margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      {trend && (
        <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 8 }}>↑ {trend}</p>
      )}
    </div>
  )
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, margin: 0 }}>{children}</h2>
      {action}
    </div>
  )
}

function ChartBox({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 16, padding: 24,
    }}>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>{subtitle}</p>}
      {children}
    </div>
  )
}

// ── Tab nav ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',  label: '📊 Vue globale'    },
  { key: 'projects',  label: '📁 Projets'        },
  { key: 'rl',        label: '🧠 Monitoring RL'  },
]

function TabBar({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
      {TABS.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          style={{
            padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
            background: active === t.key ? 'var(--surface3)' : 'transparent',
            color: active === t.key ? 'var(--text)' : 'var(--muted)',
            border: active === t.key ? '1px solid var(--border2)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Custom tooltip for Recharts ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      {label && <p style={{ color: 'var(--muted2)', marginBottom: 4 }}>{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || p.fill, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats, mounted }) {
  if (!stats) return <p style={{ color: 'var(--muted)' }}>Chargement des données...</p>

  const actionData = [
    { name: 'Like',           value: stats.action_counts?.like          || 0, fill: '#22d3a0' },
    { name: 'Complété',       value: stats.action_counts?.done          || 0, fill: '#60a5fa' },
    { name: 'Skip',           value: stats.action_counts?.skip          || 0, fill: '#f59e0b' },
    { name: 'Non intéressé',  value: stats.action_counts?.not_interested || 0, fill: '#f87171' },
    { name: 'Sauvegardé',     value: stats.action_counts?.save          || 0, fill: '#ec4899' },
  ].filter(d => d.value > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <KPICard label="Total étudiants"      value={stats.total_etudiants ?? 0}   color="var(--accent2)" />
        <KPICard label="Total feedbacks"       value={stats.global_feedbacks ?? 0}  color="var(--blue)"    />
        <KPICard label="Récompense moyenne"    value={`${stats.avg_reward ?? 0}`}   color="var(--green)"   />
        <KPICard label="Projets au catalogue"  value={stats.total_projets ?? '—'}   color="var(--amber)"   />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {mounted && stats.repartition_domaines?.length > 0 && (
          <ChartBox title="Domaines des étudiants" subtitle="Répartition par domaine choisi au profil">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={stats.repartition_domaines} cx="50%" cy="45%"
                  innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {stats.repartition_domaines.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10 }} />
                <Legend formatter={v => <span style={{ color: 'var(--text)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        )}

        {mounted && actionData.length > 0 && (
          <ChartBox title="Distribution des actions" subtitle="Répartition des feedbacks enregistrés">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={actionData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Actions" radius={[4,4,0,0]}>
                  {actionData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        )}
      </div>
    </div>
  )
}

// ── Projects Tab (CRUD) ───────────────────────────────────────────────────────
function ProjectsTab() {
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [newProjet, setNewProjet] = useState({
    titre: '', description: '', stack: '', dataset: '',
    difficulte: 'intermédiaire', domaine: 'IA', niveaux: 'M1', competences: '',
  })

  const fetchProjets = async () => {
    try {
      const res = await fetch(`${API}/projets`)
      const data = await res.json()
      setProjets(data || [])
    } catch { setProjets([]) }
    setLoading(false)
  }

  useEffect(() => { fetchProjets() }, [])

  const handleAdd = async () => {
    const payload = {
      ...newProjet,
      stack: newProjet.stack.split(',').map(s => s.trim()).filter(Boolean),
      niveaux: newProjet.niveaux.split(',').map(s => s.trim()).filter(Boolean),
      competences: newProjet.competences.split(',').map(s => s.trim()).filter(Boolean),
    }
    await fetch(`${API}/projets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setShowForm(false)
    fetchProjets()
  }

  const filtered = projets.filter(p =>
    !search || p.titre?.toLowerCase().includes(search.toLowerCase()) ||
    p.domaine?.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'var(--surface)', border: '1px solid var(--border2)',
    borderRadius: 8, color: 'var(--text)', outline: 'none',
    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div>
      <SectionTitle action={
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '8px 16px', background: showForm ? 'var(--red-dim)' : 'var(--accent)',
          color: showForm ? 'var(--red)' : '#fff', border: showForm ? '1px solid var(--red-border)' : 'none',
          borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {showForm ? '✕ Annuler' : '+ Ajouter un projet'}
        </button>
      }>
        Catalogue de projets
      </SectionTitle>

      {showForm && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Nouveau projet</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['titre', 'Titre du projet'],
              ['description', 'Description'],
              ['stack', 'Stack (séparé par virgules)'],
              ['dataset', 'Dataset utilisé'],
              ['competences', 'Compétences (virgules)'],
              ['niveaux', 'Niveaux (ex: M1,M2)'],
            ].map(([key, label]) => (
              <div key={key} style={{ gridColumn: key === 'description' ? '1 / -1' : 'auto' }}>
                <label style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
                <input style={inputStyle} value={newProjet[key]}
                  onChange={e => setNewProjet(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Domaine</label>
              <select style={inputStyle} value={newProjet.domaine}
                onChange={e => setNewProjet(p => ({ ...p, domaine: e.target.value }))}>
                {['IA','Web','Data','Cyber','Commerce','Marketing'].map(d => (
                  <option key={d} value={d} style={{ background: 'var(--surface2)' }}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Difficulté</label>
              <select style={inputStyle} value={newProjet.difficulte}
                onChange={e => setNewProjet(p => ({ ...p, difficulte: e.target.value }))}>
                {['débutant','intermédiaire','avancé'].map(d => (
                  <option key={d} value={d} style={{ background: 'var(--surface2)' }}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleAdd} style={{
            marginTop: 18, padding: '10px 24px',
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            ✓ Ajouter au catalogue
          </button>
        </div>
      )}

      {/* Search */}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Filtrer les projets..."
        style={{ ...inputStyle, marginBottom: 16, width: '100%' }}
      />

      {loading ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 32 }}>Chargement...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((p, i) => (
            <div key={i} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: DIFF_COLORS[p.difficulte] || 'var(--muted)',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.titre}
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>
                  {p.domaine} · {p.difficulte} · {(p.niveaux || []).join(', ')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {(p.stack || []).slice(0, 3).map(s => (
                  <span key={s} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── RL Monitoring Tab ─────────────────────────────────────────────────────────
function RLMonitoringTab({ mounted }) {
  // Generate synthetic RL learning data for visualization
  const learningData = Array.from({ length: 20 }, (_, i) => ({
    step: i + 1,
    'V(s) moyen': parseFloat((0.5 * (1 - Math.exp(-i * 0.15)) + Math.random() * 0.1).toFixed(3)),
    'Récompense': parseFloat(([2.0,1.0,-0.5,0][Math.floor(Math.random() * 4)] + Math.random() * 0.2).toFixed(1)),
  }))

  const rlParams = [
    { key: 'ALPHA (taux apprentissage)', value: '0.30', desc: 'Vitesse d\'adaptation de l\'agent' },
    { key: 'GAMMA (discount factor)',    value: '0.90', desc: 'Importance des récompenses futures' },
    { key: 'V_min / V_max',             value: '-2.0 / 5.0', desc: 'Bornes de la fonction valeur' },
    { key: 'Domaines trackés',           value: '6',   desc: 'IA, Web, Data, Cyber, Commerce, Marketing' },
    { key: 'Skills trackées',            value: '5+',  desc: 'Dynamique selon interactions' },
    { key: 'Algorithme',                value: 'A2C (Actor-Critic)', desc: 'TD(0) avec avantage' },
  ]

  const rewardTable = [
    { action: 'done (complété)',          reward: '+2.0', color: 'var(--blue)'  },
    { action: 'like (intéressé)',          reward: '+1.0', color: 'var(--green)' },
    { action: 'save (sauvegardé)',         reward: '+0.5', color: '#ec4899'      },
    { action: 'skip (passé)',              reward: '-0.5', color: 'var(--amber)' },
    { action: 'not_interested (rejeté)',   reward: '-1.0', color: 'var(--red)'   },
    { action: 'ignore (aucune action)',    reward: '0.0',  color: 'var(--muted)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionTitle>Monitoring du moteur RL</SectionTitle>

      {/* RL Params */}
      <ChartBox title="Hyperparamètres Actor-Critic" subtitle="Configuration actuelle du modèle">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {rlParams.map(p => (
            <div key={p.key} style={{
              background: 'rgba(124,106,255,0.08)', border: '1px solid rgba(124,106,255,0.2)',
              borderRadius: 10, padding: '12px 14px',
            }}>
              <p style={{ fontSize: 10, color: 'var(--muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.key}</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--accent2)', margin: '0 0 4px' }}>{p.value}</p>
              <p style={{ fontSize: 11, color: 'var(--muted2)', margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </ChartBox>

      {/* Reward table */}
      <ChartBox title="Table des récompenses" subtitle="Mapping action → reward pour le signal d'apprentissage">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rewardTable.map(r => (
            <div key={r.action} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{r.action}</span>
              <span style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: r.color,
                background: `${r.color}18`, padding: '2px 10px', borderRadius: 8,
              }}>
                {r.reward}
              </span>
            </div>
          ))}
        </div>
      </ChartBox>

      {/* Simulated learning curve */}
      {mounted && (
        <ChartBox title="Courbe d'apprentissage simulée" subtitle="Évolution de V(s) sur les derniers feedbacks (simulation)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={learningData} margin={{ top: 4, right: 16, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="step" tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Sans' }} />
              <Line type="monotone" dataKey="V(s) moyen" stroke="#7c6aff" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Récompense" stroke="#22d3a0" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>
      )}
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function StatsAdmin({ stats }) {
  const [tab, setTab] = useState('overview')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div>
      <TabBar active={tab} onChange={setTab} />

      {tab === 'overview' && <OverviewTab stats={stats} mounted={mounted} />}
      {tab === 'projects' && <ProjectsTab />}
      {tab === 'rl'       && <RLMonitoringTab mounted={mounted} />}
    </div>
  )
}