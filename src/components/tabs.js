// ============================================================================
// tabs.js — the list of the four buttons in the bottom menu.
//
// This is DATA, not visuals. Keeping the list here means that if you want to
// rename a tab or swap an icon, you change it in ONE place and both the menu
// and App.jsx pick up the change automatically.
// ============================================================================

// "export" makes this list usable by other files (they "import" it).
// "const" means this name never gets reassigned to something else.
//
// The square brackets [ ] make an ARRAY — an ordered list.
// Each { } inside is an OBJECT — a bundle of labelled values.
export const TABS = [
  // id    → the short internal name the code uses to know which tab is open.
  // label → the human-readable word printed under the icon.
  // icon  → the picture file. A leading "/" means "look in the public/ folder".
  { id: 'home', label: 'Home', icon: '/icon-home.png' },
  { id: 'goals', label: 'Goals', icon: '/icon-goals.png' },
  { id: 'routine', label: 'Routine', icon: '/icon-routine.png' },
  { id: 'settings', label: 'Settings', icon: '/icon-settings.png' },
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
