// main.jsx — the STARTING POINT of the whole app.

// "import" means: go and fetch some code from another file or library so we can use it here.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Importing a .css file just tells the build tool "include these styles". index.css holds.
import './index.css'

// Our own top-level component.
import App from './App.jsx'

// document.getElementById('root') finds this line in index.html.
createRoot(document.getElementById('root')).render(
  // <StrictMode> is a development-only helper.
  <StrictMode>
    {/* <App /> renders our App component. */}
    <App />
  </StrictMode>,
)

// ---- Installing the app on a phone ----
// Registers public/sw.js, the service worker that lets the app open without a connection.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Waiting for 'load' keeps the worker from competing for bandwidth with the app itself.
  window.addEventListener('load', () => {
    // .catch matters here: registration fails on plain http (it needs https, localhost aside).
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // No offline support this time.
    })
  })
}
