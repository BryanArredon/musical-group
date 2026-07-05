import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import PrivacyModal from './PrivacyModal'
import './inventory.css'

export default function LoanRequestForm() {
  const [assets, setAssets] = useState([])
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [assetsError, setAssetsError] = useState('')

  useEffect(() => {
    async function loadAssets() {
      setLoadingAssets(true)
      setAssetsError('')
      try {
        const res = await apiFetch('/activos')
        const available = (res.data || []).filter(
          (a) => (a.estado || a.activo_estado) === 'Disponible'
        )
        setAssets(available)
      } catch (err) {
        console.error('Error loading assets:', err)
        setAssetsError(err.message || 'No se pudieron cargar los activos disponibles')
      } finally {
        setLoadingAssets(false)
      }
    }
    loadAssets()
  }, [])
  const [selected, setSelected] = useState({})
  const [eventName, setEventName] = useState('')
  const [date, setDate] = useState('')
  const [period, setPeriod] = useState('Mañana')
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')
  const [showPrivacy, setShowPrivacy] = useState(false)

  function toggleSelect(id) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  function validate() {
    const e = {}
    if (!eventName.trim()) e.eventName = 'El nombre del evento es obligatorio'
    if (!date) e.date = 'La fecha es obligatoria'
    if (assets.length === 0) {
      e.assets = 'No hay activos disponibles en el inventario'
    } else if (Object.values(selected).every((v) => !v)) {
      e.assets = 'Selecciona al menos un activo'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const chosen = assets.filter((a) => selected[a.id])
    const comentarios = `Evento: ${eventName.trim()} - Fecha: ${date} - Periodo: ${period}`

    try {
      // API expects one request per asset, so we map and Promise.all
      await Promise.all(
        chosen.map((c) =>
          apiFetch('/solicitudes', {
            method: 'POST',
            body: JSON.stringify({
              activoId: c.id,
              comentarios,
            }),
          })
        )
      )

      // reset
      setSelected({})
      setEventName('')
      setDate('')
      setPeriod('Mañana')
      setErrors({})
      setSuccessMsg('Solicitud enviada correctamente. Está pendiente de aprobación.')

      // Refresh available assets list
      const res = await apiFetch('/activos')
      const available = (res.data || []).filter(
        (a) => (a.estado || a.activo_estado) === 'Disponible'
      )
      setAssets(available)

      setTimeout(() => {
        setSuccessMsg('')
      }, 4000)
    } catch (err) {
      setErrors({ assets: err.message || 'Error al enviar la solicitud' })
    }
  }

  return (
    <section className="loan-container">
      <h2>Solicitud de préstamo</h2>
      {successMsg && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--success)',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          ✅ {successMsg}
        </div>
      )}
      <form className="loan-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Nombre del evento{' '}
            {errors.eventName && <span className="error-text">{errors.eventName}</span>}
          </label>
          <input value={eventName} onChange={(e) => setEventName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Fecha {errors.date && <span className="error-text">{errors.date}</span>}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className="form-group">
          <label>Periodo</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>Mañana</option>
            <option>Tarde</option>
            <option>Noche</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            Activos disponibles{' '}
            {errors.assets && <span className="error-text">{errors.assets}</span>}
          </label>
          {loadingAssets ? (
            <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>
              ⏳ Cargando activos disponibles...
            </p>
          ) : assetsError ? (
            <p style={{ color: '#ef4444', padding: '0.5rem 0' }}>⚠️ {assetsError}</p>
          ) : assets.length === 0 ? (
            <p>No hay activos disponibles para solicitar en este momento.</p>
          ) : (
            <div className="assets-grid">
              {assets.map((a) => (
                <label key={a.id} className="asset-card">
                  <input
                    type="checkbox"
                    checked={!!selected[a.id]}
                    onChange={() => toggleSelect(a.id)}
                  />
                  <div>
                    <strong>{a.nombre}</strong>
                    <div className="small muted">{a.categoria}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions"></div>

        <p
          style={{
            marginTop: '0',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
          }}
        >
          El tratamiento de los datos de su solicitud está sujeto a nuestro{' '}
          <button
            type="button"
            onClick={() => setShowPrivacy(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.85rem',
            }}
          >
            Aviso de Privacidad
          </button>
        </p>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Enviar Solicitud
        </button>
      </form>
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </section>
  )
}
