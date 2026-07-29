// ============================================================================
// accountStorage.js — saving the account so it survives closing the app.
//
// Everything else in this app forgets itself when the page reloads, because
// useState only lives in the computer's memory. A login has to outlast that, so
// this file uses localStorage: a small box of text the BROWSER keeps on the
// phone, even after the app is closed.
//
// ---------------------------------------------------------------------------
// IMPORTANT — READ THIS BEFORE SHOWING ANYONE THE APP
//
// This is a DEMO login, not a real one. The account is stored on the phone
// itself, in plain readable text, and nothing is checked by a server. Anyone
// who can open the browser's developer tools can read the password.
//
// That is fine for a prototype you demonstrate, and it is how a lot of school
// projects work. It is NOT fine for real users with real passwords. A real
// login needs a SERVER that stores passwords scrambled (called "hashing") and
// checks them, so the phone never holds the password at all.
//
// So: never type a password here that you actually use somewhere else.
// ---------------------------------------------------------------------------
// ============================================================================

// The names the data is filed under. Think of them as labels on two boxes.
// The "activeLiving." prefix keeps them from clashing with anything else the
// browser has stored for this address.
const ACCOUNT_KEY = 'activeLiving.account'
const LOGGED_IN_KEY = 'activeLiving.loggedIn'

// Every function below wraps its work in try/catch. localStorage can THROW an
// error rather than just failing quietly — for example in Safari's Private
// Browsing mode, or if storage is full. Without try/catch, one of those errors
// would crash the whole app to a blank white screen. Catching it means the app
// keeps working; you just don't get a saved login.

// Reads the saved account. Returns null when there isn't one yet.
export function loadAccount() {
  try {
    // getItem gives back the text we stored, or null if nothing is filed there.
    const saved = window.localStorage.getItem(ACCOUNT_KEY)

    // localStorage can only hold TEXT, never objects. JSON.parse turns the text
    // '{"name":"Sam"}' back into a usable object { name: 'Sam' }.
    return saved ? JSON.parse(saved) : null
  } catch {
    // Either storage is blocked, or the saved text was damaged. Treat both as
    // "no account", which is the safe answer.
    return null
  }
}

// Saves the account object, replacing any previous one.
export function saveAccount(account) {
  try {
    // JSON.stringify is the opposite of JSON.parse: object in, text out.
    window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
  } catch {
    // Storage unavailable. The account still works for this visit — it just
    // won't be remembered next time.
  }
}

// Reads whether the user was logged in last time they used the app.
export function loadLoggedIn() {
  try {
    // === compares both value AND type, and is what you should almost always
    // use in JavaScript. Here it asks "is the stored text exactly 'true'?"
    return window.localStorage.getItem(LOGGED_IN_KEY) === 'true'
  } catch {
    return false
  }
}

// Records whether the user is logged in. Called on login and on logout.
export function saveLoggedIn(isLoggedIn) {
  try {
    // String(true) gives the text "true", because only text can be stored.
    window.localStorage.setItem(LOGGED_IN_KEY, String(isLoggedIn))
  } catch {
    // Same as above — nothing to do if storage is blocked.
  }
}
