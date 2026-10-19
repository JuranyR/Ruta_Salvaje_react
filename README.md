# Ruta Salvaje - Frontend

Aplicación web para descubrir y reservar experiencias de aventura en la naturaleza. El proyecto se desarrolló con React y Vite como parte de un bootcamp de desarrollo web.

## Funcionalidades

- Explorar planes de aventura y consultar reseñas.
- Crear una cuenta e iniciar sesión.
- Agregar planes al carrito, consultar disponibilidad y gestionar reservas.
- Enviar mensajes desde el formulario de contacto.
- Administrar planes, reservas, reseñas y contactos con una cuenta de administrador.
- Consultar información del proyecto y su equipo.

## Tecnologías

- React 19
- React Router 7
- Vite 8
- JavaScript y CSS

## Requisitos

- Acceso al backend de Ruta Salvaje para utilizar las funciones que consultan o modifican datos.

## Instalación y ejecución

Desde la carpeta `Front_React`:

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación en el navegador.

## Configuración del backend

La aplicación usa por defecto esta URL para las solicitudes al backend:

```text
https://back-ruta-salvaje-nos6.onrender.com
```

Para apuntar a otra instancia, crea un archivo `.env` en la raíz del proyecto y define:

```dotenv
VITE_API_BASE_URL=https://back-ruta-salvaje-nos6.onrender.com
```

Reemplaza la dirección del ejemplo por la URL base de tu backend. La instancia debe exponer los endpoints de autenticación, planes, reservas, reseñas, contactos y usuarios que consume el frontend.

## Rutas principales

| Ruta | Descripción | Acceso |
| --- | --- | --- |
| `/` | Inicio | Público |
| `/planes` | Planes y reseñas | Público |
| `/sobre-nosotros` | Información del proyecto y el equipo | Público |
| `/contacto` | Formulario de contacto | Público |
| `/registro` | Crear una cuenta | Público |
| `/login` | Iniciar sesión | Público |
| `/reservas` | Carrito y reservas del usuario | Usuario autenticado |
| `/admin/planes` | Gestión de planes | Administrador |
| `/admin/reservas` | Gestión de reservas | Administrador |
| `/admin/resenas` | Gestión de reseñas | Administrador |
| `/admin/contactos` | Gestión de mensajes de contacto | Administrador |

Las rutas de administración requieren una sesión con rol `ADMIN`.

## Comandos disponibles

```bash
npm run dev      
npm run build   
```

## Estructura del proyecto

```text
src/
├── assets/       # imágenes usadas desde el código fuente
├── components/   # navegación, pie de página y componentes compartidos
├── pages/        # vistas de usuario y administración
└── styles/       # estilos específicos de las vistas
public/           # archivos estáticos públicos
```

## Recursos gráficos

Las vistas de inicio, contacto, inicio de sesión, registro y «Sobre nosotros» usan imágenes guardadas en `imagenes`, en la carpeta padre de `Front_React` (`..\imagenes`). Conserva esa estructura al ejecutar o compilar el proyecto; si trasladas `Front_React` por separado, también tendrás que trasladar las imágenes y actualizar las importaciones.
