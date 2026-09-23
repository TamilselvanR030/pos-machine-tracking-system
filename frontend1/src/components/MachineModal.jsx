import { X, CheckCircle2, Clock, Package, Cpu, Key, Truck, Monitor, MapPin, User, Hash } from 'lucide-react'

function fmt(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STEPS = [
  { key: 'warehouse_status',      at: 'warehouse_at',       label: 'Scan & Warehouse', icon: Package  },
  { key: 'app_load_status',       at: 'app_load_at',        label: 'App Load',          icon: Cpu      },
  { key: 'key_injection_status',  at: 'key_injection_at',   label: 'Key Injection',     icon: Key      },
  { key: 'dispatch_status',       at: 'dispatch_at',        label: 'Dispatched',        icon: Truck    },
]

export default function MachineModal({ machine, onClose }) {
  if (!machine) return null

  const level = STEPS.filter(s => machine[s.key]).length

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Monitor size={18} color="var(--accent)" />
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--t1)' }}>{machine.serial_number}</h2>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-accent">{machine.model}</span>
              {machine.dispatch_status
                ? <span className="badge badge-green">Dispatched</span>
                : machine.key_injection_status
                ? <span className="badge badge-purple">Key Injected</span>
                : machine.app_load_status
                ? <span className="badge badge-blue">App Loaded</span>
                : <span className="badge badge-amber">In Warehouse</span>
              }
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost btn" style={{ padding: '6px 8px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 20 }}>
            <InfoRow icon={Hash}    label="Terminal ID" value={machine.terminal_id} />
            <InfoRow icon={User}    label="Merchant"    value={machine.merchant} />
            <InfoRow icon={MapPin}  label="Location"    value={machine.location} />
            <InfoRow icon={Clock}   label="Scanned By"  value={machine.scanned_by} />
          </div>

          <div className="divider" />

          {/* Timeline */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 16 }}>
              Processing Timeline
            </div>
            <div style={{ position: 'relative' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute', left: 15, top: 16, bottom: 16,
                width: 2, background: 'var(--card-border)', zIndex: 0,
              }} />

              {STEPS.map((step, i) => {
                const done = machine[step.key]
                const Icon = step.icon
                return (
                  <div key={step.key} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: i < STEPS.length - 1 ? 20 : 0,
                    position: 'relative', zIndex: 1,
                  }}>
                    {/* Dot */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? 'var(--green-bg)' : 'var(--bg2)',
                      border: done ? '2px solid var(--green)' : '2px solid var(--card-border)',
                      color: done ? 'var(--green)' : 'var(--t3)',
                    }}>
                      {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                    </div>
                    {/* Content */}
                    <div style={{ paddingTop: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: done ? 'var(--t1)' : 'var(--t3)', marginBottom: 2 }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                        {done ? fmt(machine[step.at]) : 'Pending'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--bg2)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>Overall Progress</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{level * 25}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--card-border)', borderRadius: 99 }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${level * 25}%`,
                  background: level === 4 ? 'var(--green)' : 'var(--accent)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--t3)', whiteSpace: 'nowrap' }}>{level}/4 steps</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--card-border)' }}>
      <Icon size={13} color="var(--t3)" style={{ flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{value || '—'}</div>
      </div>
    </div>
  )
}
