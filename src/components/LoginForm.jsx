// LoginForm.jsx — the sign-in form, shown when an account exists but the user is signed out.

import { useState } from 'react'
import { verifyPassword, hashPassword } from '../passwordSecurity'

// PROPS: account → the saved account to check against onLogin → called when the details match.
function LoginForm({ account, onLogin, onUpgrade, onCancel }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Stops a second submit while the first is still scrambling.
  const [isChecking, setIsChecking] = useState(false)

  // "async" because checking the password waits on the crypto engine.
  async function handleSubmit(event) {
    // Stop the browser reloading the page, as in RegisterForm.
    event.preventDefault()

    if (isChecking) return
    setIsChecking(true)

    // Compare in lower case, so "Sam@..." matches the stored "sam@...".
    const typedEmail = email.trim().toLowerCase()

    // ---- Is the password right? ----
    let passwordOk

    if (account.auth) {
      // The normal path: compare scramble with scramble.
      passwordOk = await verifyPassword(password, account.auth)
    } else {
      // An account saved by an OLDER version of this app.
      passwordOk = password === account.password

      if (passwordOk) {
        // ...and immediately replace it with a scrambled one.
        const auth = await hashPassword(password)

        // Rebuilt without the old password field.
        // eslint-disable-next-line no-unused-vars
        const { password: _old, ...rest } = account

        onUpgrade({ ...rest, auth })
      }
    }

    // Both have to match. && means "and".
    const matches = typedEmail === account.email && passwordOk

    if (!matches) {
      setIsChecking(false)

      // One vague message on purpose, rather than "that email isn't registered" or "wrong password".
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
        // "current-password" lets the phone offer a saved password.
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
