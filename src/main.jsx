import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const githubPagesPath = new URLSearchParams(window.location.search).get('__ghpages')
if (githubPagesPath) {
  const destination = new URL(githubPagesPath, window.location.origin)
  if (
    destination.origin === window.location.origin &&
    destination.pathname.startsWith(import.meta.env.BASE_URL)
  ) {
    window.history.replaceState(null, '', `${destination.pathname}${destination.search}${destination.hash}`)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
