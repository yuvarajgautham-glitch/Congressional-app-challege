// exerciseStorage.js — remembering which exercises were ticked off each day.

const PLAN_KEY = 'activeLiving.exercisePlan'

// Notes live under their OWN key rather than inside the plan above.
const NOTES_KEY = 'activeLiving.exerciseNotes'

// The date keys used here are the same ones the Routine calendar uses.
export { todayKey } from './dates'

// Reads the whole saved object.
function loadAll() {
  try {
    const saved = window.localStorage.getItem(PLAN_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    // A stored "null" or a stray number would sail through JSON.parse and then break the code.
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    // Storage blocked, or the saved text was damaged. "Nothing saved" is the safe answer to.
    return {}
  }
}

// Reads the exercises ticked off for one date and one goal.
export function loadDayPlan(dateKey, goalId) {
  const all = loadAll()

  // ?. is "optional chaining": if all[dateKey] doesn't exist.
  const saved = all[dateKey]?.[goalId]

  // Array.isArray guards against a damaged save holding something that isn't a list.
  return Array.isArray(saved) ? saved : []
}

// Saves the ticked exercises for one date and one goal.
export function saveDayPlan(dateKey, goalId, exerciseIds) {
  try {
    const all = loadAll()

    // Rebuild the object rather than editing it in place.
    const next = {
      ...all,
      [dateKey]: {
        ...all[dateKey],
        [goalId]: exerciseIds,
      },
    }

    window.localStorage.setItem(PLAN_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable.
  }
}

// Reads every note for one date and goal, as { exerciseId: text }.
export function loadDayNotes(dateKey, goalId) {
  try {
    const saved = window.localStorage.getItem(NOTES_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    // ?. gives undefined rather than crashing when the date or goal is absent.
    const notes = parsed?.[dateKey]?.[goalId]

    return notes && typeof notes === 'object' ? notes : {}
  } catch {
    return {}
  }
}

// Saves the notes for one date and goal, replacing what was there.
export function saveDayNotes(dateKey, goalId, notes) {
  try {
    const saved = window.localStorage.getItem(NOTES_KEY)
    const all = saved ? JSON.parse(saved) || {} : {}

    // Rebuilt rather than edited in place.
    const next = { ...all, [dateKey]: { ...all[dateKey], [goalId]: notes } }

    window.localStorage.setItem(NOTES_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable — the notes still show for this visit.
  }
}

// Every note saved on one date, whichever goal it was written under.
export function loadNotesForDate(dateKey) {
  try {
    const saved = window.localStorage.getItem(NOTES_KEY)
    const parsed = saved ? JSON.parse(saved) : null
    const forDate = parsed?.[dateKey]

    return forDate && typeof forDate === 'object' ? forDate : {}
  } catch {
    return {}
  }
}
// Forgets every saved plan, for every date and every goal.
export function clearExercisePlans() {
  try {
    window.localStorage.removeItem(PLAN_KEY)
    window.localStorage.removeItem(NOTES_KEY)
  } catch {
    // Storage blocked.
  }
}
