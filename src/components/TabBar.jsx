// ============================================================================
// TabBar.jsx — the menu bar of four buttons across the bottom of every screen.
//
// This component doesn't decide anything itself. App.jsx tells it which tab is
// active, and it tells App.jsx when a button is tapped. A component like this
// (no memory of its own, just draws what it's given) is the easiest kind to
// reason about, so aim for this style wherever you can.
// ============================================================================

// The list of four tabs — their names and icon files. See tabs.js.
import { TABS } from './tabs'

// The values inside { } here are the PROPS this component receives:
//   activeTab → the id of the tab currently open, e.g. 'goals'
//   onSelect  → a function to call when the user taps a button
function TabBar({ activeTab, onSelect }) {
  return (
    // <nav> is the correct HTML tag for a set of navigation links. aria-label
    // names it for screen readers, which people with low vision use.
    <nav className="tab-bar" aria-label="Main menu">
      {/* .map() walks through the TABS list and builds one <button> per entry.
          Writing it this way means four buttons come from ONE piece of code —
          add a fifth tab to tabs.js and it appears here with no other edits. */}
      {TABS.map((tab) => (
        <button
          // "key" is required by React whenever you build a list. It uses the
          // key to track which button is which. It never appears on screen.
          key={tab.id}
          // Without type="button" a button inside a form tries to submit it.
          type="button"
          // Building the class name from a condition:
          //   condition ? valueIfTrue : valueIfFalse
          // So the open tab gets "tab is-active" and the rest just get "tab".
          // App.css uses .tab.is-active to highlight it.
          className={`tab${activeTab === tab.id ? ' is-active' : ''}`}
          // Tells screen readers "this is the page you're on". undefined means
          // the attribute is left off entirely for the other three buttons.
          aria-current={activeTab === tab.id ? 'page' : undefined}
          // onClick runs when the button is tapped. The () => ... part creates a
          // small throwaway function; without it, onSelect would run instantly
          // as the page loads instead of waiting for the tap.
          onClick={() => onSelect(tab.id)}
        >
          {/* alt="" marks the picture as decoration, because the word
              underneath already says what the button does. Leaving alt off
              entirely would make a screen reader read out the filename. */}
          <img className="tab-icon" src={tab.icon} alt="" />
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default TabBar
