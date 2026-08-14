// ============================================================================
// SettingsScreen.jsx — the screen shown when you tap "Settings" in the menu.
//
// It lists the settings you can open. The ">" arrow on each row is the usual
// phone-app signal for "tapping this opens another page".
//
// Every row opens a real screen of its own, kept in its own file. If you add
// another setting below, remember to add a matching "if" in the component too —
// without one, tapping the new row would do nothing at all.
// ============================================================================

import { useState } from 'react'
import AccountInfoScreen from './AccountInfoScreen'
import BmiScreen from './BmiScreen'
import ResetGoalsScreen from './ResetGoalsScreen'
import './SettingsScreen.css'

// The rows of the list, in the order they appear. Adding another setting is one
// more line here. "Your BMI" sits under "Account info" because it's worked out
// entirely from the details given there.
const SETTINGS = [
  { id: 'account', label: 'Account info' },
  { id: 'bmi', label: 'Your BMI' },
  { id: 'reset', label: 'Reset goals' },
]

// PROPS from App.jsx:
//   onResetProgress → clears the goal, calendar, reminder and ticked exercises
function SettingsScreen({ onResetProgress }) {
  // Which inner page is open: null means "show the list".
  //
  // Compare this with the goal and calendar in App.jsx, which had to be stored
  // higher up to survive switching tabs. Here we WANT the opposite: leaving
  // Settings and coming back should show the list again, not drop you back
  // inside a sub-page. Keeping it in this component gives us that for free.
  //
  // Rule of thumb: keep state in the component that uses it, and only move it
  // up when something outside needs it too.
  const [openPage, setOpenPage] = useState(null)

  // ---- Account info: a screen of its own -----------------------------------
  // onBack lets it send the user back to the list here, by setting openPage
  // back to null.
  if (openPage === 'account') {
    return <AccountInfoScreen onBack={() => setOpenPage(null)} />
  }

  // ---- Your BMI: worked out from the account details ------------------------
  // Same pattern as above — its own file, handed the same onBack.
  if (openPage === 'bmi') {
    return <BmiScreen onBack={() => setOpenPage(null)} />
  }

  // ---- Reset goals: the yes/no question ------------------------------------
  // The clearing itself belongs to App.jsx, which owns the goal, the calendar
  // and the reminder. This screen only passes the request along.
  if (openPage === 'reset') {
    return (
      <ResetGoalsScreen
        onReset={onResetProgress}
        onBack={() => setOpenPage(null)}
      />
    )
  }

  // ---- The list of settings ------------------------------------------------
  // Reached only when openPage is null, because the "if"s above return early.
  return (
    <main className="screen settings-screen">
      <h1 className="title">Settings</h1>
      <div className="title-rule" />

      <div className="row-list">
        {SETTINGS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="row-button"
            // Tells screen readers that tapping this opens something else.
            aria-haspopup="true"
            onClick={() => setOpenPage(item.id)}
          >
            <span className="row-label">{item.label}</span>

            {/* The ">" arrow at the end of the row. &#8250; is the code for the
                › character. It's decoration, so it's hidden from screen
                readers — aria-haspopup above already conveys the meaning. */}
            <span className="row-arrow" aria-hidden="true">
              &#8250;
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}

export default SettingsScreen
