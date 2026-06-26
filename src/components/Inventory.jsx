import { useEffect, useState } from 'react'
import './inventory.css'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const STATUS_COLORS = {
  Disponible: 'status-available',
  'En uso': 'status-in-use',
  'En reparación': 'status-repair',
  Retirado: 'status-retired',
}

export default function Inventory() {
  const [assets, setAssets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mg_assets') || '[]')
    } catch {
      return []
    }
  })
  const [form, setForm] = useState({ name: '', category: '', status: 'Disponible' })
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    localStorage.setItem('mg_assets', JSON.stringify(assets))
  }, [assets])

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

  function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return

    if (editingId) {
      setAssets((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...form } : a)))
    } else {
      setAssets((prev) => [
        { id: generateId(), ...form, createdAt: new Date().toISOString() },
        ...prev,
      ])
    }

    resetForm()
  }

  function handleEdit(id) {
    const asset = assets.find((a) => a.id === id)
    if (!asset) return
    setForm({ name: asset.name, category: asset.category, status: asset.status })
    setEditingId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este activo?')) return
    setAssets((prev) => prev.filter((a) => a.id !== id))
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
        <p className="inventory-subtitle">Administra y controla todos tus activos musicales</p>
      </div>

      <div className="inventory-content">
        {/* FORMULARIO */}
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? '✏️ Editar activo' : '➕ Agregar nuevo activo'}</h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="cancel-edit">
                Cancelar edición
              </button>
            )}
          </div>

          <form className="inventory-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                Nombre del activo
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
                placeholder="Ej: Cuerdas, Percusión, Vientos"
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value })
                  if (errors.category) setErrors({ ...errors, category: '' })
                }}
                className={errors.category ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>Disponible</option>
                <option>En uso</option>
                <option>En reparación</option>
                <option>Retirado</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? '💾 Guardar cambios' : '➕ Agregar activo'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
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
              />
            </div>

            <div className="filter-tabs">
              <button
                className={`tab ${filter === 'Todos' ? 'active' : ''}`}
                onClick={() => setFilter('Todos')}
              >
                Todos ({assets.length})
              </button>
              <button
                className={`tab ${filter === 'Disponible' ? 'active' : ''}`}
                onClick={() => setFilter('Disponible')}
              >
                Disponible ({assets.filter((a) => a.status === 'Disponible').length})
              </button>
              <button
                className={`tab ${filter === 'En uso' ? 'active' : ''}`}
                onClick={() => setFilter('En uso')}
              >
                En uso ({assets.filter((a) => a.status === 'En uso').length})
              </button>
              <button
                className={`tab ${filter === 'En reparación' ? 'active' : ''}`}
                onClick={() => setFilter('En reparación')}
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

          {filteredAssets.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <p className="empty-title">
                {assets.length === 0 ? 'No hay activos registrados' : 'No hay resultados'}
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
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="btn-icon delete"
                          title="Eliminar"
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
