import { useContext, useState } from 'react'
import './App.css'
import { AuthProvider, AuthContext } from './contexts/AuthContext'
import Login from './components/Login'
import Inventory from './components/Inventory'
import ProtectedRoute from './components/ProtectedRoute'
import LoanRequestForm from './components/LoanRequestForm'
import MyRequests from './components/MyRequests'
import AdminRequests from './components/AdminRequests'
import PrivacyModal from './components/PrivacyModal'

//Cecilia Aurora Robelo Hernández - Bryan Emilio Arredondo López

function AppContent() {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const [view, setView] = useState(user?.role === 'admin' ? 'inventory' : 'loans_form')
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!isAuthenticated) {
    return <Login />
  }

  const handleNavClick = (newView) => {
    setView(newView)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="brand-mobile">
          <h1>🎵 Musical Group</h1>
        </div>
        <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <h1>🎵 Musical</h1>
            <p>Group Manager</p>
          </div>

          <nav className="side-nav">
            <div className="nav-section-title">Principal</div>
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('inventory')}
                className={view === 'inventory' ? 'active' : ''}
              >
                📦 Inventario
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('loans')}
                className={view === 'loans' ? 'active' : ''}
              >
                🔄 Préstamos (Admin)
              </button>
            )}

            {user?.role !== 'admin' && (
              <>
                <button
                  onClick={() => handleNavClick('loans_form')}
                  className={view === 'loans_form' ? 'active' : ''}
                >
                  ➕ Solicitar Equipo
                </button>
                <button
                  onClick={() => handleNavClick('loans_mine')}
                  className={view === 'loans_mine' ? 'active' : ''}
                >
                  📋 Mis Solicitudes
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="user-avatar">{user?.email?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="user-details">
              <span className="user-email">{user?.email}</span>
              <span className="user-role">
                {user?.role === 'admin' ? 'Administrador' : 'Colaborador'}
              </span>
            </div>
          </div>
          <button className="btn-logout-sidebar" onClick={logout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-content-wrapper">
        <main className="app-main">
          <header className="page-header">
            <h2>
              {view === 'inventory' && 'Gestión de Inventario'}
              {view === 'loans' &&
                (user?.role === 'admin' ? 'Solicitudes de Préstamo' : 'Sección de Préstamos')}
              {view === 'loans_form' && 'Nueva Solicitud'}
              {view === 'loans_mine' && 'Mis Solicitudes Activas'}
            </h2>
          </header>

          <div className="page-content">
            {view === 'inventory' && user?.role === 'admin' && (
              <ProtectedRoute requiredRole="admin">
                <Inventory />
              </ProtectedRoute>
            )}

            {view === 'loans' && (
              <div>{user?.role === 'admin' ? <AdminRequests /> : <LoanRequestForm />}</div>
            )}

            {view === 'loans_form' && <LoanRequestForm />}
            {view === 'loans_mine' && <MyRequests />}
          </div>
        </main>

        <footer className="app-footer">
          <p>&copy; 2026 Musical Group.</p>
          <button onClick={() => setShowPrivacyModal(true)} className="btn-privacy">
            Aviso de Privacidad
          </button>
        </footer>
      </div>

      {/* Privacy Modal */}
      {showPrivacyModal && <PrivacyModal onClose={() => setShowPrivacyModal(false)} />}
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
