/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import { encrypt, decrypt } from '../utils/crypto'
import { apiFetch } from '../utils/api'
import { buildLoginPayload, buildRegisterPayload } from '../utils/dataMinimization'

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

  async function register(nombre, email, password) {
    setLoading(true)
    setError(null)
    try {
      // RNF6: Solo se envían los campos estrictamente necesarios para el registro.
      // buildRegisterPayload descarta cualquier dato interno, nulo o de UI.
      const payload = buildRegisterPayload(nombre, email, password)
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al registrar usuario')
      }

      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      // RNF6: Solo credenciales. No se envían tokens anteriores, metadatos
      // de sesión ni ningún dato interno del estado de la aplicación.
      const payload = buildLoginPayload(email, password)
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (!response.success) {
        throw new Error(response.message || 'Error en inicio de sesión')
      }

      // El servidor inyecta el token en una cookie HttpOnly segura.
      // El FrontEnd solo recibe y guarda los datos del usuario (no el token).
      const { user: userData } = response.data

      const newUser = {
        ...userData,
        loginAt: new Date().toISOString(),
      }

      setUser(newUser)
      // Solo guardamos datos del usuario (no el token) en localStorage.
      // El token viaja exclusivamente en la cookie HttpOnly del navegador.
      localStorage.setItem('mg_user', encrypt(newUser))
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      // Notificar al servidor para que destruya la cookie HttpOnly.
      // Sin esta petición, la cookie persistiría aunque el usuario
      // borrara manualmente el localStorage.
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch {
      // Ignoramos el error de red: aunque falle, limpiamos la sesión local
    } finally {
      setUser(null)
      localStorage.removeItem('mg_user')
    }
  }

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, error, isAuthenticated, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  )
}
