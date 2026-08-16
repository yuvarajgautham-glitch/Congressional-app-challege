// ============================================================================
// tabs.js — the list of the four buttons in the bottom menu.
//
// This is DATA, not visuals. Keeping the list here means that if you want to
// rename a tab or swap an icon, you change it in ONE place and both the menu
// and App.jsx pick up the change automatically.
// ============================================================================

// Where the app is being served from: "/" on most hosts, but
// "/Congressional-app-challege/" on GitHub Pages, which serves a project from a
// folder named after the repository. Vite fills this in at build time from the
// "base" setting in vite.config.js.
//
// It has to be written this way because these paths are ordinary TEXT. Vite
// rewrites the addresses it can recognise — in index.html, and in url() inside
// CSS — but it cannot know that a string in the middle of a file happens to be
// an address. Left as "/icon-home.png", all five icons would go missing the
// moment the app was published to a folder rather than a domain root.
const BASE = import.meta.env.BASE_URL

// "export" makes this list usable by other files (they "import" it).
// "const" means this name never gets reassigned to something else.
//
// The square brackets [ ] make an ARRAY — an ordered list.
// Each { } inside is an OBJECT — a bundle of labelled values.
export const TABS = [
  // id    → the short internal name the code uses to know which tab is open.
  // label → the human-readable word printed under the icon.
  // icon  → the picture file, in the public/ folder. BASE already ends in a
  //         slash, so the file name follows it directly.
  { id: 'home', label: 'Home', icon: `${BASE}icon-home.png` },
  { id: 'goals', label: 'Goals', icon: `${BASE}icon-goals.png` },
  { id: 'routine', label: 'Routine', icon: `${BASE}icon-routine.png` },
  // Sits between Routine and Settings: it's part of using the app, not part of
  // configuring it. Its icon is a miniature of the graph the page draws.
  { id: 'data', label: 'Your data', icon: `${BASE}icon-data.png` },
  { id: 'settings', label: 'Settings', icon: `${BASE}icon-settings.png` },
]

// Note: these are black drawings on a SEE-THROUGH background, so they sit
// correctly on any colour with no help from CSS.
//
// They were made from the original icon pictures (still in public/, the four
// "...button.jpg" files), which are white drawings on a black square. Those had
// to be flipped and blended to hide the square, and the blend had two problems:
// the gear, being the finest drawing of the four, turned to grey mush when the
// browser squeezed it from 4167 pixels down to 28, and that grey tinted the
// button behind it — which is what made Settings look faded and boxed-in.
//
// The new files are drawn once at 96 pixels, trimmed to the drawing itself and
// centred, so all four now carry the same visual weight.
