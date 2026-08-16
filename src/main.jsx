// ============================================================================
// main.jsx — the STARTING POINT of the whole app.
//
// The browser loads index.html, index.html loads this file, and this file puts
// your React app onto the page. You will rarely need to change anything here.
// The file you actually edit day to day is App.jsx and the files in pages/.
// ============================================================================

// "import" means: go and fetch some code from another file or library so we can
// use it here. StrictMode and createRoot come from React itself.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Importing a .css file just tells the build tool "include these styles".
// index.css holds the site-wide styling (colours, the phone-shaped frame).
import './index.css'

// Our own top-level component. The './' means "a file in this same folder".
import App from './App.jsx'

// document.getElementById('root') finds this line in index.html:
//     <div id="root"></div>
// That empty div is the box React draws everything inside.
createRoot(document.getElementById('root')).render(
  // <StrictMode> is a development-only helper. It doesn't show anything on
  // screen — it just warns you in the browser console about risky code.
  <StrictMode>
    {/* <App /> renders our App component. Everything you see comes from here. */}
    <App />
  </StrictMode>,
)

// ---- Installing the app on a phone -----------------------------------------
// Registers public/sw.js, the service worker that lets the app open without a
// connection. It's the difference between a bookmark and something that behaves
// like an installed app.
//
// Two guards:
//
//   'serviceWorker' in navigator → older browsers don't have this at all, and
//                                  asking for it would stop the app dead.
//   import.meta.env.PROD         → Vite sets this to true only in a real build.
//                                  Skipping it during `npm run dev` matters:
//                                  a worker caching files while you edit them
//                                  means saved changes stop appearing, which is
//                                  a genuinely baffling thing to debug.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Waiting for 'load' keeps the worker from competing for bandwidth with the
  // app itself, so the first paint isn't slowed down by it.
  window.addEventListener('load', () => {
    // .catch matters here: registration fails on plain http (it needs https,
    // localhost aside), and an unhandled rejection would show up as an error in
    // the console for something the app can carry on perfectly well without.
    // import.meta.env.BASE_URL is where the app is served from — "/" normally,
    // "/Congressional-app-challege/" on GitHub Pages. The worker must be asked
    // for at the right place, and its SCOPE — the part of the site it is
    // allowed to control — is decided by where it was found.
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // No offline support this time. The app still works normally.
    })
  })
}
