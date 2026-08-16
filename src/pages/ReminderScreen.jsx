// ============================================================================
// ReminderScreen.jsx — Routine › the reminder time.
//
// Opens after the routine days are saved, and asks two things:
//
//   1. should those days repeat every week?
//   2. what time each day should the app remind you?
//
// The reminder repeats at that same time every day until it's turned off.
//
// The screen is honest about what a web app can actually deliver — see the
// warning at the top of notifications.js.
// ============================================================================

import { useState } from 'react'
import {
  supportsNotifications,
  notificationPermission,
  requestPermission,
} from '../notifications'
import { repeatWeekly } from '../dates'
import './ReminderScreen.css'

// How far ahead "repeat weekly" goes. 51 weeks is just under a year, which
// matches how far forward the month dropdown on the calendar lets you look —
// there's no point filling in months the user can't navigate to.
const REPEAT_WEEKS = 51

// PROPS from RoutineScreen:
//   days           → the chosen dates, as keys like "2026-08-13"
//   reminderTime   → the time already set, as "07:30", or '' for none
//   onReplaceDays  → asks App.jsx to swap the whole list of chosen dates
//   onSetTime      → asks App.jsx to change the time (App runs the timer)
//   onBack         → returns to the calendar
function ReminderScreen({
  days,
  reminderTime,
  onReplaceDays,
  onSetTime,
  onBack,
}) {
  // What's in the time box right now. It starts from the saved time, or 07:30
  // as a sensible first suggestion — an empty time box is fiddly to fill in on
  // a phone, and most people exercising in the morning are near that.
  const [time, setTime] = useState(reminderTime || '07:30')

  // What the browser said when we asked permission: '' before we've asked,
  // then 'granted', 'denied' or 'unsupported'. It decides which message shows
  // at the bottom of the screen.
  const [permission, setPermission] = useState(() => notificationPermission())

  // Whether the time on screen has been saved. Starts false so the button
  // invites a tap, and any edit to the box sends it back to false.
  const [isSaved, setIsSaved] = useState(false)

  // The answer to the weekly question: '' before it's answered, then 'yes' or
  // 'no'. Both answers are worth recording — once it's been answered either
  // way, the question stops being asked.
  const [weeklyAnswer, setWeeklyAnswer] = useState('')

  // The list of dates as it was BEFORE repeating, kept so the Undo button can
  // put it back. Repeating turns a handful of dates into a couple of hundred,
  // and un-picking those by hand would be miserable.
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
  //
  // "async" because asking permission opens a pop-up and we have to wait for
  // the user to answer it. "await" is what pauses here until they do.
  async function handleSave() {
    // Save first. Permission is about DELIVERING reminders; the schedule itself
    // is worth keeping either way, and this way a refused pop-up doesn't throw
    // away what the user just set.
    onSetTime(time)
    setIsSaved(true)

    // Only ask if we haven't already got an answer. Browsers ignore a second
    // request once the user has decided, so asking again would do nothing.
    if (notificationPermission() === 'default') {
      setPermission(await requestPermission())
    } else {
      setPermission(notificationPermission())
    }
  }

  // Turns the reminder off. The routine days stay saved — only the time goes.
  function handleTurnOff() {
    onSetTime('')
    setIsSaved(false)
  }

  return (
    <main className="screen reminder-screen">
      <h1 className="title reminder-title">Daily reminder</h1>
      <div className="title-rule" />

      {/* Confirms what just happened, so saving the calendar has a visible
          result rather than silently moving the user to a new screen. The
          count updates by itself if the days are repeated below. */}
      <p className="reminder-intro">
        {`${days.length} ${days.length === 1 ? 'day' : 'days'} saved to your routine.`}
      </p>

      {/* ---- Question 1: repeat weekly? ----
          Asked before the time, because it's about the days that were just
          saved — it finishes that thought before starting a new one. */}
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
          // Answered no. The question can be re-opened by clearing the answer,
          // so saying no isn't a decision the user is stuck with.
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

      {/* ---- Question 2: the time box ---- */}
      <div className="reminder-field">
        <p className="reminder-question">What time should the app remind you?</p>

        <label className="field-label reminder-label" htmlFor="reminder-time">
          Remind me at
        </label>

        {/* type="time" gives a proper clock picker on a phone rather than
            making the user type "07:30" by hand, and the browser shows it in
            whatever format the user's own phone uses — 24-hour or am/pm. */}
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

      {/* ---- Save ---- */}
      <div className="reminder-actions">
        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          // An empty box would save "no reminder" while looking like it set
          // one. Greying the button out says "not yet" more clearly than an
          // error message after the tap would.
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

      {/* ---- What will actually happen ----
          Which message shows depends on the browser's answer. Saying nothing
          would be worse: a reminder that silently never arrives looks like the
          app is broken, when it's usually a permission that was refused. */}
      <p className="form-note">
        {!supportsNotifications()
          ? 'This browser cannot show notifications, so the time is saved as a plan rather than an alert. Opening the app at that time is the reminder for now.'
          : permission === 'denied'
            ? 'Notifications are blocked for this app. Your phone or browser settings are where that gets switched back on.'
            : permission === 'granted'
              ? 'Reminders arrive while the app is open. A web page cannot run once it is closed, so reminders with the app shut need a phone app or a notification server.'
              : 'The browser will ask your permission when you save. Reminders arrive while the app is open — a web page cannot run once it is closed.'}
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
