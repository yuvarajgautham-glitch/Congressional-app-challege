// TabBar.jsx — the menu bar of four buttons across the bottom of every screen.

// The list of four tabs — their names and icon files.
import { TABS } from './tabs'

// The values inside { } here are the PROPS this component receives.
function TabBar({ activeTab, onSelect }) {
  return (
    // <nav> is the correct HTML tag for a set of navigation links. aria-label names it for screen.
    <nav className="tab-bar" aria-label="Main menu">
      {/* .map() walks through the TABS list and builds one <button> per entry. */}
      {TABS.map((tab) => (
        <button
          // "key" is required by React whenever you build a list.
          key={tab.id}
          // Without type="button" a button inside a form tries to submit it.
          type="button"
          // Building the class name from a condition: condition ? valueIfTrue.
          className={`tab${activeTab === tab.id ? ' is-active' : ''}`}
          // Tells screen readers "this is the page you're on". undefined means the attribute is left off.
          aria-current={activeTab === tab.id ? 'page' : undefined}
          // onClick runs when the button is tapped.
          onClick={() => onSelect(tab.id)}
        >
          {/* alt="" marks the picture as decoration. */}
          <img className="tab-icon" src={tab.icon} alt="" />
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default TabBar
