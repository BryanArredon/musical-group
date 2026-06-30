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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al iniciar sesión')
      }

      const userData = result.data.user
      const token = result.data.token

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
