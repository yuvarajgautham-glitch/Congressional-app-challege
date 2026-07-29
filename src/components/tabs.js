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
  { id: 'home', label: 'Home', icon: '/homebutton.jpg' },
  { id: 'goals', label: 'Goals', icon: '/goalsbutton.jpg' },

  // These two filenames contain a SPACE ("routine button.jpg"). Spaces aren't
  // allowed in web addresses, so the space is written as %20 instead.
  { id: 'routine', label: 'Routine', icon: '/routine%20button.jpg' },
  { id: 'settings', label: 'Settings', icon: '/settings%20button.jpg' },
]

// Note: the icon files are white drawings on a BLACK square. On their own they
// would show as black boxes on the green bar, so App.css flips and blends them
// into black-on-green. See the .tab-icon rule there.
