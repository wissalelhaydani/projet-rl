'use client'
import { useState } from 'react'

// ── Color map for domains ─────────────────────────────────────────────────────
const DOMAIN_META = {
  IA:        { color: 'var(--accent2)', gradient: 'linear-gradient(90deg, var(--accent), var(--accent2))', icon: '🤖' },
  Web:       { color: 'var(--blue)',    gradient: 'linear-gradient(90deg, #2563eb, var(--blue))',           icon: '🌐' },
  Data:      { color: 'var(--green)',   gradient: 'linear-gradient(90deg, #059669, var(--green))',          icon: '📊' },
  Cyber:     { color: 'var(--red)',     gradient: 'linear-gradient(90deg, #dc2626, var(--red))',            icon: '🛡️' },
  Commerce:  { color: 'var(--amber)',   gradient: 'linear-gradient(90deg, #d97706, var(--amber))',          icon: '💼' },
  Marketing: { color: '#ec4899',        gradient: 'linear-gradient(90deg, #be185d, #ec4899)',              icon: '📣' },
}

// ── Metric card ───────────────────────────────────────────────────────────────
function Metric({ label, value, color, sublabel }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--border)',
      borderRadius: 12, padding: '12px 10px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', gap: 3, flex: 1,
    }}>
      <div style={{
        fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800,
        color, lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted2)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize: 9, color: 'var(--muted2)', marginTop: 1 }}>{sublabel}</div>
      )}
    </div>
  )
}

// ── Interest bar ─────────────────────────────────────────────────────────────
function InterestBar({ domaine, val }) {
  const pct = Math.round(val * 100)
  const meta = DOMAIN_META[domaine] || { color: 'var(--muted)', gradient: 'linear-gradient(90deg, var(--muted), var(--muted))', icon: '◈' }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, marginBottom: 5 }}>
        <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 13 }}>{meta.icon}</span> {domaine}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: pct > 60 ? meta.color : 'var(--muted2)',
          background: pct > 60 ? `${meta.color}18` : 'transparent',
          padding: '1px 6px', borderRadius: 6,
          transition: 'all 0.3s',
        }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 99,
          background: meta.gradient,
          transition: 'width 0.9s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  )
}

// ── Skills Matrix ─────────────────────────────────────────────────────────────
function SkillsMatrix({ competence_score }) {
  const [hovered, setHovered] = useState(null)
  const entries = Object.entries(competence_score || {}).sort((a, b) => b[1] - a[1])

  if (entries.length === 0) return null

  const getLevel = (v) => {
    if (v >= 0.7) return { label: 'Expert',      color: 'var(--green)',   bg: 'var(--green-dim)' }
    if (v >= 0.5) return { label: 'Avancé',      color: 'var(--blue)',    bg: 'var(--blue-dim)'  }
    if (v >= 0.3) return { label: 'Intermédiaire', color: 'var(--amber)', bg: 'var(--amber-dim)' }
    return                { label: 'Débutant',    color: 'var(--muted)',   bg: 'var(--surface3)'  }
  }

  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 14, padding: 16,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>
        Skills Matrix
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map(([skill, val]) => {
          const pct = Math.round(val * 100)
          const lvl = getLevel(val)
          const isHov = hovered === skill
          return (
            <div
              key={skill}
              onMouseEnter={() => setHovered(skill)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHov ? 'rgba(255,255,255,0.04)' : 'transparent',
                borderRadius: 8, padding: isHov ? '6px 8px' : '2px 0',
                transition: 'all 0.2s', cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{skill}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                    background: lvl.bg, color: lvl.color,
                  }}>
                    {lvl.label}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--muted2)', minWidth: 26, textAlign: 'right' }}>
                    {pct}%
                  </span>
                </div>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%', borderRadius: 99,
                  background: `linear-gradient(90deg, ${lvl.color}88, ${lvl.color})`,
                  transition: 'width 0.9s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Recent activity ───────────────────────────────────────────────────────────
function RecentActivity({ historique }) {
  if (!historique || historique.length === 0) return null

  const ACTION_ICONS = { like: '👍', skip: '⏭', done: '✓', not_interested: '✕', save: '❤' }
  const recent = [...historique].reverse().slice(0, 3)

  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 14, padding: 16,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
        Activité récente
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recent.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: h.recompense > 0 ? 'var(--green-dim)' : h.recompense < 0 ? 'var(--red-dim)' : 'var(--surface3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0,
            }}>
              {ACTION_ICONS[h.action] || '◈'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {h.action} · {h.domaine}
              </p>
              <p style={{ fontSize: 10, color: 'var(--muted2)', margin: 0 }}>
                V(s) → {h.V?.toFixed(3)}
              </p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: h.recompense > 0 ? 'var(--green)' : h.recompense < 0 ? 'var(--red)' : 'var(--muted)',
            }}>
              {h.recompense > 0 ? '+' : ''}{h.recompense}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function EtatRL({ etat }) {
  const domaines = Object.entries(etat.domaine_interet || {})
  const avgReward = etat.total_feedbacks > 0
    ? (etat.total_reward / etat.total_feedbacks).toFixed(2)
    : '0.00'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Metric label="V(s)" value={etat.V?.toFixed(2) ?? '—'} color="var(--accent2)" sublabel="Valeur Critic" />
        <Metric label="Reward" value={etat.total_reward?.toFixed(1) ?? '—'} color="var(--green)" sublabel="Total" />
        <Metric label="Moy. rew." value={avgReward} color="var(--blue)" sublabel="Par feedback" />
        <Metric label="Actions" value={etat.total_feedbacks ?? 0} color="var(--muted)" sublabel="Enregistrées" />
      </div>

      {/* Interest vector */}
      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 16,
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>
          Vecteur d'intérêts
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {domaines.map(([d, v]) => <InterestBar key={d} domaine={d} val={v} />)}
        </div>
      </div>

      {/* Skills matrix */}
      <SkillsMatrix competence_score={etat.competence_score} />

      {/* Recent activity */}
      <RecentActivity historique={etat.historique} />
    </div>
  )
}