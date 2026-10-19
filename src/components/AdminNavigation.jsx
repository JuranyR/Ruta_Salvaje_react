import { NavLink } from 'react-router-dom'
import '../styles/AdminGestion.css'

const secciones = [
  { ruta: '/admin/planes', texto: 'Planes', icono: '◆' },
  { ruta: '/admin/reservas', texto: 'Reservas', icono: '▦' },
  { ruta: '/admin/resenas', texto: 'Reseñas', icono: '★' },
  { ruta: '/admin/contactos', texto: 'Contactos', icono: '✉' }
]

export default function AdminNavigation() {
  return (
    <nav className="admin-reservas-tabs" aria-label="Navegación de administración">
      {secciones.map(seccion => (
        <NavLink
          key={seccion.ruta}
          to={seccion.ruta}
          className={({ isActive }) => `admin-tab-link${isActive ? ' is-active' : ''}`}
        >
          <span aria-hidden="true">{seccion.icono}</span>
          {seccion.texto}
        </NavLink>
      ))}
    </nav>
  )
}
