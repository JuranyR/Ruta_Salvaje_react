import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import imagenRegistro from '../../../imagenes/registro.png'
import '../styles/Registro.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-ruta-salvaje-nos6.onrender.com'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const formularioInicial = {
  nombre: '',
  correo: '',
  telefono: '',
  password: '',
  password2: '',
  contactoEmergencia: '',
  parentescoEmergencia: '',
  telefonoEmergencia: ''
}

const iconos = {
  nombre: 'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z',
  correo: 'M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z',
  telefono: 'M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z',
  password: 'M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2',
  parentesco: 'M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5'
}

function validarFormulario(datos) {
  const errores = {}
  const nombre = datos.nombre.trim()
  const correo = datos.correo.trim()
  const telefono = datos.telefono.trim()
  const contactoEmergencia = datos.contactoEmergencia.trim()
  const telefonoEmergencia = datos.telefonoEmergencia.trim()

  if (!nombre) errores.nombre = 'El campo Nombre no puede estar vacío'
  else if (/\d/.test(nombre)) errores.nombre = 'El nombre solo puede contener letras'

  if (!correo) errores.correo = 'El campo Correo no puede estar vacío'
  else if (!EMAIL_REGEX.test(correo)) errores.correo = 'Correo inválido'

  if (!telefono) errores.telefono = 'El campo Teléfono no puede estar vacío'
  else if (!/^\d+$/.test(telefono)) errores.telefono = 'Debe contener solo números'
  else if (telefono.length !== 10) errores.telefono = 'Debe tener exactamente 10 dígitos'

  if (!datos.password.trim()) errores.password = 'La contraseña es obligatoria'
  else if (datos.password.length < 8) errores.password = 'Debe tener mínimo 8 caracteres'
  else if (datos.password.trim() !== datos.password2.trim()) errores.password = 'Las contraseñas no coinciden'

  if (!contactoEmergencia) errores.contactoEmergencia = 'El contacto de emergencia es obligatorio'
  else if (/\d/.test(contactoEmergencia)) errores.contactoEmergencia = 'Solo puede contener letras'

  if (!datos.parentescoEmergencia.trim()) errores.parentescoEmergencia = 'El parentesco es obligatorio'

  if (!telefonoEmergencia) errores.telefonoEmergencia = 'El teléfono de emergencia es obligatorio'
  else if (!/^\d+$/.test(telefonoEmergencia)) errores.telefonoEmergencia = 'Debe contener solo números'
  else if (telefonoEmergencia.length !== 10) errores.telefonoEmergencia = 'Debe tener exactamente 10 dígitos'

  return errores
}

function Icono({ nombre }) {
  return (
    <svg className="registro-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d={iconos[nombre]} />
    </svg>
  )
}

function Campo({ id, nombre, etiqueta, tipo = 'text', placeholder, value, onChange, error, passwordToggle, mostrarPassword, setMostrarPassword, autoComplete }) {
  const inputType = passwordToggle ? (mostrarPassword ? 'text' : 'password') : tipo

  return (
    <div className="registro-campo">
      <label className="registro-label" htmlFor={id}>{etiqueta}</label>
      <div className={`registro-input-wrap${passwordToggle ? ' registro-input-wrap--password' : ''}`}>
        <Icono nombre={passwordToggle ? 'password' : nombre} />
        <input
          className="registro-input"
          type={inputType}
          id={id}
          name={nombre}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-error`}
        />
        {passwordToggle && (
          <button
            type="button"
            className="registro-eye-btn"
            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={mostrarPassword}
            onClick={() => setMostrarPassword(mostrar => !mostrar)}
          >
            {mostrarPassword ? '◉' : '◎'}
          </button>
        )}
      </div>
      <span className="registro-error" id={`${id}-error`} role="alert">{error}</span>
    </div>
  )
}

export default function Registro() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(formularioInicial)
  const [errores, setErrores] = useState({})
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarPassword2, setMostrarPassword2] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('')

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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          email: formData.correo.trim().toLowerCase(),
          password: formData.password.trim(),
          telefono: formData.telefono.trim(),
          nombreEmergencia: formData.contactoEmergencia.trim(),
          telefonoEmergencia: formData.telefonoEmergencia.trim(),
          parentesco: formData.parentescoEmergencia.trim()
        })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || data.message || 'No fue posible registrar el usuario')
      }

      setFormData(formularioInicial)
      setTipoMensaje('ok')
      setMensaje('Registro exitoso. Te llevaremos al inicio de sesión.')
      window.setTimeout(() => navigate('/login'), 1500)
    } catch (error) {
      setTipoMensaje('error')
      setMensaje(error.message || 'No fue posible registrar el usuario')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="registro-page">
      <div className="registro-layout">
        <section className="registro-form-col">
          <div className="registro-card">
            <h1 className="registro-title">Únete al desafío</h1>
            <p className="registro-subtitle">Completa tus datos para registrarte</p>

            <form id="registro" noValidate onSubmit={handleSubmit}>
              <span className="registro-section-label">Información personal</span>
              <Campo id="registro-nombre" nombre="nombre" etiqueta="Nombre completo" placeholder="Ej. Carlos Rodríguez" value={formData.nombre} onChange={handleChange} error={errores.nombre} autoComplete="name" />
              <Campo id="registro-correo" nombre="correo" etiqueta="Correo electrónico" tipo="email" placeholder="tucorreo@email.com" value={formData.correo} onChange={handleChange} error={errores.correo} autoComplete="email" />
              <Campo id="registro-telefono" nombre="telefono" etiqueta="Teléfono" tipo="tel" placeholder="+57 315 000 0000" value={formData.telefono} onChange={handleChange} error={errores.telefono} autoComplete="tel" />
              <Campo id="registro-password" nombre="password" etiqueta="Contraseña" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={handleChange} error={errores.password} passwordToggle mostrarPassword={mostrarPassword} setMostrarPassword={setMostrarPassword} autoComplete="new-password" />
              <Campo id="registro-password-confirmar" nombre="password2" etiqueta="Confirmar contraseña" placeholder="Repite tu contraseña" value={formData.password2} onChange={handleChange} passwordToggle mostrarPassword={mostrarPassword2} setMostrarPassword={setMostrarPassword2} autoComplete="new-password" />

              <span className="registro-section-label">Contacto de emergencia</span>
              <p className="registro-hint">En caso de accidente, utilizaremos esta información para contactar a una persona cercana.</p>

              <div className="registro-campo-row">
                <Campo id="registro-contacto-emergencia" nombre="contactoEmergencia" etiqueta="Nombre del contacto" placeholder="Nombre completo" value={formData.contactoEmergencia} onChange={handleChange} error={errores.contactoEmergencia} />
                <Campo id="registro-parentesco-emergencia" nombre="parentescoEmergencia" etiqueta="Parentesco" placeholder="Ej. Madre" value={formData.parentescoEmergencia} onChange={handleChange} error={errores.parentescoEmergencia} />
              </div>
              <Campo id="registro-telefono-emergencia" nombre="telefonoEmergencia" etiqueta="Teléfono de emergencia" tipo="tel" placeholder="+57 315 000 0000" value={formData.telefonoEmergencia} onChange={handleChange} error={errores.telefonoEmergencia} />

              {mensaje && <div className={`registro-status ${tipoMensaje}`} role="status">{mensaje}</div>}

              <button type="submit" className="registro-submit" disabled={cargando}>
                {cargando ? 'Registrando…' : 'Registrarse al desafío'}
              </button>

              <p className="registro-login-link">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
            </form>
          </div>
        </section>

        <section className="registro-image-col" aria-label="Aventura al aire libre">
          <div className="registro-image-overlay" />
          <img src={imagenRegistro} alt="Aventura al aire libre" className="registro-image" />
        </section>
      </div>
    </main>
  )
}
