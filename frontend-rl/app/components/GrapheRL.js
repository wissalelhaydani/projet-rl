'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = { vs: '#7c6aff', reward: '#22d3a0', avantage: '#f59e0b' }

function StatCard({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 10, color: 'var(--muted2)', marginBottom: 4, letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: color || 'var(--text)' }}>{value}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--muted2)', marginBottom: 6 }}>Feedback #{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function GrapheRL({ historique }) {
  if (!historique || historique.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--muted2)' }}>Le graphe apparaîtra après tes premiers feedbacks.</p>
      </div>
    )
  }

  const data = historique.map((h, i) => ({
    feedback: i + 1,
    'V(s)': parseFloat(h.V.toFixed(3)),
    'Récompense': parseFloat(h.recompense.toFixed(1)),
    'Avantage A': parseFloat(h.avantage.toFixed(3)),
  }))

  const lastVs = data[data.length - 1]['V(s)']
  const bestReward = Math.max(...data.map((d) => d['Récompense']))

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Courbe d'apprentissage RL
        </p>
        <p style={{ fontSize: 11, color: 'var(--muted2)' }}>V(s) = valeur Critic · A = avantage TD</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="feedback"
            tick={{ fontSize: 10, fill: 'rgba(240,240,248,0.35)', fontFamily: 'DM Sans' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.07)' }} tickLine={false}
            label={{ value: 'Feedbacks', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'rgba(240,240,248,0.3)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'rgba(240,240,248,0.35)', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12, color: 'rgba(240,240,248,0.5)', fontFamily: 'DM Sans' }} />
          <Line type="monotone" dataKey="V(s)"        stroke={COLORS.vs}      strokeWidth={2}   dot={{ r: 3, fill: COLORS.vs,      strokeWidth: 0 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Récompense"  stroke={COLORS.reward}  strokeWidth={1.5} dot={{ r: 3, fill: COLORS.reward,  strokeWidth: 0 }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="Avantage A"  stroke={COLORS.avantage}strokeWidth={1.5} dot={{ r: 3, fill: COLORS.avantage,strokeWidth: 0 }} activeDot={{ r: 5 }} strokeDasharray="2 2" />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <StatCard label="Dernier V(s)"       value={lastVs}     color="var(--accent2)" />
        <StatCard label="Meilleure récompense" value={bestReward} color="var(--green)"   />
        <StatCard label="Feedbacks total"    value={data.length} color="var(--muted)"   />
      </div>
    </div>
  )
}