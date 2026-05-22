'use client'
import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import ProfilForm from './components/ProfilForm'
import ProjetsList from './components/ProjetsList'
import EtatRL from './components/EtatRL'
import GrapheRL from './components/GrapheRL'
import StatsAdmin from './components/StatsAdmin'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, var(--surface2) 25%, var(--surface3) 50%, var(--surface2) 75%)',
      backgroundSize: '400px 100%',
      animation: 'shimmerAnim 1.4s ease infinite',
      ...style,
    }} />
  )
}

function CardSkeleton() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '20px 22px' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <Skeleton width={36} height={36} borderRadius={10} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
      <Skeleton width="100%" height={12} style={{ marginBottom: 6 }} />
      <Skeleton width="85%" height={12} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[80, 60, 70].map(w => <Skeleton key={w} width={w} height={24} borderRadius={6} />)}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1,2,3,4,5].map(i => <Skeleton key={i} height={34} borderRadius={10} style={{ flex: 1 }} />)}
      </div>
    </div>
  )
}

// ── Status indicator ──────────────────────────────────────────────────────────
function StatusBadge({ connected }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: connected ? 'rgba(34,211,160,0.1)' : 'var(--red-dim)',
      border: `1px solid ${connected ? 'var(--green-border)' : 'var(--red-border)'}`,
      color: connected ? 'var(--green)' : 'var(--red)',
      fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: connected ? 'pulse 2s infinite' : 'none' }} />
      {connected ? 'PostgreSQL connecté' : 'API hors ligne'}
    </span>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: -4 }}>
      {children}
    </p>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [user, setUser] = useState(null)
  const [adminStats, setAdminStats] = useState(null)
  const [recommandations, setRecommandations] = useState([])
  const [etat, setEtat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiOk, setApiOk] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Check API health on mount
  useEffect(() => {
    fetch(`${API}/`).then(() => setApiOk(true)).catch(() => setApiOk(false))
  }, [])

  // Auto-recommend on login
  useEffect(() => {
    if (user?.role === 'student') {
      handleRecommander({
        nom: user.username,
        niveau: user.niveau || 'M1',
        domaine: user.domaine || 'IA',
        competences: [],
      })
    }
  }, [user])

  const fetchEtat = async (nom) => {
    try {
      const res = await fetch(`${API}/etat/${nom}`)
      const data = await res.json()
      setEtat(data)
    } catch { /* silent */ }
  }

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API}/admin/stats`)
      const data = await res.json()
      // Also fetch project count
      const projRes = await fetch(`${API}/projets`).catch(() => null)
      const projData = projRes ? await projRes.json() : []
      setAdminStats({ ...data, total_projets: projData.length })
    } catch { /* silent */ }
  }

  const handleLoginSuccess = (sessionData) => {
    setUser(sessionData)
    if (sessionData.role === 'admin') fetchAdminStats()
  }

  const handleLogout = () => {
    setUser(null)
    setRecommandations([])
    setEtat(null)
    setAdminStats(null)
  }

  const handleRecommander = async (profil) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/recommander`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: profil.nom,
          niveau: profil.niveau,
          domaine: profil.domaine,
          competences: Array.isArray(profil.competences) ? profil.competences : profil.competences.split(',').map(c => c.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      setRecommandations(data.recommandations || [])
      await fetchEtat(profil.nom)
    } catch { /* silent */ }
    setLoading(false)
  }

  const handleFeedback = async (projet, action) => {
    try {
      await fetch(`${API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etudiant_id: user.username, projet, action }),
      })
      await fetchEtat(user.username)
    } catch { /* silent */ }
  }

  // ── Not logged in ──
  if (!user) {
    return (
      <>
        <style>{`
          @keyframes shimmerAnim {
            0%   { background-position: -400px 0; }
            100% { background-position:  400px 0; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <Auth onLoginSuccess={handleLoginSuccess} />
      </>
    )
  }

  // ── Admin view ──
  if (user.role === 'admin') {
    return (
      <>
        <style>{`
          @keyframes shimmerAnim { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
          @keyframes fadeSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>

          {/* Sidebar */}
          <aside style={{
            width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)',
            padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16 }}>ProjectRL</span>
              </div>

              {/* Admin badge */}
              <div style={{ background: 'rgba(124,106,255,0.1)', border: '1px solid rgba(124,106,255,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 24 }}>
                <p style={{ fontSize: 10, color: 'var(--muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Connecté en tant que</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent2)', margin: 0 }}>⚙️ {user.username}</p>
              </div>

              <StatusBadge connected={apiOk !== false} />

              <button onClick={fetchAdminStats} style={{
                marginTop: 20, background: 'none', border: '1px solid var(--border2)',
                color: 'var(--muted)', width: '100%', padding: '8px', borderRadius: 8,
                cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans', sans-serif",
              }}>
                🔄 Rafraîchir les stats
              </button>
            </div>

            <button onClick={handleLogout} style={{
              width: '100%', padding: 10, background: 'rgba(248,113,113,0.08)',
              color: 'var(--red)', border: '1px solid var(--red-border)',
              borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Déconnexion
            </button>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, marginBottom: 6 }}>
                Dashboard Admin
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Analyse globale des interactions, catalogue de projets et monitoring du moteur RL.
              </p>
            </div>
            <StatsAdmin stats={adminStats} />
          </main>
        </div>
      </>
    )
  }

  // ── Student view ──
  return (
    <>
      <style>{`
        @keyframes shimmerAnim { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{
        display: 'flex', height: '100vh', background: 'var(--bg)',
        color: 'var(--text)', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? 340 : 0, minWidth: sidebarOpen ? 340 : 0,
          background: 'var(--surface)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 16, padding: sidebarOpen ? 24 : 0,
          overflowY: 'auto', overflowX: 'hidden',
          transition: 'width 0.3s ease, min-width 0.3s ease, padding 0.3s ease',
          flexShrink: 0,
        }}>
          {sidebarOpen && (
            <>
              {/* Top bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⚡</div>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14 }}>ProjectRL</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>
                    🎓 <strong>{user.username}</strong>
                  </p>
                </div>
                <button onClick={handleLogout} style={{
                  fontSize: 10, background: 'none', border: '1px solid var(--border2)',
                  color: 'var(--muted)', padding: '4px 10px', borderRadius: 7, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Quitter
                </button>
              </div>

              <StatusBadge connected={apiOk !== false} />

              <SectionLabel>Profil étudiant</SectionLabel>
              <ProfilForm onSubmit={handleRecommander} loading={loading} user={user} />

              {etat && (
                <>
                  <SectionLabel>Agent RL — État courant</SectionLabel>
                  <EtatRL etat={etat} />
                </>
              )}
            </>
          )}
        </aside>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            position: 'absolute', left: sidebarOpen ? 318 : -1, top: '50%',
            transform: 'translateY(-50%)',
            width: 22, height: 48, borderRadius: sidebarOpen ? '0 8px 8px 0' : '8px',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderLeft: sidebarOpen ? 'none' : '1px solid var(--border)',
            color: 'var(--muted)', cursor: 'pointer', fontSize: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, transition: 'left 0.3s ease',
          }}
        >
          {sidebarOpen ? '◂' : '▸'}
        </button>

        {/* Main content */}
        <main style={{
          flex: 1, background: 'var(--bg)', padding: '28px 24px',
          display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26,
                letterSpacing: '-0.5px', color: 'var(--text)', margin: 0,
              }}>
                Projets recommandés
              </h1>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 5 }}>
                Personnalisés en temps réel par l'algorithme Actor-Critic
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {etat && (
                <span style={{
                  background: 'rgba(34,211,160,0.08)', border: '1px solid var(--green-border)',
                  color: 'var(--green)', fontSize: 10, fontWeight: 600,
                  padding: '5px 12px', borderRadius: 99,
                }}>
                  V(s) = {etat.V?.toFixed(3)} · {etat.total_feedbacks} actions
                </span>
              )}
            </div>
          </div>

          {/* Project list or skeleton */}
          {loading && recommandations.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <ProjetsList projets={recommandations} onFeedback={handleFeedback} />
          )}

          {/* RL graph */}
          {etat?.historique?.length > 0 && (
            <GrapheRL historique={etat.historique} />
          )}
        </main>
      </div>
    </>
  )
}