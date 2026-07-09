import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import { sanitize, validateLength, FIELD_LIMITS } from '../utils/security'
import { buildSolicitudPayload } from '../utils/dataMinimization'
import useLocalDraft from '../hooks/useLocalDraft'
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

  // RNF3-F: Persistencia de datos del formulario de solicitud
  const [draft, setDraft, isRestored, clearDraft] = useLocalDraft('draft_loan_request', {
    selected: {},
    eventName: '',
    date: '',
    period: 'Mañana',
  })

  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')
  const [showPrivacy, setShowPrivacy] = useState(false)

  function toggleSelect(id) {
    setDraft((s) => ({
      ...s,
      selected: { ...s.selected, [id]: !s.selected[id] },
    }))
  }

  // ═══════════════════════════════════════════════════════════════════
  // SEGURIDAD — "Desmitificar la Seguridad del FrontEnd"
  // ═══════════════════════════════════════════════════════════════════
  // Esta validación es el PRIMER filtro. Un usuario con conocimientos
  // técnicos puede bypassearla desde F12 > Console:
  //
  //   Ejemplo de bypass (eliminar restricción de longitud):
  //   document.querySelector('input[maxlength]')
  //     .removeAttribute('maxlength')
  //
  //   Ejemplo de bypass (ejecutar submit directamente):
  //   document.querySelector('form').dispatchEvent(
  //     new Event('submit', {bubbles:true, cancelable:true})
  //   )
  //
  // El BACKEND (Node.js/Express) valida de forma independiente y
  // rechazará datos inválidos aunque el frontend sea manipulado.
  function validate() {
    const e = {}
    if (!draft.eventName.trim()) e.eventName = 'El nombre del evento es obligatorio'
    if (!draft.date) e.date = 'La fecha es obligatoria'

    // Validación de longitud máxima (bypasseable desde DevTools)
    const lenError = validateLength(draft.eventName, 'eventName')
    if (lenError) e.eventName = lenError

    // NOTA TEMPORAL: Desactivamos la detección estricta para que
    // puedas tomar la captura de pantalla de prueba de penetración XSS.
    // if (draft.eventName !== sanitize(draft.eventName)) {
    //   e.eventName = '⚠️ Se detectó contenido potencialmente peligroso (XSS)'
    // }

    if (assets.length === 0) {
      e.assets = 'No hay activos disponibles en el inventario'
    } else if (Object.values(draft.selected).every((v) => !v)) {
      e.assets = 'Selecciona al menos un activo'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const chosen = assets.filter((a) => draft.selected[a.id])

    // ═══════════════════════════════════════════════════════════════
    // PRUEBA XSS — Sanitización de inputs con DOMPurify
    // ═══════════════════════════════════════════════════════════════
    const safeEventName = sanitize(draft.eventName.trim())
    const safeComentarios = `Evento: ${safeEventName} - Fecha: ${draft.date} - Periodo: ${draft.period}`

    try {
      await Promise.all(
        chosen.map((c) => {
          // RNF6: buildSolicitudPayload garantiza que solo se envían
          // activoId y comentarios. El servidor obtiene los datos del
          // solicitante (usuario, fecha) directamente del token JWT.
          // No se exponen datos sensibles adicionales del cliente.
          const payload = buildSolicitudPayload(c.id, safeComentarios)
          return apiFetch('/solicitudes', {
            method: 'POST',
            body: JSON.stringify(payload),
          })
        })
      )

      // RNF3-F: Limpiamos el borrador local tras el envío exitoso
      clearDraft()

      setErrors({})
      setSuccessMsg('Solicitud enviada correctamente. Está pendiente de aprobación.')

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
      {isRestored && (
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
          ℹ️ <strong>Borrador recuperado:</strong> Se restauraron los datos que estabas capturando
          antes de cerrar la página.
        </div>
      )}
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
          {/* maxLength: primer filtro (bypasseable desde F12).
              DOMPurify en handleSubmit: segundo filtro.
              Backend: tercer y definitivo filtro. */}
          <input
            value={draft.eventName}
            maxLength={FIELD_LIMITS.eventName}
            onChange={(e) => setDraft({ ...draft, eventName: e.target.value })}
            placeholder="Ej: Concierto de Fin de Año"
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {draft.eventName.length}/{FIELD_LIMITS.eventName} caracteres
          </small>

          {/* ESTE BLOQUE ES PARA TU CAPTURA DE PANTALLA */}
          {draft.eventName.includes('<script>') && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                border: '1px dashed #ef4444',
                borderRadius: '5px',
              }}
            >
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                Salida Reflejada (React la protege automáticamente):
              </span>
              <br />
              <span id="xss-reflected-output">{draft.eventName}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Fecha {errors.date && <span className="error-text">{errors.date}</span>}</label>
          <input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className="form-group">
          <label>Periodo</label>
          <select
            value={draft.period}
            onChange={(e) => setDraft({ ...draft, period: e.target.value })}
          >
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
                    checked={!!draft.selected[a.id]}
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
