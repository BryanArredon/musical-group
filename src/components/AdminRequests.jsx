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
      const res = await apiFetch('/solicitudes/todas')
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

  // (updateStatus ha sido reemplazado por la acción grupal en el renderizado)

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
        <p>No hay solicitudes registradas.</p>
      ) : (
        <div className="requests-list">
          {Object.values(
            requests.reduce((acc, r) => {
              const key = `${r.comentarios}|${r.colaborador_email}|${r.estado}`
              if (!acc[key]) {
                acc[key] = { ...r, activosInfo: [], solicitudesIds: [] }
              }
              acc[key].activosInfo.push(`#${r.activo_id} ${r.categoria || 'Activo'}`)
              acc[key].solicitudesIds.push(r.id)
              return acc
            }, {})
          ).map((group) => (
            <div key={group.solicitudesIds.join('-')} className="request-card">
              <div className="request-row">
                <strong>{group.comentarios || `Solicitud Grupal`}</strong>
                <span className="muted">
                  {group.created_at ? new Date(group.created_at).toLocaleDateString('es-MX') : ''}
                </span>
              </div>
              <div className="request-row">
                <span>
                  Solicitante: <strong>{group.colaborador_email}</strong>
                </span>
                <span>
                  Activos ({group.activosInfo.length}):{' '}
                  <strong>{group.activosInfo.join(', ')}</strong>
                </span>
              </div>
              <div className="request-row">
                <span>
                  Estado general: <strong>{group.estado}</strong>
                </span>
              </div>
              <div className="form-actions">
                {group.estado === 'Pendiente' && (
                  <>
                    <button
                      className="btn-primary"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true)
                        try {
                          await Promise.all(
                            group.solicitudesIds.map((id) =>
                              apiFetch(`/solicitudes/${id}/aprobar`, { method: 'POST' })
                            )
                          )
                          await loadRequests()
                          setSuccessMsg('Solicitud grupal aprobada.')
                          setTimeout(() => setSuccessMsg(''), 4000)
                        } catch (err) {
                          setErrorMsg(err.message || 'Error al aprobar')
                        } finally {
                          setLoading(false)
                        }
                      }}
                    >
                      Aprobar {group.activosInfo.length > 1 ? 'Todo' : ''}
                    </button>
                    <button
                      className="btn-secondary"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true)
                        try {
                          await Promise.all(
                            group.solicitudesIds.map((id) =>
                              apiFetch(`/solicitudes/${id}/rechazar`, { method: 'POST' })
                            )
                          )
                          await loadRequests()
                          setSuccessMsg('Solicitud grupal rechazada.')
                          setTimeout(() => setSuccessMsg(''), 4000)
                        } catch (err) {
                          setErrorMsg(err.message || 'Error al rechazar')
                        } finally {
                          setLoading(false)
                        }
                      }}
                    >
                      Rechazar {group.activosInfo.length > 1 ? 'Todo' : ''}
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
