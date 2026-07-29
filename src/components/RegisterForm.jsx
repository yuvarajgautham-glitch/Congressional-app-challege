// ============================================================================
// RegisterForm.jsx — the "Create new account" form.
//
// Collects the seven details from the sketch — name, age, sex, height, weight,
// email and password — plus a second password box to catch typos. It checks
// they make sense, then hands the finished account back to whoever asked for
// it. It does NOT save anything itself;
// AccountInfoScreen does that. A component that just collects and reports is
// easier to reuse and to reason about.
// ============================================================================

import { useState } from 'react'

// The choices in the Sex dropdown. Kept as a list so the <option> tags can be
// built with .map(), the same trick used for the menu buttons and the calendar.
const SEX_OPTIONS = ['Male', 'Female', 'Other', 'I would rather not say']

// PROPS:
//   onCreate → called with the new account once the form passes its checks
//   onCancel → called when the user taps Cancel
function RegisterForm({ onCreate, onCancel }) {
  // One piece of state per box on the form. This is the standard React way to
  // handle typing: the box shows what's in state, and every keystroke updates
  // that state. React calls these "controlled inputs" — the code is always the
  // single source of truth for what's in the box.
  //
  // Every one starts as '' (empty text), including the numbers. That's on
  // purpose: a box the user hasn't filled in yet is empty, not 0.
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [weight, setWeight] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Typed a second time to catch a slip. There's no "forgot password" in this
  // app, so a typo here would lock the account away for good.
  const [confirm, setConfirm] = useState('')

  // The message shown when something is wrong. Empty text means "no problem".
  const [error, setError] = useState('')

  // Runs when the form is submitted — either by tapping the button, or by
  // pressing Go/Enter on the keyboard. Using a real <form> gives you that
  // second option for free, which is why it's better than a lone button.
  function handleSubmit(event) {
    // Browsers reload the whole page when a form is submitted — behaviour from
    // long before apps like this existed. This line stops that.
    event.preventDefault()

    // .trim() removes spaces from the ends, so " Sam " counts as "Sam" and a
    // box holding nothing but spaces still counts as empty.
    const cleanName = name.trim()
    const cleanEmail = email.trim()

    // Everything typed into a box arrives as TEXT, even from a number box —
    // "17" not 17. Number() converts it so we can compare it properly.
    // An empty box becomes 0, which fails the range checks below anyway.
    const ageNumber = Number(age)
    const feetNumber = Number(heightFeet)
    // Inches may be left blank, which we treat as 0 — someone exactly 6 feet
    // tall shouldn't have to type a zero.
    const inchesNumber = heightInches === '' ? 0 : Number(heightInches)
    const weightNumber = Number(weight)

    // ---- The checks. Each one stops the function with "return" if it fails,
    // so the account is only created once every check has passed.
    if (!cleanName) {
      setError('Please enter your name.')
      return
    }

    // Number.isFinite() rejects anything that isn't a real number — typing
    // letters into the box gives NaN ("not a number"), which this catches.
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
    // Trying to catch every invalid address is a famously bad idea — the rules
    // are far stranger than people expect, and strict checks reject real
    // addresses. This catches honest typos, which is the useful part.
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

    // ---- Everything passed. Build the account and hand it up.
    // Note that "confirm" is deliberately not included below — it exists only
    // to catch a typo, and there's no reason to store the password twice.
    onCreate({
      name: cleanName,
      age: ageNumber,
      sex,
      heightFeet: feetNumber,
      heightInches: inchesNumber,
      weight: weightNumber,
      // Stored in lower case so signing in later isn't case-sensitive —
      // people don't remember whether they typed Sam@ or sam@.
      email: cleanEmail.toLowerCase(),
      password,
    })
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      {/* Every input gets a <label> tied to it by matching htmlFor and id.
          Two reasons: screen readers announce the right name, and tapping the
          label puts the cursor in the box — a bigger target on a phone. */}

      {/* ---- 1. Name ---- */}
      <label className="field-label" htmlFor="register-name">
        Name
      </label>
      <input
        id="register-name"
        className="field-input"
        type="text"
        // value + onChange together are what make this a controlled input:
        // the box displays state, and typing writes back to state.
        value={name}
        onChange={(event) => setName(event.target.value)}
        // Tells the iPhone keyboard to offer the saved name.
        autoComplete="name"
      />

      {/* ---- 2. Age ---- */}
      <label className="field-label" htmlFor="register-age">
        Age
      </label>
      <input
        id="register-age"
        className="field-input"
        // type="number" brings up the number pad on a phone instead of letters.
        type="number"
        // min and max make the little up/down arrows on a computer behave, but
        // they do NOT stop someone typing anything they like — which is exactly
        // why handleSubmit checks the range again above. Never trust the form
        // alone to keep bad values out.
        min="5"
        max="120"
        value={age}
        onChange={(event) => setAge(event.target.value)}
      />

      {/* ---- 3. Sex ---- */}
      <label className="field-label" htmlFor="register-sex">
        Sex
      </label>
      {/* <select> is a dropdown. On an iPhone it opens the native picker wheel,
          which is far easier than typing. */}
      <select
        id="register-sex"
        className="field-input"
        value={sex}
        onChange={(event) => setSex(event.target.value)}
      >
        {/* An empty first option means nothing is chosen to begin with, so the
            check above can tell whether the user actually picked something. */}
        <option value="">Choose one</option>
        {SEX_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* ---- 4. Height ---- */}
      <label className="field-label" htmlFor="register-height-feet">
        Height
      </label>
      {/* Two boxes side by side for feet and inches. The wrapper div is what
          puts them in a row — see .field-row in AccountInfoScreen.css. */}
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
          {/* A small word under the box saying what the number means, so nobody
              has to guess whether to type feet or centimetres. */}
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
            // This box has no visible label of its own, so this gives screen
            // readers something to announce beyond just "number".
            aria-label="Height in inches"
          />
          <span className="field-unit">inches</span>
        </div>
      </div>

      {/* ---- 5. Weight ---- */}
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

      {/* ---- 6. Email ---- */}
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
        // Phones capitalise the first letter by default, which is wrong for an
        // email address. These two switch that off.
        autoCapitalize="none"
        autoCorrect="off"
      />

      {/* ---- 7. Password ---- */}
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
        // "new-password" stops the phone auto-filling an existing password and
        // offers to suggest a strong new one instead.
        autoComplete="new-password"
      />

      {/* ---- 8. Confirm password ---- */}
      <label className="field-label" htmlFor="register-confirm">
        Confirm password
      </label>
      <input
        id="register-confirm"
        className="field-input"
        type="password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        // Also "new-password", so the phone treats this as part of setting up a
        // new password rather than offering to fill in an old one.
        autoComplete="new-password"
      />

      {/* && means "only if". If error is empty text, nothing is drawn at all;
          if it holds a message, the paragraph appears. A very common React
          shortcut for showing something conditionally.

          role="alert" makes a screen reader read the problem out immediately,
          which matters because a sighted user sees it appear instantly. */}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {/* A reminder that this is a demo login. Worth keeping while anyone else
          is testing the app — see the warning at the top of accountStorage.js. */}
      <p className="form-note">
        Demo only — please don&apos;t use a password you use anywhere else.
      </p>

      <div className="form-buttons">
        {/* type="submit" is what makes this button run handleSubmit, and what
            makes the phone keyboard's Go key work too. */}
        <button type="submit" className="primary-button">
          Create account
        </button>

        {/* type="button" means "do nothing special" — without it, a button
            inside a form submits it, which is not what Cancel should do. */}
        <button type="button" className="ghost-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default RegisterForm
