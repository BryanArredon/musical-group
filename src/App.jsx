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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

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

      <footer
        className="app-footer"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
      >
        <p>&copy; 2024 Musical Group. Todos los derechos reservados.</p>
        <button
          onClick={() => setShowPrivacyModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '0.85rem',
            padding: '4px',
          }}
        >
          Aviso de Privacidad LGPDPPSO (Medidas de Seguridad)
        </button>
      </footer>

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
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700', color: '#6366f1' }}>
                🛡️ Aviso de Privacidad Integral
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
                El <strong>Grupo Musical "Musical Group"</strong>, en cumplimiento con la{' '}
                <strong>
                  Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados
                  (LGPDPPSO)
                </strong>
                , hace de su conocimiento que los datos personales recabados en este sistema de
                gestión de inventario y préstamos serán protegidos, incorporados y tratados con
                estrictas medidas de seguridad técnica y organizativa.
              </p>

              <h3
                style={{
                  fontSize: '1.05rem',
                  color: '#818cf8',
                  marginTop: '16px',
                  marginBottom: '8px',
                }}
              >
                1. Finalidad del Tratamiento
              </h3>
              <p>
                Los datos personales (nombre, correo electrónico, rol y trayectorias) son tratados
                para:
              </p>
              <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                <li>Controlar el acceso y asignación de instrumentos y equipos del inventario.</li>
                <li>Auditar operaciones internas (trazabilidad de préstamos y devoluciones).</li>
                <li>Prevenir robo, extravío o mal uso de activos de la agrupación.</li>
              </ul>

              <h3
                style={{
                  fontSize: '1.05rem',
                  color: '#818cf8',
                  marginTop: '16px',
                  marginBottom: '8px',
                }}
              >
                2. Medidas de Seguridad Aplicadas
              </h3>
              <p>
                De acuerdo con el <strong>Art. 25</strong> de la LGPDPPSO, implementamos:
              </p>
              <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                <li>
                  <strong>Cifrado Simétrico AES (pgcrypto)</strong>: El nombre de los activos se
                  cifra en base de datos PostgreSQL en reposo para evitar exposición.
                </li>
                <li>
                  <strong>Cifrado de Sesión en Cliente</strong>: Toda la información de sesión
                  almacenada localmente (LocalStorage) se encripta mediante nuestra utilidad
                  criptográfica.
                </li>
                <li>
                  <strong>Anonimización de Auditoría</strong>: Los logs del servidor enmascaran los
                  datos personales para garantizar la disociación.
                </li>
                <li>
                  <strong>Control de Acceso RBAC</strong>: Endpoints CRUD de inventario restringidos
                  únicamente a administradores mediante verificación de firmas JWT.
                </li>
              </ul>

              <h3
                style={{
                  fontSize: '1.05rem',
                  color: '#818cf8',
                  marginTop: '16px',
                  marginBottom: '8px',
                }}
              >
                3. Derechos ARCO
              </h3>
              <p>
                Usted puede ejercer en todo momento sus derechos de{' '}
                <strong>Acceso, Rectificación, Cancelación y Oposición</strong> contactando a la
                Unidad de Transparencia de la agrupación al correo electrónico:{' '}
                <code>privacidad@musicalgroup.com</code>.
              </p>
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
                  backgroundColor: '#6366f1',
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
