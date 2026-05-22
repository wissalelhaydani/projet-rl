'use client'
import { useState } from 'react'

const inputStyle = {
  width: '100%',
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 10,
  color: 'var(--text)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  padding: '9px 12px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  appearance: 'none',
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', letterSpacing: '0.3px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function ProfilForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    nom: 'Youssef',
    niveau: 'M1',
    domaine: 'IA',
    competences: 'Python, Machine-Learning',
  })

  const focusOn = (e) => {
    e.target.style.borderColor = 'var(--accent)'
    e.target.style.boxShadow = '0 0 0 3px rgba(124,106,255,0.15)'
  }

  const focusOff = (e) => {
    e.target.style.borderColor = 'var(--border2)'
    e.target.style.boxShadow = 'none'
  }

  const handleSubmit = () => {
    if (!form.nom.trim()) return
    onSubmit({
      nom: form.nom.trim(),
      niveau: form.niveau.trim(),
      domaine: form.domaine.trim(),
      // Nettoyage des compétences écrites à la main (supprime les espaces inutiles)
      competences: form.competences.split(',').map((c) => c.trim()).filter(Boolean),
    })
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
        Mon Profil Étudiant
      </h2>

      <Field label="Nom complet">
        <input style={inputStyle} value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          onFocus={focusOn} onBlur={focusOff} />
      </Field>

      {/* Saisie Libre avec Suggestions pour le Niveau */}
      <Field label="Niveau (Choisis ou saisis librement)">
        <input style={inputStyle} value={form.niveau} list="niveaux-list"
          onChange={(e) => setForm({ ...form, niveau: e.target.value })}
          onFocus={focusOn} onBlur={focusOff} placeholder="Ex: M1, L3, Doctorat..." />
        <datalist id="niveaux-list">
          {['L1', 'L2', 'L3', 'M1', 'M2'].map((n) => <option key={n} value={n} />)}
        </datalist>
      </Field>

      {/* Saisie Libre avec Suggestions pour le Domaine */}
      <Field label="Domaine principal (Choisis ou saisis librement)">
        <input style={inputStyle} value={form.domaine} list="domaines-list"
          onChange={(e) => setForm({ ...form, domaine: e.target.value })}
          onFocus={focusOn} onBlur={focusOff} placeholder="Ex: IA, Web, Cloud..." />
        <datalist id="domaines-list">
          {['IA', 'Web', 'Data', 'Cyber','Commerce', 'Marketing'].map((d) => <option key={d} value={d} />)}
        </datalist>
      </Field>

      {/* Saisie libre complète des compétences */}
      <Field label="Compétences actuelles (séparées par des virgules)">
        <input style={inputStyle} value={form.competences}
          onChange={(e) => setForm({ ...form, competences: e.target.value })}
          onFocus={focusOn} onBlur={focusOff} placeholder="Python, React, Go, Docker..." />
      </Field>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? 'rgba(124,106,255,0.5)' : 'var(--accent)',
          color: '#fff', border: 'none', borderRadius: 12,
          padding: '11px', fontSize: 13, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', marginTop: 4,
        }}>
        {loading ? 'Calcul des recommandations...' : '⚡ Obtenir mes recommandations'}
      </button>
    </div>
  )
}