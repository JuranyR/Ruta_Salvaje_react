import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminNavigation from '../components/AdminNavigation'
import '../styles/ReservasAdmin.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-ruta-salvaje-nos6.onrender.com'
const HORAS_DISPONIBLES = ['08:00', '10:00', '12:00']
const FORMULARIO_INICIAL = {
  nombre: '',
  email: '',
  planId: '',
  personas: '1',
  fecha: '',
  hora: '10:00'
}

async function leerRespuesta(response, mensaje) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : {}
  if (!response.ok) throw new Error(data.error || data.message || mensaje)
  return data
}

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function categoriaPlan(plan) {
  return String(plan?.tipoPlan || plan?.categoria || 'AVENTURA').toUpperCase()
}

function dificultadPlan(plan) {
  return String(plan?.dificultad || 'MEDIA').toUpperCase()
}

function precioPlan(plan) {
  const precio = Number(plan?.precio || 0)
  const descuento = Number(plan?.descuentoPorcentaje || 0)
  return Number(plan?.precioFinal ?? precio - precio * descuento / 100)
}

function formatoPrecio(valor) {
  return Number(valor || 0).toLocaleString('es-CO')
}

function formatoEnum(valor) {
  const texto = String(valor || 'Sin especificar').toLowerCase()
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function formatoFecha(fecha) {
  if (!fecha) return 'Sin fecha'
  const fechaValida = new Date(fecha)
  if (Number.isNaN(fechaValida.getTime())) return String(fecha)
  return fechaValida.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function fechaMinima() {
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const anio = manana.getFullYear()
  const mes = String(manana.getMonth() + 1).padStart(2, '0')
  const dia = String(manana.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function claseEstado(estado) {
  const normalizado = normalizarEstado(estado)
  if (normalizado === 'AGENDADA') return 'is-agendada'
  if (normalizado === 'CANCELADA') return 'is-cancelada'
  return 'is-pendiente'
}

function normalizarEstado(estado) {
  return String(estado || 'PENDIENTE').trim().toUpperCase()
}

function etiquetaEstado(estado) {
  const texto = String(estado || 'PENDIENTE').trim().toLocaleLowerCase('es')
  return texto.charAt(0).toLocaleUpperCase('es') + texto.slice(1)
}

export default function ReservasAdmin() {
  const token = localStorage.getItem('token')
  const [reservas, setReservas] = useState([])
  const [planes, setPlanes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroDificultad, setFiltroDificultad] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [reservaPendiente, setReservaPendiente] = useState(null)
  const [cancelando, setCancelando] = useState(false)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [usuariosResponse, planesResponse, reservasResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/usuarios`, { headers }),
        fetch(`${API_BASE_URL}/planes`, { headers }),
        fetch(`${API_BASE_URL}/reservas`, { headers })
      ])
      const [usuariosData, planesData, reservasData] = await Promise.all([
        leerRespuesta(usuariosResponse, 'No se pudieron cargar los usuarios'),
        leerRespuesta(planesResponse, 'No se pudieron cargar los planes'),
        leerRespuesta(reservasResponse, 'No se pudieron cargar las reservas')
      ])
      if (!Array.isArray(usuariosData) || !Array.isArray(planesData) || !Array.isArray(reservasData)) {
        throw new Error('El servidor devolvió datos de reservas con un formato inesperado.')
      }
      setUsuarios(usuariosData)
      setPlanes(planesData.filter(plan => plan.estado !== false))
      setReservas(reservasData)
    } catch (errorCarga) {
      setError(errorCarga.message || 'No se pudieron cargar las reservas')
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const planDeReserva = useCallback((reserva) => {
    const planId = reserva.planId || reserva.idPlan
    return planes.find(plan => String(plan.id) === String(planId))
      || planes.find(plan => normalizarTexto(plan.nombre) === normalizarTexto(reserva.nombrePlan))
  }, [planes])

  const reservasFiltradas = useMemo(() => {
    const consulta = normalizarTexto(busqueda)
    return reservas.filter(reserva => {
      const plan = planDeReserva(reserva)
      const categoria = categoriaPlan(plan)
      const dificultad = dificultadPlan(plan)
      const estado = normalizarEstado(reserva.estado)
      const texto = normalizarTexto([
        reserva.nombreUsuario,
        reserva.nombrePlan,
        estado,
        categoria,
        dificultad
      ].join(' '))
      return texto.includes(consulta)
        && (!filtroCategoria || categoria === filtroCategoria)
        && (!filtroDificultad || dificultad === filtroDificultad)
        && (!filtroEstado || estado === normalizarEstado(filtroEstado))
    })
  }, [busqueda, filtroCategoria, filtroDificultad, filtroEstado, planDeReserva, reservas])

  const estadosDisponibles = useMemo(() => {
    const estados = new Set(reservas.map(reserva => normalizarEstado(reserva.estado)))
    const estadosPrincipales = ['PENDIENTE', 'AGENDADA', 'CANCELADA']
    return [
      ...estadosPrincipales,
      ...[...estados].filter(estado => !estadosPrincipales.includes(estado)).sort()
    ]
  }, [reservas])

  const cambiarFormulario = event => {
    const { name, value } = event.target
    setFormulario(actual => ({ ...actual, [name]: value }))
  }

  const planSeleccionado = planes.find(plan => String(plan.id) === String(formulario.planId))
  const precioUnitario = precioPlan(planSeleccionado)
  const totalManual = precioUnitario * Number(formulario.personas || 1)

  const crearReserva = async event => {
    event.preventDefault()
    setError('')
    setMensaje('')

    const nombre = formulario.nombre.trim()
    const email = formulario.email.trim().toLowerCase()
    const personas = Number(formulario.personas)
    if (!nombre) {
      setError('Escribe el nombre del cliente.')
      return
    }
    if (!email) {
      setError('Escribe el correo del cliente.')
      return
    }
    if (!formulario.planId) {
      setError('Selecciona un plan.')
      return
    }
    if (!formulario.fecha || formulario.fecha < fechaMinima()) {
      setError('La fecha debe ser posterior a hoy.')
      return
    }
    if (!Number.isInteger(personas) || personas < 1) {
      setError('La cantidad de personas debe ser al menos 1.')
      return
    }

    setGuardando(true)
    try {
      const fecha = `${formulario.fecha}T${formulario.hora}:00`
      const url = new URL(`${API_BASE_URL}/reservas/disponibilidad`)
      url.searchParams.set('planId', formulario.planId)
      url.searchParams.set('fecha', fecha)
      const headers = { Authorization: `Bearer ${token}` }
      const disponibilidadResponse = await fetch(url, { headers })
      const disponibilidad = await leerRespuesta(disponibilidadResponse, 'No se pudo validar disponibilidad')
      if (!disponibilidad.disponible) {
        throw new Error('Ese plan ya está reservado para esa fecha y hora.')
      }

      let cliente = usuarios.find(usuario => String(usuario.email || '').toLowerCase() === email)
      if (!cliente) {
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            email,
            password: 'Reserva123!',
            confirmarPassword: 'Reserva123!',
            telefono: '3000000000',
            nombreEmergencia: 'Contacto por confirmar',
            telefonoEmergencia: '3000000000',
            parentesco: 'Por confirmar'
          })
        })
        cliente = await leerRespuesta(response, 'No se pudo crear el cliente')
        setUsuarios(actuales => [...actuales, cliente])
      }

      const reservaResponse = await fetch(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: Number(cliente.id),
          planId: Number(formulario.planId),
          cantidadPersonas: personas,
          fecha
        })
      })
      await leerRespuesta(reservaResponse, 'No se pudo crear la reserva')
      setFormulario(FORMULARIO_INICIAL)
      setMostrarFormulario(false)
      setMensaje('Reserva creada correctamente.')
      await cargarDatos()
    } catch (errorCreacion) {
      setError(errorCreacion.message || 'No se pudo crear la reserva')
    } finally {
      setGuardando(false)
    }
  }

  const cancelarReserva = async () => {
    if (!reservaPendiente) return
    setCancelando(true)
    setError('')
    setMensaje('')
    try {
      const response = await fetch(`${API_BASE_URL}/reservas/${reservaPendiente.id}/cancelar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      await leerRespuesta(response, 'No se pudo cancelar la reserva')
      setReservaPendiente(null)
      setMensaje('Reserva cancelada correctamente.')
      await cargarDatos()
    } catch (errorCancelacion) {
      setError(errorCancelacion.message || 'No se pudo cancelar la reserva')
    } finally {
      setCancelando(false)
    }
  }

  const limpiarFiltros = () => {
    setFiltroCategoria('')
    setFiltroDificultad('')
    setFiltroEstado('')
    setBusqueda('')
  }

  return (
    <section className="admin-reservas-page">
      <header className="admin-reservas-header">
        <AdminNavigation />
        <div className="admin-reservas-toolbar">
          <input
            type="search"
            value={busqueda}
            onChange={event => setBusqueda(event.target.value)}
            placeholder="Buscar reserva..."
            aria-label="Buscar reserva"
          />
          <select value={filtroCategoria} onChange={event => setFiltroCategoria(event.target.value)} aria-label="Filtrar por categoría">
            <option value="">Todas las categorías</option>
            <option value="EXTREMO">Extremo</option>
            <option value="FAMILIAR">Familiar</option>
            <option value="ROMANTICO">Romántico</option>
            <option value="AVENTURA">Aventura</option>
          </select>
          <select value={filtroDificultad} onChange={event => setFiltroDificultad(event.target.value)} aria-label="Filtrar por dificultad">
            <option value="">Todas las dificultades</option>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </select>
          <select value={filtroEstado} onChange={event => setFiltroEstado(event.target.value)} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {estadosDisponibles.map(estado => (
              <option key={estado} value={estado}>{etiquetaEstado(estado)}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="admin-reservas-content">
        <div className="admin-reservas-title-row">
          <div>
            <h1>Reservas</h1>
            <p>Consulta, crea y cancela reservas reales.</p>
          </div>
          <button type="button" className="admin-reservas-add" onClick={() => {
            setError('')
            setMensaje('')
            setMostrarFormulario(abierto => !abierto)
          }}>
            {mostrarFormulario ? 'Cerrar formulario' : '+ Crear reserva manual'}
          </button>
        </div>

        {error && <div className="admin-reservas-alert is-error" role="alert">{error}</div>}
        {mensaje && <div className="admin-reservas-alert is-success" role="status">{mensaje}</div>}

        {mostrarFormulario && (
          <form className="admin-reservas-form" onSubmit={crearReserva}>
            <div className="admin-reservas-form-heading">
              <h2>Nueva reserva</h2>
              <p>Ingresa los datos del cliente y la aventura.</p>
            </div>
            <div className="admin-reservas-form-grid">
              <label>Nombre del cliente
                <input name="nombre" value={formulario.nombre} onChange={cambiarFormulario} placeholder="Nombre completo" required />
              </label>
              <label>Correo del cliente
                <input name="email" type="email" value={formulario.email} onChange={cambiarFormulario} placeholder="cliente@correo.com" required />
              </label>
              <label className="admin-reservas-form-wide">Plan
                <select name="planId" value={formulario.planId} onChange={cambiarFormulario} required>
                  <option value="">Seleccionar plan</option>
                  {planes.map(plan => <option key={plan.id} value={plan.id}>{plan.nombre} — ${formatoPrecio(precioPlan(plan))}</option>)}
                </select>
              </label>
              <label>Personas
                <input name="personas" type="number" min="1" value={formulario.personas} onChange={cambiarFormulario} required />
              </label>
              <label>Fecha
                <input name="fecha" type="date" min={fechaMinima()} value={formulario.fecha} onChange={cambiarFormulario} required />
              </label>
              <label>Hora
                <select name="hora" value={formulario.hora} onChange={cambiarFormulario}>
                  {HORAS_DISPONIBLES.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                </select>
              </label>
              <div className="admin-reservas-calculo">
                <span>Dificultad <strong>{formatoEnum(dificultadPlan(planSeleccionado))}</strong></span>
                <span>Precio / persona <strong>${formatoPrecio(precioUnitario)}</strong></span>
                <span>Total <strong>${formatoPrecio(totalManual)}</strong></span>
              </div>
            </div>
            <div className="admin-reservas-form-actions">
              <button className="admin-reservas-add" type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar reserva'}
              </button>
              <button className="admin-reservas-cancel-form" type="button" onClick={() => setMostrarFormulario(false)} disabled={guardando}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {cargando ? (
          <p className="admin-reservas-state" role="status">Cargando reservas...</p>
        ) : reservasFiltradas.length === 0 ? (
          <p className="admin-reservas-state">No se encontraron reservas.</p>
        ) : (
          <div className="admin-reservas-grid">
            {reservasFiltradas.map(reserva => {
              const plan = planDeReserva(reserva)
              const estado = String(reserva.estado || 'PENDIENTE').toUpperCase()
              return (
                <article className="admin-reserva-card" key={reserva.id}>
                  <div className="admin-reserva-card-top">
                    <span className={`admin-reserva-status ${claseEstado(estado)}`}>{formatoEnum(estado)}</span>
                  </div>
                  <div className="admin-reserva-card-body">
                    <h2>{reserva.nombrePlan || 'Plan sin nombre'}</h2>
                    <p><span>Categoría</span><strong>{formatoEnum(categoriaPlan(plan))}</strong></p>
                    <p><span>Dificultad</span><strong>{formatoEnum(dificultadPlan(plan))}</strong></p>
                    <p><span>Cliente</span><strong>{reserva.nombreUsuario || 'Sin usuario'}</strong></p>
                    <p><span>Personas</span><strong>{reserva.cantidadPersonas || 0}</strong></p>
                    <p><span>Fecha</span><strong>{formatoFecha(reserva.fecha)}</strong></p>
                    <div className="admin-reserva-total">
                      <strong>${formatoPrecio(reserva.total)}</strong>
                      <button type="button" disabled={estado === 'CANCELADA'} onClick={() => setReservaPendiente(reserva)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <button type="button" className="admin-reservas-clear-filters" onClick={limpiarFiltros}>
          Limpiar búsqueda y filtros
        </button>
      </main>

      {reservaPendiente && (
        <div className="admin-reservas-modal-backdrop" role="presentation" onMouseDown={event => {
          if (event.target === event.currentTarget && !cancelando) setReservaPendiente(null)
        }}>
          <section className="admin-reservas-modal" role="alertdialog" aria-modal="true" aria-labelledby="admin-cancel-title">
            <h2 id="admin-cancel-title">¿Cancelar esta reserva?</h2>
            <p>La reserva de <strong>{reservaPendiente.nombrePlan || 'este plan'}</strong> quedará marcada como cancelada. Esta acción no se puede deshacer.</p>
            <div className="admin-reservas-modal-actions">
              <button type="button" className="admin-reservas-cancel-form" disabled={cancelando} onClick={() => setReservaPendiente(null)}>Volver</button>
              <button type="button" className="admin-reservas-add is-danger" disabled={cancelando} onClick={cancelarReserva}>
                {cancelando ? 'Cancelando...' : 'Cancelar reserva'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
