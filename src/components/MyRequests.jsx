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
          {Object.values(
            requests.reduce((acc, r) => {
              const key = `${r.comentarios}|${r.estado}`
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
                  Activos ({group.activosInfo.length}):{' '}
                  <strong>{group.activosInfo.join(', ')}</strong>
                </span>
              </div>
              <div className="request-row">
                <span>
                  Estado:{' '}
                  <strong style={{ color: statusColor[group.estado] || 'inherit' }}>
                    {group.estado}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
