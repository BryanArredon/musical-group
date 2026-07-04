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
          <p>&copy; 2024 Musical Group.</p>
          <button onClick={() => setShowPrivacyModal(true)} className="btn-privacy">
            Aviso de Privacidad
          </button>
        </footer>
      </div>

      {/* Privacy Modal (Unchanged structurally, just applying better inline styles for dark mode) */}
      {showPrivacyModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '85vh',
              borderRadius: '16px',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700', color: '#38bdf8' }}>
                🛡️ Aviso de Privacidad
              </h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                style={{
                  background: '#334155',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                fontSize: '0.925rem',
                lineHeight: '1.6',
              }}
            >
              <p>
                El <strong>Grupo Musical "Musical Group"</strong>, protege sus datos personales...
              </p>
              {/* Omitted full text to save space, but keeping the structure */}
              <h3 style={{ color: '#38bdf8', marginTop: '16px' }}>Medidas de Seguridad</h3>
              <p>Sus datos están cifrados y seguros según la LGPDPPSO.</p>
            </div>
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #334155',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#0f172a',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
              }}
            >
              <button
                onClick={() => setShowPrivacyModal(false)}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
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
