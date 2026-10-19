import { useCallback, useEffect, useMemo, useState } from 'react'
import imagenAgua from '../assets/planes/Plan-AguayRoca.png'
import imagenBosque from '../assets/planes/Plan-AventuraEnElBosque.png'
import imagenColgantes from '../assets/planes/Plan-CaminosColgantes1.png'
import imagenDesafio from '../assets/planes/Plan-Desafios.png'
import imagenNubes from '../assets/planes/Plan-ExploradordelasNubes.png'
import imagenSelva from '../assets/planes/Plan-MisionSecretaOperacionSelva.png'
import imagenVertigo from '../assets/planes/Plan-RutaDelVertigo1.png'
import imagenSalto from '../assets/planes/Plan-SaltoDelCaminante.png'
import imagenHorizonte from '../assets/planes/Plan-TravesiaDelHorizonte.png'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import AdminNavigation from '../components/AdminNavigation'
import '../styles/AdminGestion.css'
import '../styles/AdminPlanes.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-ruta-salvaje-nos6.onrender.com'
const FORMULARIO_INICIAL = {
  nombre: '',
  descripcion: '',
  precio: '',
  descuentoPorcentaje: '0',
  tipoPlan: 'AVENTURA',
  dificultad: 'MEDIA',
  estado: true,
  actividades: ''
}
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

async function leerRespuesta(response, mensaje) {
  const tipo = response.headers.get('content-type') || ''
  const datos = tipo.includes('application/json') ? await response.json() : {}
  if (!response.ok) throw new Error(datos.error || datos.message || mensaje)
  return datos
}

function actividadesTexto(actividades) {
  return Array.isArray(actividades) ? actividades.join(', ') : String(actividades || '')
}

function normalizar(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function normalizarEnum(valor) {
  return normalizar(valor).replace(/\s/g, '').toUpperCase()
}

function categoriaPlan(plan) {
  return normalizarEnum(plan.tipoPlan || plan.categoria || 'AVENTURA')
}

function dificultadPlan(plan) {
  return normalizarEnum(plan.dificultad || 'MEDIA')
}

function estadoPlan(plan) {
  const estado = plan.estado
  if (estado === false || estado === 0 || ['false', '0', 'inactiva', 'inactivo'].includes(normalizar(estado))) {
    return 'INACTIVA'
  }
  return 'ACTIVA'
}

function precioTexto(plan) {
  const precio = Number(plan.precio || 0)
  const descuento = Number(plan.descuentoPorcentaje || 0)
  return (precio - precio * descuento / 100).toLocaleString('es-CO')
}

function imagenPlan(plan) {
  const nombre = normalizar(plan.nombre)
  const clave = Object.keys(PLAN_IMAGES).find(key => nombre.includes(key))
  return PLAN_IMAGES[clave] || plan.imagen || imagenBosque
}

export default function AdminPlanes() {
  const token = localStorage.getItem('token')
  const [planes, setPlanes] = useState([])
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [imagen, setImagen] = useState(null)
  const [imagenActual, setImagenActual] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroDificultad, setFiltroDificultad] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [planPendiente, setPlanPendiente] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarPlanes = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/planes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const datos = await leerRespuesta(response, 'No se pudieron cargar los planes')
      if (!Array.isArray(datos)) throw new Error('La respuesta de planes no tiene el formato esperado.')
      setPlanes(datos)
    } catch (errorCarga) {
      setError(errorCarga.message || 'No se pudieron cargar los planes')
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => { cargarPlanes() }, [cargarPlanes])

  const planesFiltrados = useMemo(() => planes.filter(plan => {
    const texto = normalizar(plan.nombre)
    const terminos = normalizar(busqueda).split(' ').filter(Boolean)
    const coincideBusqueda = terminos.every(termino => texto.includes(termino))

    return coincideBusqueda &&
      (!filtroCategoria || categoriaPlan(plan) === normalizarEnum(filtroCategoria)) &&
      (!filtroDificultad || dificultadPlan(plan) === normalizarEnum(filtroDificultad)) &&
      (!filtroEstado || estadoPlan(plan) === normalizarEnum(filtroEstado))
  }), [busqueda, filtroCategoria, filtroDificultad, filtroEstado, planes])

  const cambiarCampo = event => {
    const { name, value } = event.target
    setFormulario(actual => ({ ...actual, [name]: value }))
    setError('')
    setMensaje('')
  }

  const seleccionarImagen = event => {
    const archivo = event.target.files?.[0] || null
    if (archivo && archivo.size > 1024 * 1024) {
      setImagen(null)
      event.target.value = ''
      setError('La imagen no debe superar 1 MB.')
      return
    }
    setImagen(archivo)
    setError('')
  }

  const limpiarFormulario = () => {
    setFormulario(FORMULARIO_INICIAL)
    setImagen(null)
    setImagenActual('')
    setEditandoId(null)
    setMostrarFormulario(false)
    const campoImagen = document.getElementById('admin-plan-imagen')
    if (campoImagen) campoImagen.value = ''
  }

  const abrirFormularioNuevo = () => {
    setFormulario(FORMULARIO_INICIAL)
    setImagen(null)
    setImagenActual('')
    setEditandoId(null)
    setMostrarFormulario(true)
    setError('')
    setMensaje('')
    window.setTimeout(() => {
      document.getElementById('admin-plan-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const editarPlan = plan => {
    setMostrarFormulario(true)
    setEditandoId(plan.id)
    setFormulario({
      nombre: plan.nombre || '',
      descripcion: plan.descripcion || '',
      precio: String(plan.precio ?? ''),
      descuentoPorcentaje: String(plan.descuentoPorcentaje ?? 0),
      tipoPlan: String(plan.tipoPlan || 'AVENTURA').toUpperCase(),
      dificultad: String(plan.dificultad || 'MEDIA').toUpperCase(),
      estado: plan.estado !== false,
      actividades: actividadesTexto(plan.actividades)
    })
    setImagen(null)
    setImagenActual(plan.imagen || '')
    setError('')
    setMensaje('')
    document.getElementById('admin-plan-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const guardarPlan = async event => {
    event.preventDefault()
    setGuardando(true)
    setError('')
    setMensaje('')
    try {
      const datos = {
        ...formulario,
        precio: Number(formulario.precio),
        descuentoPorcentaje: Number(formulario.descuentoPorcentaje || 0),
        actividades: formulario.actividades.trim(),
        imagen: imagenActual
      }
      let response
      if (editandoId) {
        response = await fetch(`${API_BASE_URL}/planes/${editandoId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        })
      } else {
        if (!imagen) throw new Error('Debes seleccionar una imagen para el plan.')
        const multipart = new FormData()
        multipart.append('file', imagen)
        Object.entries(datos).forEach(([campo, valor]) => {
          if (campo !== 'imagen') multipart.append(campo, String(valor))
        })
        response = await fetch(`${API_BASE_URL}/planes`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: multipart
        })
      }
      await leerRespuesta(response, editandoId ? 'No se pudo actualizar el plan' : 'No se pudo crear el plan')
      limpiarFormulario()
      setMensaje(editandoId ? 'Plan actualizado correctamente.' : 'Plan agregado correctamente.')
      await cargarPlanes()
    } catch (errorGuardar) {
      setError(errorGuardar.message || 'No se pudo guardar el plan')
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async plan => {
    setError('')
    setMensaje('')
    try {
      const response = await fetch(`${API_BASE_URL}/planes/${plan.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: plan.nombre,
          descripcion: plan.descripcion,
          precio: plan.precio,
          descuentoPorcentaje: plan.descuentoPorcentaje || 0,
          tipoPlan: plan.tipoPlan,
          dificultad: plan.dificultad,
          estado: plan.estado === false,
          actividades: actividadesTexto(plan.actividades),
          imagen: plan.imagen || ''
        })
      })
      await leerRespuesta(response, 'No se pudo cambiar el estado del plan')
      setMensaje('Estado del plan actualizado.')
      await cargarPlanes()
    } catch (errorEstado) {
      setError(errorEstado.message || 'No se pudo cambiar el estado del plan')
    }
  }

  const eliminarPlan = async plan => {
    setPlanPendiente(plan)
  }

  const confirmarEliminacion = async () => {
    if (!planPendiente) return
    setEliminando(true)
    setError('')
    setMensaje('')
    try {
      const response = await fetch(`${API_BASE_URL}/planes/${planPendiente.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      await leerRespuesta(response, 'No se pudo eliminar el plan')
      setMensaje('Plan eliminado correctamente.')
      if (String(editandoId) === String(planPendiente.id)) limpiarFormulario()
      setPlanPendiente(null)
      await cargarPlanes()
    } catch (errorEliminar) {
      setError(errorEliminar.message || 'No se pudo eliminar el plan')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <section className="admin-gestion-page">
      <AdminNavigation />
      <main className="admin-gestion-content">
        <header className="admin-gestion-heading">
          <div><h1>Gestionar planes</h1><p>Administra los planes de aventura disponibles.</p></div>
          <button type="button" className="admin-plan-new" onClick={abrirFormularioNuevo}>Añadir nuevo plan</button>
        </header>

        {error && <p className="admin-gestion-alert is-error" role="alert">{error}</p>}
        {mensaje && <p className="admin-gestion-alert is-success" role="status">{mensaje}</p>}

        {mostrarFormulario && <form id="admin-plan-form" className="admin-plan-form" onSubmit={guardarPlan}>
          <div className="admin-plan-form-heading">
            <div><h2>{editandoId ? 'Editar plan' : 'Nuevo plan'}</h2><p>Completa los datos y guarda los cambios.</p></div>
            {editandoId && <button className="admin-plan-cancel" type="button" onClick={limpiarFormulario}>Cancelar edición</button>}
          </div>
          <div className="admin-plan-form-grid">
            <label>Nombre<input name="nombre" value={formulario.nombre} onChange={cambiarCampo} required maxLength="120" /></label>
            <label>Categoría
              <select name="tipoPlan" value={formulario.tipoPlan} onChange={cambiarCampo}>
                <option value="AVENTURA">Aventura</option><option value="ROMANTICO">Romántico</option><option value="FAMILIAR">Familiar</option><option value="EXTREMO">Extremo</option>
              </select>
            </label>
            <label>Precio<input name="precio" type="number" min="0" step="any" value={formulario.precio} onChange={cambiarCampo} required /></label>
            <label>Descuento (%)<input name="descuentoPorcentaje" type="number" min="0" max="100" step="any" value={formulario.descuentoPorcentaje} onChange={cambiarCampo} /></label>
            <label>Dificultad
              <select name="dificultad" value={formulario.dificultad} onChange={cambiarCampo}>
                <option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option>
              </select>
            </label>
            <label>Estado
              <select name="estado" value={formulario.estado ? 'ACTIVA' : 'INACTIVA'} onChange={event => setFormulario(actual => ({ ...actual, estado: event.target.value === 'ACTIVA' }))}>
                <option value="ACTIVA">Activa</option><option value="INACTIVA">Inactiva</option>
              </select>
            </label>
            <label className="admin-plan-description">Descripción<textarea name="descripcion" value={formulario.descripcion} onChange={cambiarCampo} rows="3" required maxLength="2000" /></label>
            <label className="admin-plan-description">Actividades incluidas<textarea name="actividades" value={formulario.actividades} onChange={cambiarCampo} rows="2" /></label>
            <label className="admin-plan-image">Imagen del plan<input id="admin-plan-imagen" type="file" accept="image/*" onChange={seleccionarImagen} required={!editandoId} /><small>Máximo 1 MB. En edición, déjalo vacío para conservar la imagen actual.</small></label>
            {imagenActual && !imagen && <img className="admin-plan-preview" src={imagenActual} alt="Imagen actual del plan" />}
          </div>
          <div className="admin-plan-form-actions">
            <button type="submit" className="admin-plan-submit" disabled={guardando}>{guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear plan'}</button>
            {editandoId && <button type="button" className="admin-plan-cancel" onClick={limpiarFormulario}>Cancelar</button>}
          </div>
        </form>}

        <div className="admin-plan-filters">
          <input type="search" value={busqueda} onChange={event => setBusqueda(event.target.value)} placeholder="Buscar plan..." aria-label="Buscar plan" />
          <select aria-label="Filtrar por categoría" value={filtroCategoria} onChange={event => setFiltroCategoria(event.target.value)}>
            <option value="">Todas las categorías</option><option value="AVENTURA">Aventura</option><option value="ROMANTICO">Romántico</option><option value="FAMILIAR">Familiar</option><option value="EXTREMO">Extremo</option>
          </select>
          <select aria-label="Filtrar por dificultad" value={filtroDificultad} onChange={event => setFiltroDificultad(event.target.value)}>
            <option value="">Todas las dificultades</option><option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option>
          </select>
          <select aria-label="Filtrar por estado" value={filtroEstado} onChange={event => setFiltroEstado(event.target.value)}>
            <option value="">Todos los estados</option><option value="ACTIVA">Activa</option><option value="INACTIVA">Inactiva</option>
          </select>
          <button type="button" onClick={cargarPlanes} disabled={cargando}>{cargando ? 'Actualizando...' : 'Actualizar'}</button>
          <button type="button" className="admin-plan-clear-filters" onClick={() => {
            setBusqueda('')
            setFiltroCategoria('')
            setFiltroDificultad('')
            setFiltroEstado('')
          }}>Limpiar filtros</button>
        </div>

        {cargando ? <p className="admin-gestion-empty" role="status">Cargando planes...</p> : planesFiltrados.length === 0 ? (
          <p className="admin-gestion-empty">{planes.length ? 'No se encontraron planes con esos filtros.' : 'Aún no hay planes creados.'}</p>
        ) : (
          <div className="admin-planes-grid">
            {planesFiltrados.map(plan => (
              <article className="admin-plan-card" key={plan.id}>
                <img src={imagenPlan(plan)} alt={plan.nombre || 'Plan de aventura'} />
                <div className="admin-plan-card-body">
                  <div className="admin-plan-card-title"><h2>{plan.nombre}</h2><span className={plan.estado === false ? 'is-inactive' : 'is-active'}>{plan.estado === false ? 'Inactiva' : 'Activa'}</span></div>
                  <p>{plan.descripcion}</p>
                  <p><strong>Incluye:</strong> {actividadesTexto(plan.actividades) || 'No especificadas'}</p>
                  <dl>
                    <dt>Categoría</dt><dd>{String(plan.tipoPlan || 'AVENTURA').toLowerCase()}</dd>
                    <dt>Dificultad</dt><dd>{String(plan.dificultad || 'MEDIA').toLowerCase()}</dd>
                    <dt>Precio final</dt><dd>${precioTexto(plan)} COP</dd>
                    <dt>Descuento</dt><dd>{Number(plan.descuentoPorcentaje || 0)}%</dd>
                  </dl>
                  <div className="admin-plan-card-actions">
                    <button type="button" onClick={() => editarPlan(plan)}>Editar</button>
                    <button type="button" onClick={() => cambiarEstado(plan)}>{plan.estado === false ? 'Activar' : 'Desactivar'}</button>
                    <button type="button" onClick={() => eliminarPlan(plan)}>Eliminar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      {planPendiente && (
        <AdminConfirmDialog
          title="Eliminar plan"
          message={`El plan "${planPendiente.nombre}" dejará de aparecer y no se podrá recuperar desde esta vista.`}
          confirmLabel="Eliminar"
          busy={eliminando}
          onCancel={() => setPlanPendiente(null)}
          onConfirm={confirmarEliminacion}
        />
      )}
    </section>
  )
}
