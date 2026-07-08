const API_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Helper genérico para hacer peticiones al backend.
 *
 * Seguridad (Cookies HttpOnly):
 * La opción `credentials: 'include'` le ordena al navegador adjuntar
 * automáticamente la cookie HttpOnly en cada petición. Esta cookie
 * contiene el token JWT y es completamente invisible para JavaScript,
 * lo que elimina el riesgo de robo de sesión por ataques XSS.
 *
 * Ya no es necesario leer ni adjuntar manualmente el token desde localStorage.
 */
export async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    // credentials: 'include' es la clave que hace que el navegador
    // adjunte las cookies automáticamente en cada petición cross-origin.
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Error en la petición a la API')
  }

  return data
}
