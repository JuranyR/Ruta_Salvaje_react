import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Componentes
import Nav from './components/Nav'
import Footer from './components/Footer'

// Páginas
import Home from './pages/Home'
import Planes from './pages/Planes'
import Contacto from './pages/Contacto'
import Login from './pages/Login'
import Registro from './pages/Registro'
import SobreNosotros from './pages/SobreNosotros'
import ReservasUsuario from './pages/ReservasUsuario'
import ReservasAdmin from './pages/ReservasAdmin'
import AdminPlanes from './pages/AdminPlanes'
import AdminResenas from './pages/AdminResenas'
import AdminContactos from './pages/AdminContactos'

function leerUsuarioSesion() {
  let usuario
  try {
    usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || 'null')
  } catch {
    usuario = null
  }
  return usuario
}

function RutaReservasProtegida() {
  const usuario = leerUsuarioSesion()
  const token = localStorage.getItem('token')
  if (!usuario || !token) return <Navigate to="/login" replace />
  return String(usuario.rol || '').toUpperCase() === 'ADMIN'
    ? <Navigate to="/admin/reservas" replace />
    : <ReservasUsuario />
}

function RutaAdminProtegida({ children }) {
  const usuario = leerUsuarioSesion()
  const token = localStorage.getItem('token')
  if (!usuario || !token) return <Navigate to="/login" replace />
  return String(usuario.rol || '').toUpperCase() === 'ADMIN'
    ? children
    : <Navigate to="/" replace />
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Nav />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planes" element={<Planes />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/reservas" element={<RutaReservasProtegida />} />
            <Route path="/admin/planes" element={<RutaAdminProtegida><AdminPlanes /></RutaAdminProtegida>} />
            <Route path="/admin/reservas" element={<RutaAdminProtegida><ReservasAdmin /></RutaAdminProtegida>} />
            <Route path="/admin/resenas" element={<RutaAdminProtegida><AdminResenas /></RutaAdminProtegida>} />
            <Route path="/admin/contactos" element={<RutaAdminProtegida><AdminContactos /></RutaAdminProtegida>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
