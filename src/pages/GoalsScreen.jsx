// GoalsScreen.jsx — the screen shown when you tap "Goals" in the bottom menu.

import { useState } from 'react'
import ExercisePlanScreen from './ExercisePlanScreen'
import { todayKey, loadDayPlan, loadDayNotes } from '../exerciseStorage'
import { PLANS } from '../exercisePlans'
import './GoalsScreen.css'

// The two choices, kept as a list so the buttons can be built with .map() below.
const GOALS = [
  { id: 'lose', label: 'Lose weight' },
  { id: 'maintain', label: 'Maintain weight' },
  { id: 'gain', label: 'Gain weight' },
]

// PROPS from App.jsx: goal → which goal is chosen right now ('lose', 'gain'.
function GoalsScreen({ goal, onSelectGoal, onOpenRoutine }) {
  // Which goal's recommendations are open, or null for "show the cards".
  const [openPlan, setOpenPlan] = useState(null)

  // Choosing a goal and opening its plan are one action, so they're one function.
  function handleChoose(goalId) {
    onSelectGoal(goalId)
    setOpenPlan(goalId)
  }

  // ---- The exercise recommendations ----
  // Returned early, so everything below only runs when no plan is open.
  if (openPlan) {
    return (
      <ExercisePlanScreen
        goalId={openPlan}
        onBack={() => setOpenPlan(null)}
        onSaved={onOpenRoutine}
      />
    )
  }
  // ---- What the user has already chosen ----
  // Read fresh on every draw rather than kept in state.
  const plan = goal ? PLANS[goal] : null
  const savedIds = goal ? loadDayPlan(todayKey(), goal) : []

  // The user's own notes, so the list shows what they actually meant to do rather than only.
  const savedNotes = goal ? loadDayNotes(todayKey(), goal) : {}

  // Turned from saved ids back into the full recommendations.
  const chosenItems = plan
    ? plan.items.filter((item) => savedIds.includes(item.id))
    : []

  return (
    <main className="screen goals-screen">
      <h1 className="title goals-title">Goals</h1>

      {/* The same thick black divider used on the home screen — it's styled in App.css. */}
      <div className="title-rule" />

      {/* Your goals, in the open At the TOP. */}
      {chosenItems.length > 0 && (
        <section className="current-goals">
          <h2 className="current-goals-title">Your goals today</h2>

          <ul className="current-goals-list">
            {chosenItems.map((item) => (
              <li key={item.id} className="current-goal">
                {/* The tick is decoration — every item in this list is one the user chose. */}
                <span className="current-goal-tick" aria-hidden="true">
                  &#10003;
                </span>
                <span className="current-goal-text">
                  {item.text}

                  {/* Shown only when there is one. */}
                  {savedNotes[item.id] && (
                    <span className="current-goal-own-note">
                      {savedNotes[item.id]}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {/* Goes back into the plan to change them. */}
          <button
            type="button"
            className="ghost-button current-goals-edit"
            onClick={() => handleChoose(goal)}
          >
            Change these
          </button>
        </section>
      )}

      {/* The goal cards Below the list above. */}
      <h2 className="goals-choose-title">
        {chosenItems.length > 0 ? 'Change or add a goal' : 'Choose a goal'}
      </h2>

      <div className="goal-list">
        {/* One button per entry in the GOALS list above. "option" is just the name we give to. */}
        {GOALS.map((option) => (
          <button
            key={option.id}
            type="button"
            // Adds "is-chosen" to the class name only for the selected card.
            className={`goal-card${goal === option.id ? ' is-chosen' : ''}`}
            // Tells screen readers that tapping this opens another page.
            aria-haspopup="true"
            onClick={() => handleChoose(option.id)}
          >
            {/* The text on the card, e.g. "Lose weight". */}
            <span className="goal-card-label">{option.label}</span>

            {/* The ">" arrow, the usual phone-app signal for "this opens another page". */}
            <span className="row-arrow" aria-hidden="true">
              &#8250;
            </span>
          </button>
        ))}
      </div>

      {/* Tapping a card now opens its plan, so it can no longer double as "tap again to clear". */}
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
