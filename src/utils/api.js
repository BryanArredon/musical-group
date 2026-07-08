const API_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Helper genérico para hacer peticiones al backend.
 * Automáticamente adjunta el token JWT de localStorage.
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('mg_token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Error en la petición a la API')
  }

  return data
}
