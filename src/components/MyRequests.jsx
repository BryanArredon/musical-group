import { useContext, useMemo } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import './inventory.css'

export default function MyRequests() {
  const { user } = useContext(AuthContext)
  const my = useMemo(() => {
    const all = JSON.parse(localStorage.getItem('mg_requests') || '[]')
    return all.filter((r) => r.requester === user?.email)
  }, [user?.email])

  return (
    <section className="my-requests">
      <h2>Mis solicitudes</h2>
      {my.length === 0 ? (
        <p>No has realizado solicitudes aún.</p>
      ) : (
        <div className="requests-list">
          {my.map((r) => (
            <div key={r.id} className="request-card">
              <div className="request-row">
                <strong>{r.eventName}</strong>
                <span className="muted">
                  {r.date} • {r.period}
                </span>
              </div>
              <div className="request-row">
                <span>
                  Estado: <strong>{r.status}</strong>
                </span>
              </div>
              <div className="request-assets">
                {r.assets.map((a) => (
                  <span key={a.id} className="asset-chip">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
