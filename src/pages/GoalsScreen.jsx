// ============================================================================
// GoalsScreen.jsx — the screen shown when you tap "Goals" in the bottom menu.
//
// It offers two choices, "Lose weight" and "Gain weight". Tapping one selects
// it; tapping it again clears it. Only one can be chosen at a time.
// ============================================================================

import './GoalsScreen.css'

// The two choices, kept as a list so the buttons can be built with .map()
// below. To add a third goal, add one line here — nothing else changes.
const GOALS = [
  { id: 'lose', label: 'Lose weight' },
  { id: 'gain', label: 'Gain weight' },
]

// PROPS from App.jsx:
//   goal         → which goal is chosen right now ('lose', 'gain', or null)
//   onSelectGoal → the function to call to change that choice
//
// This screen does NOT remember the choice itself. It asks App.jsx to remember,
// because this component gets thrown away every time you switch tabs.
function GoalsScreen({ goal, onSelectGoal }) {
  return (
    <main className="screen goals-screen">
      <h1 className="title goals-title">Goals</h1>

      {/* The same thick black divider used on the home screen — it's styled in
          App.css, so both screens can reuse it. */}
      <div className="title-rule" />

      <div className="goal-list">
        {/* One button per entry in the GOALS list above. "option" is just the
            name we give to each entry as .map() works through them. */}
        {GOALS.map((option) => (
          <button
            key={option.id}
            type="button"
            // Adds "is-chosen" to the class name only for the selected card,
            // which GoalsScreen.css uses to fill it in and thicken the border.
            className={`goal-card${goal === option.id ? ' is-chosen' : ''}`}
            // Tells screen readers whether this option is currently switched on.
            aria-pressed={goal === option.id}
            // When tapped, work out the new value BEFORE handing it back:
            //   already chosen? → null  (tapping again clears the choice)
            //   not chosen?     → this option's id (select it)
            // Because only one value is stored, choosing one automatically
            // un-chooses the other. No extra code needed for that.
            onClick={() => onSelectGoal(goal === option.id ? null : option.id)}
          >
            {/* The text on the card, e.g. "Lose weight". */}
            {option.label}
          </button>
        ))}
      </div>
    </main>
  )
}

export default GoalsScreen
