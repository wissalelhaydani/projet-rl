// components/student/StudentDashboard.jsx
'use client'
import { useState, useMemo } from 'react'
import ProfilForm from '../ProfilForm'
import EtatRL from '../EtatRL'
import MiniChart from '../GrapheRL'
import ProjectCard from './ProjectCard'
import StatusDot from '../ui/StatusDot'
import Skeleton from '../ui/Skeleton'

export default function StudentDashboard({ user, recommandations, etat, loading, onRecommander, onFeedback, onLogout, apiOk }) {
  const [sideTab, setSideTab] = useState("profil") // profil, etat, graphe
  const [domainFilter, setDomainFilter] = useState("")
  const [diffFilter, setDiffFilter] = useState("")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ nom: user.username, niveau: user.niveau || "M1", domaine: user.domaine || "IA", competences: "Python, Machine-Learning" })

  // Filtrage des projets
  const filtered = useMemo(() => {
    return recommandations.filter(p => {
      if (domainFilter && p.domaine !== domainFilter) return false
      if (diffFilter && p.difficulte !== diffFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return p.titre?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || (p.stack || []).some(s => s.toLowerCase().includes(q))
      }
      return true
    })
  }, [recommandations, domainFilter, diffFilter, search])

  // Valeur moyenne de reward
  const avgReward = etat && etat.total_feedbacks > 0 ? (etat.total_reward / etat.total_feedbacks).toFixed(2) : "0.00"

  // Fonction pour déclencher la recommandation depuis le formulaire
  const handleRecommanderClick = () => {
    onRecommander({
      nom: form.nom,
      niveau: form.niveau,
      domaine: form.domaine,
      competences: form.competences.split(",").map(c => c.trim()).filter(Boolean)
    })
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden", position: "relative" }}>
      
      {/* SIDEBAR (copiée depuis le premium) */}
      <aside style={{ width: 420 , background: "var(--surface)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto", flexShrink: 0, position: "relative", zIndex: 2 }}>
        {/* Top bar */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7b6cff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚡</div>
              <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 15 }}>ProjectRL</span>
            </div>
            <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 10px", color: "var(--red)", borderColor: "rgba(248,113,113,0.2)" }} onClick={onLogout}>Quitter</button>
          </div>
          {/* User info */}
          <div style={{ background: "rgba(123,108,255,0.08)", border: "1px solid rgba(123,108,255,0.18)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#7b6cff,#22d4c8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>{user.username}</p>
                <p style={{ fontSize: 11, color: "var(--accent2)", margin: 0 }}>🎓 {form.niveau} · {form.domaine}</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <StatusDot online={apiOk !== false} />
          </div>
        </div>

        {/* RL KPIs */}
        {etat && (
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Agent RL</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { l: "V(s)", v: etat.V?.toFixed(2) ?? "—", c: "var(--accent2)" },
                { l: "Reward", v: etat.total_reward?.toFixed(1) ?? "—", c: "var(--green)" },
                { l: "Moy.", v: avgReward, c: "var(--blue)" },
                { l: "Actions", v: etat.total_feedbacks ?? 0, c: "var(--muted)" },
              ].map(k => (
                <div key={k.l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 20, fontWeight: 800, color: k.c }}>{k.v}</div>
                  <div style={{ fontSize: 10, color: "var(--muted2)" }}>{k.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { k: "profil", l: "Profil" },
              { k: "etat", l: "RL State" },
              { k: "graphe", l: "Courbe" }
            ].map(t => (
              <button key={t.k} onClick={() => setSideTab(t.k)}
                style={{ flex: 1, padding: "7px", borderRadius: 8, border: sideTab === t.k ? "1px solid rgba(123,108,255,0.3)" : "1px solid transparent", background: sideTab === t.k ? "rgba(123,108,255,0.12)" : "transparent", color: sideTab === t.k ? "var(--accent2)" : "var(--muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s" }}>
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar content */}
        <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
          {sideTab === "profil" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "1px" }}>Mon Profil</p>
              {[
                { k: "nom", l: "Nom", ph: "Youssef" },
                { k: "niveau", l: "Niveau", ph: "M1, L3..." },
                { k: "domaine", l: "Domaine", ph: "IA, Web..." },
                { k: "competences", l: "Compétences (virgules)", ph: "Python, React..." },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>{f.l}</label>
                  <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={{ width: "100%", background: "var(--s3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "var(--text)" }} />
                </div>
              ))}
              <button className="btn-primary" style={{ width: "100%", padding: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onClick={handleRecommanderClick} disabled={loading}>
                {loading ? <Skeleton w="20px" h="20px" r="50%" /> : "⚡"} {loading ? "Calcul..." : "Obtenir mes reco."}
              </button>
            </div>
          )}

          {sideTab === "etat" && etat && <EtatRL etat={etat} />}
          {sideTab === "graphe" && etat?.historique?.length > 0 && <MiniChart historique={etat.historique} />}
          {sideTab === "graphe" && (!etat || !etat.historique?.length) && (
            <p style={{ fontSize: 12, color: "var(--muted2)", textAlign: "center", paddingTop: 40 }}>Le graphe apparaîtra après tes premiers feedbacks.</p>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflowY: "auto", padding: "28px 28px", display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 6 }}>Projets recommandés</h1>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Personnalisés par l'algorithme Actor-Critic en temps réel</p>
          </div>
          {etat && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="tag" style={{ background: "var(--greenDim)", color: "var(--green)", border: "1px solid rgba(16,216,118,0.3)", padding: "5px 14px", borderRadius: 99, fontSize: 11 }}>
                🧠 V(s) = {etat.V?.toFixed(3)} · {etat.total_feedbacks} feedbacks
              </span>
            </div>
          )}
        </div>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.35 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher un projet, une techno..." style={{ width: "100%", paddingLeft: 38, background: "var(--surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "var(--text)" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Tous", "IA", "Web", "Data", "Cyber", "Commerce", "Marketing"].map(f => {
              const active = domainFilter === (f === "Tous" ? "" : f)
              return (
                <button key={f} onClick={() => setDomainFilter(f === "Tous" ? "" : f)}
                  style={{ padding: "6px 13px", borderRadius: 99, border: `1px solid ${active ? "rgba(123,108,255,0.5)" : "rgba(255,255,255,0.08)"}`, background: active ? "rgba(123,108,255,0.12)" : "var(--surface)", color: active ? "var(--accent2)" : "var(--muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {f}
                </button>
              )
            })}
          </div>
          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} style={{ background: "var(--surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", color: "var(--text)" }}>
            <option value="">Toutes difficultés</option>
            {["débutant", "intermédiaire", "avancé"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Liste des projets avec chargement */}
        {loading && recommandations.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, padding: "24px" }}>
                <Skeleton w="100%" h={200} r={22} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 24, padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }}>◈</div>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8 }}>
              {search || domainFilter || diffFilter ? "Aucun projet ne correspond à ces filtres." : <>Remplis ton profil et clique sur <strong style={{ color: "var(--text)" }}>Obtenir mes recommandations</strong></>}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Recommandés pour toi</p>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: 10, color: "var(--muted2)" }}>{filtered.length} projet{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            {filtered.map((p, i) => (
              <ProjectCard key={p.titre} projet={p} index={i} feedback={null} onFeedback={onFeedback} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}