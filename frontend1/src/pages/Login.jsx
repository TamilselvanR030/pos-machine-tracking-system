import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, User, Lock, Hash, Building2, ChevronDown, CheckCircle2 } from 'lucide-react'

const DOMAINS = [
  { value: 'scan_warehouse', label: 'Scan & Warehouse' },
  { value: 'app_load',       label: 'App Load' },
  { value: 'key_inject',     label: 'Key Inject' },
  { value: 'dispatch',       label: 'Dispatch' },
]

const FEATURES = [
  'Inward scanning & warehouse tracking',
  'App load & key injection workflow',
  'Real-time dispatch management',
  'Reports with PDF & Excel export',
]

export default function Login() {
  const { loginAdmin, signupAdmin, loginUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('admin')
  const [adminMode, setAdminMode] = useState('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [aUser, setAUser] = useState('')
  const [aPass, setAPass] = useState('')
  const [sName, setSName] = useState('')
  const [sEmpId, setSEmpId] = useState('')
  const [sDept, setSDept] = useState('')
  const [sSUser, setSSUser] = useState('')
  const [sSPass, setSSPass] = useState('')
  const [uEmpId, setUEmpId] = useState('')
  const [uDomain, setUDomain] = useState('')
  const [uPass, setUPass] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'admin') {
        if (adminMode === 'login') await loginAdmin(aUser, aPass)
        else await signupAdmin({ name: sName, employee_id: sEmpId, username: sSUser, department: sDept, password: sSPass })
      } else {
        if (!uDomain) { setError('Please select your domain'); setLoading(false); return }
        await loginUser(uEmpId, uDomain, uPass)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Poppins', sans-serif",
    }}>
      {/* Outer card */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: 860,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(67,97,238,0.18), 0 4px 24px rgba(0,0,0,0.1)',
      }}>

        {/* LEFT — blue brand panel */}
        <div style={{
          flex: '0 0 340px',
          background: 'linear-gradient(150deg, #3351DE 0%, #4361EE 45%, #5B77F5 100%)',
          padding: '44px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle orb decoration */}
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 260, height: 260, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: -40,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />

          {/* Logo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 40 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={20} color="#fff" fill="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>POS Track</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: '0.05em' }}>HITACHI PAYMENTS</div>
              </div>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.35, marginBottom: 12 }}>
              Track every terminal,<br />every step of the way.
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 28 }}>
              End-to-end POS machine lifecycle management for your team.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <CheckCircle2 size={15} color="rgba(255,255,255,0.7)" style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 40 }}>
            Demo · username: admin · password: 1234
          </div>
        </div>

        {/* RIGHT — white form panel */}
        <div style={{
          flex: 1,
          background: 'var(--card)',
          padding: '44px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
              {tab === 'admin'
                ? adminMode === 'login' ? 'Sign in' : 'Create admin account'
                : 'Team member sign in'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--t2)' }}>
              {tab === 'admin' ? 'Access the management dashboard' : 'Sign in with your employee credentials'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: 'var(--bg2)', borderRadius: 10,
            padding: 3, marginBottom: 24, border: '1px solid var(--card-border)',
          }}>
            {[{ v: 'admin', l: 'Admin' }, { v: 'user', l: 'Team Member' }].map(t => (
              <button key={t.v} onClick={() => { setTab(t.v); setError('') }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 7, border: 'none',
                  cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                  fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                  background: tab === t.v ? '#4361EE' : 'transparent',
                  color: tab === t.v ? '#fff' : 'var(--t2)',
                  boxShadow: tab === t.v ? '0 4px 14px rgba(67,97,238,0.35)' : 'none',
                }}>{t.l}</button>
            ))}
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', background: 'var(--red-bg)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 8, fontSize: 13, color: 'var(--red)',
              marginBottom: 16, fontWeight: 500,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {tab === 'admin' && adminMode === 'login' && (
              <>
                <F label="Username" icon={User}>
                  <input className="input" value={aUser} onChange={e => setAUser(e.target.value)}
                    placeholder="Enter username" required style={{ paddingLeft: 38 }} />
                </F>
                <F label="Password" icon={Lock} extra={
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }>
                  <input className="input" type={showPw ? 'text' : 'password'} value={aPass}
                    onChange={e => setAPass(e.target.value)} placeholder="Enter password"
                    required style={{ paddingLeft: 38, paddingRight: 38 }} />
                </F>
              </>
            )}

            {tab === 'admin' && adminMode === 'signup' && (
              <>
                <F label="Full Name" icon={User}>
                  <input className="input" value={sName} onChange={e => setSName(e.target.value)}
                    placeholder="Your full name" required style={{ paddingLeft: 38 }} />
                </F>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <F label="Employee ID" icon={Hash}>
                    <input className="input" value={sEmpId} onChange={e => setSEmpId(e.target.value)}
                      placeholder="EMP001" required style={{ paddingLeft: 38 }} />
                  </F>
                  <F label="Department" icon={Building2}>
                    <input className="input" value={sDept} onChange={e => setSDept(e.target.value)}
                      placeholder="IT, Admin…" required style={{ paddingLeft: 38 }} />
                  </F>
                </div>
                <F label="Username" icon={User}>
                  <input className="input" value={sSUser} onChange={e => setSSUser(e.target.value)}
                    placeholder="Choose a username" required style={{ paddingLeft: 38 }} />
                </F>
                <F label="Password" icon={Lock}>
                  <input className="input" type="password" value={sSPass}
                    onChange={e => setSSPass(e.target.value)} placeholder="Set a password"
                    required style={{ paddingLeft: 38 }} />
                </F>
              </>
            )}

            {tab === 'user' && (
              <>
                <F label="Employee ID" icon={Hash}>
                  <input className="input" value={uEmpId} onChange={e => setUEmpId(e.target.value)}
                    placeholder="e.g. EMP001" required style={{ paddingLeft: 38 }} />
                </F>
                <div style={{ marginBottom: 16 }}>
                  <label className="field-label">Domain</label>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                    <select className="input" value={uDomain} onChange={e => setUDomain(e.target.value)} required>
                      <option value="">Select your domain</option>
                      {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                </div>
                <F label="Password" icon={Lock}>
                  <input className="input" type="password" value={uPass}
                    onChange={e => setUPass(e.target.value)} placeholder="Enter password"
                    required style={{ paddingLeft: 38 }} />
                </F>
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 0', marginTop: 4, fontSize: 14 }}>
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Verifying…</>
                : tab === 'admin'
                  ? adminMode === 'login' ? 'Sign in' : 'Create Account'
                  : 'Sign in'}
            </button>
          </form>

          {tab === 'admin' && (
            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--t2)' }}>
              {adminMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setAdminMode(adminMode === 'login' ? 'signup' : 'login'); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4361EE', fontWeight: 600, fontSize: 13, fontFamily: "'Poppins', sans-serif" }}>
                {adminMode === 'login' ? 'Create admin account' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function F({ label, icon: Icon, children, extra }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="field-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={15} className="input-icon" />
        {children}
        {extra}
      </div>
    </div>
  )
}
