// ============================================================================
// routineStorage.js — remembering the routine: which days, and when to remind.
//
// Same idea as accountStorage.js and exerciseStorage.js: localStorage is a
// small box of text the BROWSER keeps on the phone, so what's saved here
// survives closing the app.
//
// Two separate things are stored, under two keys:
//   days → the dates picked on the calendar, as keys like "2026-08-13"
//   time → the daily reminder time as text, e.g. "07:30", or '' for none
//
// They're kept apart rather than in one object because they're saved at
// different moments — the days when you tap Save on the calendar, the time when
// you set a reminder — and one shouldn't have to know about the other.
// ============================================================================

const DAYS_KEY = 'activeLiving.routineDays'
const TIME_KEY = 'activeLiving.reminderTime'

// Reads the chosen dates. Always returns a list, empty if nothing is saved.
export function loadRoutineDays() {
  try {
    const saved = window.localStorage.getItem(DAYS_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    // Array.isArray guards against a damaged save holding something that isn't
    // a list, which would break the .includes() calls on the screen.
    if (!Array.isArray(parsed)) return []

    // Keep only entries that look like a date key.
    //
    // This matters for anyone who used the app BEFORE the calendar showed real
    // months: back then a day was saved as a plain number, 1 to 30, which no
    // longer means anything now that a day is a date. Dropping those leaves an
    // empty calendar to fill in again, which is the honest outcome — far better
    // than showing stray dates the user never picked.
    return parsed.filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry))
  } catch {
    // Storage blocked, or the saved text was damaged. "Nothing saved" is the
    // safe answer to both — see the note in accountStorage.js.
    return []
  }
}

// Saves the chosen days.
export function saveRoutineDays(days) {
  try {
    window.localStorage.setItem(DAYS_KEY, JSON.stringify(days))
  } catch {
    // Storage unavailable. The choice still holds for this visit — it just
    // won't be there next time.
  }
}

// Reads the reminder time. Returns '' when no reminder has been set, which is
// also what an empty time box gives back, so the two agree.
export function loadReminderTime() {
  try {
    const saved = window.localStorage.getItem(TIME_KEY)

    // A time box gives text like "07:30" — two digits, a colon, two digits.
    // This checks the saved text still looks like that before trusting it, so a
    // damaged save can't feed nonsense to the reminder timer.
    return /^\d{2}:\d{2}$/.test(saved) ? saved : ''
  } catch {
    return ''
  }
}

// Saves the reminder time. Pass '' to mean "no reminder".
export function saveReminderTime(time) {
  try {
    window.localStorage.setItem(TIME_KEY, time)
  } catch {
    // Same as above — nothing to do if storage is blocked.
  }
}

// Forgets the chosen dates AND the reminder time. Used by Settings › Reset
// goals. Both keys belong to this file, so both are cleared here — see the
// matching note in exerciseStorage.js.
export function clearRoutine() {
  try {
    window.localStorage.removeItem(DAYS_KEY)
    window.localStorage.removeItem(TIME_KEY)
  } catch {
    // Storage blocked. Nothing was saved in the first place, so there is
    // nothing left to clear.
  }
}
