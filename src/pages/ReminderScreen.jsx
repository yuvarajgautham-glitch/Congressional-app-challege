// ReminderScreen.jsx — Routine › the reminder time.

import { useState } from 'react'
import {
  supportsNotifications,
  notificationPermission,
  requestPermission,
} from '../notifications'
import { repeatWeekly } from '../dates'
import './ReminderScreen.css'

// How far ahead "repeat weekly" goes. 51 weeks is just under a year.
const REPEAT_WEEKS = 51

// PROPS from RoutineScreen: days → the chosen dates.
function ReminderScreen({
  days,
  reminderTime,
  onReplaceDays,
  onSetTime,
  onBack,
}) {
  // What's in the time box right now.
  const [time, setTime] = useState(reminderTime || '07:30')

  // What the browser said when we asked permission: '' before we've asked, then 'granted'.
  const [permission, setPermission] = useState(() => notificationPermission())

  // Whether the time on screen has been saved.
  const [isSaved, setIsSaved] = useState(false)

  // The answer to the weekly question: '' before it's answered, then 'yes' or 'no'.
  const [weeklyAnswer, setWeeklyAnswer] = useState('')

  // The list of dates as it was BEFORE repeating, kept so the Undo button can put it back.
  const [daysBeforeRepeat, setDaysBeforeRepeat] = useState(null)

  // Repeats every chosen date weekly for the next year.
  function handleRepeatWeekly() {
    setDaysBeforeRepeat(days)
    onReplaceDays(repeatWeekly(days, REPEAT_WEEKS))
    setWeeklyAnswer('yes')
  }

  // Puts the original dates back and asks the question again.
  function handleUndoRepeat() {
    onReplaceDays(daysBeforeRepeat)
    setDaysBeforeRepeat(null)
    setWeeklyAnswer('')
  }

  // Saves the time and asks the browser's permission if we don't have it yet.
  async function handleSave() {
    // Save first.
    onSetTime(time)
    setIsSaved(true)

    // Only ask if we haven't already got an answer.
    if (notificationPermission() === 'default') {
      setPermission(await requestPermission())
    } else {
      setPermission(notificationPermission())
    }
  }

  // Turns the reminder off.
  function handleTurnOff() {
    onSetTime('')
    setIsSaved(false)
  }

  return (
    <main className="screen reminder-screen">
      <h1 className="title reminder-title">Daily reminder</h1>
      <div className="title-rule" />

      {/* Confirms what just happened, so saving the calendar has a visible result rather. */}
      <p className="reminder-intro">
        {`${days.length} ${days.length === 1 ? 'day' : 'days'} saved to your routine.`}
      </p>

      {/* Question 1: repeat weekly? */}
      <div className="reminder-weekly">
        <p className="reminder-question">Repeat these days every week?</p>

        {weeklyAnswer === '' ? (
          // Not answered yet — offer the two answers.
          <div className="reminder-choices">
            <button
              type="button"
              className="primary-button"
              onClick={handleRepeatWeekly}
            >
              Yes, repeat weekly
            </button>

            <button
              type="button"
              className="ghost-button"
              onClick={() => setWeeklyAnswer('no')}
            >
              No, just these days
            </button>
          </div>
        ) : weeklyAnswer === 'yes' ? (
          // Answered yes — confirm what it did, and offer a way back.
          <div className="reminder-choices">
            <p className="reminder-answer">
              Repeating every week for the next year.
            </p>
            <button
              type="button"
              className="ghost-button"
              onClick={handleUndoRepeat}
            >
              Undo repeat
            </button>
          </div>
        ) : (
          // Answered no.
          <div className="reminder-choices">
            <p className="reminder-answer">Just the days you picked.</p>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setWeeklyAnswer('')}
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Question 2: the time box. */}
      <div className="reminder-field">
        <p className="reminder-question">What time should the app remind you?</p>

        <label className="field-label reminder-label" htmlFor="reminder-time">
          Remind me at
        </label>

        {/* type="time" gives a proper clock picker on a phone rather than making the user type "07:30". */}
        <input
          id="reminder-time"
          className="field-input reminder-input"
          type="time"
          value={time}
          onChange={(event) => {
            setTime(event.target.value)
            setIsSaved(false)
          }}
        />

        <p className="reminder-repeat">
          You&apos;ll be reminded at this time on the days you picked, and
          nothing on your rest days. An hour later a second reminder asks
          whether you finished — confirming there is what adds a day to your
          streak.
        </p>
      </div>

      {/* Save. */}
      <div className="reminder-actions">
        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          // An empty box would save "no reminder" while looking like it set one.
          disabled={!time}
        >
          {isSaved ? 'Reminder saved' : 'Save reminder'}
        </button>

        {/* Only worth showing once there's a reminder to turn off. */}
        {reminderTime && (
          <button
            type="button"
            className="ghost-button"
            onClick={handleTurnOff}
          >
            Turn reminder off
          </button>
        )}
      </div>

      {/* What will actually happen Which message shows depends on the browser's answer. */}
      <p className="form-note">
        {!supportsNotifications()
          ? 'This browser cannot show notifications, so the time is saved as a plan rather than an alert. Opening the app at that time is the reminder for now.'
          : permission === 'denied'
            ? 'Notifications are blocked for this app. Your phone or browser settings are where that gets switched back on.'
            : permission === 'granted'
              ? 'Reminders appear on your phone like any other notification, and tapping one opens the app on the right page — even if you have closed it since. Add Active Living to your home screen for the most reliable delivery.'
              : 'The browser will ask your permission when you save. Reminders then appear on your phone like any other notification, and tapping one opens the app.'}
      </p>

      <button type="button" className="back-button" onClick={onBack}>
        <span className="back-arrow" aria-hidden="true">
          &#8249;
        </span>
        Back
      </button>
    </main>
  )
}

export default ReminderScreen
