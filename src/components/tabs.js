// tabs.js — the list of the four buttons in the bottom menu.

// Where the app is being served from: "/" on most hosts, but "/Active-Living/" on GitHub Pages.
const BASE = import.meta.env.BASE_URL

// "export" makes this list usable by other files (they "import" it). "const" means this name.
export const TABS = [
  // id → the short internal name the code uses to know which tab is open. label →.
  { id: 'home', label: 'Home', icon: `${BASE}icon-home.png` },
  { id: 'goals', label: 'Goals', icon: `${BASE}icon-goals.png` },
  { id: 'routine', label: 'Routine', icon: `${BASE}icon-routine.png` },
  // Sits between Routine and Settings: it's part of using the app, not part of configuring it.
  { id: 'data', label: 'Your data', icon: `${BASE}icon-data.png` },
  { id: 'settings', label: 'Settings', icon: `${BASE}icon-settings.png` },
]

// Note: these are black drawings on a SEE-THROUGH background.
