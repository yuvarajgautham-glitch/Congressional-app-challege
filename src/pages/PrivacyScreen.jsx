// ============================================================================
// PrivacyScreen.jsx — Settings › Privacy and data.
//
// Every claim on this page is one the code actually backs up. That matters more
// than it sounds: a privacy notice that overstates things is worse than none at
// all, because people make real decisions based on it — like whether to reuse a
// password here.
//
// So the page says what IS protected, and is equally plain about what isn't.
// If you change how the app stores things, change this page in the same commit.
// ============================================================================

import './PrivacyScreen.css'

// The promises, as a list so each renders the same way.
//
// Every one of these is checkable in the source:
//   nothing sent   → there is not a single fetch() or network call in src/
//   no accounts    → nothing is registered anywhere; storage is this phone only
//   no tracking    → no analytics library, no third-party script at all
//   password safe  → see passwordSecurity.js
const PROMISES = [
  {
    id: 'stays',
    title: 'Nothing leaves your phone',
    body: 'Everything you type is saved on this device and nowhere else. The app has no server to send it to — there is not one line of code in it that contacts the internet.',
  },
  {
    id: 'nobody',
    title: 'Nobody else can see it',
    body: 'Your details are not shared, sold, or handed to anyone. No company, no school, no other app. There is nothing to share, because nothing was ever collected.',
  },
  {
    id: 'measurements',
    title: 'Your weekly measurements stay private',
    body: 'The weight, height and age you enter each week are saved on this phone to draw your graph, and are used for nothing else. They are never uploaded, and no one but you ever sees them.',
  },
  {
    id: 'tracking',
    title: 'No tracking of any kind',
    body: 'No analytics, no advertising, no cookies following you around, and no outside code running in the app. Nobody is counting what you tap.',
  },
  {
    id: 'password',
    title: 'Your password is scrambled',
    body: 'It is never saved as you typed it. It is put through 100,000 rounds of PBKDF2 with a random salt — a one-way scramble that cannot be turned back into the password, even by someone holding your phone.',
  },
  {
    id: 'yours',
    title: 'You can delete it whenever you like',
    body: 'Reset goals in Settings clears everything you have done. Clearing this site in your browser settings removes the account itself. Nothing is kept anywhere else, so once it is gone it is gone.',
  },
]

// PROPS from SettingsScreen:
//   onBack → returns to the Settings list
function PrivacyScreen({ onBack }) {
  return (
    <main className="screen privacy-screen">
      <h1 className="title privacy-title">Privacy and data</h1>
      <div className="title-rule" />

      <p className="privacy-lead">
        Active Living keeps everything on your phone. Here is exactly what that
        means.
      </p>

      <ul className="privacy-list">
        {PROMISES.map((promise) => (
          <li key={promise.id} className="privacy-item">
            <h2 className="privacy-item-title">{promise.title}</h2>
            <p className="privacy-item-body">{promise.body}</p>
          </li>
        ))}
      </ul>

      {/* ---- The honest part ----
          Saying only the reassuring half would be the easy thing to do, and
          would make everything above less trustworthy rather than more. A
          reader who spots one overstated claim reasonably doubts the rest. */}
      <div className="privacy-limits">
        <h2 className="privacy-item-title">What this does not protect against</h2>
        <p className="privacy-item-body">
          Because everything is stored on the phone rather than on a server,
          somebody holding your unlocked phone could read the details you
          entered — your name, age, height and weight. Your password is the one
          thing they could not read.
        </p>
        <p className="privacy-item-body">
          Keeping a passcode on your phone is what protects the rest. And since
          this is a school project rather than a bank, it is still worth using a
          password here that you do not use anywhere else.
        </p>
      </div>

      <button type="button" className="back-button" onClick={onBack}>
        <span className="back-arrow" aria-hidden="true">
          &#8249;
        </span>
        Back
      </button>
    </main>
  )
}

export default PrivacyScreen
