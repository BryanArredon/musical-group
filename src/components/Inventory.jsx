import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import { sanitize, validateLength, FIELD_LIMITS } from '../utils/security'
import './inventory.css'

const STATUS_COLORS = {
  Disponible: 'status-available',
  'En uso': 'status-in-use',
  'En reparación': 'status-repair',
  Retirado: 'status-retired',
}

export default function Inventory() {
  const [assets, setAssets] = useState([])
  const [form, setForm] = useState({ nombre: '', categoria: '', estado: 'Disponible' })
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadAssets()
  }, [])

  async function loadAssets() {
    setLoading(true)
    try {
      const res = await apiFetch('/activos')
      setAssets(res.data || [])
    } catch (err) {
      setErrorMessage(err.message || 'Error al cargar activos')
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SEGURIDAD — "Desmitificar la Seguridad del FrontEnd"
  // ═══════════════════════════════════════════════════════════════════
  // Esta función de validación puede ser bypasseada desde F12.
  // Ejemplo de bypass: document.querySelector('#name').removeAttribute('maxlength')
  // Sin embargo, el BACKEND también valida de forma independiente,
  // por lo que aunque el frontend sea engañado, el backend rechaza datos inválidos.
  // Esta validación es SOLO para la comodidad del usuario, NO una garantía de seguridad.
  function validateForm() {
    const newErrors = {}

    // Validación de presencia
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!form.categoria.trim()) newErrors.categoria = 'La categoría es requerida'

    // Validación de longitud máxima (PUEDE BYPASSEARSE desde DevTools)
    const nombreLenError = validateLength(form.nombre, 'nombre')
    if (nombreLenError) newErrors.nombre = nombreLenError

    // Detección de intento XSS en el cliente (segundo filtro, DOMPurify es el primero)
    if (form.nombre !== sanitize(form.nombre)) {
      newErrors.nombre = '⚠️ Se detectó contenido potencialmente peligroso (XSS)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function resetForm() {
    setForm({ nombre: '', categoria: '', estado: 'Disponible' })
    setEditingId(null)
    setErrors({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrorMessage('')

    // ═══════════════════════════════════════════════════════════════
    // PRUEBA XSS — Sanitización con DOMPurify
    // ═══════════════════════════════════════════════════════════════
    // Antes de enviar al backend, sanitizamos los campos de texto.
    // Si alguien intenta inyectar: <script>alert('XSS')</script>
    // DOMPurify lo convierte en: "" (cadena vacía)
    // Si intenta: <img src=x onerror="robarToken()">
    // DOMPurify lo convierte en: <img src="x"> (sin evento malicioso)
    const safeForm = {
      nombre: sanitize(form.nombre),
      categoria: form.categoria, // Es un select, no hay riesgo de XSS
      estado: form.estado, // Es un select, no hay riesgo de XSS
    }

    try {
      if (editingId) {
        await apiFetch(`/activos/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(safeForm),
        })
      } else {
        await apiFetch('/activos', {
          method: 'POST',
          body: JSON.stringify(safeForm),
        })
      }
      await loadAssets()
      resetForm()
    } catch (err) {
      setErrorMessage(err.message || 'Error al guardar en el servidor.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(id) {
    const asset = assets.find((a) => a.id === id)
    if (!asset) return
    setForm({
      nombre: asset.nombre,
      categoria: asset.categoria,
      estado: asset.estado || asset.activo_estado,
    })
    setEditingId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este activo de forma permanente?')) return

    setLoading(true)
    setErrorMessage('')
    try {
      await apiFetch(`/activos/${id}`, { method: 'DELETE' })
      await loadAssets()
    } catch (err) {
      setErrorMessage(err.message || 'Error al eliminar en el servidor.')
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter((a) => {
    const assetEstado = a.estado || a.activo_estado || 'Disponible'
    const matchesFilter = filter === 'Todos' || assetEstado === filter
    const matchesSearch =
      (a.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <section className="inventory-container">
      <div className="inventory-header">
        <h2>Gestión de Inventario</h2>
        <p className="inventory-subtitle">
          Administra y controla todos tus activos musicales de forma segura (LGPDPPSO Cifrado
          Habilitado)
        </p>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#ef4444',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '500',
            fontSize: '0.9rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ Error: {errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="inventory-content">
        {/* FORMULARIO */}
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? '✏️ Editar activo' : '➕ Agregar nuevo activo'}</h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="cancel-edit" disabled={loading}>
                Cancelar edición
              </button>
            )}
          </div>

          <form className="inventory-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                Nombre del activo (Se cifrará en tránsito y reposo)
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </label>
              {/* ── DEFENSA XSS + Longitud máxima ─────────────────────────
                  maxLength es el primer filtro visible (puede bypassearse con F12).
                  La sanitización con DOMPurify en handleSubmit es el segundo filtro.
                  El backend es el tercer y definitivo filtro.
              ─────────────────────────────────────────────────────────── */}
              <input
                id="name"
                type="text"
                placeholder="Ej: Guitarra Fender Stratocaster"
                value={form.nombre}
                maxLength={FIELD_LIMITS.nombre}
                onChange={(e) => {
                  setForm({ ...form, nombre: e.target.value })
                  if (errors.nombre) setErrors({ ...errors, nombre: '' })
                }}
                disabled={loading}
                className={errors.nombre ? 'input-error' : ''}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {form.nombre.length}/{FIELD_LIMITS.nombre} caracteres
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Categoría
                {errors.categoria && <span className="error-text">{errors.categoria}</span>}
              </label>
              <select
                id="category"
                value={form.categoria}
                onChange={(e) => {
                  setForm({ ...form, categoria: e.target.value })
                  if (errors.categoria) setErrors({ ...errors, categoria: '' })
                }}
                disabled={loading}
                className={errors.categoria ? 'input-error' : ''}
              >
                <option value="">Selecciona una categoría</option>
                <option value="Instrumentos de Cuerda">Instrumentos de Cuerda</option>
                <option value="Instrumentos de Viento">Instrumentos de Viento</option>
                <option value="Instrumentos de Percusión">Instrumentos de Percusión</option>
                <option value="Equipo de Audio">Equipo de Audio</option>
                <option value="Cables y Accesorios">Cables y Accesorios</option>
                <option value="Instrumentos">Instrumentos</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                disabled={loading}
              >
                <option value="Disponible">Disponible</option>
                <option value="En uso">En uso</option>
                <option value="En reparación">En reparación</option>
                <option value="Retirado">Retirado</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? '⏳ Guardando...'
                  : editingId
                    ? '💾 Guardar cambios'
                    : '➕ Agregar activo'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
                disabled={loading}
              >
                🔄 Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* LISTADO */}
        <div className="list-section">
          <div className="list-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Buscar activos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="filter-tabs">
              <button
                className={`tab ${filter === 'Todos' ? 'active' : ''}`}
                onClick={() => setFilter('Todos')}
                disabled={loading}
              >
                Todos ({assets.length})
              </button>
              <button
                className={`tab ${filter === 'Disponible' ? 'active' : ''}`}
                onClick={() => setFilter('Disponible')}
                disabled={loading}
              >
                Disponible (
                {assets.filter((a) => (a.estado || a.activo_estado) === 'Disponible').length})
              </button>
              <button
                className={`tab ${filter === 'En uso' ? 'active' : ''}`}
                onClick={() => setFilter('En uso')}
                disabled={loading}
              >
                En uso ({assets.filter((a) => (a.estado || a.activo_estado) === 'En uso').length})
              </button>
              <button
                className={`tab ${filter === 'En reparación' ? 'active' : ''}`}
                onClick={() => setFilter('En reparación')}
                disabled={loading}
              >
                Reparación (
                {assets.filter((a) => (a.estado || a.activo_estado) === 'En reparación').length})
              </button>
            </div>
          </div>

          <div className="list-header">
            <h3>Listado de activos</h3>
            <span className="count-badge">
              {filteredAssets.length} resultado{filteredAssets.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading && assets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              ⏳ Cargando catálogo de inventario seguro...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <p className="empty-title">
                {assets.length === 0
                  ? 'No hay activos registrados en el servidor'
                  : 'No hay resultados'}
              </p>
              <p className="empty-desc">
                {assets.length === 0
                  ? 'Comienza a agregar activos usando el formulario anterior'
                  : 'Intenta con otros términos de búsqueda o filtros'}
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((a) => {
                    const status = a.estado || a.activo_estado || 'Disponible'
                    return (
                      <tr key={a.id} className={`row ${STATUS_COLORS[status]}`}>
                        <td className="name-cell">{a.nombre}</td>
                        <td className="category-cell">{a.categoria}</td>
                        <td className="status-cell">
                          <span className={`status-badge ${STATUS_COLORS[status]}`}>{status}</span>
                        </td>
                        <td className="actions-cell">
                          <button
                            onClick={() => handleEdit(a.id)}
                            className="btn-icon edit"
                            title="Editar"
                            disabled={loading}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="btn-icon delete"
                            title="Eliminar"
                            disabled={loading}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
