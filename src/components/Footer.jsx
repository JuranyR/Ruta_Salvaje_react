import { Link } from 'react-router-dom'
import '../styles/Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-columns">
          <section className="footer-column footer-brand">
            <h2>Ruta Salvaje</h2>
            <p>
              Plataforma para descubrir<br />
              aventuras al aire libre.
            </p>
          </section>

          <nav className="footer-column footer-navigation" aria-label="Navegación del pie de página">
            <h2>Navegación</h2>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/sobre-nosotros">Sobre Nosotros</Link></li>
              <li><Link to="/planes">Planes</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </nav>

          <section className="footer-column footer-contact">
            <h2>Contacto</h2>
            <p>
              Bogotá, Colombia<br />
              <a href="mailto:rutasalvaje.admin@gmail.com">rutasalvaje.admin@gmail.com</a><br />
              <a href="tel:+573151234567">+57 315 123 4567</a>
            </p>
          </section>
        </div>
      </div>

      <div className="footer-bottom">
        <hr />
        <small>© {currentYear} Ruta Salvaje - Todos los derechos reservados</small>
      </div>
    </footer>
  )
}
