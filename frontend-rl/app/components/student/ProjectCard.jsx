// components/student/ProjectCard.jsx
'use client'
import { useState } from 'react'

const ACTIONS = [
  { key: "like",           icon: "👍", label: "Like",      color: "var(--green)", bg: "var(--greenDim)" },
  { key: "done",           icon: "✅", label: "Complété",  color: "var(--blue)",  bg: "var(--blueDim)"  },
  { key: "save",           icon: "❤️", label: "Sauver",    color: "#ec4899",      bg: "rgba(236,72,153,0.12)" },
  { key: "skip",           icon: "⏭",  label: "Skip",      color: "var(--muted)", bg: "rgba(255,255,255,0.04)" },
  { key: "not_interested", icon: "✕",  label: "Non",       color: "var(--red)",   bg: "var(--redDim)"   },
]

// Mapping domaines (à enrichir selon ta base)
const DOMAIN_META = {
  IA:        { color: "var(--accent2)", bg: "rgba(123,108,255,0.12)", icon: "🤖", grad: "linear-gradient(135deg,#7b6cff,#a78bfa)" },
  Web:       { color: "var(--blue)",    bg: "rgba(96,165,250,0.12)",  icon: "🌐", grad: "linear-gradient(135deg,#2563eb,#60a5fa)" },
  Data:      { color: "var(--green)",   bg: "rgba(16,216,118,0.12)",  icon: "📊", grad: "linear-gradient(135deg,#059669,#10d876)" },
  Cyber:     { color: "var(--red)",     bg: "rgba(248,113,113,0.12)", icon: "🛡️", grad: "linear-gradient(135deg,#dc2626,#f87171)" },
  Commerce:  { color: "var(--amber)",   bg: "rgba(245,158,11,0.12)",  icon: "💼", grad: "linear-gradient(135deg,#d97706,#f59e0b)" },
  Marketing: { color: "#ec4899",        bg: "rgba(236,72,153,0.1)",   icon: "📣", grad: "linear-gradient(135deg,#be185d,#ec4899)" },
}

const DIFF_META = {
  "débutant":       { label: "Débutant",       color: "var(--green)",  bg: "var(--greenDim)", dot: "●" },
  "intermédiaire":  { label: "Intermédiaire",   color: "var(--amber)",  bg: "var(--amberDim)", dot: "●●" },
  "avancé":         { label: "Avancé",          color: "var(--red)",    bg: "var(--redDim)",   dot: "●●●" },
}

function ActionButton({ icon, color, bg, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: 1, padding: "9px 4px", borderRadius: 11, fontSize: 14, cursor: "pointer", border: `1px solid ${hov ? color + "55" : "rgba(255,255,255,0.08)"}`, background: hov ? bg : "transparent", color: hov ? color : "var(--muted2)", transform: hov ? "translateY(-2px)" : "none", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
      {icon}
    </button>
  )
}

export default function ProjectCard({ projet, index, feedback, onFeedback }) {
  const [hov, setHov] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const dom = DOMAIN_META[projet.domaine] || DOMAIN_META["IA"]
  const diff = DIFF_META[projet.difficulte] || DIFF_META["intermédiaire"]
  const done = !!feedback

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "var(--surface)", border: `1px solid ${hov ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)"}`, borderRadius: 22, overflow: "hidden", position: "relative", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 24px 50px rgba(0,0,0,0.5)" : "none", transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)", opacity: done && feedback === "not_interested" ? 0.45 : 1, animation: "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${index * 0.07}s` }}>

      {/* Top gradient bar */}
      <div style={{ height: 3, background: dom.grad }} />

      <div style={{ padding: "22px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: dom.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: hov ? `0 0 20px ${dom.color}44` : "none", transition: "box-shadow 0.3s" }}>{dom.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <h3 style={{ fontFamily: "Outfit, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", lineHeight: 1.3, margin: 0 }}>{projet.titre}</h3>
              <span className="tag" style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.color}40`, flexShrink: 0, fontSize: 10 }}>
                {diff.dot} {diff.label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="tag" style={{ background: dom.bg, color: dom.color, border: "transparent", padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{projet.domaine}</span>
              {(projet.niveaux || []).slice(0, 2).map(n => (
                <span key={n} className="tag" style={{ background: "rgba(255,255,255,0.05)", color: "var(--muted)", border: "transparent" }}>{n}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginBottom: 16 }}>{projet.description}</p>

        {/* Stack */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {(projet.stack || []).map(s => (
            <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "var(--muted2)", border: "1px solid rgba(255,255,255,0.08)" }}>{s}</span>
          ))}
        </div>

        {/* Dataset + expand toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "var(--muted2)" }}>Dataset · <span style={{ color: "var(--muted)" }}>{projet.dataset || "—"}</span></span>
          {(projet.competences || []).length > 0 && (
            <button onClick={() => setExpanded(!expanded)} style={{ fontSize: 11, color: "var(--accent2)", background: "none", border: "none", cursor: "pointer", padding: "2px 8px", borderRadius: 6 }}>
              {expanded ? "▲ Moins" : `▼ +${projet.competences.length} compétences`}
            </button>
          )}
        </div>

        {/* Compétences (expandable) */}
        {expanded && (projet.competences || []).length > 0 && (
          <div style={{ marginBottom: 16, padding: "14px", background: "rgba(123,108,255,0.06)", borderRadius: 12, border: "1px solid rgba(123,108,255,0.15)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Compétences développées</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(projet.competences || []).map(c => (
                <span key={c} style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6, background: "rgba(123,108,255,0.15)", color: "var(--accent2)", border: "1px solid rgba(123,108,255,0.25)" }}>+ {c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions ou feedback déjà envoyé */}
        {done ? (
          <div style={{ padding: "12px 16px", borderRadius: 12, background: feedback === "done" ? "var(--blueDim)" : feedback === "like" ? "var(--greenDim)" : "rgba(255,255,255,0.04)", border: `1px solid ${feedback === "done" ? "rgba(96,165,250,0.3)" : feedback === "like" ? "rgba(16,216,118,0.3)" : "rgba(255,255,255,0.1)"}`, fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <span>✦</span>
            Feedback <strong style={{ color: "var(--text)" }}>«{feedback}»</strong> enregistré · RL mis à jour
          </div>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            {ACTIONS.map(a => (
              <ActionButton key={a.key} icon={a.icon} color={a.color} bg={a.bg} onClick={() => onFeedback(projet.titre, a.key)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}