import { useContext, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validateForm() {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'El email es requerido'
    else if (!email.includes('@')) newErrors.email = 'Email inválido'
    if (!password.trim()) newErrors.password = 'La contraseña es requerida'
    if (password.length < 4) newErrors.password = 'La contraseña debe tener al menos 4 caracteres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    // Simular delay de API
    setTimeout(() => {
      login(email, password, 'admin')
      setLoading(false)
    }, 800)
  }

  function handleDemo() {
    setLoading(true)
    setTimeout(() => {
      login('admin@musicalgroup.com', 'demo1234', 'admin')
      setLoading(false)
    }, 800)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎵 Musical Group</h1>
          <p>Gestión de Inventario</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              📧 Email
              {errors.email && <span className="error-text">{errors.email}</span>}
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@musicalgroup.com"
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
              🔒 Contraseña
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

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? '⏳ Iniciando sesión...' : '✓ Iniciar Sesión'}
          </button>
        </form>

        <div className="login-divider">
          <span>o</span>
        </div>

        <button type="button" className="btn-demo" onClick={handleDemo} disabled={loading}>
          {loading ? '⏳ Cargando...' : '🎮 Acceso Demo'}
        </button>

        <div className="login-info">
          <p className="info-title">💡 Acceso Demo</p>
          <p className="info-text">
            Email: <strong>admin@musicalgroup.com</strong>
          </p>
          <p className="info-text">
            Contraseña: <strong>demo1234</strong>
          </p>
          <p className="info-notice">Nota: Solo administradores pueden acceder al inventario</p>
        </div>
      </div>
    </div>
  )
}
