import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, X, User, Hash, Building2, Shield, Users, Lock, KeyRound } from 'lucide-react'

const API = 'http://localhost:8000/api'

const DOMAINS = [
  { value: 'scan_warehouse', label: 'Scan & Warehouse', badge: 'domain-sw' },
  { value: 'app_load',       label: 'App Load',          badge: 'domain-al' },
  { value: 'key_inject',     label: 'Key Inject',        badge: 'domain-ki' },
  { value: 'dispatch',       label: 'Dispatch',           badge: 'domain-di' },
]

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    axios.get(`${API}/users`).then(r => setUsers(r.data.users)).finally(() => setLoading(false))
  }, [])

  function toast(msg) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500) }

  async function deleteUser(uid) {
    await axios.delete(`${API}/users/${uid}`)
    setUsers(prev => prev.filter(u => u.id !== uid))
    setConfirmDel(null)
    toast('User deleted')
  }

  const admins = users.filter(u => u.role === 'admin')
  const teamMembers = users.filter(u => u.role !== 'admin')

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 6, height: 26, borderRadius: 99, background: 'linear-gradient(180deg,#4361EE,#7B2FF7)' }} />
            <h1 style={{ fontSize: 21, fontWeight: 700, color: 'var(--t1)' }}>User Management</h1>
          </div>
          <p style={{ color: 'var(--t2)', fontSize: 13.5, paddingLeft: 16 }}>Manage team members and domain access</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Team Member
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
        <MiniCard label="Total Users" value={users.length} icon={Users} color="var(--accent)" bg="var(--accent-bg)" />
        <MiniCard label="Admins" value={admins.length} icon={Shield} color="var(--purple)" bg="var(--purple-bg)" />
        {DOMAINS.map(d => (
          <MiniCard key={d.value} label={d.label}
            value={teamMembers.filter(u => u.domain === d.value).length}
            icon={User} color="var(--t2)" bg="var(--bg2)" />
        ))}
      </div>

      {/* Admins */}
      <Section title="Administrators" icon={Shield}>
        <UserTable users={admins} isAdmin onDelete={setConfirmDel} loading={loading} />
      </Section>

      <div style={{ marginTop: 24 }}>
        <Section title="Team Members" icon={User}>
          <UserTable users={teamMembers} onDelete={setConfirmDel} loading={loading} />
        </Section>
      </div>

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onAdd={u => { setUsers(prev => [...prev, u]); setShowModal(false); toast('User created successfully') }}
        />
      )}

      {confirmDel && (
        <div className="overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Remove User</h3>
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)} style={{ padding: '6px 8px' }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--t2)', fontSize: 13.5, marginBottom: 20 }}>
                Remove <strong>{confirmDel.name}</strong> ({confirmDel.employee_id}) from the system? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setConfirmDel(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => deleteUser(confirmDel.id)}>Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'var(--t1)', color: '#fff', padding: '10px 18px',
          borderRadius: 'var(--r)', fontSize: 13, fontWeight: 500, boxShadow: 'var(--s3)',
        }}>{toastMsg}</div>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon size={15} color="var(--t3)" />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
      </div>
      <div className="card">{children}</div>
    </div>
  )
}

function MiniCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}

function UserTable({ users, isAdmin, onDelete, loading }) {
  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <span className="spinner spinner-accent" style={{ display: 'inline-block' }} />
    </div>
  )
  if (!users.length) return (
    <div className="empty-state" style={{ padding: 40 }}>
      <User size={28} />
      <p>No users found</p>
    </div>
  )

  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Name</th>
            <th>Employee ID</th>
            <th>Username</th>
            <th>Department</th>
            {!isAdmin && <th>Domain</th>}
            <th>Joined</th>
            <th style={{ textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: isAdmin ? 'var(--purple-bg)' : 'var(--accent-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: isAdmin ? 'var(--purple)' : 'var(--accent)',
                    flexShrink: 0,
                  }}>{u.name?.charAt(0)}</div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                </div>
              </td>
              <td><span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--t2)' }}>{u.employee_id}</span></td>
              <td style={{ color: 'var(--t2)', fontSize: 13 }}>{u.username}</td>
              <td style={{ color: 'var(--t2)', fontSize: 13 }}>{u.department}</td>
              {!isAdmin && (
                <td>
                  {u.domain
                    ? <span className={`badge ${DOMAINS.find(d => d.value === u.domain)?.badge || 'badge-gray'}`}>
                        {DOMAINS.find(d => d.value === u.domain)?.label || u.domain}
                      </span>
                    : <span className="badge badge-gray">—</span>
                  }
                </td>
              )}
              <td style={{ fontSize: 12, color: 'var(--t3)' }}>{u.created_at}</td>
              <td style={{ textAlign: 'center' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => onDelete(u)} style={{ color: 'var(--red)' }}>
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AddUserModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '',
    employee_id: '',
    department: '',
    domain: 'scan_warehouse',
    username: '',
    password: '1234',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.username.trim()) { setErr('Username is required'); return }
    setLoading(true); setErr('')
    try {
      const { data } = await axios.post(`${API}/users`, {
        name: form.name,
        employee_id: form.employee_id,
        department: form.department,
        domain: form.domain,
        username: form.username,
        password: form.password,
      })
      onAdd(data.user)
    } catch (ex) {
      setErr(ex?.response?.data?.detail || 'Failed to create user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Add Team Member</h3>
              <p style={{ fontSize: 12, color: 'var(--t3)' }}>Fill in all fields to create the account</p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 8px' }}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {err && (
            <div style={{
              padding: '10px 14px', background: 'var(--red-bg)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 'var(--r)', color: 'var(--red)', fontSize: 13, marginBottom: 16, fontWeight: 500,
            }}>{err}</div>
          )}

          <form onSubmit={submit}>
            {/* Row 1: Name + Employee ID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label className="field-label">Full Name</label>
                <div className="input-icon-wrap">
                  <User size={14} className="input-icon" />
                  <input className="input" placeholder="e.g. Rahul Sharma" required
                    value={form.name} onChange={e => setF('name', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="field-label">Employee ID</label>
                <div className="input-icon-wrap">
                  <Hash size={14} className="input-icon" />
                  <input className="input" placeholder="e.g. EMP005" required
                    value={form.employee_id} onChange={e => setF('employee_id', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Row 2: Department + Domain */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label className="field-label">Department</label>
                <div className="input-icon-wrap">
                  <Building2 size={14} className="input-icon" />
                  <input className="input" placeholder="e.g. Warehouse, Tech" required
                    value={form.department} onChange={e => setF('department', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="field-label">Domain Access</label>
                <select className="input" value={form.domain} onChange={e => setF('domain', e.target.value)}>
                  {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3: Username + Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div>
                <label className="field-label">Username</label>
                <div className="input-icon-wrap">
                  <KeyRound size={14} className="input-icon" />
                  <input className="input" placeholder="e.g. rahul.sharma" required
                    value={form.username} onChange={e => setF('username', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="field-label">Password</label>
                <div className="input-icon-wrap">
                  <Lock size={14} className="input-icon" />
                  <input className="input" type="password" placeholder="Default: 1234"
                    value={form.password} onChange={e => setF('password', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Access preview */}
            <div style={{
              padding: '12px 14px', background: 'var(--bg2)',
              borderRadius: 'var(--r)', border: '1px solid var(--card-border)', marginBottom: 20,
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Page Access
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {['Dashboard', 'Domain Work Page', 'Reports'].map(p => (
                  <span key={p} className="badge badge-green">{p}</span>
                ))}
                <span className="badge badge-gray" style={{ textDecoration: 'line-through', opacity: 0.5 }}>User Management</span>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--t3)', margin: 0 }}>
                Domain locked to: <strong style={{ color: 'var(--t2)' }}>{DOMAINS.find(d => d.value === form.domain)?.label}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Creating…</>
                  : 'Create Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
