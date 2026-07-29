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
