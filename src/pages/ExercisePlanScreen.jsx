// ExercisePlanScreen.jsx — Goals › Lose weight / Gain weight.

import { useState } from 'react'
import {
  todayKey,
  loadDayPlan,
  saveDayPlan,
  loadDayNotes,
  saveDayNotes,
} from '../exerciseStorage'
import { PLANS } from '../exercisePlans'
import './ExercisePlanScreen.css'

// The recommendations live in src/exercisePlans.js.

// PROPS from GoalsScreen: goalId → 'lose' or 'gain'.
function ExercisePlanScreen({ goalId, onBack, onSaved }) {
  const plan = PLANS[goalId]

  // Today's date as text.
  const [dateKey] = useState(() => todayKey())

  // Which exercises are ticked, as a list of ids.
  const [chosen, setChosen] = useState(() =>
    loadDayPlan(dateKey, goalId).filter((id) =>
      plan.items.some((item) => item.id === id),
    ),
  )

  // The user's own note against each exercise, as { exerciseId: text }.
  const [notes, setNotes] = useState(() => loadDayNotes(dateKey, goalId))

  // Changes one note.
  function setNoteFor(id, text) {
    setNotes((current) => ({ ...current, [id]: text }))
  }

  // Ticks one exercise off, or clears it if it was already ticked.
  function toggleExercise(id) {
    setChosen((current) =>
      current.includes(id)
        ? current.filter((chosenId) => chosenId !== id)
        : [...current, id],
    )
  }

  // Writes today's ticks to storage, then hands over to Routine.
  function handleSave() {
    saveDayPlan(dateKey, goalId, chosen)

    // Only notes for exercises still ticked are kept.
    const kept = {}
    for (const id of chosen) {
      if (notes[id] && notes[id].trim()) kept[id] = notes[id].trim()
    }
    saveDayNotes(dateKey, goalId, kept)

    // Order matters here.
    onSaved()

    // Nothing is set on the screen afterwards, deliberately.
  }

  // ---- Ticked ones first ----
  // The order the list is DRAWN in, which is not the order it is stored in.
  const ordered = [...plan.items].sort(
    (a, b) =>
      (chosen.includes(a.id) ? 0 : 1) - (chosen.includes(b.id) ? 0 : 1),
  )

  return (
    <main className="screen plan-screen">
      <h1 className="title plan-title">{plan.title}</h1>
      <div className="title-rule" />

      <p className="plan-intro">{plan.intro}</p>

      {/* Where to read more Under the goal's own opening line, so it sits with the advice it extends. */}
      <p className="plan-links">
        For healthy eating recipe ideas:{' '}
        <a
          className="plan-link"
          href="https://www.nhs.uk/healthier-families/recipes/"
          target="_blank"
          rel="noopener noreferrer"
        >
          nhs.uk/healthier-families/recipes
        </a>
        <br />
        For healthy exercise ideas:{' '}
        <a
          className="plan-link"
          href="https://www.nhs.uk/live-well/exercise/"
          target="_blank"
          rel="noopener noreferrer"
        >
          nhs.uk/live-well/exercise
        </a>
      </p>

      <ul className="plan-list">
        {ordered.map((item) => {
          // Worked out once because the answer is needed three times below.
          const isChecked = chosen.includes(item.id)

          return (
            // The <li> is only the list structure.
            <li key={item.id}>
              <button
                type="button"
                className={`plan-item${isChecked ? ' is-checked' : ''}`}
                // role="checkbox" plus aria-checked is what tells a screen reader this is a tick box.
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggleExercise(item.id)}
              >
                {/* The square box. */}
                <span className="plan-box" aria-hidden="true">
                  {isChecked && <span className="plan-check">&#10003;</span>}
                </span>

                {/* The recommendation and its detail line, stacked. */}
                <span className="plan-text">
                  <span className="plan-item-title">{item.text}</span>
                  <span className="plan-item-note">{item.note}</span>
                </span>
              </button>

              {/* Your own note Only once the exercise is ticked. */}
              {isChecked && (
                <div className="plan-note-wrap">
                  <label className="plan-note-label" htmlFor={`note-${item.id}`}>
                    Your note
                  </label>
                  <textarea
                    id={`note-${item.id}`}
                    className="plan-note-input"
                    rows="2"
                    placeholder="e.g. 3 miles around the park, before school"
                    value={notes[item.id] || ''}
                    onChange={(event) =>
                      setNoteFor(item.id, event.target.value)
                    }
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* Save Kept at the bottom, after the list, so it's the natural last step. */}
      <div className="plan-save">
        <p className="plan-count">
          {/* .length counts the list. */}
          {`${chosen.length} of ${plan.items.length} chosen`}
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          // At least one box has to be ticked before moving on.
          disabled={chosen.length === 0}
        >
          {/* The wording says where you end up as well as what it does. */}
          Save and go to Routine
        </button>

        {/* Explains the grayed-out button. */}
        {chosen.length === 0 && (
          <p className="plan-hint">Tick at least one exercise to continue.</p>
        )}
      </div>

      <button type="button" className="back-button" onClick={onBack}>
        <span className="back-arrow" aria-hidden="true">
          &#8249;
        </span>
        Back
      </button>
    </main>
  )
}

export default ExercisePlanScreen
