/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import { encrypt, decrypt } from '../utils/crypto'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('mg_user')
      return savedUser ? decrypt(savedUser) : null
    } catch (error) {
      console.error('Error loading user:', error)
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      let userData = null
      let token = 'mock-token-' + Date.now()

      // Mock login for demo accounts since there is no backend endpoint
      if (email === 'admin@musicalgroup.com' && password === 'demo1234') {
        userData = {
          id: 1,
          email: 'admin@musicalgroup.com',
          role: 'admin',
          name: 'Administrador Demo',
        }
      } else if (email === 'user@musicalgroup.com' && password === 'demo1234') {
        userData = { id: 2, email: 'user@musicalgroup.com', role: 'user', name: 'Usuario Demo' }
      } else {
        throw new Error(
          'Credenciales inválidas. Usa admin@musicalgroup.com o user@musicalgroup.com con la contraseña demo1234'
        )
      }

      const newUser = {
        ...userData,
        token,
        loginAt: new Date().toISOString(),
      }

      setUser(newUser)
      localStorage.setItem('mg_user', encrypt(newUser))
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('mg_user')
  }

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
