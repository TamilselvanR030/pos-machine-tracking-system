import { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Hardcoded default user to bypass authentication
  const [user, setUser] = useState({
    id: 1,
    name: 'Admin User',
    username: 'admin',
    role: 'admin',
    domain: 'admin'
  })

  const loginAdmin = useCallback(async (username, password) => {
    // Mock successful login
    return user
  }, [user])

  const signupAdmin = useCallback(async (payload) => {
    // Mock successful signup
    return user
  }, [user])

  const loginUser = useCallback(async (employee_id, domain, password) => {
    // Mock successful login
    return user
  }, [user])

  const logout = useCallback(() => {
    // No-op for now since auth is bypassed
  }, [])

  return (
    <AuthContext.Provider value={{ user, loginAdmin, signupAdmin, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
