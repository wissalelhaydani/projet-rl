'use client'
import { useState } from 'react'
import Spinner from './ui/Spinner'  // tu as déjà ce composant

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState('login') // 'login' ou 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  // Force du mot de passe (pour l'affichage)
  const pwScore = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/, /.{8,}/].filter(r => r.test(password)).length
  const pwColors = ["#f87171", "#f87171", "#f59e0b", "#f59e0b", "#10d876"]
  const pwLabels = ["", "Très faible", "Faible", "Moyen", "Fort", "Excellent"]

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API}/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? { username, password, role } : { username, password }),
      })
      const data = await res.json()
      if (data.status === 'error') {
        setError(data.message)
      } else if (isRegister) {
        setSuccess('Compte créé avec succès ! Connecte-toi.')
        setMode('login')
        setPassword('')
      } else {
        onLoginSuccess(data)
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", fontFamily: "'Space Grotesk', sans-serif", position: "relative" }}>
      
      {/* PANEL GAUCHE – BRANDING */}
      <div style={{ flex: "0 0 460px", background: "rgba(14,14,24,0.8)", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #7b6cff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 0 24px rgba(123,108,255,0.4)" }}>⚡</div>
            <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 18, background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ProjectRL</span>
          </div>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: 38, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 20 }}>
            Trouve le projet<br />
            <span style={{ background: "linear-gradient(135deg, #7b6cff, #22d4c8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>fait pour toi</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, maxWidth: 340 }}>Un moteur RL apprend tes préférences en temps réel et recommande des projets calibrés à ton niveau.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: "🧠", t: "Actor-Critic RL", d: "Apprentissage adaptatif temps réel" },
            { icon: "📊", t: "Skills Matrix", d: "Visualisation de ta progression" },
            { icon: "🎯", t: "60+ projets", d: "IA, Web, Data, Cyber, Commerce" },
          ].map(f => (
            <div key={f.t} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(123,108,255,0.12)", border: "1px solid rgba(123,108,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{f.t}</p>
                <p style={{ fontSize: 11, color: "var(--muted2)" }}>{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL DROIT – FORMULAIRE */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
          
          {/* Toggle Connexion / Inscription */}
          <div style={{ display: "flex", background: "var(--surface)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 4, marginBottom: 36 }}>
            {["login", "register"].map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(""); setSuccess("") }}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: mode === m ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", background: mode === m ? "var(--s3)" : "transparent", color: mode === m ? "var(--text)" : "var(--muted)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                {m === "login" ? "Se connecter" : "S'inscrire"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Champ Nom d'utilisateur */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>Identifiant</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.35 }}>👤</span>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="ex: youssef_dev" style={{ width: "100%", paddingLeft: 42, background: "var(--s3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", outline: "none" }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.35 }}>🔒</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", paddingLeft: 42, background: "var(--s3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "var(--text)" }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
              {isRegister && password && (
                <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 10 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= pwScore ? pwColors[pwScore-1] : "rgba(255,255,255,0.1)" }} />
                  ))}
                  <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>{pwLabels[pwScore]}</span>
                </div>
              )}
            </div>

            {/* Choix du rôle (uniquement pour l'inscription) */}
            {isRegister && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.8px" }}>Rôle</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { v: "student", icon: "🎓", t: "Étudiant", d: "Recommandations personnalisées" },
                    { v: "admin",   icon: "⚙️", t: "Admin",    d: "Analytics & gestion" },
                  ].map(r => (
                    <button key={r.v} type="button" onClick={() => setRole(r.v)}
                      style={{ flex: 1, padding: "14px 12px", borderRadius: 14, background: role === r.v ? "rgba(123,108,255,0.1)" : "var(--s3)", border: `1.5px solid ${role === r.v ? "#7b6cff" : "rgba(255,255,255,0.08)"}`, color: "var(--text)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{r.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: role === r.v ? "#a78bfa" : "var(--text)", marginBottom: 2 }}>{r.t}</div>
                      <div style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 1.4 }}>{r.d}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages d'erreur / succès */}
            {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: 13 }}>⚠️ {error}</div>}
            {success && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(16,216,118,0.12)", border: "1px solid rgba(16,216,118,0.3)", color: "#10d876", fontSize: 13 }}>✓ {success}</div>}

            {/* Bouton de validation */}
            <button className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
              onClick={handleSubmit} disabled={loading}>
              {loading && <Spinner size={16} />}
              {loading ? "Chargement..." : isRegister ? "Créer mon compte" : "Se connecter →"}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted2)" }}>
              Données stockées localement sur PostgreSQL · Projet académique
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}