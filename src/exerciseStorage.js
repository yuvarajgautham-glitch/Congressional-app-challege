// ============================================================================
// exerciseStorage.js — remembering which exercises were ticked off each day.
//
// Same idea as accountStorage.js: localStorage is a small box of text the
// BROWSER keeps on the phone, so what's saved here survives closing the app.
//
// Everything is filed under ONE key holding one object, laid out like this:
//
//   {
//     "2026-08-13": { lose: ["walk", "stairs"], gain: ["pushups"] },
//     "2026-08-14": { lose: [] }
//   }
//
// A date, then the goal, then the list of ticked exercises. Storing it by date
// is what makes "save this for the day" mean something: tomorrow starts with a
// clean sheet, and yesterday's record is still there.
//
// One key rather than one per day matters — otherwise a year of use would
// leave 365 separate entries cluttering the browser's storage.
// ============================================================================

const PLAN_KEY = 'activeLiving.exercisePlan'

// The date keys used here are the same ones the Routine calendar uses, so they
// come from the one place that builds them — dates.js. Two files inventing
// their own date format is how a calendar and a saved plan end up disagreeing
// about what day it is.
//
// It's re-exported so the screens that already ask this file for today's date
// don't all have to change.
export { todayKey } from './dates'

// Reads the whole saved object. Returns {} when there's nothing yet, so callers
// never have to check for null before looking inside it.
function loadAll() {
  try {
    const saved = window.localStorage.getItem(PLAN_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    // A stored "null" or a stray number would sail through JSON.parse and then
    // break the code below. Anything that isn't a usable object becomes {}.
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    // Storage blocked, or the saved text was damaged. "Nothing saved" is the
    // safe answer to both — see the note in accountStorage.js.
    return {}
  }
}

// Reads the exercises ticked off for one date and one goal.
// Always returns a list, empty if nothing was saved.
export function loadDayPlan(dateKey, goalId) {
  const all = loadAll()

  // ?. is "optional chaining": if all[dateKey] doesn't exist, the whole thing
  // gives undefined instead of crashing. Without it, looking up .lose on a
  // missing date would stop the app.
  const saved = all[dateKey]?.[goalId]

  // Array.isArray guards against a damaged save holding something that isn't a
  // list, which would break the .includes() calls on the screen.
  return Array.isArray(saved) ? saved : []
}

// Saves the ticked exercises for one date and one goal.
export function saveDayPlan(dateKey, goalId, exerciseIds) {
  try {
    const all = loadAll()

    // Rebuild the object rather than editing it in place. The ... spread copies
    // everything that was there, then the lines after it replace just the one
    // date and the one goal — so ticking off a "lose" plan can't wipe out a
    // "gain" plan saved the same day.
    const next = {
      ...all,
      [dateKey]: {
        ...all[dateKey],
        [goalId]: exerciseIds,
      },
    }

    window.localStorage.setItem(PLAN_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable. The ticks still show for this visit — they just
    // won't be there next time.
  }
}

// Forgets every saved plan, for every date and every goal. Used by Settings ›
// Reset goals.
//
// Each storage file clears its OWN key like this, rather than one place in the
// app knowing every key there is. That way a key can be renamed here without
// something else, somewhere else, quietly still pointing at the old name.
export function clearExercisePlans() {
  try {
    window.localStorage.removeItem(PLAN_KEY)
  } catch {
    // Storage blocked. Nothing was saved in the first place, so there is
    // nothing left to clear.
  }
}
