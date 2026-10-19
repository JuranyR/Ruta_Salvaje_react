import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ReservasUsuario.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-ruta-salvaje-nos6.onrender.com'
const HORAS_DISPONIBLES = ['08:00', '10:00', '12:00', '14:00', '16:00']

function leerCarritoInicial() {
  const carritoGuardado = localStorage.getItem('reservas')
  if (!carritoGuardado) return { reservas: [], error: '' }

  try {
    const reservas = JSON.parse(carritoGuardado)
    if (!Array.isArray(reservas)) throw new Error('El contenido guardado no es una lista de reservas.')
    return { reservas, error: '' }
  } catch {
    return { reservas: [], error: 'No se pudo leer el carrito guardado. Quita los datos dañados para continuar.' }
  }
}

async function leerRespuesta(response, mensaje) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : {}

  if (!response.ok) {
    throw new Error(data.error || data.message || mensaje)
  }

  return data
}

function obtenerFechaMinima() {
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const anio = manana.getFullYear()
  const mes = String(manana.getMonth() + 1).padStart(2, '0')
  const dia = String(manana.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function formatoPrecio(valor) {
  return Number(valor || 0).toLocaleString('es-CO')
}

function subtotal(reserva) {
  return Number(reserva.precio || 0) * Number(reserva.personas || 1)
}

function fechaHoraReserva(reserva) {
  return `${reserva.fecha}T${reserva.hora || '10:00'}:00`
}

function formatoFechaReserva(fecha) {
  if (!fecha) return 'Sin fecha'
  const fechaValida = new Date(fecha)
  if (Number.isNaN(fechaValida.getTime())) return fecha

  return fechaValida.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function leerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuarioLogueado') || 'null')
  } catch {
    return null
  }
}

export default function ReservasUsuario() {
  const navigate = useNavigate()
  const [carritoInicial] = useState(leerCarritoInicial)
  const [reservas, setReservas] = useState(carritoInicial.reservas)
  const [usuario] = useState(leerUsuario)
  const [error, setError] = useState(carritoInicial.error)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [reservasConfirmadas, setReservasConfirmadas] = useState([])
  const [cargandoConfirmadas, setCargandoConfirmadas] = useState(true)
  const [errorConfirmadas, setErrorConfirmadas] = useState('')
  const [cancelandoId, setCancelandoId] = useState(null)
  const [resumenConfirmacion, setResumenConfirmacion] = useState(null)
  const [reservaPendienteCancelacion, setReservaPendienteCancelacion] = useState(null)
  const token = localStorage.getItem('token')
  const sesionValida = Boolean(usuario && token)

  const cargarReservasConfirmadas = useCallback(async () => {
    if (!usuario?.id) return

    setCargandoConfirmadas(true)
    setErrorConfirmadas('')
    try {
      const response = await fetch(`${API_BASE_URL}/reservas/usuario/${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const confirmadas = await leerRespuesta(response, 'No se pudieron cargar tus reservas')
      if (!Array.isArray(confirmadas)) throw new Error('La respuesta de reservas no tiene el formato esperado.')
      setReservasConfirmadas(confirmadas)
    } catch (errorCarga) {
      setErrorConfirmadas(errorCarga.message || 'No se pudieron cargar tus reservas')
    } finally {
      setCargandoConfirmadas(false)
    }
  }, [token, usuario])

  useEffect(() => {
    if (!sesionValida) {
      navigate('/login', { replace: true })
      return
    }

    cargarReservasConfirmadas()
  }, [cargarReservasConfirmadas, navigate, sesionValida])

  const actualizarCarrito = (reservasActualizadas) => {
    localStorage.setItem('reservas', JSON.stringify(reservasActualizadas))
    setReservas(reservasActualizadas)
    setError('')
    setMensaje('')
  }

  const actualizarReserva = (indice, cambios) => {
    actualizarCarrito(reservas.map((reserva, posicion) => (
      posicion === indice ? { ...reserva, ...cambios } : reserva
    )))
  }

  const confirmarReserva = async () => {
    setMensaje('')
    setError('')

    if (!reservas.length) {
      setError('Agrega al menos un plan.')
      return
    }

    const fechaMinima = obtenerFechaMinima()
    for (const reserva of reservas) {
      if (!reserva.fecha) {
        setError(`Selecciona una fecha para ${reserva.nombre}.`)
        return
      }
      if (reserva.fecha < fechaMinima) {
        setError(`La fecha de ${reserva.nombre} debe ser posterior a hoy.`)
        return
      }
      if (!reserva.hora) {
        setError(`Selecciona una hora para ${reserva.nombre}.`)
        return
      }
      if (Number(reserva.personas || 0) <= 0) {
        setError(`La cantidad de personas de ${reserva.nombre} debe ser mayor a cero.`)
        return
      }
    }

    setEnviando(true)
    try {
      for (const reserva of reservas) {
        const url = new URL(`${API_BASE_URL}/reservas/disponibilidad`)
        url.searchParams.set('planId', reserva.id)
        url.searchParams.set('fecha', fechaHoraReserva(reserva))
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const disponibilidad = await leerRespuesta(response, 'No se pudo validar disponibilidad')
        if (!disponibilidad.disponible) {
          throw new Error(`${reserva.nombre} no está disponible para ${reserva.fecha} a las ${reserva.hora}.`)
        }
      }

      for (const reserva of reservas) {
        const response = await fetch(`${API_BASE_URL}/reservas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            cantidadPersonas: Number(reserva.personas),
            fecha: fechaHoraReserva(reserva),
            usuarioId: usuario.id,
            planId: reserva.id
          })
        })
        await leerRespuesta(response, `Error al guardar ${reserva.nombre}`)
      }

      setResumenConfirmacion({
        reservas,
        total: reservas.reduce((total, reserva) => total + subtotal(reserva), 0)
      })
      localStorage.removeItem('reservas')
      setReservas([])
      setMensaje('¡Reserva confirmada con éxito!')
      await cargarReservasConfirmadas()
    } catch (errorReserva) {
      setError(errorReserva.message || 'No se pudo confirmar la reserva')
    } finally {
      setEnviando(false)
    }
  }

  const cancelarReserva = async () => {
    if (!reservaPendienteCancelacion) return

    const reserva = reservaPendienteCancelacion
    setCancelandoId(reserva.id)
    setError('')
    setMensaje('')
    try {
      const response = await fetch(
        `${API_BASE_URL}/reservas/${reserva.id}/cancelar-usuario?usuarioId=${encodeURIComponent(usuario.id)}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      await leerRespuesta(response, 'No se pudo cancelar la reserva')
      setReservaPendienteCancelacion(null)
      setMensaje('Reserva cancelada correctamente.')
      await cargarReservasConfirmadas()
    } catch (errorCancelacion) {
      setError(errorCancelacion.message || 'No se pudo cancelar la reserva')
    } finally {
      setCancelandoId(null)
    }
  }

  if (!sesionValida) return null

  const total = reservas.reduce((acumulado, reserva) => acumulado + subtotal(reserva), 0)

  return (
    <section className="reservas-page">
      <div className="page-wrapper">
        <main className="reservas-main">
          <div className="reservas-container">
            <h2 className="carrito-titulo">Carrito de Aventuras</h2>
            <p className="carrito-subtitulo">Configura fecha, hora y personas para cada plan antes de confirmar.</p>

            {error && <div className="alerta-inline visible error" role="alert">{error}</div>}
            {mensaje && <div className="alerta-inline visible ok" role="status">{mensaje}</div>}

            <div className="reservas-grid">
              <div className="reservas-col reservas-col--list">
                <div className="carrito-lista-col">
                  <div className="tabla-header" aria-hidden="true">
                    <span className="th-reserva">Reserva</span>
                    <span className="th-dato">Fecha y hora</span>
                    <span className="th-dato">Personas</span>
                    <span className="th-dato">Total</span>
                  </div>

                  <div id="lista-reservas">
                    {reservas.length === 0 ? (
                      <p className="texto-vacio text-center">No hay planes en el carrito.</p>
                    ) : reservas.map((reserva, indice) => (
                      <article className="item" key={`${reserva.id}-${indice}`}>
                        <div className="plan-info">
                          <div className="reservas-plan-resumen">
                            <img src={reserva.imagen} alt={reserva.nombre} />
                            <div>
                              <p>{reserva.nombre}</p>
                              <small>${formatoPrecio(reserva.precio)} por persona</small>
                            </div>
                          </div>
                        </div>

                        <div className="celda reserva-fecha">
                          <label className="campo-label fecha-label" htmlFor={`fecha-${indice}`}>Fecha</label>
                          <input
                            id={`fecha-${indice}`}
                            className="campo-input input-fecha"
                            type="date"
                            min={obtenerFechaMinima()}
                            value={reserva.fecha || ''}
                            onChange={event => actualizarReserva(indice, { fecha: event.target.value })}
                          />
                          <label className="campo-label hora-label" htmlFor={`hora-${indice}`}>Hora</label>
                          <select
                            id={`hora-${indice}`}
                            className="campo-input input-hora"
                            value={reserva.hora || '10:00'}
                            onChange={event => actualizarReserva(indice, { hora: event.target.value })}
                          >
                            {HORAS_DISPONIBLES.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                          </select>
                        </div>

                        <div className="celda">
                          <div className="personas-control justify-content-center">
                            <button
                              className="personas-btn"
                              type="button"
                              aria-label={`Quitar una persona de ${reserva.nombre}`}
                              onClick={() => actualizarReserva(indice, { personas: Math.max(1, Number(reserva.personas || 1) - 1) })}
                            >-</button>
                            <input
                              className="campo-input personas-input"
                              type="number"
                              min="1"
                              aria-label={`Cantidad de personas para ${reserva.nombre}`}
                              value={reserva.personas || 1}
                              onChange={event => actualizarReserva(indice, { personas: Math.max(1, Number(event.target.value || 1)) })}
                            />
                            <button
                              className="personas-btn"
                              type="button"
                              aria-label={`Agregar una persona a ${reserva.nombre}`}
                              onClick={() => actualizarReserva(indice, { personas: Number(reserva.personas || 1) + 1 })}
                            >+</button>
                          </div>
                        </div>

                        <div className="celda">
                          <strong>${formatoPrecio(subtotal(reserva))}</strong>
                          <br />
                          <button
                            className="btn-eliminar"
                            type="button"
                            onClick={() => actualizarCarrito(reservas.filter((_, posicion) => posicion !== indice))}
                          >
                            Quitar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <div className="reservas-col reservas-col--summary">
                <aside className="resumen-card">
                  <div className="resumen-total">
                    <span>Total</span>
                    <span className="total-monto">$ {formatoPrecio(total)}</span>
                  </div>
                  <div className="resumen-acciones">
                    <button className="btn-confirmar" type="button" disabled={enviando || !reservas.length} onClick={confirmarReserva}>
                      {enviando ? 'Validando...' : 'Confirmar reserva'}
                    </button>
                    <button
                      className="btn-vaciar"
                      type="button"
                      disabled={!reservas.length || enviando}
                      onClick={() => actualizarCarrito([])}
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </aside>
              </div>
            </div>

            <section className="reservas-confirmadas-wrap">
              <h3 className="reservas-confirmadas-titulo">Mis reservas confirmadas</h3>
              <p className="carrito-subtitulo">Aquí puedes revisar lo que ya quedó guardado y cancelar si lo necesitas.</p>

              <div className="reservas-confirmadas-lista">
                {cargandoConfirmadas ? (
                  <p className="texto-vacio text-center" role="status">Cargando reservas...</p>
                ) : errorConfirmadas ? (
                  <div className="alerta-inline visible error" role="alert">{errorConfirmadas}</div>
                ) : reservasConfirmadas.length === 0 ? (
                  <p className="texto-vacio text-center">Aún no tienes reservas confirmadas.</p>
                ) : reservasConfirmadas.map(reserva => {
                  const cancelada = String(reserva.estado || '').toUpperCase() === 'CANCELADA'
                  return (
                    <article className="reserva-confirmada" key={reserva.id}>
                      <div className="reserva-confirmada__body">
                        <div className="reserva-confirmada__top">
                          <span className={`estado-reserva${cancelada ? ' cancelada' : ''}`}>
                            {reserva.estado || 'CONFIRMADA'}
                          </span>
                        </div>
                        <h4 className="reserva-confirmada__nombre">{reserva.nombrePlan || 'Plan'}</h4>
                        <div className="reserva-confirmada__fila">
                          <span className="reserva-confirmada__label">Fecha</span>
                          <span className="reserva-confirmada__valor">{formatoFechaReserva(reserva.fecha)}</span>
                        </div>
                        <div className="reserva-confirmada__fila">
                          <span className="reserva-confirmada__label">Personas</span>
                          <span className="reserva-confirmada__valor">{reserva.cantidadPersonas}</span>
                        </div>
                        <div className="reserva-confirmada__fila">
                          <span className="reserva-confirmada__label">Total</span>
                          <span className="reserva-confirmada__valor reserva-confirmada__total">${formatoPrecio(reserva.total)}</span>
                        </div>
                      </div>
                      <button
                        className="btn-cancelar-reserva"
                        type="button"
                        disabled={cancelada || cancelandoId === reserva.id}
                        onClick={() => setReservaPendienteCancelacion(reserva)}
                      >
                        {cancelandoId === reserva.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>
        </main>
      </div>

      {resumenConfirmacion && (
        <div className="rs-modal-backdrop" role="presentation" onMouseDown={event => {
          if (event.target === event.currentTarget) setResumenConfirmacion(null)
        }}>
          <section className="rs-modal-content" role="dialog" aria-modal="true" aria-labelledby="reservas-modal-title">
            <header className="rs-modal-header">
              <h2 className="rs-modal-title" id="reservas-modal-title">¡Reserva confirmada!</h2>
            </header>
            <div className="rs-modal-body">
              <p className="rs-modal-seccion-label">Resumen de tu aventura</p>
              {resumenConfirmacion.reservas.map((reserva, indice) => (
                <div className="rs-modal-item" key={`${reserva.id}-${indice}`}>
                  <div>
                    <p className="rs-modal-item-nombre">{reserva.nombre}</p>
                    <p className="rs-modal-item-detalle">{reserva.personas} personas · {reserva.fecha} · {reserva.hora}</p>
                  </div>
                </div>
              ))}
              <div className="rs-modal-fila">
                <span className="rs-modal-key">A nombre de</span>
                <span className="rs-modal-val-naranja">{usuario.nombre || usuario.email || '—'}</span>
              </div>
              <div className="rs-modal-fila">
                <span className="rs-modal-key">Total pagado</span>
                <span className="rs-modal-total">${formatoPrecio(resumenConfirmacion.total)}</span>
              </div>
            </div>
            <footer className="rs-modal-footer">
              <button className="btn-confirmar" type="button" onClick={() => setResumenConfirmacion(null)}>Cerrar</button>
            </footer>
          </section>
        </div>
      )}

      {reservaPendienteCancelacion && (
        <div
          className="rs-modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !cancelandoId) setReservaPendienteCancelacion(null)
          }}
        >
          <section className="rs-modal-content rs-cancel-modal" role="alertdialog" aria-modal="true" aria-labelledby="cancelar-reserva-titulo" aria-describedby="cancelar-reserva-mensaje">
            <header className="rs-modal-header">
              <h2 className="rs-modal-title" id="cancelar-reserva-titulo">Cancelar reserva</h2>
            </header>
            <div className="rs-modal-body">
              <p className="rs-cancel-modal-plan">{reservaPendienteCancelacion.nombrePlan || 'Esta aventura'}</p>
              <p className="rs-cancel-modal-message" id="cancelar-reserva-mensaje">
                Esta reserva quedará marcada como cancelada. ¿Deseas continuar?
              </p>
            </div>
            <footer className="rs-modal-footer rs-cancel-modal-actions">
              <button
                className="btn-vaciar"
                type="button"
                disabled={Boolean(cancelandoId)}
                onClick={() => setReservaPendienteCancelacion(null)}
              >
                Volver
              </button>
              <button
                className="btn-confirmar btn-confirmar-cancelacion"
                type="button"
                disabled={Boolean(cancelandoId)}
                onClick={cancelarReserva}
              >
                {cancelandoId ? 'Cancelando...' : 'Cancelar reserva'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  )
}
