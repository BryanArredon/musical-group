import { useContext } from 'react'
import './App.css'
import { AuthProvider, AuthContext } from './contexts/AuthContext'
import Login from './components/Login'
import Inventory from './components/Inventory'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const { isAuthenticated, user, logout } = useContext(AuthContext)

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <h1>🎵 Musical Group</h1>
            <p>Gestión de Inventario</p>
          </div>
          <div className="header-user">
            <span className="user-info">👤 {user?.email}</span>
            <button className="btn-logout-header" onClick={logout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <ProtectedRoute requiredRole="admin">
          <Inventory />
        </ProtectedRoute>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Musical Group. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
