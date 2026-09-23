import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, ClipboardList, BarChart3,
  Users, ScanLine, LogOut, Zap, Sun, Moon
} from 'lucide-react'

const DOMAIN_LABEL = {
  scan_warehouse: 'Scan & Warehouse',
  app_load:       'App Load',
  key_inject:     'Key Inject',
  dispatch:       'Dispatch',
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const adminLinks = [
    { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'        },
    { to: '/inward-entry',    icon: ClipboardList,   label: 'Inward Entry'     },
    { to: '/reports',         icon: BarChart3,       label: 'Reports'          },
    { to: '/user-management', icon: Users,           label: 'User Management'  },
  ]
  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'                         },
    { to: '/my-work',   icon: ScanLine,         label: DOMAIN_LABEL[user?.domain] || 'My Work' },
    { to: '/reports',   icon: BarChart3,        label: 'Reports'                           },
  ]
  const links = isAdmin ? adminLinks : userLinks

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: 'var(--sidebar)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg,#4361EE,#7B2FF7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(67,97,238,0.4)',
          }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>POS Track</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 500, letterSpacing: '0.04em' }}>HITACHI PAYMENTS</div>
          </div>
        </div>
      </div>

      {/* Section label + theme toggle */}
      <div style={{ padding: '14px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', paddingLeft: 6 }}>
          Navigation
        </div>
        <button onClick={toggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600,
            fontFamily: 'Poppins, sans-serif', transition: 'all 0.15s',
          }}>
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <Icon className="nav-icon" />
            <span style={{ fontSize: 13 }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + theme */}
      <div style={{ padding: '10px 10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* User info */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: 10,
          padding: '10px 12px', marginBottom: 8,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#4361EE,#7B2FF7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isAdmin ? 'Administrator' : DOMAIN_LABEL[user?.domain]}
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login') }} className="nav-item" style={{ width: '100%', color: 'rgba(255,255,255,0.38)', gap: 9 }}>
          <LogOut size={14} />
          <span style={{ fontSize: 12.5 }}>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
