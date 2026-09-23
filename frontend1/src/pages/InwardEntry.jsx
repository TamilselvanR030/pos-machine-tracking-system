import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import MachineModal from '../components/MachineModal'
import QRScanner from '../components/QRScanner'
import {
  Search, Plus, Trash2, ScanLine, CheckCircle2, Circle,
  Package, Cpu, Key, Truck, Filter, X
} from 'lucide-react'

const API = 'http://localhost:8000/api'

const COLS = [
  { key: 'warehouse_status',     at: 'warehouse_at',       label: 'Warehouse',  icon: Package, domain: 'scan_warehouse', badge: 'badge-amber'  },
  { key: 'app_load_status',      at: 'app_load_at',        label: 'App Load',   icon: Cpu,     domain: 'app_load',       badge: 'badge-blue'   },
  { key: 'key_injection_status', at: 'key_injection_at',   label: 'Key Inject', icon: Key,     domain: 'key_inject',     badge: 'badge-purple' },
  { key: 'dispatch_status',      at: 'dispatch_at',        label: 'Dispatch',   icon: Truck,   domain: 'dispatch',       badge: 'badge-green'  },
]

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function InwardEntry() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  const load = useCallback(() => {
    axios.get(`${API}/machines`).then(r => setMachines(r.data.machines)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  function toast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  async function toggleStatus(machine, field) {
    const col = COLS.find(c => c.key === field)
    if (!col) return
    // Admin can toggle anything; users can only toggle their domain column
    if (!isAdmin && col.domain !== user?.domain) return
    // Sequential: to check a step, previous must be done
    const colIdx = COLS.findIndex(c => c.key === field)
    if (colIdx > 0 && !machine[COLS[colIdx - 1].key]) return // previous not done

    const newVal = !machine[field]
    const { data } = await axios.put(`${API}/machines/${machine.id}`, { field, value: newVal })
    setMachines(prev => prev.map(m => m.id === machine.id ? data.machine : m))
    toast(newVal ? `Marked as ${col.label}` : `Unmarked ${col.label}`)
  }

  async function deleteMachine(id) {
    await axios.delete(`${API}/machines/${id}`)
    setMachines(prev => prev.filter(m => m.id !== id))
    setConfirmDelete(null)
    toast('Machine deleted')
  }

  function handleQRScan(text) {
    setShowScanner(false)
    setSearch(text)
    toast(`QR scanned: ${text}`)
  }

  // Filter
  const filtered = machines.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.serial_number.toLowerCase().includes(q) ||
      m.terminal_id.toLowerCase().includes(q) || m.merchant.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q)
    const matchDate = !dateFilter || m.scanned_at?.startsWith(dateFilter)
    return matchSearch && matchDate
  })

  // For non-admin: only show their relevant column
  const visibleCols = isAdmin ? COLS : COLS.filter(c => c.domain === user?.domain)

  const canCheckCol = (col) => isAdmin || col.domain === user?.domain

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Inward Entry</h1>
          <p style={{ color: 'var(--t2)', fontSize: 13.5 }}>
            {isAdmin ? 'Full tracking view — manage all POS machines' : `Showing your domain: ${COLS.find(c=>c.domain===user?.domain)?.label}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setShowScanner(true)}>
            <ScanLine size={15} /> Scan QR
          </button>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={15} /> Add Machine
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input className="input" placeholder="Search serial, terminal ID, merchant…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="var(--t3)" />
          <input className="input" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            style={{ width: 150 }} />
        </div>
        {(search || dateFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setDateFilter('') }}>
            <X size={13} /> Clear
          </button>
        )}
        <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 'auto' }}>{filtered.length} machines</span>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Model</th>
                <th>Terminal ID</th>
                <th>Merchant</th>
                <th>Location</th>
                {visibleCols.map(c => (
                  <th key={c.key} style={{ textAlign: 'center' }}>{c.label}</th>
                ))}
                {isAdmin && <th style={{ textAlign: 'center' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={20} style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>
                  <span className="spinner spinner-accent" style={{ display: 'inline-block' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={20}>
                  <div className="empty-state">
                    <Package size={40} />
                    <p>No machines found</p>
                    <span>Try adjusting your search or filters</span>
                  </div>
                </td></tr>
              ) : filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <button onClick={() => setSelected(m)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Poppins, sans-serif', fontSize: 13, padding: 0 }}>
                      {m.serial_number}
                    </button>
                  </td>
                  <td style={{ color: 'var(--t2)', fontSize: 12.5 }}>{m.model}</td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--t2)' }}>{m.terminal_id}</span></td>
                  <td>{m.merchant}</td>
                  <td><span className="badge badge-gray">{m.location}</span></td>
                  {visibleCols.map((col, ci) => {
                    const done = m[col.key]
                    const prevDone = ci === 0 ? true : m[visibleCols[ci - 1]?.key]
                    // For admin show all cols; for user only their col
                    const myCol = isAdmin
                      ? COLS.findIndex(c => c.key === col.key)
                      : 0
                    const globalPrev = isAdmin ? (myCol === 0 ? true : m[COLS[myCol - 1]?.key]) : m[COLS[COLS.findIndex(c=>c.domain===user?.domain) - 1]?.key] !== false
                    const locked = !isAdmin && col.domain !== user?.domain
                    const prevBlocked = !isAdmin && !m[COLS[COLS.findIndex(c=>c.domain===user?.domain) - 1]?.key] && COLS.findIndex(c=>c.domain===user?.domain) > 0

                    const canToggle = !locked && (isAdmin
                      ? (myCol === 0 || m[COLS[myCol-1]?.key])
                      : !prevBlocked)

                    return (
                      <td key={col.key} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => canToggle && toggleStatus(m, col.key)}
                            className={`status-check ${done ? 'done' : canToggle ? 'active' : 'locked'}`}
                            title={done ? fmt(m[col.at]) : canToggle ? 'Click to mark done' : 'Locked'}
                          >
                            {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                          </button>
                          {done && <div style={{ fontSize: 10, color: 'var(--t3)' }}>{fmt(m[col.at]).split(',')[0]}</div>}
                        </div>
                      </td>
                    )
                  })}
                  {isAdmin && (
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(m)}
                        style={{ color: 'var(--red)', padding: '4px 8px' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selected && <MachineModal machine={selected} onClose={() => setSelected(null)} />}
      {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />}
      {showAddModal && <AddMachineModal onClose={() => setShowAddModal(false)} onAdd={m => { setMachines(prev => [m, ...prev]); setShowAddModal(false); toast('Machine added') }} />}
      {confirmDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Delete Machine</h3>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)} style={{ padding: '6px 8px' }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 20 }}>
                Are you sure you want to delete <strong>{confirmDelete.serial_number}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => deleteMachine(confirmDelete.id)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'var(--t1)', color: '#fff', padding: '10px 18px',
          borderRadius: 'var(--r)', fontSize: 13, fontWeight: 500,
          boxShadow: 'var(--s3)', animation: 'fadeIn 0.2s ease',
        }}>{toastMsg}</div>
      )}
    </div>
  )
}

function AddMachineModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ serial_number: '', model: '', terminal_id: '', merchant: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const { data } = await axios.post(`${API}/machines`, form)
      onAdd(data.machine)
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Failed to add machine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add POS Machine</h3>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 8px' }}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {err && <div style={{ padding: '10px 14px', background: 'var(--red-bg)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--r)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{err}</div>}
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                ['serial_number', 'Serial Number', 'HIT12345678'],
                ['model', 'Model', 'Hitachi TP-V7000'],
                ['terminal_id', 'Terminal ID', 'TID12345'],
                ['merchant', 'Merchant', 'RetailMart'],
                ['location', 'Location', 'Delhi'],
              ].map(([k, label, ph]) => (
                <div key={k} style={k === 'serial_number' ? { gridColumn: '1/-1' } : {}}>
                  <label className="field-label">{label}</label>
                  <input className="input" placeholder={ph} value={form[k]} required
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Adding…</> : 'Add Machine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
