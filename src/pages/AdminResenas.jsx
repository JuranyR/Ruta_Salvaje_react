import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import AdminNavigation from '../components/AdminNavigation'
import '../styles/AdminGestion.css'
import '../styles/AdminResenas.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-ruta-salvaje-nos6.onrender.com'

async function leerRespuesta(response, mensaje) {
  const tipo = response.headers.get('content-type') || ''
  const datos = tipo.includes('application/json') ? await response.json() : {}
  if (!response.ok) throw new Error(datos.error || datos.message || mensaje)
  return datos
}

function estrellas(calificacion) {
  const valor = Math.max(0, Math.min(5, Math.round(Number(calificacion || 0))))
  return `${'★'.repeat(valor)}${'☆'.repeat(5 - valor)}`
}

function fechaResena(fecha) {
  if (!fecha) return 'Sin fecha'
  const valida = new Date(fecha)
  return Number.isNaN(valida.getTime()) ? String(fecha) : valida.toLocaleString('es-CO')
}

export default function AdminResenas() {
  const token = localStorage.getItem('token')
  const [resenas, setResenas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [eliminandoId, setEliminandoId] = useState(null)
  const [resenaPendiente, setResenaPendiente] = useState(null)

  const cargarResenas = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/resenas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const datos = await leerRespuesta(response, 'No se pudieron cargar las reseñas')
      if (!Array.isArray(datos)) throw new Error('La respuesta de reseñas no tiene el formato esperado.')
      setResenas(datos)
    } catch (errorCarga) {
      setError(errorCarga.message || 'No se pudieron cargar las reseñas')
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => { cargarResenas() }, [cargarResenas])

  const resenasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase()
    return resenas.filter(resena => (
      `${resena.nombreUsuario || ''} ${resena.nombrePlan || ''} ${resena.comentario || ''}`
        .toLocaleLowerCase()
        .includes(termino)
    ))
  }, [busqueda, resenas])

  const eliminarResena = async resena => {
    setResenaPendiente(resena)
  }

  const confirmarEliminacion = async () => {
    if (!resenaPendiente) return
    setEliminandoId(resenaPendiente.id)
    setError('')
    setMensaje('')
    try {
      const response = await fetch(`${API_BASE_URL}/resenas/${resenaPendiente.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      await leerRespuesta(response, 'No se pudo eliminar la reseña')
      setMensaje('Reseña eliminada correctamente.')
      setResenaPendiente(null)
      await cargarResenas()
    } catch (errorEliminar) {
      setError(errorEliminar.message || 'No se pudo eliminar la reseña')
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <section className="admin-gestion-page">
      <AdminNavigation />
      <main className="admin-gestion-content">
        <header className="admin-gestion-heading">
          <div><h1>Reseñas</h1><p>Revisa y modera las opiniones de los usuarios.</p></div>
          <input type="search" value={busqueda} onChange={event => setBusqueda(event.target.value)} placeholder="Buscar reseña..." aria-label="Buscar reseña" />
        </header>
        {error && <p className="admin-gestion-alert is-error" role="alert">{error}</p>}
        {mensaje && <p className="admin-gestion-alert is-success" role="status">{mensaje}</p>}
        {cargando ? <p className="admin-gestion-empty" role="status">Cargando reseñas...</p> : resenasFiltradas.length === 0 ? (
          <p className="admin-gestion-empty">{resenas.length ? 'No se encontraron reseñas.' : 'Aún no hay reseñas.'}</p>
        ) : (
          <div className="admin-resenas-grid">
            {resenasFiltradas.map(resena => (
              <article className="admin-resena-card" key={resena.id}>
                <header><h2>{resena.nombrePlan || 'Plan'}</h2><span aria-label={`${resena.calificacion} de 5 estrellas`}>{estrellas(resena.calificacion)}</span></header>
                <p className="admin-resena-meta">{resena.nombreUsuario || 'Sin usuario'} · {fechaResena(resena.fechaCreacion)}</p>
                <p className="admin-resena-comment">{resena.comentario || 'Sin comentario'}</p>
                <button type="button" disabled={eliminandoId === resena.id} onClick={() => eliminarResena(resena)}>
                  {eliminandoId === resena.id ? 'Eliminando...' : 'Eliminar reseña'}
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
      {resenaPendiente && (
        <AdminConfirmDialog
          title="Eliminar reseña"
          message="La reseña se quitará del panel y de la vista pública."
          confirmLabel="Eliminar"
          busy={eliminandoId === resenaPendiente.id}
          onCancel={() => setResenaPendiente(null)}
          onConfirm={confirmarEliminacion}
        />
      )}
    </section>
  )
}
