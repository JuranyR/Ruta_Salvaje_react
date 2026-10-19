import { Link } from 'react-router-dom'
import planFamiliar from '../../../imagenes/planes/Plan-CaminosColgantes1.png'
import planAcuatico from '../../../imagenes/planes/Plan-AguayRoca.png'
import planExtremo from '../../../imagenes/planes/Plan-RutaDelVertigo1.png'
import '../styles/Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="home-container">
          <div className="hero-row">
            <div className="hero-copy">
              <h1 className="hero-title">
                Embárcate <span>en la Aventura</span>
              </h1>
              <p>Descubre experiencias inolvidables</p>
              <Link to="/planes" className="btn-descubre">Descubre más</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="planes-section">
        <div className="home-container">
          <header className="section-header">
            <h2>Planes</h2>
          </header>

          <div className="plans-grid">
            <div className="plan-card-shell">
              <article className="plan-card familiar">
                <div className="card-img-wrap">
                  <img src={planFamiliar} className="card-img-top" alt="Puentes colgantes del Plan Familiar" />
                  <span className="plan-badge">Familiar</span>
                </div>
                <div className="card-body">
                  <h3>Plan Familiar</h3>
                  <p>Puentes colgantes, senderos seguros y aventura controlada.</p>
                  <Link to="/planes" className="btn-reserva">Ver más</Link>
                </div>
              </article>
            </div>

            <div className="plan-card-shell">
              <article className="plan-card acuatico">
                <div className="card-img-wrap">
                  <img src={planAcuatico} className="card-img-top" alt="Aventura acuática entre agua y roca" />
                  <span className="plan-badge">Acuático</span>
                </div>
                <div className="card-body">
                  <h3>Aventura Acuática</h3>
                  <p>Canotaje, cascadas y experiencias refrescantes en la naturaleza.</p>
                  <Link to="/planes" className="btn-reserva">Ver más</Link>
                </div>
              </article>
            </div>

            <div className="plan-card-shell">
              <article className="plan-card extremo">
                <div className="card-img-wrap">
                  <img src={planExtremo} className="card-img-top" alt="Ruta de aventura extrema" />
                  <span className="plan-badge">Extremo</span>
                </div>
                <div className="card-body">
                  <h3>Plan Extremo</h3>
                  <p>Bungee, canopy y adrenalina pura para los más valientes.</p>
                  <Link to="/planes" className="btn-reserva">Ver más</Link>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="sobre-section">
        <div className="home-container">
          <div className="sobre-inner">
            <h2>Sobre Ruta Salvaje</h2>
            <p>
              Ruta Salvaje es un proyecto desarrollado durante un bootcamp de desarrollo web, cuyo
              objetivo es diseñar una plataforma intuitiva para explorar y reservar actividades de
              aventura en la naturaleza, priorizando la experiencia de usuario y una navegación clara.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
