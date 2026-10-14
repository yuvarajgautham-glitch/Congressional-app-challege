// RegisterForm.jsx — the "Create new account" form.

import { useState } from 'react'
import { hashPassword } from '../passwordSecurity'

// The choices in the Sex dropdown.
const SEX_OPTIONS = ['Male', 'Female', 'Other', 'I would rather not say']

// PROPS: onCreate → called with the new account once the form passes its checks onCancel →.
function RegisterForm({ onCreate, onCancel }) {
  // One piece of state per box on the form.
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [weight, setWeight] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Typed a second time to catch a slip.
  const [confirm, setConfirm] = useState('')

  // The message shown when something is wrong.
  const [error, setError] = useState('')

  // Runs when the form is submitted — either by tapping the button.
  async function handleSubmit(event) {
    // Browsers reload the whole page when a form is submitted.
    event.preventDefault()

    // .trim() removes spaces from the ends.
    const cleanName = name.trim()
    const cleanEmail = email.trim()

    // Everything typed into a box arrives as TEXT, even from a number box — "17" not 17.
    const ageNumber = Number(age)
    const feetNumber = Number(heightFeet)
    // Inches may be left blank, which we treat as 0.
    const inchesNumber = heightInches === '' ? 0 : Number(heightInches)
    const weightNumber = Number(weight)

    // The checks.
    if (!cleanName) {
      setError('Please enter your name.')
      return
    }

    // Number.isFinite() rejects anything that isn't a real number.
    if (!Number.isFinite(ageNumber) || ageNumber < 5 || ageNumber > 120) {
      setError('Please enter an age between 5 and 120.')
      return
    }

    if (!sex) {
      setError('Please choose an option for sex.')
      return
    }

    if (!Number.isFinite(feetNumber) || feetNumber < 1 || feetNumber > 8) {
      setError('Please enter a height in feet between 1 and 8.')
      return
    }

    if (
      !Number.isFinite(inchesNumber) ||
      inchesNumber < 0 ||
      inchesNumber > 11
    ) {
      // 12 inches is a foot, so the inches box only ever holds 0 to 11.
      setError('Inches must be between 0 and 11.')
      return
    }

    if (!Number.isFinite(weightNumber) || weightNumber < 20 || weightNumber > 1000) {
      setError('Please enter a weight in pounds between 20 and 1000.')
      return
    }

    // A deliberately loose email check: something, then @, then something.
    if (!cleanEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirm) {
      // !== means "is NOT exactly equal to".
      setError('The two passwords do not match.')
      return
    }

    // Everything passed.

    // The password is scrambled BEFORE it goes anywhere.
    const auth = await hashPassword(password)

    onCreate({
      name: cleanName,
      age: ageNumber,
      sex,
      heightFeet: feetNumber,
      heightInches: inchesNumber,
      weight: weightNumber,
      // Stored in lower case so signing in later isn't case-sensitive.
      email: cleanEmail.toLowerCase(),
      // Note the name: "auth", not "password".
      auth,
    })
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      {/* Every input gets a <label> tied to it by matching htmlFor and id. */}

      {/* 1. */}
      <label className="field-label" htmlFor="register-name">
        Name
      </label>
      <input
        id="register-name"
        className="field-input"
        type="text"
        // value + onChange together are what make this a controlled input: the box displays state.
        value={name}
        onChange={(event) => setName(event.target.value)}
        // Tells the iPhone keyboard to offer the saved name.
        autoComplete="name"
      />

      {/* 2. */}
      <label className="field-label" htmlFor="register-age">
        Age
      </label>
      <input
        id="register-age"
        className="field-input"
        // type="number" brings up the number pad on a phone instead of letters.
        type="number"
        // min and max make the little up/down arrows on a computer behave.
        min="5"
        max="120"
        value={age}
        onChange={(event) => setAge(event.target.value)}
      />

      {/* 3. */}
      <label className="field-label" htmlFor="register-sex">
        Sex
      </label>
      {/* <select> is a dropdown. */}
      <select
        id="register-sex"
        className="field-input"
        value={sex}
        onChange={(event) => setSex(event.target.value)}
      >
        {/* An empty first option means nothing is chosen to begin. */}
        <option value="">Choose one</option>
        {SEX_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* 4. */}
      <label className="field-label" htmlFor="register-height-feet">
        Height
      </label>
      {/* Two boxes side by side for feet and inches. */}
      <div className="field-row">
        <div className="field-part">
          <input
            id="register-height-feet"
            className="field-input"
            type="number"
            min="1"
            max="8"
            value={heightFeet}
            onChange={(event) => setHeightFeet(event.target.value)}
          />
          {/* A small word under the box saying what the number means. */}
          <span className="field-unit">feet</span>
        </div>

        <div className="field-part">
          <input
            id="register-height-inches"
            className="field-input"
            type="number"
            min="0"
            max="11"
            value={heightInches}
            onChange={(event) => setHeightInches(event.target.value)}
            // This box has no visible label of its own.
            aria-label="Height in inches"
          />
          <span className="field-unit">inches</span>
        </div>
      </div>

      {/* 5. */}
      <label className="field-label" htmlFor="register-weight">
        Weight
      </label>
      <div className="field-part">
        <input
          id="register-weight"
          className="field-input"
          type="number"
          min="20"
          max="1000"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
        <span className="field-unit">pounds</span>
      </div>

      {/* 6. */}
      <label className="field-label" htmlFor="register-email">
        Email
      </label>
      <input
        id="register-email"
        className="field-input"
        // type="email" makes the iPhone show a keyboard with an @ key.
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        // Phones capitalise the first letter by default, which is wrong for an email address.
        autoCapitalize="none"
        autoCorrect="off"
      />

      {/* 7. */}
      <label className="field-label" htmlFor="register-password">
        Password
      </label>
      <input
        id="register-password"
        className="field-input"
        // type="password" shows dots instead of the letters as you type.
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        // "new-password" stops the phone auto-filling an existing password and offers to suggest.
        autoComplete="new-password"
      />

      {/* 8. */}
      <label className="field-label" htmlFor="register-confirm">
        Confirm password
      </label>
      <input
        id="register-confirm"
        className="field-input"
        type="password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        // Also "new-password", so the phone treats this as part of setting up a new password.
        autoComplete="new-password"
      />

      {/* && means "only if". */}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {/* A reminder that this is a demo login. */}
      <p className="form-note">
        Demo only — please don&apos;t use a password you use anywhere else.
      </p>

      <div className="form-buttons">
        {/* type="submit" is what makes this button run handleSubmit. */}
        <button type="submit" className="primary-button">
          Create account
        </button>

        {/* type="button" means "do nothing special" — without it, a button inside a form submits. */}
        <button type="button" className="ghost-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default RegisterForm
