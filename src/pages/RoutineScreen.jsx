// RoutineScreen.jsx — the screen shown when you tap "Routine" in the menu.

import { useState, useEffect } from 'react'
import ReminderScreen from './ReminderScreen'
import DayNotesScreen from './DayNotesScreen'
import {
  WEEKDAY_NAMES,
  todayKey,
  formatNow,
  formatMonth,
  formatLongDate,
  addMonths,
  buildMonthGrid,
} from '../dates'
import { loadDayNote } from '../routineStorage'
import './RoutineScreen.css'

// How many months the dropdown offers: this one and the next eleven.
const MONTHS_AHEAD = 12

// PROPS from App.jsx: routineDays → the dates already picked.
function RoutineScreen({
  routineDays,
  onToggleDay,
  onSaveDays,
  onReplaceDays,
  reminderTime,
  onSetTime,
}) {
  // Whether the reminder screen is open.
  const [showReminder, setShowReminder] = useState(false)

  // The date most recently tapped on the calendar, or null before any tap.
  const [pickedDay, setPickedDay] = useState(null)

  // Whether that day’s own page is open.
  const [showDay, setShowDay] = useState(false)

  // Tapping a calendar square.
  function handleDayTap(dateKey) {
    onToggleDay(dateKey)
    setPickedDay(dateKey)
  }

  // Which month is on screen, counted from the current one: 0 is this month, 1 is next month.
  const [monthOffset, setMonthOffset] = useState(0)

  // The current date and time, kept up to date by the effect below.
  const [now, setNow] = useState(() => new Date())

  // ---- Keeping the clock right ----
  // Without this the time would show whatever it was when the screen opened and then sit there.
  useEffect(() => {
    let timerId = null

    function tick() {
      // 60000 milliseconds is a minute.
      const untilNextMinute = 60000 - (Date.now() % 60000)

      timerId = window.setTimeout(() => {
        setNow(new Date())
        tick() // Set the next one, which is what makes this keep going.
      }, untilNextMinute)
    }

    tick()

    // Returned from useEffect, so React runs it when the screen closes.
    return () => {
      if (timerId !== null) window.clearTimeout(timerId)
    }
  }, [])

  // ---- The reminder screen ----
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

  // ---- One day’s own page ----
  // Same pattern as the reminder screen above: returned early.
  if (showDay && pickedDay) {
    return (
      <DayNotesScreen
        dateKey={pickedDay}
        isChosen={routineDays.includes(pickedDay)}
        onToggle={() => onToggleDay(pickedDay)}
        onBack={() => setShowDay(false)}
      />
    )
  }

  // ---- Working out what to draw ----
  const today = todayKey()

  // The first of whichever month is being shown, and its grid of cells.
  const monthStart = addMonths(now, monthOffset)
  const cells = buildMonthGrid(monthStart)

  // The dropdown's options: this month and the next eleven.
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

      {/* Today Everything below the title starts here: what day it actually is. */}
      <p className="routine-now">{formatNow(now)}</p>

      {/* The prompt. */}
      <p className="routine-prompt">
        Tap the days you plan to exercise, then save to set a daily reminder.
      </p>

      {/* The month dropdown A <select> opens the native picker wheel on a phone. */}
      <div className="month-picker">
        <label className="month-label" htmlFor="routine-month">
          Month
        </label>
        <select
          id="routine-month"
          className="field-input month-select"
          value={monthOffset}
          // Everything from a form arrives as TEXT, even from a list of numbers.
          onChange={(event) => setMonthOffset(Number(event.target.value))}
        >
          {monthOptions.map((option) => (
            <option key={option.offset} value={option.offset}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* The calendar. */}
      <div className="calendar-block">
        {/* The month's name, repeated above the grid. */}
        <p className="month-title">{formatMonth(monthStart)}</p>

        {/* The weekday names. aria-hidden because a screen reader gets each date's full weekday. */}
        <div className="weekday-row" aria-hidden="true">
          {WEEKDAY_NAMES.map((name) => (
            <span key={name} className="weekday-name">
              {name}
            </span>
          ))}
        </div>

        <div className="calendar" aria-label={formatMonth(monthStart)}>
          {cells.map((cell) => {
            // The blanks in front of the 1st.
            if (cell.blank) {
              return <div key={cell.id} className="day-blank" />
            }

            // Worked out once each because they're needed several times below.
            const isChosen = routineDays.includes(cell.key)
            const isToday = cell.key === today

            // Because the keys are zero-padded, comparing them as TEXT gives the right answer.
            const isPast = cell.key < today

            return (
              <button
                key={cell.id}
                type="button"
                // Three separate states, so the class name is built up rather than written out: chosen, today.
                className={`day${isChosen ? ' is-chosen' : ''}${
                  isToday ? ' is-today' : ''
                }`}
                // There's no planning a day that has already gone.
                disabled={isPast}
                aria-pressed={isChosen}
                // A screen reader would otherwise announce only "13".
                aria-label={`${cell.key}${isToday ? ', today' : ''}${
                  isChosen ? ', chosen' : ''
                }`}
                onClick={() => handleDayTap(cell.key)}
              >
                {cell.day}
              </button>
            )
          })}
        </div>
      </div>

      {/* The day you just tapped Appears only once a square has been tapped. */}
      {pickedDay && (
        <div className="picked-day">
          <p className="picked-day-text">
            {`${formatLongDate(pickedDay)} is ${
              routineDays.includes(pickedDay) ? 'in' : 'not in'
            } your routine.`}
          </p>

          <button
            type="button"
            className="ghost-button picked-day-open"
            onClick={() => setShowDay(true)}
          >
            {/* Says whether there is already something to read. */}
            {loadDayNote(pickedDay)
              ? 'Open this day \u2014 you have notes'
              : 'Open this day and add notes'}
          </button>
        </div>
      )}

      {/* Save At the foot of the page, after the calendar. */}
      <div className="routine-save">
        <p className="routine-count">
          {/* Counts every chosen date, across all months — not just the one on screen. */}
          {`${routineDays.length} ${routineDays.length === 1 ? 'day' : 'days'} chosen`}
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          // Saving an empty calendar and then being asked to set a reminder for nothing would be.
          disabled={routineDays.length === 0}
        >
          Save days and set reminder
        </button>

        {/* Once a reminder exists, say so and offer a way straight back to. */}
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
