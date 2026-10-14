// CheckInScreen.jsx — the page a reminder notification opens.

import { useState } from 'react'
import {
  todayKey,
  loadDayPlan,
  saveDayPlan,
  loadDayNotes,
} from '../exerciseStorage'
import { currentStreak, isCheckedIn, recordCheckIn } from '../streakStorage'
import { PLANS } from '../exercisePlans'
import './CheckInScreen.css'

// PROPS from App.jsx: goal → the chosen goal ('lose', 'maintain', 'gain').
function CheckInScreen({ goal, scheduledDays, onClose }) {
  // Today's date, worked out once and kept.
  const [dateKey] = useState(() => todayKey())

  // The plan for the chosen goal, or undefined when no goal has been picked.
  const plan = goal ? PLANS[goal] : null

  // Which exercises are ticked.
  const [chosen, setChosen] = useState(() =>
    plan
      ? loadDayPlan(dateKey, goal).filter((id) =>
          plan.items.some((item) => item.id === id),
        )
      : [],
  )

  // The streak as it stands, and whether today has already been confirmed.
  const [streak, setStreak] = useState(() =>
    currentStreak(scheduledDays, dateKey),
  )
  const [isDone, setIsDone] = useState(() => isCheckedIn(dateKey))

  // Whatever the user wrote against each exercise when planning.
  const ownNotes = goal ? loadDayNotes(dateKey, goal) : {}

  // Ticks one exercise, or clears it.
  function toggleExercise(id) {
    const next = chosen.includes(id)
      ? chosen.filter((chosenId) => chosenId !== id)
      : [...chosen, id]

    setChosen(next)
    saveDayPlan(dateKey, goal, next)
  }

  // The check mark.
  function handleConfirm() {
    saveDayPlan(dateKey, goal, chosen)

    // recordCheckIn hands back the new streak, so there's no need to read it again.
    setStreak(recordCheckIn(dateKey, scheduledDays).count)
    setIsDone(true)
  }

  // ---- No goal picked yet ----
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

      {/* The streak Shown at the top once today is confirmed. */}
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

      {/* The tick list. */}
      <ul className="checkin-list">
        {plan.items.map((item) => {
          const isChecked = chosen.includes(item.id)

          return (
            <li key={item.id}>
              <button
                type="button"
                className={`checkin-item${isChecked ? ' is-checked' : ''}`}
                // role="checkbox" plus aria-checked is what tells a screen reader this is a tick box.
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggleExercise(item.id)}
              >
                <span className="checkin-box" aria-hidden="true">
                  {isChecked && <span className="checkin-tick">&#10003;</span>}
                </span>

                <span className="checkin-text">
                  {item.text}

                  {/* The user's own note, if they left one when planning. */}
                  {ownNotes[item.id] && (
                    <span className="checkin-own-note">{ownNotes[item.id]}</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* The check mark The big confirm at the foot of the page. */}
      <div className="checkin-confirm">
        <p className="checkin-count">
          {`${chosen.length} of ${plan.items.length} done`}
        </p>

        <button
          type="button"
          className="confirm-button"
          onClick={handleConfirm}
          // Confirming an empty list would count a day on which nothing was done.
          disabled={chosen.length === 0}
        >
          {/* The tick itself is hidden from screen readers. */}
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

        {/* Before confirming, the streak still gets a quiet mention — it's the reason to tap the button. */}
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
