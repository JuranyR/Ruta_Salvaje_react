import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import AdminNavigation from '../components/AdminNavigation'
import '../styles/AdminGestion.css'
import '../styles/AdminContactos.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-ruta-salvaje-nos6.onrender.com'

async function leerRespuesta(response, mensaje) {
  const tipo = response.headers.get('content-type') || ''
  const datos = tipo.includes('application/json') ? await response.json() : {}
  if (!response.ok) throw new Error(datos.error || datos.message || mensaje)
  return datos
}

export default function AdminContactos() {
  const token = localStorage.getItem('token')
  const [contactos, setContactos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [eliminandoId, setEliminandoId] = useState(null)
  const [contactoPendiente, setContactoPendiente] = useState(null)

  const cargarContactos = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/contactos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const datos = await leerRespuesta(response, 'No se pudieron cargar los mensajes de contacto')
      if (!Array.isArray(datos)) throw new Error('La respuesta de contactos no tiene el formato esperado.')
      setContactos(datos)
    } catch (errorCarga) {
      setError(errorCarga.message || 'No se pudieron cargar los mensajes')
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => { cargarContactos() }, [cargarContactos])

  const contactosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase()
    return contactos.filter(contacto => (
      `${contacto.nombre || ''} ${contacto.email || ''} ${contacto.telefono || ''} ${contacto.mensaje || ''}`
        .toLocaleLowerCase()
        .includes(termino)
    ))
  }, [busqueda, contactos])

  const eliminarContacto = async contacto => {
    setContactoPendiente(contacto)
  }

  const confirmarEliminacion = async () => {
    if (!contactoPendiente) return
    setEliminandoId(contactoPendiente.id)
    setError('')
    setMensaje('')
    try {
      const response = await fetch(`${API_BASE_URL}/contactos/${contactoPendiente.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      await leerRespuesta(response, 'No se pudo eliminar el mensaje')
      setMensaje('Mensaje eliminado correctamente.')
      setContactoPendiente(null)
      await cargarContactos()
    } catch (errorEliminar) {
      setError(errorEliminar.message || 'No se pudo eliminar el mensaje')
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <section className="admin-gestion-page">
      <AdminNavigation />
      <main className="admin-gestion-content">
        <header className="admin-gestion-heading">
          <div><h1>Mensajes de contacto</h1><p>Mensajes enviados desde la página de contacto.</p></div>
          <div className="admin-contactos-tools">
            <input type="search" value={busqueda} onChange={event => setBusqueda(event.target.value)} placeholder="Buscar mensaje..." aria-label="Buscar mensaje" />
            <button type="button" onClick={cargarContactos} disabled={cargando}>{cargando ? 'Actualizando...' : 'Actualizar'}</button>
          </div>
        </header>
        {error && <p className="admin-gestion-alert is-error" role="alert">{error}</p>}
        {mensaje && <p className="admin-gestion-alert is-success" role="status">{mensaje}</p>}
        {cargando ? <p className="admin-gestion-empty" role="status">Cargando mensajes...</p> : contactosFiltrados.length === 0 ? (
          <p className="admin-gestion-empty">{contactos.length ? 'No se encontraron mensajes.' : 'Todavía no hay mensajes de contacto.'}</p>
        ) : (
          <div className="admin-contactos-grid">
            {contactosFiltrados.map(contacto => (
              <article className="admin-contacto-card" key={contacto.id}>
                <header>
                  <div><h2>{contacto.nombre || 'Sin nombre'}</h2><a href={`mailto:${contacto.email}`}>{contacto.email}</a></div>
                  <button type="button" disabled={eliminandoId === contacto.id} onClick={() => eliminarContacto(contacto)}>
                    {eliminandoId === contacto.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </header>
                {contacto.telefono && <a className="admin-contacto-phone" href={`tel:${contacto.telefono}`}>{contacto.telefono}</a>}
                <p>{contacto.mensaje || 'Sin contenido'}</p>
              </article>
            ))}
          </div>
        )}
      </main>
      {contactoPendiente && (
        <AdminConfirmDialog
          title="Eliminar mensaje"
          message="Este mensaje de contacto se eliminará del panel."
          confirmLabel="Eliminar"
          busy={eliminandoId === contactoPendiente.id}
          onCancel={() => setContactoPendiente(null)}
          onConfirm={confirmarEliminacion}
        />
      )}
    </section>
  )
}
