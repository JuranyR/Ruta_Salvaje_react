import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import imagenAgua from '../assets/planes/Plan-AguayRoca.png'
import imagenBosque from '../assets/planes/Plan-AventuraEnElBosque.png'
import imagenColgantes from '../assets/planes/Plan-CaminosColgantes1.png'
import imagenDesafio from '../assets/planes/Plan-Desafios.png'
import imagenNubes from '../assets/planes/Plan-ExploradordelasNubes.png'
import imagenSelva from '../assets/planes/Plan-MisionSecretaOperacionSelva.png'
import imagenVertigo from '../assets/planes/Plan-RutaDelVertigo1.png'
import imagenSalto from '../assets/planes/Plan-SaltoDelCaminante.png'
import imagenHorizonte from '../assets/planes/Plan-TravesiaDelHorizonte.png'
import '../styles/Planes.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-ruta-salvaje-nos6.onrender.com'

const PLAN_IMAGES = {
  vertigo: imagenVertigo,
  extremo: imagenVertigo,
  familiar: imagenColgantes,
  desafio: imagenDesafio,
  nubes: imagenNubes,
  secreta: imagenSelva,
  selva: imagenSelva,
  agua: imagenAgua,
  acuatica: imagenAgua,
  roca: imagenAgua,
  horizonte: imagenHorizonte,
  colgantes: imagenColgantes,
  supervivencia: imagenSelva,
  bosque: imagenBosque,
  salto: imagenSalto
}

function imagenPlan(plan) {
  const nombre = String(plan.nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const clave = Object.keys(PLAN_IMAGES).find(key => nombre.includes(key))
  return PLAN_IMAGES[clave] || plan.imagen || imagenBosque
}

function precioPlan(plan) {
  const precio = Number(plan.precio || 0)
  const descuento = Number(plan.descuentoPorcentaje || 0)
  return Number(plan.precioFinal ?? precio - precio * descuento / 100)
}

function formatoPrecio(valor) {
  return Number(valor || 0).toLocaleString('es-CO')
}

function formatoEtiqueta(valor, predeterminado) {
  const texto = String(valor || predeterminado).toLowerCase()
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function estrellas(calificacion = 0) {
  const cantidad = Math.max(0, Math.min(5, Math.round(Number(calificacion || 0))))
  return `${'★'.repeat(cantidad)}${'☆'.repeat(5 - cantidad)}`
}

async function leerRespuesta(response, mensaje) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || data.message || mensaje)
  }
  return response.json()
}

async function cargarResenas() {
  try {
    const response = await fetch(`${API_BASE_URL}/resenas`)
    return await leerRespuesta(response, 'No se pudieron cargar las reseñas')
  } catch {
    return []
  }
}

export default function Planes() {
  const navigate = useNavigate()
  const [planes, setPlanes] = useState([])
  const [resenas, setResenas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [planActivo, setPlanActivo] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [avisoInicio, setAvisoInicio] = useState(false)
  const [avisoCarrito, setAvisoCarrito] = useState(false)
  const [calificacion, setCalificacion] = useState('5')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let activa = true

    async function cargarPlanes() {
      setCargando(true)
      setError('')

      try {
        const response = await fetch(`${API_BASE_URL}/planes`)
        const datos = await leerRespuesta(response, 'No se pudieron cargar los planes')
        const planesDisponibles = datos.filter(plan => plan.estado !== false)
        const resenasCargadas = await cargarResenas()

        if (activa) {
          setPlanes(planesDisponibles)
          setResenas(resenasCargadas)
        }
      } catch (errorCarga) {
        if (activa) setError(errorCarga.message || 'No se pudieron cargar los planes')
      } finally {
        if (activa) setCargando(false)
      }
    }

    cargarPlanes()
    return () => { activa = false }
  }, [intento])

  useEffect(() => {
    if (!planActivo) return

    const cerrarConEscape = (event) => {
      if (event.key === 'Escape') setPlanActivo(null)
    }

    document.addEventListener('keydown', cerrarConEscape)
    return () => document.removeEventListener('keydown', cerrarConEscape)
  }, [planActivo])

  useEffect(() => {
    if (!avisoInicio) return

    const timeout = window.setTimeout(() => {
      navigate('/login', { state: { redirectTo: '/reservas' } })
    }, 1800)
    return () => window.clearTimeout(timeout)
  }, [avisoInicio, navigate])

  useEffect(() => {
    if (!avisoCarrito) return

    const timeout = window.setTimeout(() => setAvisoCarrito(false), 5000)
    return () => window.clearTimeout(timeout)
  }, [avisoCarrito])

  const resenasPlan = planActivo
    ? resenas.filter(resena => String(resena.planId) === String(planActivo.id))
    : []

  const reservarPlan = (plan) => {
    let usuario
    let token
    try {
      usuario = JSON.parse(localStorage.getItem('usuarioLogueado'))
      token = localStorage.getItem('token')
    } catch {
      usuario = null
      token = null
    }

    let reservas
    try {
      reservas = JSON.parse(localStorage.getItem('reservas') || '[]')
      if (!Array.isArray(reservas)) throw new Error('El carrito guardado no tiene un formato válido.')
    } catch {
      setMensaje('No se pudo leer el carrito guardado. Inténtalo de nuevo.')
      return
    }

    const yaEstaEnCarrito = reservas.some(reserva => String(reserva.id) === String(plan.id))
    if (!usuario || !token) {
      if (!yaEstaEnCarrito) {
        reservas.push({
          id: plan.id,
          nombre: plan.nombre,
          descripcion: plan.descripcion,
          precio: precioPlan(plan),
          precioBase: plan.precio,
          descuentoPorcentaje: plan.descuentoPorcentaje || 0,
          imagen: imagenPlan(plan),
          personas: 1,
          fecha: '',
          hora: '10:00'
        })
        localStorage.setItem('reservas', JSON.stringify(reservas))
      }
      setAvisoInicio(true)
      return
    }

    if (yaEstaEnCarrito) {
      setMensaje('')
      setAvisoCarrito(true)
      return
    }

    reservas.push({
      id: plan.id,
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio: precioPlan(plan),
      precioBase: plan.precio,
      descuentoPorcentaje: plan.descuentoPorcentaje || 0,
      imagen: imagenPlan(plan),
      personas: 1,
      fecha: '',
      hora: '10:00'
    })
    localStorage.setItem('reservas', JSON.stringify(reservas))
    navigate('/reservas')
  }

  const publicarResena = async (event) => {
    event.preventDefault()
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || 'null')
    const token = localStorage.getItem('token')

    if (!usuario || !token) {
      navigate('/login')
      return
    }

    setEnviando(true)
    setMensaje('')
    try {
      const response = await fetch(`${API_BASE_URL}/resenas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          comentario: comentario.trim(),
          calificacion: Number(calificacion),
          usuarioId: usuario.id,
          planId: planActivo.id
        })
      })
      await leerRespuesta(response, 'No se pudo publicar la reseña')
      setResenas(await cargarResenas())
      setComentario('')
      setCalificacion('5')
      setMensaje('¡Reseña publicada correctamente!')
    } catch (errorResena) {
      setMensaje(errorResena.message || 'No se pudo publicar la reseña')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="planes-page">
      <h1 className="planes-title">Nuestros Planes</h1>

      {avisoInicio && (
        <div className="planes-auth-toast" role="alert">
          <p>Para reservar una aventura, primero debes iniciar sesión o registrarte.</p>
          <button type="button" onClick={() => navigate('/login', { state: { redirectTo: '/reservas' } })}>
            Iniciar sesión
          </button>
        </div>
      )}

      {avisoCarrito && (
        <div className="planes-cart-toast" role="status" aria-live="polite">
          <span className="planes-cart-toast-icon" aria-hidden="true">!</span>
          <p>Este plan ya está en tu carrito.</p>
          <button type="button" className="planes-cart-toast-action" onClick={() => navigate('/reservas')}>
            Ver carrito
          </button>
          <button
            type="button"
            className="planes-cart-toast-close"
            aria-label="Cerrar aviso"
            onClick={() => setAvisoCarrito(false)}
          >
            ×
          </button>
        </div>
      )}

      {mensaje && <p className="planes-notice" role="status">{mensaje}</p>}

      {cargando && <p className="planes-state" role="status">Cargando planes...</p>}

      {!cargando && error && (
        <div className="planes-state planes-error" role="alert">
          <p>{error}</p>
          <button type="button" className="planes-retry" onClick={() => setIntento(valor => valor + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && planes.length === 0 && (
        <p className="planes-state">Aún no tenemos planes publicados.</p>
      )}

      {!cargando && !error && planes.length > 0 && (
        <div className="planes-catalog-grid">
          {planes.map(plan => {
            const resenasPlanCard = resenas.filter(resena => String(resena.planId) === String(plan.id))
            const promedio = resenasPlanCard.length
              ? resenasPlanCard.reduce((total, resena) => total + Number(resena.calificacion || 0), 0) / resenasPlanCard.length
              : 0
            const descuento = Number(plan.descuentoPorcentaje || 0)

            return (
              <article className="catalog-card" key={plan.id}>
                <img className="catalog-image" src={imagenPlan(plan)} alt={plan.nombre} />
                <div className="catalog-card-body">
                  <h2 className="catalog-card-title">{plan.nombre}</h2>
                  <p className="catalog-meta">
                    {formatoEtiqueta(plan.tipoPlan || plan.categoria, 'Aventura')} | {formatoEtiqueta(plan.dificultad, 'Media')}
                  </p>
                  <p className="catalog-price"><b>Precio:</b> ${formatoPrecio(precioPlan(plan))}</p>
                  {descuento > 0 && (
                    <p className="catalog-discount">
                      <del>${formatoPrecio(plan.precio)}</del> {descuento}% off
                    </p>
                  )}
                  {resenasPlanCard.length ? (
                    <p className="catalog-review-summary">
                      <span aria-label={`${promedio.toFixed(1)} de 5 estrellas`}>{estrellas(promedio)}</span>
                      {' '}{promedio.toFixed(1)} ({resenasPlanCard.length})
                    </p>
                  ) : (
                    <p className="catalog-review-summary">Sin reseñas todavía</p>
                  )}
                  <div className="catalog-card-actions">
                    <button type="button" className="btn-rs-primary" onClick={() => reservarPlan(plan)}>
                      Reservar
                    </button>
                    <button type="button" className="btn-rs-outline" onClick={() => { setPlanActivo(plan); setMensaje('') }}>
                      Ver más
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {planActivo && (
        <div className="catalog-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setPlanActivo(null) }}>
          <section className="catalog-modal" role="dialog" aria-modal="true" aria-labelledby="catalog-modal-title">
            <button type="button" className="catalog-modal-close" aria-label="Cerrar detalle" onClick={() => setPlanActivo(null)}>×</button>
            <div className="catalog-modal-top">
              <img src={imagenPlan(planActivo)} alt={planActivo.nombre} />
              <div className="catalog-modal-info">
                <h2 id="catalog-modal-title">{planActivo.nombre}</h2>
                <p>{planActivo.descripcion}</p>
                <button type="button" className="btn-rs-primary" onClick={() => reservarPlan(planActivo)}>Reservar</button>
              </div>
            </div>
            <div className="catalog-modal-price">
              <span>Precio</span>
              <strong>${formatoPrecio(precioPlan(planActivo))}</strong>
            </div>
            <section className="catalog-reviews">
              <h3>Reseñas</h3>
              <p className="catalog-reviews-subtitle">Comparte tu experiencia del plan</p>
              <div className="catalog-review-list">
                {resenasPlan.length ? resenasPlan.map(resena => (
                  <article className="catalog-review" key={resena.id || `${resena.planId}-${resena.nombreUsuario}-${resena.comentario}`}>
                    <header><strong>{resena.nombreUsuario || 'Usuario'}</strong><span>{estrellas(resena.calificacion)}</span></header>
                    <p>{resena.comentario}</p>
                  </article>
                )) : <p className="catalog-no-reviews">Este plan aún no tiene reseñas. Sé el primero en contar tu experiencia.</p>}
              </div>

              {localStorage.getItem('token') ? (
                <form className="catalog-review-form" onSubmit={publicarResena}>
                  <label htmlFor="review-rating">Calificación</label>
                  <select id="review-rating" value={calificacion} onChange={event => setCalificacion(event.target.value)}>
                    <option value="5">★★★★★ — Excelente</option>
                    <option value="4">★★★★☆ — Muy bueno</option>
                    <option value="3">★★★☆☆ — Regular</option>
                    <option value="2">★★☆☆☆ — Malo</option>
                    <option value="1">★☆☆☆☆ — Muy malo</option>
                  </select>
                  <label htmlFor="review-comment">Tu comentario</label>
                  <input id="review-comment" maxLength="240" placeholder="Escribe una reseña breve..." value={comentario} onChange={event => setComentario(event.target.value)} required />
                  <button className="btn-rs-primary" type="submit" disabled={enviando}>{enviando ? 'Publicando...' : 'Publicar reseña'}</button>
                  {mensaje && <p className="catalog-form-message" role="status">{mensaje}</p>}
                </form>
              ) : (
                <div className="catalog-login-prompt">
                  <p>¿Viviste esta aventura?</p>
                  <Link className="btn-rs-primary" to="/login">Inicia sesión para dejar tu reseña</Link>
                </div>
              )}
            </section>
          </section>
        </div>
      )}
    </div>
  )
}
