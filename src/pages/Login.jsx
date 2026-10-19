import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import imagenLogin from '../../../imagenes/login.jpg'
import '../styles/Login.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-ruta-salvaje-nos6.onrender.com'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const formularioInicial = { email: '', password: '' }

function validarFormulario(formulario) {
  const errores = {}
  const email = formulario.email.trim()
  const password = formulario.password.trim()

  if (!email) {
    errores.email = 'El correo electrónico es obligatorio.'
  } else if (!EMAIL_REGEX.test(email)) {
    errores.email = 'Por favor, ingresa un correo electrónico válido.'
  }

  if (!password) {
    errores.password = 'La contraseña es obligatoria.'
  } else if (password.length < 4) {
    errores.password = 'La contraseña debe tener al menos 4 caracteres.'
  }

  return errores
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('')
  const [formData, setFormData] = useState(formularioInicial)
  const [errores, setErrores] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(actual => ({ ...actual, [name]: value }))
    setErrores(actuales => ({ ...actuales, [name]: '' }))
    setMensaje('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const erroresFormulario = validarFormulario(formData)
    setErrores(erroresFormulario)
    setMensaje('')

    if (Object.keys(erroresFormulario).length) return

    setCargando(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim()
        })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Usuario o contraseña incorrectos')
      }

      const usuario = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: String(data.rol || '').toUpperCase()
      }
      localStorage.setItem('usuarioLogueado', JSON.stringify(usuario))
      localStorage.setItem('token', data.token)
      window.dispatchEvent(new Event('ruta-salvaje:session-changed'))

      setTipoMensaje('ok')
      setMensaje('¡Inicio exitoso!')
      const destino = location.state?.redirectTo === '/reservas' ? '/reservas' : '/'
      window.setTimeout(() => navigate(destino, { replace: true }), 1000)
    } catch (error) {
      setTipoMensaje('error')
      setMensaje(error.message || 'No se pudo iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="login-page" style={{ '--login-imagen-fondo': `url("${imagenLogin}")` }}>
      <div className="login-layout">
        <section className="login-form-col">
          <div className="login-card">
            <h1 className="login-title">Iniciar sesión</h1>
            <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

            <form id="loginForm" noValidate onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label" htmlFor="loginCorreo">Correo electrónico</label>
                <div className="login-input-wrap">
                  <svg className="login-input-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z" />
                  </svg>
                  <input
                    type="email"
                    className="login-input"
                    id="loginCorreo"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tucorreo@email.com"
                    autoComplete="email"
                    disabled={cargando}
                    aria-invalid={Boolean(errores.email)}
                    aria-describedby="errorLoginCorreo"
                  />
                </div>
                <span id="errorLoginCorreo" className="login-field-error" role="alert">{errores.email}</span>
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="loginPassword">Contraseña</label>
                <div className="login-input-wrap login-input-wrap--password">
                  <svg className="login-input-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
                  </svg>
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    className="login-input"
                    id="loginPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    disabled={cargando}
                    aria-invalid={Boolean(errores.password)}
                    aria-describedby="errorLoginPassword"
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setMostrarPassword(mostrar => !mostrar)}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={mostrarPassword}
                    disabled={cargando}
                  >
                    {mostrarPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.7 7.7 0 0 0-3.354.789l.823.823A6.5 6.5 0 0 1 8 3.5c3.446 0 5.8 3.171 6.657 4.5a13 13 0 0 1-2.12 2.544z" /><path d="M11.297 9.176a3.5 3.5 0 0 0-4.473-4.473l1.062 1.062a2 2 0 0 1 2.35 2.35zM3.35 5.47A13 13 0 0 0 1.343 8c.857 1.329 3.211 4.5 6.657 4.5a6.5 6.5 0 0 0 2.531-.508l.823.823A7.7 7.7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.72 2.641-3.238zM13.646 14.354l-12-12 .708-.708 12 12z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.72 5.88 3.5 8 3.5s3.88 1.22 5.167 2.457A13 13 0 0 1 14.827 8a13 13 0 0 1-1.66 2.043C11.88 11.28 10.12 12.5 8 12.5s-3.88-1.22-5.167-2.457A13 13 0 0 1 1.173 8" /><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" /></svg>
                    )}
                  </button>
                </div>
                <span id="errorLoginPassword" className="login-field-error" role="alert">{errores.password}</span>
              </div>

              {mensaje && (
                <div className={`login-status ${tipoMensaje}`} role="status">
                  {mensaje}
                </div>
              )}

              <button type="submit" className="login-submit" disabled={cargando}>
                {cargando ? 'Ingresando…' : 'Ingresar a la plataforma'}
              </button>

              <p className="login-register-link">
                ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
              </p>
            </form>
          </div>
        </section>

        <section className="login-image-col" aria-label="Aventura de escalada">
          <div className="login-image-overlay" />
          <img src={imagenLogin} alt="Persona escalando una montaña" className="login-image" />
        </section>
      </div>
    </main>
  )
}
