import { useContext, useState } from 'react'
import './App.css'
import { AuthProvider, AuthContext } from './contexts/AuthContext'
import Login from './components/Login'
import Inventory from './components/Inventory'
import ProtectedRoute from './components/ProtectedRoute'
import LoanRequestForm from './components/LoanRequestForm'
import MyRequests from './components/MyRequests'
import AdminRequests from './components/AdminRequests'

function AppContent() {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const [view, setView] = useState(user?.role === 'admin' ? 'inventory' : 'loans')

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <nav className="top-nav">
              {user?.role === 'admin' && (
                <button
                  onClick={() => setView('inventory')}
                  className={view === 'inventory' ? 'active' : ''}
                >
                  Inventario
                </button>
              )}
              <button onClick={() => setView('loans')} className={view === 'loans' ? 'active' : ''}>
                Préstamos
              </button>
            </nav>

            <div className="header-user">
              <span className="user-info">👤 {user?.email}</span>
              <button className="btn-logout-header" onClick={logout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {view === 'inventory' && user?.role === 'admin' && (
          <ProtectedRoute requiredRole="admin">
            <Inventory />
          </ProtectedRoute>
        )}

        {view === 'loans' && (
          <div>
            {user?.role === 'admin' ? (
              <AdminRequests />
            ) : (
              <div>
                <div className="mini-nav" style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => setView('loans_form')}
                    className={view === 'loans_form' ? 'active' : ''}
                    onFocus={() => {}}
                  >
                    Solicitar equipo
                  </button>
                  <button
                    onClick={() => setView('loans_mine')}
                    className={view === 'loans_mine' ? 'active' : ''}
                  >
                    Mis solicitudes
                  </button>
                </div>
                {view === 'loans_form' && <LoanRequestForm />}
                {view === 'loans_mine' && <MyRequests />}
                {view === 'loans' && <LoanRequestForm />}
              </div>
            )}
          </div>
        )}

        {view === 'loans_form' && <LoanRequestForm />}
        {view === 'loans_mine' && <MyRequests />}
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
