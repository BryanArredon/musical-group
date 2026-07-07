import { useState, useEffect, useCallback, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { apiFetch } from '../utils/api'
import './inventory.css'

export default function MyRequests() {
  const { user } = useContext(AuthContext)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadMyRequests = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      // Get all pending requests from backend (includes colaborador_email to filter)
      const res = await apiFetch('/solicitudes/mis-solicitudes')
      const all = res.data || []
      // Filter by current user email
      const mine = all.filter((r) => r.colaborador_email === user?.email || user?.role === 'user')
      setRequests(mine)
    } catch (err) {
      // If user doesn't have admin role, /pendientes may fail with 403
      // In that case show empty list gracefully
      if (err.message && err.message.toLowerCase().includes('acceso')) {
        setRequests([])
      } else {
        setErrorMsg(err.message || 'Error al cargar tus solicitudes')
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMyRequests()
  }, [loadMyRequests])

  const statusColor = {
    Pendiente: '#f59e0b',
    Aprobada: '#10b981',
    Rechazada: '#ef4444',
  }

  return (
    <section className="my-requests">
      <h2>Mis solicitudes</h2>
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
          ⏳ Cargando tus solicitudes...
        </p>
      ) : requests.length === 0 ? (
        <p>No has realizado solicitudes aún.</p>
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
                  Activo ID: <strong>#{r.activo_id}</strong>
                </span>
                {r.categoria && (
                  <span>
                    Categoría: <strong>{r.categoria}</strong>
                  </span>
                )}
              </div>
              <div className="request-row">
                <span>
                  Estado:{' '}
                  <strong style={{ color: statusColor[r.estado] || 'inherit' }}>{r.estado}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
