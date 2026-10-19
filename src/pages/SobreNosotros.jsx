import imagenHero from '../../../imagenes/kamerman1960-zipline-6278621_1920.jpg'
import cristian from '../../../imagenes/equipo/Cristian.png'
import jurany from '../../../imagenes/equipo/Jurany.png'
import leider from '../../../imagenes/equipo/Leider.png'
import quiryat from '../../../imagenes/equipo/Quiryat.jpeg'
import '../styles/SobreNosotros.css'

const equipo = [
  {
    nombre: 'Cristian Ariza',
    imagen: cristian,
    descripcion: 'Especialista en lógica de programación, Java y Spring Boot.',
    linkedin: 'https://www.linkedin.com/in/cristian-ariza-velasco-5b417a3b8'
  },
  {
    nombre: 'Jurany Ramírez',
    imagen: jurany,
    descripcion: 'Desarrolladora enfocada en interfaces dinámicas y crecimiento.',
    linkedin: 'https://www.linkedin.com/in/jurany-adelia-ramirez-pineda/'
  },
  {
    nombre: 'Leider Merchan',
    imagen: leider,
    descripcion: 'Analítico orientado al detalle y soluciones funcionales backend.',
    linkedin: '#'
  },
  {
    nombre: 'Quiryat Moncada',
    imagen: quiryat,
    descripcion: 'Desarrolladora enfocada en interfaces web y soluciones Full Stack.',
    linkedin: 'https://www.linkedin.com/in/quiryat-gabriela-moncada-sarmiento-fullstack/'
  }
]

function LinkedinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.225 2.4 3.934c0 .694.52 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.432.568-.88 1.232-.88.869 0 1.216.664 1.216 1.637v3.864h2.401V9.25c0-2.177-1.16-3.192-2.707-3.192-1.248 0-1.8.686-2.11 1.168h.016V6.169H6.38c.03.678 0 7.225 0 7.225z" />
    </svg>
  )
}

export default function SobreNosotros() {
  return (
    <main className="sobre-nosotros-page">
      <header className="sobre-hero">
        <div className="sobre-hero-overlay" />
        <img src={imagenHero} alt="Persona disfrutando una aventura en tirolesa" className="sobre-hero-img" />
        <div className="sobre-hero-content">
          <p className="sobre-hero-eyebrow">⚡ NUESTRA HISTORIA</p>
          <h1 className="sobre-hero-titulo">¿Qué es Ruta Salvaje?</h1>
          <div className="sobre-hero-divider" />
          <p className="sobre-hero-texto">
            Ruta Salvaje es una plataforma digital que moderniza el turismo de aventura al digitalizar procesos de reserva antes manuales. Su solución integra tecnología para ofrecer planes estructurados y seguros, facilitando la exploración y toma de decisiones del usuario. El proyecto se centra en la usabilidad y la confianza, conectando a aventureros con experiencias al aire libre de manera rápida e intuitiva.
          </p>
        </div>
      </header>

      <section className="sobre-content">
        <h2 className="sobre-section-title">Equipo de trabajo</h2>

        <div className="equipo-grid">
          {equipo.map((persona) => (
            <article className="equipo-card" key={persona.nombre}>
              <img src={persona.imagen} className="equipo-card-image" alt={persona.nombre} />
              <div className="equipo-card-body">
                <h3>{persona.nombre}</h3>
                <span className="equipo-badge">Full Stack Developer</span>
                <p>{persona.descripcion}</p>
                <a href={persona.linkedin} target="_blank" rel="noreferrer" className="equipo-linkedin">
                  <LinkedinIcon /> Linkedin
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mision-vision-grid">
          <article className="mision-vision-card">
            <span className="mision-vision-icon" aria-hidden="true">🧭</span>
            <h2>Misión</h2>
            <p>Nuestra misión es ser la puerta de entrada a experiencias de aventura únicas, mediante una plataforma web segura, práctica y fácil de usar.</p>
          </article>
          <article className="mision-vision-card">
            <span className="mision-vision-icon" aria-hidden="true">🌄</span>
            <h2>Visión</h2>
            <p>Nuestra visión es ser el ecosistema digital que lidera el turismo de aventura. Para el 2028, Ruta Salvaje será la plataforma referente en Colombia.</p>
          </article>
        </div>
      </section>
    </main>
  )
}
