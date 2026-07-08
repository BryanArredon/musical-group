import { useContext, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import PrivacyModal from './PrivacyModal'
import { sanitize, isValidEmail } from '../utils/security'
import './Login.css'

export default function Login() {
  const { login, register } = useContext(AuthContext)
  const [isRegistering, setIsRegistering] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [successText, setSuccessText] = useState('')
  const [showPrivacy, setShowPrivacy] = useState(false)

  // Validaciones dinámicas de la contraseña
  const passRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const isPasswordValid = Object.values(passRules).every(Boolean)

  function validateForm() {
    const newErrors = {}

    if (isRegistering && !nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Formato de email inválido'
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    } else if (isRegistering && !isPasswordValid) {
      newErrors.password = 'La contraseña no cumple los requisitos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrorText('')
    setSuccessText('')

    try {
      if (isRegistering) {
        await register(sanitize(nombre), sanitize(email.toLowerCase().trim()), password)
        setSuccessText('¡Registro exitoso! Iniciando sesión...')
        // Auto login after successful registration
        await login(sanitize(email.toLowerCase().trim()), password)
      } else {
        await login(sanitize(email.toLowerCase().trim()), password)
      }
    } catch (err) {
      setErrorText(err.message || 'Error de conexión con el servidor')
      setLoading(false)
    }
  }

  function toggleMode() {
    setIsRegistering(!isRegistering)
    setErrors({})
    setErrorText('')
    setSuccessText('')
    setNombre('')
    setPassword('')
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
            <h2>{isRegistering ? 'Crea tu Cuenta' : 'Bienvenido de nuevo'}</h2>
            <p>
              {isRegistering
                ? 'Regístrate para comenzar a gestionar el equipo'
                : 'Ingresa a tu cuenta para continuar'}
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre Completo
                  {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                </label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Juan Pérez"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    if (errors.nombre) setErrors({ ...errors, nombre: '' })
                  }}
                  disabled={loading}
                  className={errors.nombre ? 'input-error' : ''}
                />
              </div>
            )}

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

              {/* Dynamic Password Validation UI */}
              {isRegistering && (
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                    Requisitos de la contraseña:
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <li
                      style={{
                        color: passRules.length ? '#22c55e' : 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {passRules.length ? '✅' : '❌'} Mínimo 8 caracteres
                    </li>
                    <li
                      style={{
                        color: passRules.upper ? '#22c55e' : 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {passRules.upper ? '✅' : '❌'} Al menos 1 letra mayúscula
                    </li>
                    <li
                      style={{
                        color: passRules.number ? '#22c55e' : 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {passRules.number ? '✅' : '❌'} Al menos 1 número
                    </li>
                    <li
                      style={{
                        color: passRules.special ? '#22c55e' : 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {passRules.special ? '✅' : '❌'} Al menos 1 carácter especial
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {errorText && (
              <div
                className="login-error-alert"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                }}
              >
                ⚠️ {errorText}
              </div>
            )}
            {successText && (
              <div
                className="login-error-alert"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  border: '1px solid #22c55e',
                }}
              >
                ✅ {successText}
              </div>
            )}

            <button
              type="submit"
              className="btn-login"
              disabled={loading || (isRegistering && !isPasswordValid)}
            >
              {loading ? 'Procesando...' : isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={toggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                {isRegistering
                  ? '¿Ya tienes cuenta? Inicia sesión aquí'
                  : '¿No tienes cuenta? Regístrate aquí'}
              </button>
            </div>

            <p
              style={{
                marginTop: '1.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                lineHeight: '1.5',
              }}
            >
              El tratamiento de sus datos personales está sujeto a nuestro{' '}
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.85rem',
                }}
              >
                Aviso de Privacidad
              </button>
            </p>
          </form>
        </div>
      </div>
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  )
}
