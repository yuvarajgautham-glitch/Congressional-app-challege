// ============================================================================
// RoutineScreen.jsx — the screen shown when you tap "Routine" in the menu.
//
// A real calendar, month by month. Under the title it shows today's date and
// the time, then a dropdown for picking the month, then that month laid out
// properly — dates under the right weekday names, the right number of days,
// today marked.
//
// The user taps the days they plan to exercise on; tapping again clears one.
// Days that have already gone can't be tapped — you can only plan ahead. The
// Save button at the bottom stores the choice and opens the reminder screen.
//
// This is where the app lands after an exercise plan is saved under Goals, so
// the prompt explains what to do without the user having to guess.
// ============================================================================

import { useState, useEffect } from 'react'
import ReminderScreen from './ReminderScreen'
import {
  WEEKDAY_NAMES,
  todayKey,
  formatNow,
  formatMonth,
  addMonths,
  buildMonthGrid,
} from '../dates'
import './RoutineScreen.css'

// How many months the dropdown offers: this one and the next eleven. A year
// ahead is far more than anyone plans exercise for, and stopping somewhere
// keeps the list short enough to scroll through on a phone.
const MONTHS_AHEAD = 12

// PROPS from App.jsx:
//   routineDays   → the dates already picked, as keys like "2026-08-13"
//   onToggleDay   → the function to call when a date is tapped
//   onSaveDays    → stores the chosen dates
//   onReplaceDays → swaps the whole list at once, for "repeat weekly"
//   reminderTime  → the daily reminder time as "07:30", or '' for none
//   onSetTime     → changes that time (App runs the actual timer)
function RoutineScreen({
  routineDays,
  onToggleDay,
  onSaveDays,
  onReplaceDays,
  reminderTime,
  onSetTime,
}) {
  // Whether the reminder screen is open. Kept HERE rather than in App.jsx for
  // the same reason SettingsScreen keeps its inner page locally: leaving the
  // Routine tab and coming back should show the calendar again, not drop the
  // user back inside a sub-page.
  const [showReminder, setShowReminder] = useState(false)

  // Which month is on screen, counted from the current one: 0 is this month,
  // 1 is next month, and so on. Storing the OFFSET rather than a date keeps
  // "which option is picked" and "which month to draw" as one value.
  const [monthOffset, setMonthOffset] = useState(0)

  // The current date and time, kept up to date by the effect below.
  const [now, setNow] = useState(() => new Date())

  // ---- Keeping the clock right ---------------------------------------------
  // Without this the time would show whatever it was when the screen opened and
  // then sit there, wrong, which is worse than showing no time at all.
  //
  // It waits until the top of the NEXT minute rather than ticking every sixty
  // seconds from now. Otherwise a screen opened at 10:00:59 would keep showing
  // 10:00 for another full minute. Redrawing once a minute is also far less
  // work than once a second, and the seconds aren't shown anyway.
  useEffect(() => {
    let timerId = null

    function tick() {
      // 60000 milliseconds is a minute. The remainder of "milliseconds since
      // 1970" divided by a minute is how far INTO the current minute we are, so
      // subtracting it from a minute gives the time left until the next one.
      const untilNextMinute = 60000 - (Date.now() % 60000)

      timerId = window.setTimeout(() => {
        setNow(new Date())
        tick() // Set the next one, which is what makes this keep going.
      }, untilNextMinute)
    }

    tick()

    // Returned from useEffect, so React runs it when the screen closes. Without
    // it the timer would carry on trying to redraw a screen that has gone.
    return () => {
      if (timerId !== null) window.clearTimeout(timerId)
    }
  }, [])

  // ---- The reminder screen -------------------------------------------------
  // Returned early, so everything below only runs when it's closed.
  if (showReminder) {
    return (
      <ReminderScreen
        days={routineDays}
        reminderTime={reminderTime}
        onReplaceDays={onReplaceDays}
        onSetTime={onSetTime}
        onBack={() => setShowReminder(false)}
      />
    )
  }

  // ---- Working out what to draw --------------------------------------------
  const today = todayKey()

  // The first of whichever month is being shown, and its grid of cells.
  const monthStart = addMonths(now, monthOffset)
  const cells = buildMonthGrid(monthStart)

  // The dropdown's options: this month and the next eleven. Array.from builds
  // the list, the same trick the old fixed calendar used for its day numbers.
  const monthOptions = Array.from({ length: MONTHS_AHEAD }, (_, offset) => ({
    offset,
    label: formatMonth(addMonths(now, offset)),
  }))

  // Saves the chosen days, then moves on to setting the reminder time.
  function handleSave() {
    onSaveDays(routineDays)
    setShowReminder(true)
  }

  return (
    <main className="screen routine-screen">
      <h1 className="title">Routine</h1>
      <div className="title-rule" />

      {/* ---- Today ----
          Everything below the title starts here: what day it actually is. */}
      <p className="routine-now">{formatNow(now)}</p>

      {/* The prompt. A grid of numbers means nothing on its own — this line is
          what turns it into a question the user can answer. */}
      <p className="routine-prompt">
        Tap the days you plan to exercise, then save to set a daily reminder.
      </p>

      {/* ---- The month dropdown ----
          A <select> opens the native picker wheel on a phone, which beats
          tapping an arrow eleven times to reach next summer. */}
      <div className="month-picker">
        <label className="month-label" htmlFor="routine-month">
          Month
        </label>
        <select
          id="routine-month"
          className="field-input month-select"
          value={monthOffset}
          // Everything from a form arrives as TEXT, even from a list of
          // numbers. Number() converts it back, so the comparisons and the
          // month arithmetic above work on a real number.
          onChange={(event) => setMonthOffset(Number(event.target.value))}
        >
          {monthOptions.map((option) => (
            <option key={option.offset} value={option.offset}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---- The calendar ---- */}
      <div className="calendar-block">
        {/* The month's name, repeated above the grid. The dropdown says it too,
            but a calendar you can read at a glance shouldn't need you to check
            a form control to know what you're looking at. */}
        <p className="month-title">{formatMonth(monthStart)}</p>

        {/* The weekday names. aria-hidden because a screen reader gets each
            date's full weekday from the aria-label on the square itself, so
            reading this row out as well would just be noise. */}
        <div className="weekday-row" aria-hidden="true">
          {WEEKDAY_NAMES.map((name) => (
            <span key={name} className="weekday-name">
              {name}
            </span>
          ))}
        </div>

        <div className="calendar" aria-label={formatMonth(monthStart)}>
          {cells.map((cell) => {
            // The blanks in front of the 1st. An empty div holds the space so
            // the dates line up under the right weekday.
            if (cell.blank) {
              return <div key={cell.id} className="day-blank" />
            }

            // Worked out once each because they're needed several times below.
            const isChosen = routineDays.includes(cell.key)
            const isToday = cell.key === today

            // Because the keys are zero-padded, comparing them as TEXT gives
            // the right answer — see the note at the top of dates.js.
            const isPast = cell.key < today

            return (
              <button
                key={cell.id}
                type="button"
                // Three separate states, so the class name is built up rather
                // than written out: chosen, today, or an ordinary day.
                className={`day${isChosen ? ' is-chosen' : ''}${
                  isToday ? ' is-today' : ''
                }`}
                // There's no planning a day that has already gone.
                disabled={isPast}
                aria-pressed={isChosen}
                // A screen reader would otherwise announce only "13". This
                // spells out the full date and its state. It isn't shown.
                aria-label={`${cell.key}${isToday ? ', today' : ''}${
                  isChosen ? ', chosen' : ''
                }`}
                onClick={() => onToggleDay(cell.key)}
              >
                {cell.day}
              </button>
            )
          })}
        </div>
      </div>

      {/* ---- Save ----
          At the foot of the page, after the calendar, so it reads as the last
          step rather than something to do on the way past. */}
      <div className="routine-save">
        <p className="routine-count">
          {/* Counts every chosen date, across all months — not just the one on
              screen, which would drop to zero as you flicked ahead and look
              like the choices had been lost. */}
          {`${routineDays.length} ${routineDays.length === 1 ? 'day' : 'days'} chosen`}
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          // Saving an empty calendar and then being asked to set a reminder for
          // nothing would be a confusing place to end up.
          disabled={routineDays.length === 0}
        >
          Save days and set reminder
        </button>

        {/* Once a reminder exists, say so and offer a way straight back to it —
            otherwise changing the time would mean re-saving the calendar. */}
        {reminderTime && (
          <button
            type="button"
            className="ghost-button"
            onClick={() => setShowReminder(true)}
          >
            {`Reminder set for ${reminderTime}`}
          </button>
        )}
      </div>
    </main>
  )
}

export default RoutineScreen
