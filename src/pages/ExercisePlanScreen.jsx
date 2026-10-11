// ============================================================================
// ExercisePlanScreen.jsx — Goals › Lose weight / Gain weight.
//
// Opens when either goal card is tapped. It lists exercise recommendations for
// that goal, each with a square box beside it. Tapping a row ticks it off; tap
// again to clear it, and as many as you like can be ticked at once.
//
// The button at the bottom files the list under today's date and then moves the
// user on to the Routine tab, so the natural next step — ticking the day off on
// the calendar — is already in front of them.
//
// Each goal gets a genuinely different list. Losing weight is mostly about
// steady, repeatable movement; maintaining is about variety and consistency so
// the habit lasts; gaining is about strength work and eating enough to build
// on it.
// ============================================================================

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

// The recommendations live in src/exercisePlans.js — the check-in screen that
// the reminder notification opens needs the same lists, so they belong to
// neither screen on its own.

// PROPS from GoalsScreen:
//   goalId  → 'lose' or 'gain', which decides the whole list below
//   onBack  → returns to the Goals cards
//   onSaved → called once the plan is saved; takes the user to Routine
function ExercisePlanScreen({ goalId, onBack, onSaved }) {
  const plan = PLANS[goalId]

  // Today's date as text. Worked out once and kept, so a plan started just
  // before midnight still saves under the day the user began it.
  const [dateKey] = useState(() => todayKey())

  // Which exercises are ticked, as a list of ids.
  //
  // It starts from whatever was saved for today, so coming back to the screen
  // later shows the ticks you left — that's what makes the Save button worth
  // pressing. The arrow means "run this once", as in AccountInfoScreen.
  //
  // Anything saved that ISN'T in the plan any more is dropped. Recommendations
  // get reworded and replaced as the advice behind them is revisited, and a
  // saved tick for an exercise that no longer exists would otherwise keep
  // counting towards "5 of 8" while having no box on screen to show for it.
  const [chosen, setChosen] = useState(() =>
    loadDayPlan(dateKey, goalId).filter((id) =>
      plan.items.some((item) => item.id === id),
    ),
  )

  // The user's own note against each exercise, as { exerciseId: text }.
  //
  // The recommendations are general by design — "do 30 minutes of cardio" has
  // to suit everyone. A note is where that becomes a particular thing the
  // person actually intends to do.
  const [notes, setNotes] = useState(() => loadDayNotes(dateKey, goalId))

  // Changes one note. Builds a NEW object rather than editing the old one, for
  // the same reason the ticks do: React only redraws when handed a new value.
  function setNoteFor(id, text) {
    setNotes((current) => ({ ...current, [id]: text }))
  }

  // Ticks one exercise off, or clears it if it was already ticked. This is the
  // same add-or-remove pattern as toggleDay in App.jsx — and the same rule
  // applies: build a NEW list rather than editing the old one, because React
  // only redraws when it's handed a new value.
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

    // Only notes for exercises still ticked are kept. Unticking something and
    // saving should not leave its note behind to reappear later.
    const kept = {}
    for (const id of chosen) {
      if (notes[id] && notes[id].trim()) kept[id] = notes[id].trim()
    }
    saveDayNotes(dateKey, goalId, kept)

    // Order matters here. Saving has to finish BEFORE we leave, because moving
    // to another tab throws this screen away — anything left undone at that
    // point simply never happens.
    onSaved()

    // Nothing is set on the screen afterwards, deliberately. It's closing, so
    // there is nothing left to redraw — any "saved!" message would flash by
    // unread. Landing on Routine IS the confirmation.
  }

  // ---- Ticked ones first ---------------------------------------------------
  // The order the list is DRAWN in, which is not the order it is stored in.
  // Anything ticked rises to the top, so what you have chosen sits together at
  // the top of the screen instead of being scattered down a list of eight.
  //
  // The plan itself is never reordered — [...plan.items] copies it first.
  // Sorting the real thing would permanently rearrange the recommendations,
  // and the order they are written in is deliberate.
  //
  // Ticked items score 0 and unticked score 1, so subtracting puts the ticked
  // ones first. JavaScript sorts are STABLE, which is what keeps the original
  // order within each of the two groups rather than shuffling them.
  const ordered = [...plan.items].sort(
    (a, b) =>
      (chosen.includes(a.id) ? 0 : 1) - (chosen.includes(b.id) ? 0 : 1),
  )

  return (
    <main className="screen plan-screen">
      <h1 className="title plan-title">{plan.title}</h1>
      <div className="title-rule" />

      <p className="plan-intro">{plan.intro}</p>

      {/* ---- Where to read more -------------------------------------------
          Under the goal's own opening line, so it sits with the advice it
          extends. The list below is deliberately short and general; these point
          at a proper health service for anyone who wants real depth on the
          eating and exercise behind it.

          target="_blank" opens them in a separate tab, so tapping one doesn't
          throw away ticks that haven't been saved yet.

          rel="noopener noreferrer" goes with it every time. Without "noopener"
          the page that opens is handed a reference back to this one and could
          redirect it; "noreferrer" stops the other site being told where the
          visitor came from. Neither sends anything about the user — the app
          still makes no requests of its own. */}
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
            // The <li> is only the list structure. The button inside it is what
            // you tap, and it covers the whole row — box and words together —
            // so there's no small target to aim at with a thumb.
            <li key={item.id}>
              <button
                type="button"
                className={`plan-item${isChecked ? ' is-checked' : ''}`}
                // role="checkbox" plus aria-checked is what tells a screen
                // reader this is a tick box rather than an ordinary button, so
                // it announces "ticked" or "not ticked" as you move through.
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggleExercise(item.id)}
              >
                {/* The square box. It's empty until ticked, when the check mark
                    appears inside it. aria-hidden because the aria-checked
                    above already says the same thing in words — a screen reader
                    reading out "✓" as well would just be noise. */}
                <span className="plan-box" aria-hidden="true">
                  {isChecked && <span className="plan-check">&#10003;</span>}
                </span>

                {/* The recommendation and its detail line, stacked. */}
                <span className="plan-text">
                  <span className="plan-item-title">{item.text}</span>
                  <span className="plan-item-note">{item.note}</span>
                </span>
              </button>

              {/* ---- Your own note ----
                  Only once the exercise is ticked. An unticked recommendation
                  isn't something you're doing, so a note on it would have
                  nothing to describe — and eight boxes open at once would bury
                  the list itself.

                  It sits OUTSIDE the button on purpose. A text box inside a
                  button is invalid HTML, and every tap meant for the box would
                  toggle the tick instead. */}
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

      {/* ---- Save ----
          Kept at the bottom, after the list, so it's the natural last step. */}
      <div className="plan-save">
        <p className="plan-count">
          {/* .length counts the list. Showing the tally means the user doesn't
              have to look back up the page to see how the day is going. */}
          {`${chosen.length} of ${plan.items.length} chosen`}
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          // At least one box has to be ticked before moving on. Saving an empty
          // plan and then being asked which days to do it on would be a
          // confusing place to end up — the same reason the Routine calendar
          // won't save with no days picked.
          disabled={chosen.length === 0}
        >
          {/* The wording says where you end up as well as what it does, so
              being moved to another tab doesn't come as a surprise. */}
          Save and go to Routine
        </button>

        {/* Explains the grayed-out button. A disabled control with no reason
            given is the kind of thing people tap three times and give up on. */}
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
