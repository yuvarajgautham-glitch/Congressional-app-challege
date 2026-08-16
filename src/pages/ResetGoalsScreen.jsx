// ============================================================================
// ResetGoalsScreen.jsx — Settings › Reset goals.
//
// A question with two answers. Under each one, in smaller print, is exactly
// what tapping it does — because "are you sure?" on its own tells the user
// nothing they didn't already know, and this is the one screen in the app that
// throws work away.
//
// Nothing is cleared until Yes is tapped. Opening this page, reading it and
// leaving changes nothing at all.
// ============================================================================

import { useState } from 'react'
import './ResetGoalsScreen.css'

// PROPS from SettingsScreen:
//   onReset → clears the progress (App.jsx does the actual work)
//   onBack  → returns to the Settings list
function ResetGoalsScreen({ onReset, onBack }) {
  // Whether the reset has happened. Once it has, the question is gone and the
  // screen becomes a confirmation — asking again would invite a second tap on
  // something that has already done its job.
  const [isReset, setIsReset] = useState(false)

  function handleYes() {
    onReset()
    setIsReset(true)
  }

  // ---- After the reset -----------------------------------------------------
  if (isReset) {
    return (
      <main className="screen reset-screen">
        <h1 className="title reset-title">Reset goals</h1>
        <div className="title-rule" />

        <p className="quote">Your goals have been reset.</p>

        <p className="reset-note reset-note-centred">
          Your goal, your calendar, your reminder, your streak and every
          exercise you had ticked off are gone. Your account details were left
          untouched.
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

  // ---- The question --------------------------------------------------------
  return (
    <main className="screen reset-screen">
      <h1 className="title reset-title">Reset goals</h1>
      <div className="title-rule" />

      <p className="reset-question">Reset everything you have done so far?</p>

      <div className="reset-choices">
        {/* Each answer is a button with its consequences written underneath in
            smaller type. The two are wrapped together so the small print stays
            visibly attached to the button it describes. */}
        <div className="reset-choice">
          <button type="button" className="primary-button" onClick={handleYes}>
            Yes
          </button>
          <p className="reset-note">
            Clears the goal you picked, every day chosen on the Routine
            calendar, your daily reminder time, every exercise you have ticked
            off on any day, your check-in streak, and every weekly measurement
            on your graph. This cannot be undone.
            <br />
            <br />
            Your account details — name, age, sex, height, weight and email —
            are kept, so your BMI stays as it is and you stay signed in.
          </p>
        </div>

        <div className="reset-choice">
          <button type="button" className="ghost-button" onClick={onBack}>
            No
          </button>
          <p className="reset-note">
            Changes nothing. Everything stays exactly as it is and you go back
            to Settings.
          </p>
        </div>
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

export default ResetGoalsScreen
