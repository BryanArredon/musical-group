import { useState, useEffect, useMemo } from 'react'
import { apiFetch } from '../utils/api'
import { sanitize, validateLength, FIELD_LIMITS } from '../utils/security'
import { buildActivoPayload } from '../utils/dataMinimization'
import useLocalDraft from '../hooks/useLocalDraft'
import Pagination from './Pagination'
import './inventory.css'

// ── Constantes de configuración escalable ───────────────────────────
const ITEMS_PER_PAGE = 10

// Categorías base. Al recibir activos de la API, se añaden las nuevas
// dinámicamente sin cambiar el código fuente. (RNF2-F)
const BASE_CATEGORIES = [
  'Instrumentos de Cuerda',
  'Instrumentos de Viento',
  'Instrumentos de Percusión',
  'Equipo de Audio',
  'Cables y Accesorios',
  'Instrumentos',
  'Iluminación',
  'Mobiliario',
  'Otro',
]

const STATUS_COLORS = {
  Disponible: 'status-available',
  'En uso': 'status-in-use',
  'En reparación': 'status-repair',
  Retirado: 'status-retired',
}

export default function Inventory() {
  const [assets, setAssets] = useState([])

  // RNF3-F: Persistencia local para el formulario de activos
  const [form, setForm, isRestored, clearDraft] = useLocalDraft('draft_inventory_form', {
    nombre: '',
    categoria: '',
    estado: 'Disponible',
  })

  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  // RNF2-F: Paginación
  const [currentPage, setCurrentPage] = useState(1)
  // Guardamos el último filtro/búsqueda para detectar cambios y resetear la página
  const [lastFilter, setLastFilter] = useState(filter)
  const [lastSearch, setLastSearch] = useState(searchTerm)

  useEffect(() => {
    loadAssets()
  }, [])

  // RNF2-F: Detectar cambio de filtro/búsqueda durante el render para
  // resetear la página sin usar un efecto (evita renders en cascada).
  if (filter !== lastFilter || searchTerm !== lastSearch) {
    setLastFilter(filter)
    setLastSearch(searchTerm)
    setCurrentPage(1)
  }

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

  // RNF2-F: Categorías dinámicas — combina las categorías base con
  // cualquier categoría nueva que ya exista en la base de datos,
  // sin tocar el código fuente. (Criterio: "sin modificar la estructura")
  const dynamicCategories = useMemo(() => {
    const fromDB = assets.map((a) => a.categoria).filter(Boolean)
    return [...new Set([...BASE_CATEGORIES, ...fromDB])].sort()
  }, [assets])

  // ═══════════════════════════════════════════════════════════════════
  // SEGURIDAD — \"Desmitificar la Seguridad del FrontEnd\"
  // ═══════════════════════════════════════════════════════════════════
  function validateForm() {
    const newErrors = {}
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!form.categoria.trim()) newErrors.categoria = 'La categoría es requerida'
    const nombreLenError = validateLength(form.nombre, 'nombre')
    if (nombreLenError) newErrors.nombre = nombreLenError
    if (form.nombre !== sanitize(form.nombre)) {
      newErrors.nombre = '⚠️ Se detectó contenido potencialmente peligroso (XSS)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function resetForm() {
    clearDraft()
    setEditingId(null)
    setErrors({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setErrorMessage('')
    // RNF6: buildActivoPayload garantiza que solo se envíen los campos
    // requeridos por la API (nombre, categoria, estado). Descarta automáticamente
    // cualquier campo interno como id, fechas de creación o alias de UI.
    const payload = buildActivoPayload({
      nombre: sanitize(form.nombre),
      categoria: form.categoria,
      estado: form.estado,
    })
    try {
      if (editingId) {
        await apiFetch(`/activos/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiFetch('/activos', { method: 'POST', body: JSON.stringify(payload) })
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

  // ── Filtrado y paginación (RNF2-F) ──────────────────────────────────
  const filteredAssets = assets.filter((a) => {
    const assetEstado = a.estado || a.activo_estado || 'Disponible'
    const matchesFilter = filter === 'Todos' || assetEstado === filter
    const matchesSearch =
      (a.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / ITEMS_PER_PAGE))
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Conteos para los tabs de filtro
  const countByStatus = (status) =>
    assets.filter((a) => (a.estado || a.activo_estado) === status).length

  return (
    <section className="inventory-container">
      <div className="inventory-header">
        <h2>Gestión de Inventario</h2>
        <p className="inventory-subtitle">
          Administra y controla todos tus activos musicales de forma segura (LGPDPPSO Cifrado
          Habilitado)
        </p>
      </div>

      {/* ── Estado de Error Global (RNF2-F: error state) ── */}
      {errorMessage && (
        <div className="alert-error" role="alert">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage('')} aria-label="Cerrar error">
            ✕
          </button>
        </div>
      )}

      <div className="inventory-content">
        {/* ── FORMULARIO ── */}
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? '✏️ Editar activo' : '➕ Nuevo activo'}</h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="cancel-edit" disabled={loading}>
                Cancelar
              </button>
            )}
          </div>

          {isRestored && !editingId && (
            <div
              style={{
                padding: '0.8rem',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#2563eb',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                fontSize: '0.9rem',
              }}
              role="status"
            >
              ℹ️ <strong>Borrador recuperado.</strong>
            </div>
          )}

          <form className="inventory-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">
                Nombre del activo
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </label>
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

            {/* RNF2-F: datalist dinámico — nuevas categorías de la API
                aparecen automáticamente sin cambiar el código fuente */}
            <div className="form-group">
              <label htmlFor="category">
                Categoría
                {errors.categoria && <span className="error-text">{errors.categoria}</span>}
              </label>
              <input
                id="category"
                type="text"
                list="categories-list"
                placeholder="Selecciona o escribe una categoría"
                value={form.categoria}
                onChange={(e) => {
                  setForm({ ...form, categoria: e.target.value })
                  if (errors.categoria) setErrors({ ...errors, categoria: '' })
                }}
                disabled={loading}
                className={errors.categoria ? 'input-error' : ''}
                autoComplete="off"
              />
              <datalist id="categories-list">
                {dynamicCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                💡 Puedes escribir una nueva categoría o seleccionar una existente
              </small>
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

        {/* ── LISTADO ── */}
        <div className="list-section">
          <div className="list-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                aria-label="Buscar activos"
              />
            </div>

            {/* RNF2-F: Tabs de filtro — flex-wrap para que escalen si hay más estados */}
            <div className="filter-tabs" role="group" aria-label="Filtrar por estado">
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
                Disponible ({countByStatus('Disponible')})
              </button>
              <button
                className={`tab ${filter === 'En uso' ? 'active' : ''}`}
                onClick={() => setFilter('En uso')}
                disabled={loading}
              >
                En uso ({countByStatus('En uso')})
              </button>
              <button
                className={`tab ${filter === 'En reparación' ? 'active' : ''}`}
                onClick={() => setFilter('En reparación')}
                disabled={loading}
              >
                Reparación ({countByStatus('En reparación')})
              </button>
              <button
                className={`tab ${filter === 'Retirado' ? 'active' : ''}`}
                onClick={() => setFilter('Retirado')}
                disabled={loading}
              >
                Retirado ({countByStatus('Retirado')})
              </button>
            </div>
          </div>

          <div className="list-header">
            <h3>Listado de activos</h3>
            <span className="count-badge">
              {filteredAssets.length} resultado{filteredAssets.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* RNF2-F: Estado de carga (loading state) */}
          {loading && assets.length === 0 ? (
            <div className="loading-state" aria-live="polite">
              <div className="spinner" aria-hidden="true" />
              <p>Cargando catálogo de inventario...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            /* RNF2-F: Estado de lista vacía (empty state) */
            <div className="empty-state" role="status">
              <p className="empty-icon">📭</p>
              <p className="empty-title">
                {assets.length === 0 ? 'No hay activos registrados' : 'Sin resultados'}
              </p>
              <p className="empty-desc">
                {assets.length === 0
                  ? 'Comienza agregando activos usando el formulario'
                  : 'Intenta con otros términos de búsqueda o cambia el filtro'}
              </p>
            </div>
          ) : (
            <>
              {/* RNF2-F: tabla con scroll horizontal en desktop, cards en mobile */}
              <div className="table-wrapper">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th scope="col">Nombre</th>
                      <th scope="col">Categoría</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAssets.map((a) => {
                      const status = a.estado || a.activo_estado || 'Disponible'
                      return (
                        <tr key={a.id} className={`row ${STATUS_COLORS[status] || ''}`}>
                          <td className="name-cell" data-label="Nombre">
                            {a.nombre}
                          </td>
                          <td className="category-cell" data-label="Categoría">
                            <span className="category-chip">{a.categoria}</span>
                          </td>
                          <td className="status-cell" data-label="Estado">
                            <span className={`status-badge ${STATUS_COLORS[status] || ''}`}>
                              {status}
                            </span>
                          </td>
                          <td className="actions-cell" data-label="Acciones">
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

              {/* RNF2-F: Paginación reutilizable */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
