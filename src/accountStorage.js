// accountStorage.js — saving the account so it survives closing the app.
// WHAT IS AND ISN'T PROTECTED HERE.

// The names the data is filed under.
const ACCOUNT_KEY = 'activeLiving.account'
const LOGGED_IN_KEY = 'activeLiving.loggedIn'

// Every function below wraps its work in try/catch. localStorage can THROW an error.

// Reads the saved account.
export function loadAccount() {
  try {
    // getItem gives back the text we stored, or null if nothing is filed there.
    const saved = window.localStorage.getItem(ACCOUNT_KEY)

    // localStorage can only hold TEXT, never objects.
    return saved ? JSON.parse(saved) : null
  } catch {
    // Either storage is blocked, or the saved text was damaged.
    return null
  }
}

// Saves the account object, replacing any previous one.
export function saveAccount(account) {
  try {
    // JSON.stringify is the opposite of JSON.parse: object in, text out.
    window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
  } catch {
    // Storage unavailable.
  }
}

// Reads whether the user was logged in last time they used the app.
export function loadLoggedIn() {
  try {
    // === compares both value AND type, and is what you should almost always use in JavaScript.
    return window.localStorage.getItem(LOGGED_IN_KEY) === 'true'
  } catch {
    return false
  }
}

// Records whether the user is logged in.
export function saveLoggedIn(isLoggedIn) {
  try {
    // String(true) gives the text "true", because only text can be stored.
    window.localStorage.setItem(LOGGED_IN_KEY, String(isLoggedIn))
  } catch {
    // Same as above — nothing to do if storage is blocked.
  }
}
