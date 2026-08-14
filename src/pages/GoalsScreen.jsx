// ============================================================================
// GoalsScreen.jsx — the screen shown when you tap "Goals" in the bottom menu.
//
// It offers three choices: "Lose weight", "Maintain weight" and "Gain weight".
// Tapping one chooses it AND opens its exercise recommendations. Coming back
// leaves it chosen, and the "Clear goal" button underneath is how you un-choose
// it.
//
// Only one goal can be chosen at a time, since the app stores a single value.
// ============================================================================

import { useState } from 'react'
import ExercisePlanScreen from './ExercisePlanScreen'
import './GoalsScreen.css'

// The two choices, kept as a list so the buttons can be built with .map()
// below. To add a third goal, add one line here — and a matching list of
// recommendations in ExercisePlanScreen.jsx.
const GOALS = [
  { id: 'lose', label: 'Lose weight' },
  { id: 'maintain', label: 'Maintain weight' },
  { id: 'gain', label: 'Gain weight' },
]

// PROPS from App.jsx:
//   goal          → which goal is chosen right now ('lose', 'gain', or null)
//   onSelectGoal  → the function to call to change that choice
//   onOpenRoutine → switches the whole app to the Routine tab
//
// This screen does NOT remember the choice itself. It asks App.jsx to remember,
// because this component gets thrown away every time you switch tabs.
function GoalsScreen({ goal, onSelectGoal, onOpenRoutine }) {
  // Which goal's recommendations are open, or null for "show the cards".
  //
  // Unlike the goal above, this one DOES belong here. Leaving the Goals tab and
  // coming back should show the cards again rather than dropping you back inside
  // a plan — and state kept in this component gives us that for free, because
  // the component is rebuilt from scratch each time. It's the same reasoning
  // SettingsScreen uses for its inner pages.
  const [openPlan, setOpenPlan] = useState(null)

  // Choosing a goal and opening its plan are one action, so they're one
  // function. Both happen on a single tap of a card.
  function handleChoose(goalId) {
    onSelectGoal(goalId)
    setOpenPlan(goalId)
  }

  // ---- The exercise recommendations ----------------------------------------
  // Returned early, so everything below only runs when no plan is open.
  //
  // onSaved is passed straight through to App.jsx: once the plan is saved the
  // user is taken to the Routine tab, which throws this whole component away
  // and takes the plan screen with it. So there's no need to close the plan
  // first — switching tabs already does that.
  if (openPlan) {
    return (
      <ExercisePlanScreen
        goalId={openPlan}
        onBack={() => setOpenPlan(null)}
        onSaved={onOpenRoutine}
      />
    )
  }

  // ---- The two goal cards --------------------------------------------------
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
            // Tells screen readers that tapping this opens another page.
            aria-haspopup="true"
            onClick={() => handleChoose(option.id)}
          >
            {/* The text on the card, e.g. "Lose weight". */}
            <span className="goal-card-label">{option.label}</span>

            {/* The ">" arrow, the usual phone-app signal for "this opens
                another page". Decoration only, so it's hidden from screen
                readers — aria-haspopup above already conveys the meaning. */}
            <span className="row-arrow" aria-hidden="true">
              &#8250;
            </span>
          </button>
        ))}
      </div>

      {/* Tapping a card now opens its plan, so it can no longer double as
          "tap again to clear". This button is how a goal gets un-chosen
          instead. && means it only appears once there's a goal to clear —
          an always-visible button that does nothing would be worse. */}
      {goal && (
        <button
          type="button"
          className="ghost-button goal-clear"
          onClick={() => onSelectGoal(null)}
        >
          Clear goal
        </button>
      )}
    </main>
  )
}

export default GoalsScreen
