// ============================================================================
// CheckInScreen.jsx — the page a reminder notification opens.
//
// It asks one thing: which of today's exercises did you actually do? Tick them,
// then tap the big check mark at the bottom to confirm. Confirming is what
// counts the day towards the streak.
//
// Come back after confirming — by tapping the next notification, say — and the
// streak is what the page leads with.
//
// The ticks are the SAME list the Goals plan screen saves. Ticking here and
// ticking there are the same act recorded in the same place, so the two can
// never disagree about what was done today.
// ============================================================================

import { useState } from 'react'
import { todayKey, loadDayPlan, saveDayPlan } from '../exerciseStorage'
import { currentStreak, isCheckedIn, recordCheckIn } from '../streakStorage'
import { PLANS } from '../exercisePlans'
import './CheckInScreen.css'

// PROPS from App.jsx:
//   goal           → the chosen goal ('lose', 'maintain', 'gain'), or null
//   scheduledDays  → the workout days picked on the Routine calendar, which is
//                    what "in a row" is counted against
//   onClose        → shuts the check-in and returns to whatever tab was open
function CheckInScreen({ goal, scheduledDays, onClose }) {
  // Today's date, worked out once and kept. A check-in started just before
  // midnight still counts for the day it was started.
  const [dateKey] = useState(() => todayKey())

  // The plan for the chosen goal, or undefined when no goal has been picked.
  const plan = goal ? PLANS[goal] : null

  // Which exercises are ticked. Starts from whatever is already saved for
  // today, so this page and the Goals plan screen always show the same ticks.
  //
  // Ticks for exercises no longer in the plan are dropped, for the same reason
  // as on the Goals plan screen — see the note there.
  const [chosen, setChosen] = useState(() =>
    plan
      ? loadDayPlan(dateKey, goal).filter((id) =>
          plan.items.some((item) => item.id === id),
        )
      : [],
  )

  // The streak as it stands, and whether today has already been confirmed.
  // Both are kept in state rather than read fresh each time, because tapping
  // the check mark has to change what's on screen straight away.
  //
  // currentStreak, not the raw saved number: if a workout day has been and gone
  // without being confirmed, the run is already broken and this reports 0. The
  // saved count wouldn't know that until the next check-in.
  const [streak, setStreak] = useState(() =>
    currentStreak(scheduledDays, dateKey),
  )
  const [isDone, setIsDone] = useState(() => isCheckedIn(dateKey))

  // Ticks one exercise, or clears it. Saved on every tap rather than waiting
  // for the check mark: the ticks and the confirmation are two different
  // things, and someone who ticks a few and wanders off should keep them.
  function toggleExercise(id) {
    const next = chosen.includes(id)
      ? chosen.filter((chosenId) => chosenId !== id)
      : [...chosen, id]

    setChosen(next)
    saveDayPlan(dateKey, goal, next)
  }

  // The check mark. Records the day and moves the streak on.
  function handleConfirm() {
    saveDayPlan(dateKey, goal, chosen)

    // recordCheckIn hands back the new streak, so there's no need to read it
    // again — and .count because it returns the whole record.
    setStreak(recordCheckIn(dateKey, scheduledDays).count)
    setIsDone(true)
  }

  // ---- No goal picked yet --------------------------------------------------
  // Handled first so everything below can assume there's a plan to show.
  if (!plan) {
    return (
      <main className="screen checkin-screen">
        <h1 className="title checkin-title">Check in</h1>
        <div className="title-rule" />

        <p className="quote">
          Pick a goal under Goals and today&apos;s exercises will appear here.
        </p>

        <button type="button" className="back-button" onClick={onClose}>
          <span className="back-arrow" aria-hidden="true">
            &#8249;
          </span>
          Close
        </button>
      </main>
    )
  }

  return (
    <main className="screen checkin-screen">
      <h1 className="title checkin-title">
        {isDone ? 'Checked in' : 'Did you do it?'}
      </h1>
      <div className="title-rule" />

      {/* ---- The streak ----
          Shown at the top once today is confirmed, because from then on it's
          the thing the user opened the page to see. Before confirming it sits
          lower down, out of the way of the question being asked. */}
      {isDone && (
        <div className="streak-card">
          <p className="streak-count">{streak}</p>
          <p className="streak-label">
            {`${streak === 1 ? 'workout' : 'workouts'} in a row`}
          </p>
        </div>
      )}

      <p className="checkin-intro">
        {isDone
          ? 'Today is counted. You can still change what you ticked.'
          : 'Tick the exercises you completed today, then confirm at the bottom.'}
      </p>

      {/* The tick list. Same shape as the Goals plan screen — a square box you
          can tap anywhere along the row. */}
      <ul className="checkin-list">
        {plan.items.map((item) => {
          const isChecked = chosen.includes(item.id)

          return (
            <li key={item.id}>
              <button
                type="button"
                className={`checkin-item${isChecked ? ' is-checked' : ''}`}
                // role="checkbox" plus aria-checked is what tells a screen
                // reader this is a tick box rather than an ordinary button.
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggleExercise(item.id)}
              >
                <span className="checkin-box" aria-hidden="true">
                  {isChecked && <span className="checkin-tick">&#10003;</span>}
                </span>

                <span className="checkin-text">{item.text}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* ---- The check mark ----
          The big confirm at the foot of the page. It's a check mark rather than
          a word because that's what it means: "yes, that's what I did". */}
      <div className="checkin-confirm">
        <p className="checkin-count">
          {`${chosen.length} of ${plan.items.length} done`}
        </p>

        <button
          type="button"
          className="confirm-button"
          onClick={handleConfirm}
          // Confirming an empty list would count a day on which nothing was
          // done, which is exactly what a streak shouldn't reward.
          disabled={chosen.length === 0}
        >
          {/* The tick itself is hidden from screen readers — the label beside
              it already says what the button does. */}
          <span className="confirm-tick" aria-hidden="true">
            &#10003;
          </span>
          <span className="confirm-label">
            {isDone ? 'Saved for today' : 'Confirm'}
          </span>
        </button>

        {chosen.length === 0 && (
          <p className="checkin-hint">Tick at least one to confirm.</p>
        )}

        {/* Before confirming, the streak still gets a quiet mention — it's the
            reason to tap the button, so hiding it entirely would be odd. */}
        {!isDone && streak > 0 && (
          <p className="checkin-hint">
            {`Confirming keeps your streak of ${streak} going.`}
          </p>
        )}
      </div>

      <button type="button" className="back-button" onClick={onClose}>
        <span className="back-arrow" aria-hidden="true">
          &#8249;
        </span>
        Close
      </button>
    </main>
  )
}

export default CheckInScreen
