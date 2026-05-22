'use client'
import { useState, useEffect } from 'react'
import OrbBg from '../ui/OrbBg'
import GridBg from '../ui/GridBg'

export default function LandingPage({ onEnter }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [count, setCount] = useState({ users: 0, projects: 0, domains: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => ({
        users: Math.min(prev.users + 47, 2840),
        projects: Math.min(prev.projects + 3, 60),
        domains: Math.min(prev.domains + 1, 6),
      }))
    }, 30)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { icon: "🧠", title: "Actor-Critic RL", desc: "Algorithme A2C qui apprend tes préférences en temps réel. Chaque interaction affine les recommandations.", gradient: "linear-gradient(135deg, #7b6cff, #a78bfa)" },
    { icon: "⚡", title: "Recommandations instantanées", desc: "Score dynamique combinant domaine, niveau, compétences et historique comportemental.", gradient: "linear-gradient(135deg, #22d4c8, #60a5fa)" },
    { icon: "📊", title: "Skills Matrix", desc: "Visualisation en temps réel de ta progression par domaine et compétence.", gradient: "linear-gradient(135deg, #10d876, #22d4c8)" },
    { icon: "🎯", title: "60+ Projets curatés", desc: "IA, Web, Data, Cybersécurité, Commerce, Marketing — tous avec stack, dataset et roadmap.", gradient: "linear-gradient(135deg, #f59e0b, #ec4899)" },
    { icon: "🔄", title: "Feedback en boucle", desc: "Like, Skip, Done, Save, Not Interested — chaque action enrichit le modèle.", gradient: "linear-gradient(135deg, #f87171, #f59e0b)" },
    { icon: "🛡️", title: "Dashboard Admin", desc: "Analytics complets, CRUD projets, monitoring RL et statistiques globales.", gradient: "linear-gradient(135deg, #ec4899, #7b6cff)" },
  ]

  const domains = [
    { name: "Intelligence Artificielle", icon: "🤖", count: 8, color: "#a78bfa" },
    { name: "Développement Web", icon: "🌐", count: 6, color: "#60a5fa" },
    { name: "Data Science", icon: "📊", count: 5, color: "#10d876" },
    { name: "Cybersécurité", icon: "🛡️", count: 4, color: "#f87171" },
    { name: "Commerce", icon: "💼", count: 3, color: "#f59e0b" },
    { name: "Marketing Digital", icon: "📣", count: 3, color: "#ec4899" },
  ]

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Navbar */}
      <nav className="nav-blur" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #7b6cff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 0 20px rgba(123,108,255,0.4)" }}>⚡</div>
            <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 18, background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.6))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ProjectRL</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => onEnter("login")}>Se connecter</button>
            <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }} onClick={() => onEnter("register")}>Commencer →</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, paddingTop: 160, paddingBottom: 120, textAlign: "center", padding: "160px 24px 120px" }}>
        <div className="anim-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(123,108,255,0.1)", border: "1px solid rgba(123,108,255,0.3)", borderRadius: 99, padding: "6px 16px 6px 8px", marginBottom: 32 }}>
          <span style={{ background: "linear-gradient(135deg, #7b6cff, #a78bfa)", borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 700, color: "#fff" }}>NOUVEAU</span>
          <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 500 }}>Moteur Actor-Critic RL v2.0 disponible</span>
        </div>
        <h1 className="anim-fade-up" style={{ fontFamily: "Outfit, sans-serif", fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24, animationDelay: "0.1s" }}>
          <span style={{ background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ton prochain projet,</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #7b6cff 0%, #a78bfa 40%, #22d4c8 100%)", backgroundSize: "200% 200%", animation: "gradientShift 4s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>recommandé par l'IA</span>
        </h1>
        <p className="anim-fade-up" style={{ fontSize: 18, color: "var(--muted)", maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7, animationDelay: "0.2s" }}>
          Un moteur de Reinforcement Learning apprend tes préférences en temps réel et te recommande des projets <em style={{ color: "#a78bfa", fontStyle: "normal" }}>parfaitement calibrés</em> à ton profil.
        </p>
        <div className="anim-fade-up" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 80, animationDelay: "0.3s" }}>
          <button className="btn-primary" style={{ padding: "14px 32px", fontSize: 15, borderRadius: 14 }} onClick={() => onEnter("register")}>
            Démarrer gratuitement →
          </button>
          <button className="btn-ghost" style={{ padding: "14px 24px", fontSize: 14 }} onClick={() => onEnter("login")}>
            J'ai déjà un compte
          </button>
        </div>
        <div className="anim-fade-up" style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", animationDelay: "0.4s" }}>
          {[
            { val: count.users.toLocaleString(), label: "Étudiants actifs" },
            { val: `${count.projects}+`, label: "Projets curatés" },
            { val: `${count.domains}`, label: "Domaines couverts" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 36, fontWeight: 800, background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "var(--muted2)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 12 }}>FONCTIONNALITÉS</p>
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: 38, fontWeight: 800, letterSpacing: "-1px" }}>Pourquoi ProjectRL ?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <div key={f.title} className="card" onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)}
                style={{ padding: "28px 28px 24px", cursor: "default", animationDelay: `${i * 0.06}s` }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18, boxShadow: hoveredFeature === i ? `0 0 20px rgba(123,108,255,0.3)` : "none", transition: "box-shadow 0.3s" }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "Outfit, sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains section */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 12 }}>DOMAINES</p>
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: 38, fontWeight: 800, letterSpacing: "-1px" }}>Tous les secteurs tech</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
            {domains.map(d => (
              <div key={d.name} style={{ background: "var(--surface)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 16px", textAlign: "center", cursor: "default", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = d.color + "55"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{d.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: d.color, fontWeight: 600 }}>{d.count} projets</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px 120px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", background: "linear-gradient(135deg, rgba(123,108,255,0.1), rgba(34,212,200,0.05))", border: "1px solid rgba(123,108,255,0.25)", borderRadius: 28, padding: "60px 40px", animation: "borderPulse 4s ease infinite" }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🚀</div>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.5px" }}>Prêt à trouver ton prochain projet ?</h2>
          <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 32, lineHeight: 1.7 }}>Crée ton profil en 30 secondes et laisse l'IA faire le reste.</p>
          <button className="btn-primary" style={{ padding: "15px 40px", fontSize: 16, borderRadius: 14 }} onClick={() => onEnter("register")}>
            Créer mon compte gratuitement
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg, #7b6cff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>⚡</div>
          <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 14, color: "var(--muted)" }}>ProjectRL</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted2)" }}>Projet académique — Reinforcement Learning × UX Premium</p>
      </footer>
    </div>
  )
}