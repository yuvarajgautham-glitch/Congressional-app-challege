// SettingsScreen.jsx — the screen shown when you tap "Settings" in the menu.

import { useState } from 'react'
import AccountInfoScreen from './AccountInfoScreen'
import BmiScreen from './BmiScreen'
import ResetGoalsScreen from './ResetGoalsScreen'
import PrivacyScreen from './PrivacyScreen'
import './SettingsScreen.css'

// The rows of the list, in the order they appear.
const SETTINGS = [
  { id: 'account', label: 'Account info' },
  { id: 'bmi', label: 'Your BMI' },
  { id: 'reset', label: 'Reset goals' },
  { id: 'privacy', label: 'Privacy and data' },
]

// PROPS from App.jsx: onResetProgress → clears the goal, calendar.
function SettingsScreen({ onResetProgress }) {
  // Which inner page is open: null means "show the list".
  const [openPage, setOpenPage] = useState(null)

  // ---- Account info: a screen of its own ----
  // onBack lets it send the user back to the list here, by setting openPage back to null.
  if (openPage === 'account') {
    return <AccountInfoScreen onBack={() => setOpenPage(null)} />
  }

  // ---- Your BMI: worked out from the account details ----
  // Same pattern as above — its own file, handed the same onBack.
  if (openPage === 'bmi') {
    return <BmiScreen onBack={() => setOpenPage(null)} />
  }

  // ---- Reset goals: the yes/no question ----
  // The clearing itself belongs to App.jsx, which owns the goal, the calendar and the reminder.
  if (openPage === 'reset') {
    return (
      <ResetGoalsScreen
        onReset={onResetProgress}
        onBack={() => setOpenPage(null)}
      />
    )
  }

  // ---- Privacy and data: what's stored, and what isn't ----
  if (openPage === 'privacy') {
    return <PrivacyScreen onBack={() => setOpenPage(null)} />
  }

  // ---- The list of settings ----
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

            {/* The ">" arrow at the end of the row. &#8250; is the code for the › character. */}
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
