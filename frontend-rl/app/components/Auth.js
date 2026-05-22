'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

// ── Micro-animation keyframes injected once ──────────────────────────────────
const GLOBAL_CSS = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulseRing {
  0%   { box-shadow: 0 0 0 0 rgba(124,106,255,0.4); }
  70%  { box-shadow: 0 0 0 10px rgba(124,106,255,0); }
  100% { box-shadow: 0 0 0 0  rgba(124,106,255,0); }
}
`

// ── Utility helpers ───────────────────────────────────────────────────────────
function InjectCSS() {
  useEffect(() => {
    if (document.getElementById('auth-global-css')) return
    const el = document.createElement('style')
    el.id = 'auth-global-css'
    el.textContent = GLOBAL_CSS
    document.head.appendChild(el)
  }, [])
  return null
}

// ── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ value, current, onChange, icon, title, desc }) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      style={{
        flex: 1, padding: '14px 12px', borderRadius: 14, cursor: 'pointer',
        background: active ? 'rgba(124,106,255,0.12)' : 'var(--surface3)',
        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        color: 'var(--text)', textAlign: 'left',
        transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 4,
        animation: active ? 'pulseRing 0.4s ease-out' : 'none',
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: active ? 'var(--accent2)' : 'var(--text)' }}>
        {title}
      </span>
      <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{desc}</span>
    </button>
  )
}

// ── Input Field ──────────────────────────────────────────────────────────────
function AuthInput({ label, type = 'text', value, onChange, placeholder, icon }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 7, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4, pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: `12px 14px 12px ${icon ? '40px' : '14px'}`,
            background: 'var(--surface2)',
            border: `1px solid ${focused ? 'var(--accent)' : 'var(--border2)'}`,
            borderRadius: 12, color: 'var(--text)', outline: 'none',
            fontSize: 13, fontFamily: "'DM Sans', sans-serif",
            boxShadow: focused ? '0 0 0 3px rgba(124,106,255,0.12)' : 'none',
            transition: 'all 0.2s',
          }}
        />
      </div>
    </div>
  )
}

// ── Alert Banner ─────────────────────────────────────────────────────────────
function Alert({ type, text }) {
  if (!text) return null
  const isError = type === 'error'
  return (
    <div style={{
      fontSize: 13, borderRadius: 10, padding: '10px 14px',
      background: isError ? 'var(--red-dim)' : 'var(--green-dim)',
      color: isError ? 'var(--red)' : 'var(--green)',
      border: `1px solid ${isError ? 'var(--red-border)' : 'var(--green-border)'}`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span>{isError ? '⚠' : '✓'}</span>
      {text}
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      width: 16, height: 16, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

// ── Password strength bar ────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const score = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/, /.{8,}/].filter(r => r.test(password)).length
  if (!password) return null
  const colors = ['var(--red)', 'var(--red)', 'var(--amber)', 'var(--amber)', 'var(--green)']
  const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Excellent']
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 8 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 99,
          background: i <= score ? colors[score - 1] : 'var(--border)',
          transition: 'background 0.3s',
        }} />
      ))}
      <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6, whiteSpace: 'nowrap' }}>
        {labels[score]}
      </span>
    </div>
  )
}

// ── Main Auth Component ───────────────────────────────────────────────────────
export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isRegister = mode === 'register'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const endpoint = isRegister ? 'register' : 'login'
      const body = isRegister ? { username, password, role } : { username, password }

      const res = await fetch(`${API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.status === 'error') {
        setMessage({ type: 'error', text: data.message })
      } else if (isRegister) {
        setMessage({ type: 'success', text: 'Compte créé avec succès ! Connecte-toi.' })
        setMode('login')
        setPassword('')
      } else {
        onLoginSuccess(data)
      }
    } catch {
      setMessage({ type: 'error', text: 'Impossible de joindre le serveur. Vérifie que le backend est lancé.' })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      <InjectCSS />
      <div style={{
        minHeight: '100vh', display: 'flex', background: 'var(--bg)',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── Left panel : branding ── */}
        <div style={{
          display: 'none',
          // On desktop (CSS media query via style tag would be needed;
          // this simulates the visual via hardcoded flex 1 on large screens)
          flex: '0 0 420px', background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          padding: '48px 40px',
          flexDirection: 'column', justifyContent: 'space-between',
        }} className="auth-left-panel">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>ProjectRL</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, lineHeight: 1.2, marginBottom: 20 }}>
              Trouve le projet<br/>fait pour toi
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}>
              Un moteur RL apprend tes préférences en temps réel pour te recommander des projets parfaitement adaptés à ton niveau et tes compétences.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '🧠', title: 'Actor-Critic RL', desc: 'Apprentissage adaptatif en temps réel' },
              { icon: '📊', title: 'Skills Matrix', desc: 'Visualisation de ta progression' },
              { icon: '🎯', title: '60+ projets', desc: 'IA, Web, Data, Cyber, Commerce, Marketing' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 20, width: 36, textAlign: 'center' }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{f.title}</p>
                  <p style={{ color: 'var(--muted)', fontSize: 12 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel : form ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
          <div style={{
            width: '100%', maxWidth: 420,
            animation: 'fadeSlideUp 0.5s ease both',
          }}>
            {/* Logo on mobile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22 }}>ProjectRL</span>
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 4, marginBottom: 32 }}>
              {['login', 'register'].map(m => (
                <button
                  key={m} type="button"
                  onClick={() => { setMode(m); setMessage({ type: '', text: '' }) }}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                    background: mode === m ? 'var(--surface3)' : 'transparent',
                    color: mode === m ? 'var(--text)' : 'var(--muted)',
                    border: mode === m ? '1px solid var(--border2)' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}>
                  {m === 'login' ? 'Se connecter' : "S'inscrire"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <AuthInput
                label="Nom d'utilisateur" icon="👤"
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Ex: youssef_dev"
              />

              <div>
                <AuthInput
                  label="Mot de passe" type="password" icon="🔒"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {isRegister && <PasswordStrength password={password} />}
              </div>

              {isRegister && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 10, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    Rôle du compte
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <RoleCard value="student" current={role} onChange={setRole}
                      icon="🎓" title="Étudiant"
                      desc="Recommandations personnalisées et suivi de progression" />
                    <RoleCard value="admin" current={role} onChange={setRole}
                      icon="⚙️" title="Admin"
                      desc="Dashboard analytique et gestion du catalogue" />
                  </div>
                </div>
              )}

              <Alert type={message.type} text={message.text} />

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? 'rgba(124,106,255,0.5)' : 'var(--accent)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s', marginTop: 4,
                }}
              >
                {loading ? <Spinner /> : null}
                {loading ? 'Chargement...' : isRegister ? "Créer mon compte" : 'Se connecter →'}
              </button>

              {!isRegister && (
                <p style={{ fontSize: 12, color: 'var(--muted2)', textAlign: 'center', marginTop: -4 }}>
                  Pas encore de compte ?{' '}
                  <span
                    onClick={() => { setMode('register'); setMessage({ type: '', text: '' }) }}
                    style={{ color: 'var(--accent2)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                    S'inscrire gratuitement
                  </span>
                </p>
              )}
            </form>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted2)', marginTop: 28 }}>
              Projet académique — Données stockées localement sur PostgreSQL
            </p>
          </div>
        </div>
      </div>
    </>
  )
}