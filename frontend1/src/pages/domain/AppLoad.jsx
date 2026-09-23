import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import MachineModal from '../../components/MachineModal'
import { Cpu, CheckCircle2, Circle, Hash } from 'lucide-react'

const API = 'http://localhost:8000/api'

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AppLoad() {
  const { user } = useAuth()
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [bulkInput, setBulkInput] = useState('')
  const [bulkResult, setBulkResult] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    axios.get(`${API}/machines`).then(r => {
      // Only machines that passed warehouse
      setMachines(r.data.machines.filter(m => m.warehouse_status))
    }).finally(() => setLoading(false))
  }, [])

  function toast(msg) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500) }

  async function toggleAppLoad(m) {
    if (!m.warehouse_status) return
    const newVal = !m.app_load_status
    const { data } = await axios.put(`${API}/machines/${m.id}`, { field: 'app_load_status', value: newVal })
    setMachines(prev => prev.map(x => x.id === m.id ? data.machine : x))
    toast(newVal ? `${m.serial_number} — App Load marked` : `${m.serial_number} — App Load unmarked`)
  }

  async function bulkMark() {
    const serials = bulkInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
    if (!serials.length) return
    let ok = [], notFound = [], already = []
    for (const sn of serials) {
      const m = machines.find(x => x.serial_number === sn || x.terminal_id === sn)
      if (!m) { notFound.push(sn); continue }
      if (m.app_load_status) { already.push(sn); continue }
      const { data } = await axios.put(`${API}/machines/${m.id}`, { field: 'app_load_status', value: true })
      setMachines(prev => prev.map(x => x.id === m.id ? data.machine : x))
      ok.push(sn)
    }
    setBulkResult({ ok, notFound, already })
    setBulkInput('')
  }

  const pending = machines.filter(m => !m.app_load_status)
  const done = machines.filter(m => m.app_load_status)

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>App Load</h1>
        <p style={{ color: 'var(--t2)', fontSize: 13.5 }}>Welcome, {user?.name} — mark machines after app installation</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Ready for App Load', val: machines.length, color: 'var(--accent)' },
          { label: 'App Loaded', val: done.length, color: 'var(--green)' },
          { label: 'Pending', val: pending.length, color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>{s.val}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: 12.5, color: 'var(--t2)', fontWeight: 500 }}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk mark section */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>Bulk Mark by Serial Number</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <textarea
            className="input" rows={3} value={bulkInput} onChange={e => setBulkInput(e.target.value)}
            placeholder="Paste serial numbers, one per line or comma-separated…"
            style={{ flex: 1, resize: 'vertical', fontFamily: 'monospace', fontSize: 12.5 }}
          />
          <button className="btn btn-primary" onClick={bulkMark} disabled={!bulkInput.trim()}>
            <Cpu size={14} /> Mark All
          </button>
        </div>
        {bulkResult && (
          <div style={{ marginTop: 12, padding: 12, background: 'var(--bg2)', borderRadius: 'var(--r)', fontSize: 12 }}>
            {bulkResult.ok.length > 0 && <div style={{ color: 'var(--green)', marginBottom: 4 }}>✓ Marked: {bulkResult.ok.join(', ')}</div>}
            {bulkResult.already.length > 0 && <div style={{ color: 'var(--amber)', marginBottom: 4 }}>Already done: {bulkResult.already.join(', ')}</div>}
            {bulkResult.notFound.length > 0 && <div style={{ color: 'var(--red)' }}>Not found: {bulkResult.notFound.join(', ')}</div>}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={15} color="var(--t2)" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Machines — App Load Queue</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--t3)' }}>{pending.length} pending</span>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Model</th>
                <th>Merchant</th>
                <th>Location</th>
                <th>Warehouse At</th>
                <th style={{ textAlign: 'center' }}>App Load</th>
                <th>Loaded At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                  <span className="spinner spinner-accent" style={{ display: 'inline-block' }} />
                </td></tr>
              ) : machines.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state" style={{ padding: 32 }}><Cpu size={32} /><p>No machines in queue</p><span>Machines appear here after warehouse scan</span></div></td></tr>
              ) : machines.map(m => (
                <tr key={m.id}>
                  <td>
                    <button onClick={() => setSelected(m)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Poppins,sans-serif', fontSize: 13 }}>
                      {m.serial_number}
                    </button>
                  </td>
                  <td style={{ fontSize: 12.5, color: 'var(--t2)' }}>{m.model}</td>
                  <td>{m.merchant}</td>
                  <td><span className="badge badge-gray">{m.location}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--t3)' }}>{fmt(m.warehouse_at)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => toggleAppLoad(m)}
                      className={`status-check ${m.app_load_status ? 'done' : 'active'}`}>
                      {m.app_load_status ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                    </button>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--t3)' }}>{fmt(m.app_load_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <MachineModal machine={selected} onClose={() => setSelected(null)} />}
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
