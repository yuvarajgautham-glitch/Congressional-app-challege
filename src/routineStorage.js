// routineStorage.js — remembering the routine: which days, and when to remind.

const DAYS_KEY = 'activeLiving.routineDays'
const TIME_KEY = 'activeLiving.reminderTime'

// A free note the user can write against any one day on the calendar — "away at my cousin's".
const DAY_NOTES_KEY = 'activeLiving.dayNotes'

// Reads the chosen dates.
export function loadRoutineDays() {
  try {
    const saved = window.localStorage.getItem(DAYS_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    // Array.isArray guards against a damaged save holding something that isn't a list.
    if (!Array.isArray(parsed)) return []

    // Keep only entries that look like a date key.
    return parsed.filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry))
  } catch {
    // Storage blocked, or the saved text was damaged. "Nothing saved" is the safe answer to.
    return []
  }
}

// Saves the chosen days.
export function saveRoutineDays(days) {
  try {
    window.localStorage.setItem(DAYS_KEY, JSON.stringify(days))
  } catch {
    // Storage unavailable.
  }
}

// Reads the reminder time.
export function loadReminderTime() {
  try {
    const saved = window.localStorage.getItem(TIME_KEY)

    // A time box gives text like "07:30" — two digits, a colon, two digits.
    return /^\d{2}:\d{2}$/.test(saved) ? saved : ''
  } catch {
    return ''
  }
}

// Saves the reminder time.
export function saveReminderTime(time) {
  try {
    window.localStorage.setItem(TIME_KEY, time)
  } catch {
    // Same as above — nothing to do if storage is blocked.
  }
}

// Reads the free note for one day.
export function loadDayNote(dateKey) {
  try {
    const saved = window.localStorage.getItem(DAY_NOTES_KEY)
    const parsed = saved ? JSON.parse(saved) : null
    const note = parsed?.[dateKey]

    return typeof note === 'string' ? note : ''
  } catch {
    return ''
  }
}

// Saves the free note for one day.
export function saveDayNote(dateKey, text) {
  try {
    const saved = window.localStorage.getItem(DAY_NOTES_KEY)
    const all = saved ? JSON.parse(saved) || {} : {}

    const trimmed = text.trim()
    if (trimmed) all[dateKey] = trimmed
    else delete all[dateKey]

    window.localStorage.setItem(DAY_NOTES_KEY, JSON.stringify(all))
  } catch {
    // Storage unavailable — the note still shows for this visit.
  }
}

// How many days have a note.
export function countDayNotes() {
  try {
    const saved = window.localStorage.getItem(DAY_NOTES_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    return parsed ? Object.keys(parsed).length : 0
  } catch {
    return 0
  }
}
// Forgets the chosen dates AND the reminder time.
export function clearRoutine() {
  try {
    window.localStorage.removeItem(DAYS_KEY)
    window.localStorage.removeItem(TIME_KEY)
    window.localStorage.removeItem(DAY_NOTES_KEY)
  } catch {
    // Storage blocked.
  }
}
