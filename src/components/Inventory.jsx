import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/useAuth'
import './inventory.css'

const STATUS_COLORS = {
  Disponible: 'status-available',
  'En uso': 'status-in-use',
  'En reparación': 'status-repair',
  Retirado: 'status-retired',
}

export default function Inventory() {
  const { user } = useAuth()
  const [assets, setAssets] = useState([])
  const [form, setForm] = useState({ name: '', category: '', status: 'Disponible' })
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Map backend assets (nombre, categoria, estado) to frontend (name, category, status)
  const mapAssetToFrontend = (a) => ({
    id: a.id,
    name: a.nombre,
    category: a.categoria,
    status: a.estado,
    createdAt: a.created_at || a.createdAt,
  })

  // Load assets from the backend
  useEffect(() => {
    async function fetchAssets() {
      setLoading(true)
      setErrorMessage('')
      try {
        const response = await fetch('/api/activos', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron cargar los activos del servidor.')
        }
        const mapped = (result.data || []).map(mapAssetToFrontend)
        setAssets(mapped)
      } catch (err) {
        setErrorMessage(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user?.token) {
      fetchAssets()
    }
  }, [user?.token])

  function validateForm() {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!form.category.trim()) newErrors.category = 'La categoría es requerida'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function resetForm() {
    setForm({ name: '', category: '', status: 'Disponible' })
    setEditingId(null)
    setErrors({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrorMessage('')

    // Map frontend fields to backend schema
    const payload = {
      nombre: form.name,
      categoria: form.category,
      estado: form.status,
    }

    try {
      let url = '/api/activos'
      let method = 'POST'
      if (editingId) {
        url = `/api/activos/${editingId}`
        method = 'PUT'
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Error al guardar el activo en el servidor.')
      }

      if (editingId) {
        const updated = mapAssetToFrontend(result.data)
        setAssets((prev) => prev.map((a) => (a.id === editingId ? updated : a)))
      } else {
        const added = mapAssetToFrontend(result.data)
        setAssets((prev) => [added, ...prev])
      }

      resetForm()
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(id) {
    const asset = assets.find((a) => a.id === id)
    if (!asset) return
    setForm({ name: asset.name, category: asset.category, status: asset.status })
    setEditingId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este activo de forma permanente?')) return

    setLoading(true)
    setErrorMessage('')
    try {
      const response = await fetch(`/api/activos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar el activo del servidor.')
      }
      setAssets((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter((a) => {
    const matchesFilter = filter === 'Todos' || a.status === filter
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
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
                {errors.name && <span className="error-text">{errors.name}</span>}
              </label>
              <input
                id="name"
                type="text"
                placeholder="Ej: Guitarra Fender Stratocaster"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: '' })
                }}
                disabled={loading}
                className={errors.name ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Categoría
                {errors.category && <span className="error-text">{errors.category}</span>}
              </label>
              <input
                id="category"
                type="text"
                placeholder="Ej: Guitarras, Teclados, Micrófonos"
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value })
                  if (errors.category) setErrors({ ...errors, category: '' })
                }}
                disabled={loading}
                className={errors.category ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                disabled={loading}
              >
                <option>Disponible</option>
                <option>En uso</option>
                <option>En reparación</option>
                <option>Retirado</option>
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
                Disponible ({assets.filter((a) => a.status === 'Disponible').length})
              </button>
              <button
                className={`tab ${filter === 'En uso' ? 'active' : ''}`}
                onClick={() => setFilter('En uso')}
                disabled={loading}
              >
                En uso ({assets.filter((a) => a.status === 'En uso').length})
              </button>
              <button
                className={`tab ${filter === 'En reparación' ? 'active' : ''}`}
                onClick={() => setFilter('En reparación')}
                disabled={loading}
              >
                Reparación ({assets.filter((a) => a.status === 'En reparación').length})
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
                  {filteredAssets.map((a) => (
                    <tr key={a.id} className={`row ${STATUS_COLORS[a.status]}`}>
                      <td className="name-cell">{a.name}</td>
                      <td className="category-cell">{a.category}</td>
                      <td className="status-cell">
                        <span className={`status-badge ${STATUS_COLORS[a.status]}`}>
                          {a.status}
                        </span>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
