// ============================================================================
// DayNotesScreen.jsx — Routine › one day.
//
// Opens when a date on the calendar is tapped and then opened. It gathers
// everything written about that single day in one place:
//
//   1. whether the day is in the routine, and a way to change that
//   2. the notes left on individual exercises when the plan was made
//   3. a free note about the day itself, which can be written here
//
// Those first two are written elsewhere in the app and only shown here. The
// third belongs to this screen, and is the "add more if you want" part.
// ============================================================================

import { useState } from 'react'
import { formatLongDate, todayKey } from '../dates'
import { loadNotesForDate } from '../exerciseStorage'
import { loadDayNote, saveDayNote } from '../routineStorage'
import { PLANS } from '../exercisePlans'
import './DayNotesScreen.css'

// PROPS from RoutineScreen:
//   dateKey    → which day this is, e.g. "2026-10-15"
//   isChosen   → whether it's currently part of the routine
//   onToggle   → adds or removes it from the routine
//   onBack     → returns to the calendar
function DayNotesScreen({ dateKey, isChosen, onToggle, onBack }) {
  // The free note for this day. Read once when the screen opens.
  const [note, setNote] = useState(() => loadDayNote(dateKey))

  // Whether what's typed has been saved. Starts true because nothing has been
  // changed yet; any edit flips it, so the button can say which state it's in.
  const [isSaved, setIsSaved] = useState(true)

  // Every exercise note written for this date, under whichever goal was active
  // at the time. Read fresh rather than kept in state — nothing on this screen
  // changes them.
  const exerciseNotes = loadNotesForDate(dateKey)

  // Flattened into one list the screen can draw, turning saved ids back into
  // the exercises they name.
  //
  // Object.entries turns { lose: { walk: "..." } } into [["lose", {...}]], so
  // both the goal and its notes are available at once.
  const written = []
  for (const [goalId, notes] of Object.entries(exerciseNotes)) {
    const plan = PLANS[goalId]
    if (!plan) continue

    for (const item of plan.items) {
      if (notes[item.id]) {
        written.push({
          id: `${goalId}-${item.id}`,
          goal: plan.title,
          exercise: item.text,
          note: notes[item.id],
        })
      }
    }
  }

  function handleSave() {
    saveDayNote(dateKey, note)
    setIsSaved(true)
  }

  const isPast = dateKey < todayKey()

  return (
    <main className="screen daynotes-screen">
      <h1 className="title daynotes-title">{formatLongDate(dateKey)}</h1>
      <div className="title-rule" />

      {/* ---- Is this day in the routine? ----
          Shown first because it's the thing the calendar tap was about, and it
          can be changed without going back. */}
      <div className="daynotes-status">
        <p className="daynotes-status-text">
          {isChosen
            ? 'This day is in your routine.'
            : 'This day is not in your routine.'}
        </p>

        <button
          type="button"
          className="ghost-button daynotes-toggle"
          // A day that has already gone can't be planned — the same rule the
          // calendar squares follow.
          disabled={isPast}
          onClick={onToggle}
        >
          {isChosen ? 'Remove from routine' : 'Add to routine'}
        </button>
      </div>

      {/* ---- What you wrote on the exercises ----
          Only drawn when there is something. An empty box headed "your notes"
          would be worse than no box. */}
      {written.length > 0 && (
        <section className="daynotes-block">
          <h2 className="daynotes-heading">Notes on your exercises</h2>

          <ul className="daynotes-list">
            {written.map((entry) => (
              <li key={entry.id} className="daynotes-item">
                <p className="daynotes-item-exercise">{entry.exercise}</p>
                <p className="daynotes-item-note">{entry.note}</p>
                <p className="daynotes-item-goal">{entry.goal}</p>
              </li>
            ))}
          </ul>

          <p className="daynotes-hint">
            These were written under Goals. Change them there.
          </p>
        </section>
      )}

      {/* ---- The free note ----
          The part that can be written here. Deliberately unstructured: the
          useful thing about a day is rarely one of the fields a form would
          have thought to ask for. */}
      <section className="daynotes-block">
        <h2 className="daynotes-heading">
          {written.length > 0 ? 'Note about this day' : 'Your notes'}
        </h2>

        <label className="daynotes-label" htmlFor="day-note">
          Anything worth remembering
        </label>
        <textarea
          id="day-note"
          className="daynotes-input"
          rows="5"
          placeholder="Swim instead of a run — pool closes at 7. Knee still sore."
          value={note}
          onChange={(event) => {
            setNote(event.target.value)
            setIsSaved(false)
          }}
        />

        <button
          type="button"
          className="primary-button daynotes-save"
          onClick={handleSave}
          // Nothing to save means nothing to press.
          disabled={isSaved}
        >
          {isSaved ? 'Saved' : 'Save note'}
        </button>
      </section>

      <button type="button" className="back-button" onClick={onBack}>
        <span className="back-arrow" aria-hidden="true">
          &#8249;
        </span>
        Back to calendar
      </button>
    </main>
  )
}

export default DayNotesScreen
