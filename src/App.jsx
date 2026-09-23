import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import InwardEntry from './pages/InwardEntry'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'
import ScanWarehouse from './pages/domain/ScanWarehouse'
import AppLoad from './pages/domain/AppLoad'
import KeyInject from './pages/domain/KeyInject'
import Dispatch from './pages/domain/Dispatch'

function RequireAuth({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function DomainRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const map = {
    scan_warehouse: <ScanWarehouse />,
    app_load:       <AppLoad />,
    key_inject:     <KeyInject />,
    dispatch:       <Dispatch />,
  }
  return map[user.domain] || <Navigate to="/dashboard" replace />
}

export default function App() {
  const { user } = useAuth()
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inward-entry" element={<InwardEntry />} />
          <Route path="reports" element={<Reports />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="my-work" element={<DomainRoute />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
