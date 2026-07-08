/**
 * RNF6 — Minimización de datos en el cliente
 *
 * Este módulo centraliza la lógica de preparación de payloads para cada
 * operación de la API. Garantiza que el FrontEnd envíe ÚNICAMENTE los
 * campos estrictamente necesarios, sin datos internos, nulos, indefinidos
 * o sensibles que no sean requeridos por el contrato de la API.
 *
 * Principio de proporcionalidad y minimización (LGPDPPSO Art. 7 Fr. IV).
 */

/**
 * Elimina del objeto todas las claves cuyo valor sea:
 * - undefined
 * - null
 * - cadena vacía ""
 * Esto evita enviar campos opcionales vacíos que no aportan información.
 *
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} - Objeto sin campos vacíos
 */
function stripEmpty(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
}

/**
 * Selecciona SOLO las claves permitidas de un objeto.
 * Si el objeto tiene campos extra (internos, de UI, sensibles),
 * estos son descartados antes de enviarlos al servidor.
 *
 * @param {Object} obj    - Objeto fuente (puede tener campos extra)
 * @param {string[]} keys - Lista de claves permitidas por la API
 * @returns {Object}      - Objeto con únicamente las claves permitidas
 */
function pick(obj, keys) {
  return Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]))
}

// ══════════════════════════════════════════════════════════════════════
// CONTRATOS DE LA API — Campos permitidos por operación
// Cada función construye el payload mínimo para su endpoint específico.
// Añadir un campo aquí es la ÚNICA forma de que llegue al servidor.
// ══════════════════════════════════════════════════════════════════════

/**
 * Payload para POST /api/auth/login
 * Solo requiere credenciales de acceso.
 */
export function buildLoginPayload(email, password) {
  return stripEmpty(pick({ email, password }, ['email', 'password']))
}

/**
 * Payload para POST /api/auth/register
 * Solo requiere datos de identidad básicos para crear la cuenta.
 * NO se envían: roles, permisos, fechas internas, tokens ni metadatos de UI.
 */
export function buildRegisterPayload(nombre, email, password) {
  return stripEmpty(pick({ nombre, email, password }, ['nombre', 'email', 'password']))
}

/**
 * Payload para POST /api/activos y PUT /api/activos/:id
 * Solo los campos editables del activo. NO se envían: id, fechas de creación,
 * campos de UI como 'activo_estado' (alias interno), ni datos del usuario dueño.
 */
export function buildActivoPayload({ nombre, categoria, estado }) {
  return stripEmpty(pick({ nombre, categoria, estado }, ['nombre', 'categoria', 'estado']))
}

/**
 * Payload para POST /api/solicitudes
 * Solo el id del activo y un comentario sanitizado.
 * NO se envían: datos del solicitante (los obtiene el servidor del token JWT),
 * estado de la solicitud, ni fechas internas.
 */
export function buildSolicitudPayload(activoId, comentarios) {
  return stripEmpty(pick({ activoId, comentarios }, ['activoId', 'comentarios']))
}
