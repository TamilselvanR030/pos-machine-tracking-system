import { useState, useEffect } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  BarChart2, FileText, FileSpreadsheet, Download,
  X, Search, Package, Cpu, Key, Truck, CheckCircle2, Circle,
} from 'lucide-react'

const API = 'http://localhost:8000/api'

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STAGES = [
  { key: 'inWh',       label: 'In Warehouse', icon: Package, color: '#4361EE', bg: '#EEF0FF' },
  { key: 'appLoad',    label: 'App Loaded',   icon: Cpu,     color: '#4361EE', bg: '#EEF0FF' },
  { key: 'keyInj',     label: 'Key Injected', icon: Key,     color: '#4361EE', bg: '#EEF0FF' },
  { key: 'dispatched', label: 'Dispatched',   icon: Truck,   color: '#4361EE', bg: '#EEF0FF' },
]

export default function Reports() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    axios.get(`${API}/machines`).then(r => setMachines(r.data.machines)).finally(() => setLoading(false))
  }, [])

  const filtered = machines.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.serial_number.toLowerCase().includes(q) ||
      m.terminal_id.toLowerCase().includes(q) || m.merchant.toLowerCase().includes(q)
    const matchStatus =
      statusFilter === 'all' ? true
      : statusFilter === 'dispatched'   ? m.dispatch_status
      : statusFilter === 'key_injected' ? m.key_injection_status && !m.dispatch_status
      : statusFilter === 'app_loaded'   ? m.app_load_status && !m.key_injection_status
      : !m.app_load_status
    const matchFrom = !dateFrom || m.scanned_at >= dateFrom
    const matchTo   = !dateTo   || m.scanned_at <= dateTo + 'T23:59:59'
    return matchSearch && matchStatus && matchFrom && matchTo
  })

  function getStatus(m) {
    if (m.dispatch_status)        return 'Dispatched'
    if (m.key_injection_status)   return 'Key Injected'
    if (m.app_load_status)        return 'App Loaded'
    return 'In Warehouse'
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `pos_report_${new Date().toISOString().slice(0,10)}.json`; a.click()
  }

  function exportExcel() {
    const rows = filtered.map(m => ({
      'Serial No': m.serial_number, 'Model': m.model, 'Terminal ID': m.terminal_id,
      'Merchant': m.merchant, 'Location': m.location, 'Status': getStatus(m),
      'Warehouse At': fmt(m.warehouse_at), 'App Load At': fmt(m.app_load_at),
      'Key Inject At': fmt(m.key_injection_at), 'Dispatch At': fmt(m.dispatch_at),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'POS Machines')
    XLSX.writeFile(wb, `pos_report_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  function exportPDF(withStats = false) {
    const doc = new jsPDF()
    const now = new Date().toLocaleString('en-IN')
    doc.setFontSize(18); doc.setTextColor(15,23,42); doc.text('POS Machine Report', 14, 20)
    doc.setFontSize(10); doc.setTextColor(100,116,139)
    doc.text(`Generated: ${now}`, 14, 28); doc.text(`Records: ${filtered.length}`, 14, 34)
    if (withStats) {
      doc.setFontSize(12); doc.setTextColor(15,23,42); doc.text('Summary', 14, 46)
      autoTable(doc, {
        startY: 50,
        head: [['Stage','Count','%']],
        body: [
          ['In Warehouse', summary.inWh,       pct(summary.inWh)],
          ['App Loaded',   summary.appLoad,     pct(summary.appLoad)],
          ['Key Injected', summary.keyInj,      pct(summary.keyInj)],
          ['Dispatched',   summary.dispatched,  pct(summary.dispatched)],
        ],
        styles: { fontSize: 10 }, headStyles: { fillColor: [67,97,238] },
      })
    }
    autoTable(doc, {
      startY: withStats ? doc.lastAutoTable.finalY + 10 : 42,
      head: [['Serial No','Model','Terminal ID','Merchant','Location','Status','Scanned At']],
      body: filtered.map(m => [m.serial_number, m.model, m.terminal_id, m.merchant, m.location, getStatus(m), fmt(m.scanned_at)]),
      styles: { fontSize: 8 }, headStyles: { fillColor: [67,97,238] },
      alternateRowStyles: { fillColor: [248,250,252] },
    })
    doc.save(`pos_${withStats ? 'stats_' : ''}report_${new Date().toISOString().slice(0,10)}.pdf`)
  }

  const total = filtered.length || 1
  const summary = {
    total: filtered.length,
    inWh:       filtered.filter(m => !m.app_load_status).length,
    appLoad:    filtered.filter(m => m.app_load_status && !m.key_injection_status).length,
    keyInj:     filtered.filter(m => m.key_injection_status && !m.dispatch_status).length,
    dispatched: filtered.filter(m => m.dispatch_status).length,
  }
  const pct = v => `${Math.round((v / total) * 100)}%`

  return (
    <div style={{ padding: 32, fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>Reports</h1>
        <p style={{ color: 'var(--t2)', fontSize: 13.5 }}>Export and analyse POS machine data</p>
      </div>

      {/* ── DOWNLOAD BAR at the very top ── */}
      <div className="card" style={{ padding: '12px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--t2)', marginRight: 4 }}>Export:</span>
          <button className="btn btn-outline btn-sm" onClick={exportJSON}>
            <FileText size={14} /> JSON
          </button>
          <button className="btn btn-outline btn-sm" onClick={exportExcel}>
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => exportPDF(false)}>
            <Download size={14} /> PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => exportPDF(true)}>
            <BarChart2 size={14} /> Stats PDF
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-wrap" style={{ width: 200 }}>
              <Search size={14} className="search-icon" />
              <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
              <option value="all">All Stages</option>
              <option value="in_warehouse">In Warehouse</option>
              <option value="app_loaded">App Loaded</option>
              <option value="key_injected">Key Injected</option>
              <option value="dispatched">Dispatched</option>
            </select>
            <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 136 }} />
            <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 136 }} />
            {(search || statusFilter !== 'all' || dateFrom || dateTo) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo('') }}>
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {STAGES.map(({ key, label, icon: Icon }) => {
          const val = summary[key]
          const p = Math.round((val / total) * 100)
          return (
            <div key={key} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color="var(--accent)" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-bg)', padding: '2px 8px', borderRadius: 99 }}>
                  {p}%
                </span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--t1)', lineHeight: 1, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12.5, color: 'var(--t2)', fontWeight: 500 }}>{label}</div>
              <div style={{ marginTop: 10, height: 4, borderRadius: 99, background: 'var(--bg2)' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${p}%`, background: 'var(--accent)', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── TIMELINE ── */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 24 }}>
          Machine Stage Timeline
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--t3)', marginLeft: 10 }}>
            — lifecycle progression for {filtered.length} machine{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { key: 'inWh',       label: 'In Warehouse', icon: Package, count: summary.inWh,       desc: 'Scanned and physically received into warehouse' },
            { key: 'appLoad',    label: 'App Loaded',   icon: Cpu,     count: summary.appLoad,     desc: 'Required software and firmware loaded onto device' },
            { key: 'keyInj',     label: 'Key Injected', icon: Key,     count: summary.keyInj,      desc: 'Cryptographic keys programmed into device HSM' },
            { key: 'dispatched', label: 'Dispatched',   icon: Truck,   count: summary.dispatched,  desc: 'Device shipped and delivered to merchant location' },
          ].map(({ key, label, icon: Icon, count, desc }, i, arr) => {
            const p = Math.round((count / total) * 100)
            const isDone = count > 0
            const isLast = i === arr.length - 1

            return (
              <div key={key} style={{ display: 'flex', gap: 0 }}>
                {/* Left: line + dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: isDone ? '#4361EE' : 'var(--bg2)',
                    border: isDone ? '3px solid #4361EE' : '2px solid var(--card-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isDone ? '0 4px 16px rgba(67,97,238,0.35)' : 'none',
                    transition: 'all 0.2s',
                    zIndex: 1,
                  }}>
                    <Icon size={16} color={isDone ? '#fff' : 'var(--t3)'} />
                  </div>
                  {!isLast && (
                    <div style={{ width: 2, flex: 1, minHeight: 40, background: isDone ? 'linear-gradient(#4361EE, rgba(67,97,238,0.2))' : 'var(--card-border)', margin: '4px 0' }} />
                  )}
                </div>

                {/* Right: content */}
                <div style={{ flex: 1, paddingLeft: 16, paddingBottom: isLast ? 0 : 28, paddingTop: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{label}</span>
                      {isDone
                        ? <CheckCircle2 size={14} color="#4361EE" />
                        : <Circle size={14} color="var(--t3)" />
                      }
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--t3)' }}>{p}% of total</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: isDone ? 'var(--t1)' : 'var(--t3)', minWidth: 36, textAlign: 'right' }}>
                        {count}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--t3)', marginBottom: 10, lineHeight: 1.5 }}>{desc}</p>
                  <div style={{ height: 6, borderRadius: 99, background: 'var(--bg2)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${p}%`,
                      background: isDone ? '#4361EE' : 'var(--card-border)',
                      transition: 'width 1s cubic-bezier(0.34,1.2,0.64,1)',
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Total at bottom */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)' }}>Total Records</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{summary.total}</span>
        </div>
      </div>

    </div>
  )
}
