/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('mg_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch (error) {
      console.error('Error loading user:', error)
      return null
    }
  })
  const [loading] = useState(false)

  function login(email, password, role = 'admin') {
    // Simulación de login - En producción, validar contra un backend
    // Para demostración: acepta cualquier credencial y asigna el rol
    const newUser = { email, role, loginAt: new Date().toISOString() }

    setUser(newUser)
    localStorage.setItem('mg_user', JSON.stringify(newUser))
    return true
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('mg_user')
  }

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
