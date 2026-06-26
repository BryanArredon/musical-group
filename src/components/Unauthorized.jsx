import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import './Unauthorized.css'

export default function Unauthorized() {
  const { logout } = useContext(AuthContext)

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">🔐</div>
        <h1>Acceso Denegado</h1>
        <p className="unauthorized-message">No tienes permisos para acceder a esta sección.</p>
        <p className="unauthorized-subtitle">
          Solo los administradores pueden gestionar el inventario.
        </p>

        <button onClick={logout} className="btn-logout">
          ← Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
