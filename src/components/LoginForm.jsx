// ============================================================================
// LoginForm.jsx — the sign-in form, shown when an account exists but the user
// is signed out.
//
// It checks the typed email and password against the saved account. The saved
// account holds a SCRAMBLE of the password, never the password itself, so this
// works by scrambling what was typed and comparing the two — see
// passwordSecurity.js.
// ============================================================================

import { useState } from 'react'
import { verifyPassword, hashPassword } from '../passwordSecurity'

// PROPS:
//   account   → the saved account to check against
//   onLogin   → called when the details match
//   onUpgrade → called with a repaired account when an old plain-text password
//               is found, so it can be replaced with a scrambled one
//   onCancel  → called when the user taps Cancel
function LoginForm({ account, onLogin, onUpgrade, onCancel }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Stops a second submit while the first is still scrambling. The check takes
  // a moment by design, and without this a double-tap would run it twice.
  const [isChecking, setIsChecking] = useState(false)

  // "async" because checking the password waits on the crypto engine.
  async function handleSubmit(event) {
    // Stop the browser reloading the page, as in RegisterForm.
    event.preventDefault()

    if (isChecking) return
    setIsChecking(true)

    // Compare in lower case, so "Sam@..." matches the stored "sam@...".
    const typedEmail = email.trim().toLowerCase()

    // ---- Is the password right? ---------------------------------------------
    let passwordOk

    if (account.auth) {
      // The normal path: compare scramble with scramble.
      passwordOk = await verifyPassword(password, account.auth)
    } else {
      // An account saved by an OLDER version of this app, back when the
      // password was stored as typed. Compare it directly this once, so nobody
      // is locked out of an account they already had...
      passwordOk = password === account.password

      if (passwordOk) {
        // ...and immediately replace it with a scrambled one. This is the only
        // moment the plain password is available to scramble, since it isn't
        // recoverable from storage afterwards.
        const auth = await hashPassword(password)

        // Rebuilt without the old password field. Object destructuring with a
        // rest (...) is the tidy way to say "everything except this one".
        // eslint-disable-next-line no-unused-vars
        const { password: _old, ...rest } = account

        onUpgrade({ ...rest, auth })
      }
    }

    // Both have to match. && means "and" — the whole thing is only true when
    // the email is right AND the password is right.
    const matches = typedEmail === account.email && passwordOk

    if (!matches) {
      setIsChecking(false)

      // One vague message on purpose, rather than "that email isn't
      // registered" or "wrong password". Saying which half was wrong tells a
      // stranger whether an email has an account here, which is worth avoiding
      // as a habit even in a demo like this.
      setError('Email or password is not correct.')
      return
    }

    // Details are good — tell AccountInfoScreen to sign the user in.
    onLogin()
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="login-email">
        Email
      </label>
      <input
        id="login-email"
        className="field-input"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
      />

      <label className="field-label" htmlFor="login-password">
        Password
      </label>
      <input
        id="login-password"
        className="field-input"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        // "current-password" lets the phone offer a saved password, unlike the
        // "new-password" used on the registration form.
        autoComplete="current-password"
      />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-buttons">
        <button
          type="submit"
          className="primary-button"
          disabled={isChecking}
        >
          {isChecking ? 'Checking…' : 'Log in'}
        </button>
        <button type="button" className="ghost-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default LoginForm
