// ============================================================================
// SettingsScreen.jsx — the screen shown when you tap "Settings" in the menu.
//
// It lists the settings you can open. The ">" arrow on each row is the usual
// phone-app signal for "tapping this opens another page".
//
// Those two inner pages aren't designed yet, so for now each one opens a short
// placeholder with a Back button. That way nothing in the app dead-ends.
// ============================================================================

import { useState } from 'react'
import AccountInfoScreen from './AccountInfoScreen'
import './SettingsScreen.css'

// The rows of the list. Adding a third setting is one more line here.
const SETTINGS = [
  { id: 'account', label: 'Account info' },
  { id: 'exercise', label: 'Exercise recommendations' },
]

function SettingsScreen() {
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
  // The only inner page that's actually been built. onBack lets it send the
  // user back to the list here, by setting openPage to null.
  if (openPage === 'account') {
    return <AccountInfoScreen onBack={() => setOpenPage(null)} />
  }

  // ---- Any other inner page ------------------------------------------------
  // Just "Exercise recommendations" for now, which is still a placeholder.
  if (openPage) {
    // .find() looks up the row that was tapped so we can show its name.
    const page = SETTINGS.find((item) => item.id === openPage)

    return (
      <main className="screen settings-screen">
        <h1 className="title settings-detail-title">{page.label}</h1>
        <div className="title-rule" />

        <p className="quote">Coming soon</p>

        {/* Setting openPage back to null returns to the list. */}
        <button
          type="button"
          className="back-button"
          onClick={() => setOpenPage(null)}
        >
          {/* aria-hidden hides the arrow SHAPE from screen readers, since the
              word "Back" next to it already says what the button does. */}
          <span className="back-arrow" aria-hidden="true">
            &#8249;
          </span>
          Back
        </button>
      </main>
    )
  }

  // ---- The list of settings ------------------------------------------------
  // Reached only when openPage is null, because the "if" above returns early.
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
