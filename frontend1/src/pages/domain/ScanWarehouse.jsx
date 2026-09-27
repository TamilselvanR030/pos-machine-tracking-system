import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import QRScanner from '../../components/QRScanner'
import MachineModal from '../../components/MachineModal'
import { ScanLine, Package, CheckCircle2, Circle, X, Plus } from 'lucide-react'

const API = 'https://pos-machine-tracking-system-0.onrender.com/api'

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ScanWarehouse() {
  const { user } = useAuth()
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const [scannedSerial, setScannedSerial] = useState('')

  useEffect(() => {
    axios.get(`${API}/machines`).then(r => setMachines(r.data.machines)).finally(() => setLoading(false))
  }, [])

  function toast(msg) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500) }

  async function markWarehouse(m) {
    if (m.warehouse_status) return
    const { data } = await axios.put(`${API}/machines/${m.id}`, { field: 'warehouse_status', value: true })
    setMachines(prev => prev.map(x => x.id === m.id ? data.machine : x))
    toast(`${m.serial_number} marked as received in warehouse`)
  }

  function handleQRScan(text) {
    setShowScanner(false)
    setScannedSerial(text)
    // Check if machine exists
    const found = machines.find(m => m.serial_number === text || m.terminal_id === text)
    if (found) {
      setSelected(found)
    } else {
      setShowAdd(true)
    }
    toast(`Scanned: ${text}`)
  }

  const stats = {
    total: machines.length,
    received: machines.filter(m => m.warehouse_status).length,
    pending: machines.filter(m => !m.warehouse_status).length,
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Scan & Warehouse</h1>
          <p style={{ color: 'var(--t2)', fontSize: 13.5 }}>Welcome, {user?.name} — scan POS machines on arrival</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setShowScanner(true)}>
            <ScanLine size={15} /> Scan QR
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Manual Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Machines', val: stats.total, color: 'var(--accent)', bg: 'var(--accent-bg)' },
          { label: 'Received in Warehouse', val: stats.received, color: 'var(--green)', bg: 'var(--green-bg)' },
          { label: 'Pending Scan', val: stats.pending, color: 'var(--amber)', bg: 'var(--amber-bg)' },
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

      {/* Machine list */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={15} color="var(--t2)" />
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>All Machines</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--t3)' }}>{machines.length} total</span>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Model</th>
                <th>Merchant</th>
                <th>Location</th>
                <th style={{ textAlign: 'center' }}>Warehouse Status</th>
                <th>Received At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                  <span className="spinner spinner-accent" style={{ display: 'inline-block' }} />
                </td></tr>
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
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => markWarehouse(m)}
                      className={`status-check ${m.warehouse_status ? 'done' : 'active'}`}
                    >
                      {m.warehouse_status ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                    </button>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--t3)' }}>{fmt(m.warehouse_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />}
      {selected && <MachineModal machine={selected} onClose={() => setSelected(null)} />}
      {showAdd && (
        <QuickAddModal
          prefillSerial={scannedSerial}
          onClose={() => { setShowAdd(false); setScannedSerial('') }}
          onAdd={m => {
            setMachines(prev => [m, ...prev])
            setShowAdd(false)
            setScannedSerial('')
            toast(`Machine ${m.serial_number} added & received`)
          }}
        />
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

function QuickAddModal({ prefillSerial, onClose, onAdd }) {
  const [form, setForm] = useState({ serial_number: prefillSerial || '', model: '', terminal_id: '', merchant: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault(); setLoading(true); setErr('')
    try {
      const { data } = await axios.post(`${API}/machines`, form)
      onAdd(data.machine)
    } catch (ex) { setErr(ex?.response?.data?.detail || 'Error') } finally { setLoading(false) }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Register Machine</h3>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 8px' }}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {err && <div style={{ padding: '10px 14px', background: 'var(--red-bg)', borderRadius: 'var(--r)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{err}</div>}
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[['serial_number','Serial Number','HIT12345678'],['model','Model','Hitachi TP-V7000'],['terminal_id','Terminal ID','TID12345'],['merchant','Merchant','RetailMart'],['location','Location','Delhi']].map(([k,lbl,ph]) => (
                <div key={k} style={k==='serial_number'?{gridColumn:'1/-1'}:{}}>
                  <label className="field-label">{lbl}</label>
                  <input className="input" placeholder={ph} required value={form[k]}
                    onChange={e => setForm(f => ({...f,[k]:e.target.value}))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding…' : 'Register & Mark Received'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
