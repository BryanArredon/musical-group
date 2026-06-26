import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Unauthorized from './Unauthorized'

export default function ProtectedRoute({ children, requiredRole = 'admin' }) {
  const { user, loading, isAuthenticated } = useContext(AuthContext)

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
        }}
      >
        ⏳ Cargando...
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== requiredRole) {
    return <Unauthorized />
  }

  return children
}
