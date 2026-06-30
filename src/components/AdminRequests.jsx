import { useState } from 'react'
import './inventory.css'

export default function AdminRequests() {
  const [requests, setRequests] = useState(() => {
    return JSON.parse(localStorage.getItem('mg_requests') || '[]')
  })

  function updateStatus(id, status) {
    const all = JSON.parse(localStorage.getItem('mg_requests') || '[]')
    const updated = all.map((r) => (r.id === id ? { ...r, status } : r))
    localStorage.setItem('mg_requests', JSON.stringify(updated))
    setRequests(updated)
  }

  return (
    <section className="admin-requests">
      <h2>Panel de solicitudes (Admin)</h2>
      {requests.length === 0 ? (
        <p>No hay solicitudes registradas.</p>
      ) : (
        <div className="requests-list">
          {requests.map((r) => (
            <div key={r.id} className="request-card">
              <div className="request-row">
                <strong>{r.eventName}</strong>
                <span className="muted">
                  {r.date} • {r.period}
                </span>
              </div>
              <div className="request-row">
                <span>
                  Solicitante: <strong>{r.requester}</strong>
                </span>
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
              <div className="form-actions">
                <button className="btn-primary" onClick={() => updateStatus(r.id, 'Aprobada')}>
                  Aprobar
                </button>
                <button className="btn-secondary" onClick={() => updateStatus(r.id, 'Rechazada')}>
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
