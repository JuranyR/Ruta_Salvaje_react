import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../../../imagenes/logov1.png'
import '../styles/Nav.css'

function leerUsuarioSesion() {
  if (!localStorage.getItem('token')) return null

  try {
    return JSON.parse(localStorage.getItem('usuarioLogueado') || 'null')
  } catch {
    return null
  }
}

function inicialesUsuario(usuario) {
  const nombre = String(usuario?.nombre || usuario?.email || 'US').trim()
  const partes = nombre.includes('@') ? nombre.split('@')[0].split(/[._\s-]+/) : nombre.split(/\s+/)
  return partes.slice(0, 2).map(parte => parte.charAt(0)).join('').toUpperCase() || 'US'
}

export default function Nav() {
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [usuario, setUsuario] = useState(leerUsuarioSesion)

  const cerrarMenu = () => setMenuAbierto(false)
  const esAdmin = String(usuario?.rol || '').toUpperCase() === 'ADMIN'
  const rutaReservas = esAdmin ? '/admin/reservas' : '/reservas'
  const rutaPerfil = esAdmin ? '/admin/planes' : rutaReservas

  useEffect(() => {
    const actualizarSesion = () => setUsuario(leerUsuarioSesion())
    window.addEventListener('storage', actualizarSesion)
    window.addEventListener('ruta-salvaje:session-changed', actualizarSesion)
    return () => {
      window.removeEventListener('storage', actualizarSesion)
      window.removeEventListener('ruta-salvaje:session-changed', actualizarSesion)
    }
  }, [])

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuarioLogueado')
    localStorage.removeItem('reservas')
    setUsuario(null)
    cerrarMenu()
    navigate('/')
  }

  return (
    <nav className="navbar-salvaje">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={cerrarMenu}>
          <img className="nav-logo" src={logo} alt="" />
          <span>Ruta Salvaje</span>
        </Link>

        <button
          type="button"
          className={`nav-toggle${menuAbierto ? ' is-open' : ''}`}
          aria-label={menuAbierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto(abierto => !abierto)}
        >
          <span />
          <span />
          <span />
        </button>

        <div id="menu-principal" className={`nav-collapse${menuAbierto ? ' is-open' : ''}`}>
          <ul className="nav-menu">
            {esAdmin ? (
              <li className="nav-item">
                <NavLink to="/admin/planes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={cerrarMenu}>Panel de control</NavLink>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={cerrarMenu}>Inicio</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/sobre-nosotros" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={cerrarMenu}>Sobre Nosotros</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/planes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={cerrarMenu}>Planes</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/contacto" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={cerrarMenu}>Contacto</NavLink>
                </li>
              </>
            )}
            {usuario ? (
              <>
                {!esAdmin && (
                  <li className="nav-item">
                    <NavLink to={rutaReservas} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={cerrarMenu}>Reservas</NavLink>
                  </li>
                )}
                <li className="nav-item nav-user-item">
                  <Link
                    to={rutaPerfil}
                    className="nav-avatar"
                    aria-label={esAdmin ? 'Abrir panel de control' : `Abrir reservas de ${usuario.nombre || usuario.email || 'usuario'}`}
                    title={usuario.nombre || usuario.email || 'Mi cuenta'}
                    onClick={cerrarMenu}
                  >
                    {inicialesUsuario(usuario)}
                  </Link>
                </li>
                <li className="nav-item nav-logout-item">
                  <button type="button" className="btn-logout" onClick={cerrarSesion}>Cerrar sesión</button>
                </li>
              </>
            ) : (
              <li className="nav-item nav-login-item">
                <NavLink to="/login" className={({ isActive }) => `btn-login${isActive ? ' active' : ''}`} onClick={cerrarMenu}>Iniciar sesión</NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
