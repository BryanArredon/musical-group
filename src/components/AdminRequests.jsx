import { useState } from 'react'
import './inventory.css'

export default function AdminRequests() {
  const [requests, setRequests] = useState(() => {
    return JSON.parse(localStorage.getItem('mg_requests') || '[]')
  })

  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [activeReturnId, setActiveReturnId] = useState(null)
  const [returnNote, setReturnNote] = useState('')
  const [returnError, setReturnError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  function updateStatus(id, status) {
    const all = JSON.parse(localStorage.getItem('mg_requests') || '[]')
    const updated = all.map((r) => (r.id === id ? { ...r, status } : r))
    localStorage.setItem('mg_requests', JSON.stringify(updated))
    setRequests(updated)
  }

  function openReturnModal(id) {
    setActiveReturnId(id)
    setReturnNote('')
    setReturnError('')
    setReturnModalOpen(true)
  }

  function handleReturnSubmit(e) {
    e.preventDefault()
    if (!returnNote.trim()) {
      setReturnError('La nota descriptiva es obligatoria para realizar la devolución.')
      return
    }

    const all = JSON.parse(localStorage.getItem('mg_requests') || '[]')
    const updated = all.map((r) => {
      if (r.id === activeReturnId) {
        return { ...r, status: 'Devuelta', returnNote: returnNote.trim() }
      }
      return r
    })

    localStorage.setItem('mg_requests', JSON.stringify(updated))
    setRequests(updated)
    setReturnModalOpen(false)

    // Also mark assets as 'Disponible'
    const request = updated.find((r) => r.id === activeReturnId)
    if (request && request.assets) {
      const allAssets = JSON.parse(localStorage.getItem('mg_assets') || '[]')
      const updatedAssets = allAssets.map((a) => {
        if (request.assets.some((reqAsset) => reqAsset.id === a.id)) {
          return { ...a, status: 'Disponible' }
        }
        return a
      })
      localStorage.setItem('mg_assets', JSON.stringify(updatedAssets))
    }

    setSuccessMsg('Devolución registrada correctamente.')
    setTimeout(() => {
      setSuccessMsg('')
    }, 4000)
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
              {r.status === 'Devuelta' && r.returnNote && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                  }}
                >
                  <strong>Nota de devolución:</strong> {r.returnNote}
                </div>
              )}
              <div className="form-actions">
                {r.status === 'Pendiente' && (
                  <>
                    <button className="btn-primary" onClick={() => updateStatus(r.id, 'Aprobada')}>
                      Aprobar
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => updateStatus(r.id, 'Rechazada')}
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {r.status === 'Aprobada' && (
                  <button
                    className="btn-primary"
                    style={{ backgroundColor: 'var(--success)' }}
                    onClick={() => openReturnModal(r.id)}
                  >
                    Registrar Devolución
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE DEVOLUCIÓN */}
      {returnModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '2rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Captura de Devolución</h3>
            <form onSubmit={handleReturnSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Nota descriptiva de condiciones físicas (Obligatorio)
                </label>
                <textarea
                  rows={4}
                  value={returnNote}
                  onChange={(e) => {
                    setReturnNote(e.target.value)
                    if (returnError) setReturnError('')
                  }}
                  placeholder="Ej. La guitarra presenta un pequeño rasguño en el cuerpo, cuerdas intactas..."
                  style={{ width: '100%', resize: 'vertical' }}
                  className={returnError ? 'input-error' : ''}
                />
                {returnError && (
                  <p
                    style={{
                      color: 'var(--error, #ef4444)',
                      fontSize: '0.85rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    {returnError}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setReturnModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Confirmar Devolución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
