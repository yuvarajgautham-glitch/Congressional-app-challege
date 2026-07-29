// ============================================================================
// LoginForm.jsx — the sign-in form, shown when an account exists but the user
// is signed out.
//
// It checks the typed email and password against the saved account. Remember
// that the account lives on this phone, not on a server — see the warning at
// the top of accountStorage.js for why that is a demo, not real security.
// ============================================================================

import { useState } from 'react'

// PROPS:
//   account → the saved account to check against
//   onLogin → called when the details match
//   onCancel → called when the user taps Cancel
function LoginForm({ account, onLogin, onCancel }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    // Stop the browser reloading the page, as in RegisterForm.
    event.preventDefault()

    // Compare in lower case, so "Sam@..." matches the stored "sam@...".
    const typedEmail = email.trim().toLowerCase()

    // Both have to match. && means "and" — the whole thing is only true when
    // the email is right AND the password is right.
    const matches =
      typedEmail === account.email && password === account.password

    if (!matches) {
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
        <button type="submit" className="primary-button">
          Log in
        </button>
        <button type="button" className="ghost-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default LoginForm
