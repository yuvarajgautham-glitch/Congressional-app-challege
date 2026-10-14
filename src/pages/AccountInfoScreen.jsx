// AccountInfoScreen.jsx — Settings › Account info.

import { useState } from 'react'
import RegisterForm from '../components/RegisterForm'
import LoginForm from '../components/LoginForm'
import {
  loadAccount,
  saveAccount,
  loadLoggedIn,
  saveLoggedIn,
} from '../accountStorage'
import './AccountInfoScreen.css'

// PROPS: onBack → returns to the Settings list (SettingsScreen passes this in).
function AccountInfoScreen({ onBack }) {
  // Which of the three views is showing.
  const [view, setView] = useState('menu')

  // The saved account, or null if nobody has registered yet.
  const [account, setAccount] = useState(() => loadAccount())

  // Whether the user is signed in.
  const [loggedIn, setLoggedIn] = useState(() => loadLoggedIn())

  // ---- Actions ----

  // Called by RegisterForm once its checks pass.
  function handleCreate(newAccount) {
    // Two jobs each time: update state so the screen redraws NOW.
    setAccount(newAccount)
    saveAccount(newAccount)

    setLoggedIn(true)
    saveLoggedIn(true)

    setView('current')
  }

  // Called by LoginForm when it finds an account saved by an older version of the app.
  function handleUpgrade(repairedAccount) {
    setAccount(repairedAccount)
    saveAccount(repairedAccount)
  }

  // Called by LoginForm once the email and password match.
  function handleLogin() {
    setLoggedIn(true)
    saveLoggedIn(true)
    setView('current')
  }

  // Signs out.
  function handleLogout() {
    setLoggedIn(false)
    saveLoggedIn(false)
    setView('menu')
  }

  // ---- View 1: the registration form ----
  if (view === 'create') {
    return (
      <main className="screen account-screen">
        <h1 className="title account-title">Create account</h1>
        <div className="title-rule" />

        {/* Handing our own functions down as props. */}
        <RegisterForm
          onCreate={handleCreate}
          onCancel={() => setView('menu')}
        />
      </main>
    )
  }

  // ---- View 2: current information ----
  if (view === 'current') {
    return (
      <main className="screen account-screen">
        <h1 className="title account-title">Current information</h1>
        <div className="title-rule" />

        {/* Three different things can be true here, so the code checks them in order: no account at. */}

        {!account ? (
          // Nothing registered yet — offer to fix that rather than dead-ending.
          <div className="account-empty">
            <p className="quote">No account yet</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => setView('create')}
            >
              Create account
            </button>
          </div>
        ) : !loggedIn ? (
          // An account exists but the user is signed out, so ask them to log in.
          <LoginForm
            account={account}
            onLogin={handleLogin}
            onUpgrade={handleUpgrade}
            onCancel={() => setView('menu')}
          />
        ) : (
          // Signed in — show the details.
          <div className="account-details">
            {/* <dl> is a description list: the proper HTML for pairs of "label and value" like these. <dt>. */}
            <dl className="detail-list">
              <dt className="detail-term">Name</dt>
              <dd className="detail-value">{account.name}</dd>

              <dt className="detail-term">Age</dt>
              <dd className="detail-value">{account.age}</dd>

              <dt className="detail-term">Sex</dt>
              <dd className="detail-value">{account.sex}</dd>

              <dt className="detail-term">Height</dt>
              {/* Backticks make a "template string": anything inside ${ } is a value dropped into the text. */}
              <dd className="detail-value">
                {`${account.heightFeet}' ${account.heightInches}"`}
              </dd>

              <dt className="detail-term">Weight</dt>
              <dd className="detail-value">{`${account.weight} lb`}</dd>

              <dt className="detail-term">Email</dt>
              <dd className="detail-value">{account.email}</dd>
            </dl>

            {/* The password is deliberately never shown. */}

            <button
              type="button"
              className="primary-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        )}

        <button
          type="button"
          className="back-button"
          onClick={() => setView('menu')}
        >
          <span className="back-arrow" aria-hidden="true">
            &#8249;
          </span>
          Back
        </button>
      </main>
    )
  }

  // ---- View 3: the menu ----
  // Reached when view is 'menu', because both checks above returned early.
  return (
    <main className="screen account-screen">
      <h1 className="title account-title">Account info</h1>
      <div className="title-rule" />

      <div className="row-list">
        <button
          type="button"
          className="row-button"
          onClick={() => setView('create')}
        >
          <span className="row-label">Create new account</span>
          <span className="row-arrow" aria-hidden="true">
            &#8250;
          </span>
        </button>

        <button
          type="button"
          className="row-button"
          onClick={() => setView('current')}
        >
          <span className="row-label">Current information</span>
          <span className="row-arrow" aria-hidden="true">
            &#8250;
          </span>
        </button>
      </div>

      {/* A small line telling the user where they stand. */}
      <p className="account-status">
        {loggedIn && account
          ? `Signed in as ${account.name}`
          : 'Not signed in'}
      </p>

      {/* This Back button leaves Account info entirely and returns to the Settings list. */}
      <button type="button" className="back-button" onClick={onBack}>
        <span className="back-arrow" aria-hidden="true">
          &#8249;
        </span>
        Back
      </button>
    </main>
  )
}

export default AccountInfoScreen
