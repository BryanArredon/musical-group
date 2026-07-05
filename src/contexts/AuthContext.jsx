/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import { encrypt, decrypt } from '../utils/crypto'
import { apiFetch } from '../utils/api'

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
      // Call real backend API
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (!response.success) {
        throw new Error(response.message || 'Error en inicio de sesión')
      }

      const { token, user: userData } = response.data

      const newUser = {
        ...userData,
        token,
        loginAt: new Date().toISOString(),
      }

      setUser(newUser)
      localStorage.setItem('mg_token', token)
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
    localStorage.removeItem('mg_token')
  }

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
