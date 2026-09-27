import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  CartesianGrid,
} from 'recharts'
import { Package, Cpu, Key, Truck, ScanLine, Monitor, TrendingUp, ChevronRight } from 'lucide-react'

const API = 'https://pos-machine-tracking-system-0.onrender.com/api'

// ONE color scheme — all cards same deep navy, icon accent color is subtle
const CARD_BG = 'linear-gradient(145deg, #0D1B4B 0%, #162466 100%)'

const TOP_CARDS = [
  { key: 'total',        label: 'Total Machines',  sub: 'in the system',   icon: Monitor  },
  { key: 'todayScanned', label: 'Scanned Today',   sub: 'new entries',     icon: ScanLine },
]

const STAGE_CARDS = [
  { key: 'inWarehouse', label: 'In Warehouse', sub: 'awaiting app load', icon: Package },
  { key: 'appLoaded',   label: 'App Loaded',   sub: 'awaiting key inject', icon: Cpu   },
  { key: 'keyInjected', label: 'Key Injected', sub: 'ready for dispatch',  icon: Key   },
  { key: 'dispatched',  label: 'Dispatched',   sub: 'sent to merchant',    icon: Truck },
]

// Two-tone palette — accent blue + muted teal, no rainbow
const BAR_COLORS = {
  appLoaded:   '#4361EE',
  keyInjected: '#7B8CDE',
  dispatched:  '#B4BFFF',
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--card)',
    border: '1px solid var(--card-border)',
    borderRadius: 10,
    fontSize: 12,
    fontFamily: "'Poppins', sans-serif",
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  labelStyle: { fontWeight: 700, color: 'var(--t1)', marginBottom: 4 },
  cursor: { fill: 'var(--accent-bg)' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/dashboard/stats`).then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--t2)', fontFamily: "'Poppins', sans-serif" }}>
      <span className="spinner spinner-accent" /> Loading dashboard…
    </div>
  )

  const s = stats || {}
  const total = s.total || 1

  return (
    <div style={{ padding: 32, fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--t2)', fontSize: 13.5 }}>
          Welcome back, <strong style={{ color: 'var(--t1)' }}>{user?.name}</strong> — here's your live overview.
        </p>
      </div>

      {/* Top 2 cards — total + today */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {TOP_CARDS.map(({ key, label, sub, icon: Icon }) => (
          <div key={key} style={{
            background: CARD_BG,
            borderRadius: 14, padding: '22px 24px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(19,37,120,0.28)',
          }}>
            {/* decorative circles */}
            <div style={{ position: 'absolute', top: -36, right: -36, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: 16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
                  {label}
                </div>
                <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  {s[key] ?? '—'}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 6 }}>{sub}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color="rgba(255,255,255,0.85)" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4 stage cards — same color, clean */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {STAGE_CARDS.map(({ key, label, sub, icon: Icon }) => {
          const val = s[key] ?? 0
          const pct = Math.round((val / total) * 100)
          return (
            <div key={key} style={{
              background: CARD_BG,
              borderRadius: 14, padding: '20px 20px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(19,37,120,0.22)',
            }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={17} color="rgba(255,255,255,0.85)" />
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 6 }}>
                  {val}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</div>
                {/* thin progress line */}
                <div style={{ marginTop: 14, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: 'rgba(255,255,255,0.45)', transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>{pct}% of total</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pipeline flow */}
      <div className="card" style={{ padding: 0, marginBottom: 22, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)' }}>Machine Pipeline</span>
          <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 'auto' }}>stage-by-stage flow</span>
        </div>
        <div style={{ display: 'flex' }}>
          {STAGE_CARDS.map(({ key, label, icon: Icon }, i) => {
            const val = s[key] ?? 0
            const pct = Math.round((val / total) * 100)
            return (
              <div key={key} style={{
                flex: 1, padding: '20px 14px', textAlign: 'center', position: 'relative',
                borderRight: i < STAGE_CARDS.length - 1 ? '1px solid var(--card-border)' : 'none',
              }}>
                {i < STAGE_CARDS.length - 1 && (
                  <div style={{
                    position: 'absolute', right: -11, top: '50%', transform: 'translateY(-50%)',
                    width: 22, height: 22, borderRadius: '50%', background: 'var(--bg)',
                    border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2, color: 'var(--t3)',
                  }}>
                    <ChevronRight size={11} />
                  </div>
                )}
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#4361EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Icon size={16} color="#fff" />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--t1)', lineHeight: 1, marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--t3)' }}>{label}</div>
                <div style={{ fontSize: 10.5, color: 'var(--accent)', fontWeight: 600, marginTop: 3 }}>{pct}%</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Area chart — full width */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <TrendingUp size={16} color="var(--accent)" style={{ marginRight: 9 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>7-Day Scan Activity</span>
          <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--t3)' }}>scanned vs dispatched</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={s.dailyData || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4361EE" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#4361EE" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7B8CDE" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#7B8CDE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--t3)', fontFamily: "'Poppins', sans-serif" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--t3)', fontFamily: "'Poppins', sans-serif" }} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12, fontFamily: "'Poppins', sans-serif" }} />
            <Area type="monotone" dataKey="scanned"    stroke="#4361EE" fill="url(#gS)" strokeWidth={2.5} name="Scanned"    dot={false} activeDot={{ r: 4, fill: '#4361EE' }} />
            <Area type="monotone" dataKey="dispatched" stroke="#7B8CDE" fill="url(#gD)" strokeWidth={2.5} name="Dispatched" dot={false} activeDot={{ r: 4, fill: '#7B8CDE' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart — BIG */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>Daily Processing by Stage</span>
          <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--t3)' }}>app load · key inject · dispatch</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={s.dailyData || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={16} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--t3)', fontFamily: "'Poppins', sans-serif" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--t3)', fontFamily: "'Poppins', sans-serif" }} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 16, fontFamily: "'Poppins', sans-serif" }} />
            <Bar dataKey="appLoaded"   fill={BAR_COLORS.appLoaded}   name="App Loaded"   radius={[4,4,0,0]} />
            <Bar dataKey="keyInjected" fill={BAR_COLORS.keyInjected} name="Key Injected" radius={[4,4,0,0]} />
            <Bar dataKey="dispatched"  fill={BAR_COLORS.dispatched}  name="Dispatched"   radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
