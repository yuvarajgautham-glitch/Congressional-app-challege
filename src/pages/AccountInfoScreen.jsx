// ============================================================================
// AccountInfoScreen.jsx — Settings › Account info.
//
// Two choices, as in the sketch: "Create new account" and "Current
// information". This file is the one that decides which of the three views to
// show, and it owns the account itself — the forms only collect and report.
//
//   menu    → the two buttons
//   create  → the registration form
//   current → your details if signed in, otherwise the sign-in form
//
// The bottom menu bar is not here. App.jsx draws that under every screen, so it
// stays put exactly as the sketch shows.
// ============================================================================

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

// PROPS:
//   onBack → returns to the Settings list (SettingsScreen passes this in)
function AccountInfoScreen({ onBack }) {
  // Which of the three views is showing.
  const [view, setView] = useState('menu')

  // The saved account, or null if nobody has registered yet.
  //
  // Passing a FUNCTION to useState instead of a value means "run this once, on
  // the very first render, to work out the starting value". Without the arrow,
  // loadAccount() would run on every single render — wasted work reading from
  // storage over and over.
  const [account, setAccount] = useState(() => loadAccount())

  // Whether the user is signed in. Also read from storage, so closing the app
  // and reopening it keeps you signed in.
  const [loggedIn, setLoggedIn] = useState(() => loadLoggedIn())

  // ---- Actions -------------------------------------------------------------

  // Called by RegisterForm once its checks pass. Saves the account, signs the
  // new user in straight away, and shows their details.
  function handleCreate(newAccount) {
    // Two jobs each time: update state so the screen redraws NOW, and write to
    // storage so it's still there after a reload. State is the app's memory for
    // this visit; storage is its memory between visits.
    setAccount(newAccount)
    saveAccount(newAccount)

    setLoggedIn(true)
    saveLoggedIn(true)

    setView('current')
  }

  // Called by LoginForm once the email and password match.
  function handleLogin() {
    setLoggedIn(true)
    saveLoggedIn(true)
    setView('current')
  }

  // Signs out. The account itself is kept, so the user can log back in.
  function handleLogout() {
    setLoggedIn(false)
    saveLoggedIn(false)
    setView('menu')
  }

  // ---- View 1: the registration form ---------------------------------------
  if (view === 'create') {
    return (
      <main className="screen account-screen">
        <h1 className="title account-title">Create account</h1>
        <div className="title-rule" />

        {/* Handing our own functions down as props. When the form is filled in
            correctly it calls onCreate, which runs handleCreate up here. */}
        <RegisterForm
          onCreate={handleCreate}
          onCancel={() => setView('menu')}
        />
      </main>
    )
  }

  // ---- View 2: current information -----------------------------------------
  if (view === 'current') {
    return (
      <main className="screen account-screen">
        <h1 className="title account-title">Current information</h1>
        <div className="title-rule" />

        {/* Three different things can be true here, so the code checks them in
            order: no account at all, an account but signed out, or signed in. */}

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
            onCancel={() => setView('menu')}
          />
        ) : (
          // Signed in — show the details.
          <div className="account-details">
            {/* <dl> is a description list: the proper HTML for pairs of
                "label and value" like these. <dt> is the term, <dd> the value. */}
            <dl className="detail-list">
              <dt className="detail-term">Name</dt>
              <dd className="detail-value">{account.name}</dd>

              <dt className="detail-term">Age</dt>
              <dd className="detail-value">{account.age}</dd>

              <dt className="detail-term">Sex</dt>
              <dd className="detail-value">{account.sex}</dd>

              <dt className="detail-term">Height</dt>
              {/* Backticks make a "template string": anything inside ${ } is a
                  value dropped into the text. The \" is a double quote — the
                  backslash tells JavaScript it's part of the text, not the end
                  of it. So this reads as 5' 9". */}
              <dd className="detail-value">
                {`${account.heightFeet}' ${account.heightInches}"`}
              </dd>

              <dt className="detail-term">Weight</dt>
              <dd className="detail-value">{`${account.weight} lb`}</dd>

              <dt className="detail-term">Email</dt>
              <dd className="detail-value">{account.email}</dd>
            </dl>

            {/* The password is deliberately never shown. Even in a demo it's a
                bad habit — someone glancing at the screen shouldn't get it. */}

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

  // ---- View 3: the menu ----------------------------------------------------
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

      {/* A small line telling the user where they stand, so they don't have to
          open a page to find out whether they're signed in. */}
      <p className="account-status">
        {loggedIn && account
          ? `Signed in as ${account.name}`
          : 'Not signed in'}
      </p>

      {/* This Back button leaves Account info entirely and returns to the
          Settings list — that's the onBack prop from SettingsScreen. */}
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
