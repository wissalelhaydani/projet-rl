'use client'
import { useState, useMemo } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────
const DIFF_STYLES = {
  'débutant':      { bg: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-border)', label: '● Débutant' },
  'intermédiaire': { bg: 'var(--amber-dim)', color: 'var(--amber)', border: '1px solid var(--amber-border)', label: '●● Intermédiaire' },
  'avancé':        { bg: 'var(--red-dim)',   color: 'var(--red)',   border: '1px solid var(--red-border)',   label: '●●● Avancé' },
}

const DOMAIN_COLORS = {
  IA:        { color: 'var(--accent2)', bg: 'rgba(124,106,255,0.12)', icon: '🤖' },
  Web:       { color: 'var(--blue)',    bg: 'var(--blue-dim)',         icon: '🌐' },
  Data:      { color: 'var(--green)',   bg: 'var(--green-dim)',        icon: '📊' },
  Cyber:     { color: 'var(--red)',     bg: 'var(--red-dim)',          icon: '🛡️' },
  Commerce:  { color: 'var(--amber)',   bg: 'var(--amber-dim)',        icon: '💼' },
  Marketing: { color: '#ec4899',        bg: 'rgba(236,72,153,0.1)',    icon: '📣' },
}

const ACTIONS = [
  { key: 'like',          icon: '👍', label: 'Like',          color: 'var(--green)', bg: 'var(--green-dim)', border: 'var(--green-border)' },
  { key: 'done',          icon: '✓',  label: 'Complété',      color: 'var(--blue)',  bg: 'var(--blue-dim)',  border: 'var(--blue-border)'  },
  { key: 'save',          icon: '❤',  label: 'Sauvegarder',   color: '#ec4899',      bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.3)' },
  { key: 'skip',          icon: '⏭',  label: 'Skip',          color: 'var(--muted)', bg: 'var(--surface3)', border: 'var(--border)'       },
  { key: 'not_interested',icon: '✕',  label: 'Pas intéressé', color: 'var(--red)',   bg: 'var(--red-dim)',   border: 'var(--red-border)'   },
]

const FILTERS = ['Tous', 'IA', 'Web', 'Data', 'Cyber', 'Commerce', 'Marketing']
const DIFFICULTIES = ['Toutes', 'débutant', 'intermédiaire', 'avancé']

// ── Sub-components ────────────────────────────────────────────────────────────
function Badge({ text, bg, color, border }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: bg, color, border, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {text}
    </span>
  )
}

function StackPill({ label }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500,
      background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
      color: 'var(--muted)', padding: '4px 9px', borderRadius: 6,
    }}>{label}</span>
  )
}

function ActionBtn({ icon, label, color, bg, border, onClick, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: '8px 4px', borderRadius: 10,
        fontSize: 11, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
        border: `1px solid ${border}`, background: hov && !disabled ? bg : 'transparent',
        color: disabled ? 'var(--muted2)' : color,
        opacity: disabled ? 0.5 : 1,
        transform: hov && !disabled ? 'translateY(-1px)' : 'none',
        transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
      <span>{icon}</span>
      <span style={{ display: 'none' /* shown on wider cards via CSS */ }}>{label}</span>
    </button>
  )
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ projet, index, feedback, onFeedback }) {
  const [hov, setHov] = useState(false)
  const diff = DIFF_STYLES[projet.difficulte] || DIFF_STYLES['intermédiaire']
  const dom = DOMAIN_COLORS[projet.domaine] || DOMAIN_COLORS['IA']

  const done = !!feedback

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hov ? 'var(--border2)' : 'var(--border)'}`,
        borderRadius: 18, padding: '20px 22px',
        position: 'relative', overflow: 'hidden',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.25)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        animationName: 'fadeSlideUp',
        animationDuration: '0.5s',
        animationDelay: `${index * 0.06}s`,
        animationFillMode: 'both',
        animationTimingFunction: 'ease',
        opacity: done && feedback === 'not_interested' ? 0.45 : 1,
      }}>

      {/* Accent shimmer on hover */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${dom.color}, transparent)`,
        opacity: hov ? 0.7 : 0, transition: 'opacity 0.3s', pointerEvents: 'none',
      }} />

      {/* Domain icon watermark */}
      <div style={{
        position: 'absolute', right: 16, top: 14, fontSize: 32, opacity: 0.07,
        pointerEvents: 'none', userSelect: 'none',
      }}>{dom.icon}</div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        {/* Domain icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: dom.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, flexShrink: 0,
        }}>{dom.icon}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
              color: 'var(--text)', lineHeight: 1.3, margin: 0,
            }}>
              {projet.titre}
            </h3>
            <Badge text={diff.label} bg={diff.bg} color={diff.color} border={diff.border} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
            <Badge text={projet.domaine} bg={dom.bg} color={dom.color} border="transparent" />
            {(projet.niveaux || []).slice(0, 2).map(n => (
              <Badge key={n} text={n} bg="rgba(255,255,255,0.05)" color="var(--muted)" border="var(--border)" />
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>
        {projet.description}
      </p>

      {/* Stack pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {(projet.stack || []).map(s => <StackPill key={s} label={s} />)}
      </div>

      {/* Dataset */}
      <p style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 14 }}>
        Dataset · <span style={{ color: 'var(--muted)' }}>{projet.dataset || '—'}</span>
      </p>

      {/* Compétences acquises */}
      {(projet.competences || []).length > 0 && (
        <div style={{ marginBottom: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted2)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
            Compétences développées
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(projet.competences || []).map(c => (
              <span key={c} style={{
                fontSize: 10, fontWeight: 600,
                background: 'rgba(124,106,255,0.1)', color: 'var(--accent2)',
                border: '1px solid rgba(124,106,255,0.2)', padding: '3px 8px', borderRadius: 6,
              }}>+ {c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons / feedback sent */}
      {done ? (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: feedback === 'done' ? 'var(--blue-dim)' : feedback === 'like' ? 'var(--green-dim)' : feedback === 'save' ? 'rgba(236,72,153,0.1)' : 'var(--surface3)',
          border: `1px solid ${feedback === 'done' ? 'var(--blue-border)' : feedback === 'like' ? 'var(--green-border)' : feedback === 'save' ? 'rgba(236,72,153,0.3)' : 'var(--border)'}`,
          fontSize: 12, color: 'var(--muted)',
        }}>
          ✦ Feedback <strong style={{ color: 'var(--text)' }}>«{feedback}»</strong> enregistré — le modèle RL s'adapte.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          {ACTIONS.map(a => {
            // Extraction de la clé (key) pour ne pas la passer dans le spread operator restant (...actionProps)
            const { key, ...actionProps } = a;
            return (
              <ActionBtn 
                key={key} 
                {...actionProps}
                onClick={() => onFeedback(projet.titre, key)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
function FilterBar({ domainFilter, setDomainFilter, diffFilter, setDiffFilter, search, setSearch }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 200px' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.4, pointerEvents: 'none' }}>🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Chercher un projet, une techno..."
          style={{
            width: '100%', padding: '9px 12px 9px 36px',
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 10, color: 'var(--text)', outline: 'none',
            fontSize: 12, fontFamily: "'DM Sans', sans-serif",
          }}
        />
      </div>

      {/* Domain filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const active = domainFilter === (f === 'Tous' ? '' : f)
          return (
            <button key={f}
              onClick={() => setDomainFilter(f === 'Tous' ? '' : f)}
              style={{
                padding: '6px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                background: active ? 'var(--accent)' : 'var(--surface)',
                color: active ? '#fff' : 'var(--muted)',
                border: active ? '1px solid transparent' : '1px solid var(--border)',
                transition: 'all 0.15s',
              }}>
              {f !== 'Tous' && DOMAIN_COLORS[f] ? DOMAIN_COLORS[f].icon + ' ' : ''}{f}
            </button>
          )
        })}
      </div>

      {/* Difficulty select */}
      <select
        value={diffFilter}
        onChange={e => setDiffFilter(e.target.value)}
        style={{
          padding: '8px 12px', borderRadius: 10,
          background: 'var(--surface)', border: '1px solid var(--border2)',
          color: 'var(--text)', fontSize: 12,
          fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer',
        }}>
        {DIFFICULTIES.map(d => (
          <option key={d} value={d === 'Toutes' ? '' : d} style={{ background: 'var(--surface2)' }}>
            {d}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
        {label}
      </p>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 10, color: 'var(--muted2)' }}>{count} projet{count !== 1 ? 's' : ''}</span>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilter }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px dashed var(--border2)',
      borderRadius: 20, padding: '56px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 36, marginBottom: 16, opacity: 0.2 }}>◈</div>
      <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>
        {hasFilter
          ? 'Aucun projet ne correspond à ces filtres.\nEssaie de modifier ta recherche.'
          : <>Remplis ton profil et clique sur<br /><strong style={{ color: 'var(--text)' }}>Obtenir mes recommandations</strong><br />pour découvrir tes projets personnalisés.</>
        }
      </p>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function ProjetsList({ projets, onFeedback }) {
  const [feedbacks, setFeedbacks] = useState({})
  const [domainFilter, setDomainFilter] = useState('')
  const [diffFilter, setDiffFilter] = useState('')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!projets) return []
    return projets.filter(p => {
      if (domainFilter && p.domaine !== domainFilter) return false
      if (diffFilter && p.difficulte !== diffFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.titre.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (p.stack || []).some(s => s.toLowerCase().includes(q)) ||
          (p.competences || []).some(c => c.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [projets, domainFilter, diffFilter, search])

  const hasFilter = domainFilter || diffFilter || search

  const handleFeedback = async (titre, action) => {
    setFeedbacks(f => ({ ...f, [titre]: action }))
    await onFeedback(titre, action)
  }

  if (!projets || projets.length === 0) {
    return <EmptyState hasFilter={false} />
  }

  const projectsWithIndex = filtered.map((p, originalIndex) => ({
    projet: p,
    originalIndex
  }))

  const recommended = projectsWithIndex.filter(item => !feedbacks[item.projet.titre])
  const actioned    = projectsWithIndex.filter(item => !!feedbacks[item.projet.titre])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <FilterBar
        domainFilter={domainFilter} setDomainFilter={setDomainFilter}
        diffFilter={diffFilter} setDiffFilter={setDiffFilter}
        search={search} setSearch={setSearch}
      />

      {filtered.length === 0 ? (
        <EmptyState hasFilter={!!hasFilter} />
      ) : (
        <>
          {recommended.length > 0 && (
            <>
              <SectionHeader label="Recommandés pour toi" count={recommended.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {recommended.map((item) => (
                  <ProjectCard 
                    key={`rec-${item.projet.titre}`} 
                    projet={item.projet} 
                    index={item.originalIndex} 
                    feedback={feedbacks[item.projet.titre]} 
                    onFeedback={handleFeedback} 
                  />
                ))}
              </div>
            </>
          )}

          {actioned.length > 0 && (
            <>
              <SectionHeader label="Déjà évalués" count={actioned.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {actioned.map((item) => (
                  <ProjectCard 
                    key={`act-${item.projet.titre}`} 
                    projet={item.projet} 
                    index={item.originalIndex} 
                    feedback={feedbacks[item.projet.titre]} 
                    onFeedback={handleFeedback} 
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}