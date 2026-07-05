import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../utils/api'
import './inventory.css'

export default function AdminRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await apiFetch('/solicitudes/pendientes')
      setRequests(res.data || [])
    } catch (err) {
      setErrorMsg(err.message || 'Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRequests()
  }, [loadRequests])

  async function updateStatus(id, action) {
    setLoading(true)
    try {
      await apiFetch(`/solicitudes/${id}/${action}`, { method: 'POST' })
      await loadRequests()
      const msg =
        action === 'aprobar'
          ? 'Solicitud aprobada correctamente.'
          : 'Solicitud rechazada correctamente.'
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-requests">
      <h2>Panel de solicitudes (Admin)</h2>
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
      {errorMsg && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            color: '#ef4444',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #fee2e2',
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          ⏳ Cargando solicitudes...
        </p>
      ) : requests.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        <div className="requests-list">
          {requests.map((r) => (
            <div key={r.id} className="request-card">
              <div className="request-row">
                <strong>{r.comentarios || `Solicitud #${r.id}`}</strong>
                <span className="muted">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('es-MX') : ''}
                </span>
              </div>
              <div className="request-row">
                <span>
                  Solicitante: <strong>{r.colaborador_email}</strong>
                </span>
                <span>
                  Activo ID: <strong>#{r.activo_id}</strong>
                </span>
              </div>
              <div className="request-row">
                <span>
                  Estado: <strong>{r.estado}</strong>
                </span>
                {r.categoria && (
                  <span>
                    Categoría: <strong>{r.categoria}</strong>
                  </span>
                )}
              </div>
              <div className="form-actions">
                {r.estado === 'Pendiente' && (
                  <>
                    <button
                      className="btn-primary"
                      disabled={loading}
                      onClick={() => updateStatus(r.id, 'aprobar')}
                    >
                      Aprobar
                    </button>
                    <button
                      className="btn-secondary"
                      disabled={loading}
                      onClick={() => updateStatus(r.id, 'rechazar')}
                    >
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
