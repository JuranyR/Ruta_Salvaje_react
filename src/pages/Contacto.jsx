import { useState } from 'react'
import imagenContacto from '../../../imagenes/contacto/imagen-contacto.png'
import '../styles/Contacto.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-ruta-salvaje-nos6.onrender.com'

const formularioInicial = {
  nombre: '',
  correo: '',
  telefono: '',
  mensaje: ''
}

const iconos = {
  telefono: 'M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z',
  correo: 'M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z',
  ubicacion: 'M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6',
  nombre: 'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z',
  mensaje: 'M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z'
}

function Icono({ nombre, className = '' }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d={iconos[nombre]} />
    </svg>
  )
}

function validarFormulario(datos) {
  const errores = {}
  const nombre = datos.nombre.trim()
  const correo = datos.correo.trim()
  const telefono = datos.telefono.trim()

  if (!nombre) {
    errores.nombre = 'El campo Nombre no puede estar vacío'
  } else if (/\d/.test(nombre)) {
    errores.nombre = 'El nombre solo puede contener letras'
  }

  if (!correo) {
    errores.correo = 'El campo Correo no puede estar vacío'
  } else if (!correo.includes('@')) {
    errores.correo = 'El correo debe incluir un @'
  }

  if (!telefono) {
    errores.telefono = 'El campo Teléfono no puede estar vacío'
  } else if (!/^\d+$/.test(telefono)) {
    errores.telefono = 'Debe contener solo números'
  } else if (telefono.length !== 10) {
    errores.telefono = 'El número debe tener exactamente 10 dígitos'
  }

  if (!datos.mensaje.trim()) {
    errores.mensaje = 'El campo Mensaje no puede estar vacío'
  }

  return errores
}

export default function Contacto() {
  const [formData, setFormData] = useState(formularioInicial)
  const [errores, setErrores] = useState({})
  const [mensajeEstado, setMensajeEstado] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(datos => ({ ...datos, [name]: value }))
    setErrores(actuales => ({ ...actuales, [name]: '' }))
    setMensajeEstado('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const erroresFormulario = validarFormulario(formData)
    setErrores(erroresFormulario)
    setMensajeEstado('')

    if (Object.keys(erroresFormulario).length > 0) return

    setEnviando(true)
    try {
      const response = await fetch(`${API_BASE_URL}/contactos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          email: formData.correo.trim().toLowerCase(),
          telefono: formData.telefono.trim(),
          mensaje: formData.mensaje.trim()
        })
      })

      if (!response.ok) {
        const datosError = await response.json().catch(() => ({}))
        throw new Error(datosError.error || datosError.message || 'No se pudo enviar el mensaje. Inténtalo de nuevo.')
      }

      setFormData(formularioInicial)
      setErrores({})
      setMensajeEstado('success')
    } catch (error) {
      setMensajeEstado(error.message || 'No se pudo enviar el mensaje. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="contacto-page" style={{ '--contacto-imagen-fondo': `url("${imagenContacto}")` }}>
      <div className="contacto-wrapper">
        <header className="contacto-hero">
          <h1 className="contacto-heading">Contáctanos</h1>
          <p className="contacto-subheading">
            ¿Tienes alguna pregunta? Nos encantaría saber de ti.
            Envíanos un mensaje y te responderemos lo antes posible.
          </p>
        </header>

        <div className="contacto-grid">
          <section className="info-panel">
            <h2 className="info-panel__title">Nuestro contacto</h2>

            <div className="info-row">
              <div className="info-row__icon"><Icono nombre="telefono" /></div>
              <div className="info-row__body">
                <span className="info-row__label">Llámanos</span>
                <a className="info-row__value" href="tel:+573151234567">+57 315 123 4567</a>
                <span className="info-row__hint">Lun-Dom · 8am – 6pm</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-row__icon"><Icono nombre="correo" /></div>
              <div className="info-row__body">
                <span className="info-row__label">Escríbenos</span>
                <a className="info-row__value" href="mailto:rutasalvaje.admin@gmail.com">rutasalvaje.admin@gmail.com</a>
              </div>
            </div>

            <div className="info-row">
              <div className="info-row__icon"><Icono nombre="ubicacion" /></div>
              <div className="info-row__body">
                <span className="info-row__label">Encuéntranos</span>
                <span className="info-row__value">Calle 93 #12-34, Bogotá<br />Colombia</span>
              </div>
            </div>

            <div className="info-divider" />

            <div className="info-social">
              <span className="info-social__label">Síguenos</span>
              <div className="info-social__icons">
                <a href="https://www.facebook.com/?locale=es_LA" target="_blank" rel="noreferrer" className="social-btn" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58-.002-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" /></svg>
                </a>
                <a href="https://www.instagram.com/rutasalvaje.admin/" target="_blank" rel="noreferrer" className="social-btn" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" /></svg>
                </a>
                <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" /></svg>
                </a>
              </div>
            </div>
          </section>

          <section className="form-panel">
            <h2 className="form-panel__title">Tu aventura empieza aquí</h2>
            <form id="contacto" noValidate onSubmit={handleSubmit}>
              <div className="campo">
                <label className="campo__label" htmlFor="nombre">Nombre completo</label>
                <div className="campo__input-wrap">
                  <Icono nombre="nombre" className="campo__icon" />
                  <input className="campo__input" type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. María García" aria-invalid={Boolean(errores.nombre)} aria-describedby="errorNombre" />
                </div>
                <span id="errorNombre" className="campo__error" role="alert">{errores.nombre}</span>
              </div>

              <div className="campo">
                <label className="campo__label" htmlFor="correo">Correo electrónico</label>
                <div className="campo__input-wrap">
                  <Icono nombre="correo" className="campo__icon" />
                  <input className="campo__input" type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} placeholder="tucorreo@email.com" aria-invalid={Boolean(errores.correo)} aria-describedby="errorCorreo" />
                </div>
                <span id="errorCorreo" className="campo__error" role="alert">{errores.correo}</span>
              </div>

              <div className="campo">
                <label className="campo__label" htmlFor="telefono">Teléfono</label>
                <div className="campo__input-wrap">
                  <Icono nombre="telefono" className="campo__icon" />
                  <input className="campo__input" type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+57 315 000 0000" aria-invalid={Boolean(errores.telefono)} aria-describedby="errorTelefono" />
                </div>
                <span id="errorTelefono" className="campo__error" role="alert">{errores.telefono}</span>
              </div>

              <div className="campo">
                <label className="campo__label" htmlFor="mensaje">Mensaje</label>
                <div className="campo__input-wrap">
                  <Icono nombre="mensaje" className="campo__icon campo__icon--textarea" />
                  <textarea className="campo__input campo__textarea" id="mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} placeholder="Cuéntanos sobre tu aventura soñada..." aria-invalid={Boolean(errores.mensaje)} aria-describedby="errorMensaje" />
                </div>
                <span id="errorMensaje" className="campo__error" role="alert">{errores.mensaje}</span>
              </div>

              {mensajeEstado && (
                <div className={`alerta-contacto ${mensajeEstado === 'success' ? 'alerta-contacto--exito' : 'alerta-contacto--error'}`} role="status">
                  {mensajeEstado === 'success' ? '¡Mensaje enviado! Te contactaremos muy pronto' : mensajeEstado}
                </div>
              )}

              <button type="submit" className="btn-enviar" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar mensaje'}
                {!enviando && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                  </svg>
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
