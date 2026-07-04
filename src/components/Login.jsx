import { useContext, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  function validateForm() {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'El email es requerido'
    else if (!email.includes('@')) newErrors.email = 'Email inválido'
    if (!password.trim()) newErrors.password = 'La contraseña es requerida'
    if (password.length < 4) newErrors.password = 'La contraseña debe tener al menos 4 caracteres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrorText('')
    try {
      await login(email, password)
    } catch (err) {
      setErrorText(err.message || 'Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoRole(role) {
    setLoading(true)
    setErrorText('')
    const demoEmail = role === 'admin' ? 'admin@musicalgroup.com' : 'user@musicalgroup.com'
    try {
      await login(demoEmail, 'demo1234')
    } catch (err) {
      setErrorText(err.message || 'Error al iniciar sesión de demostración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-layout">
      {/* Visual / Branding Section (Left Side) */}
      <div className="login-branding">
        <div className="branding-overlay"></div>
        <div className="branding-content">
          <div className="branding-logo">
            <span>🎵</span>
          </div>
          <h1 className="branding-title">Musical Group Manager</h1>
          <p className="branding-subtitle">
            Plataforma Profesional de Gestión de Inventario y Préstamo de Equipo
          </p>
          <div className="branding-features">
            <div className="feature-item">
              <span className="feature-icon">📦</span>
              <div>
                <strong>Control Total</strong>
                <p>Gestiona el inventario de instrumentos y equipo de forma centralizada.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <div>
                <strong>Préstamos Ágiles</strong>
                <p>Automatiza las solicitudes y devoluciones de forma transparente.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section (Right Side) */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa a tu cuenta para continuar</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">
                Correo Electrónico
                {errors.email && <span className="error-text">{errors.email}</span>}
              </label>
              <input
                id="email"
                type="email"
                placeholder="ejemplo@musicalgroup.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: '' })
                }}
                disabled={loading}
                className={errors.email ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Contraseña
                {errors.password && <span className="error-text">{errors.password}</span>}
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: '' })
                }}
                disabled={loading}
                className={errors.password ? 'input-error' : ''}
              />
            </div>

            {errorText && <div className="login-error-alert">⚠️ {errorText}</div>}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-divider">
            <span>Accesos Rápidos de Prueba</span>
          </div>

          <div className="demo-actions">
            <button
              type="button"
              className="btn-demo admin"
              onClick={() => handleDemoRole('admin')}
              disabled={loading}
            >
              <span className="demo-icon">👑</span>
              <span className="demo-text">Admin</span>
            </button>
            <button
              type="button"
              className="btn-demo user"
              onClick={() => handleDemoRole('user')}
              disabled={loading}
            >
              <span className="demo-icon">👥</span>
              <span className="demo-text">Colaborador</span>
            </button>
          </div>

          <div className="login-info">
            <p className="info-title">💡 Credenciales Demo</p>
            <div className="info-credentials">
              <div className="cred-row">
                <span className="cred-label">Email:</span>
                <span className="cred-value">admin@musicalgroup.com</span>
              </div>
              <div className="cred-row">
                <span className="cred-label">Pass:</span>
                <span className="cred-value">demo1234</span>
              </div>
            </div>
            <p className="info-notice">
              El acceso de administrador permite gestionar el inventario.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
