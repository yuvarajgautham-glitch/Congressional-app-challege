// ============================================================================
// measurementsStorage.js — the weekly record of weight, height and age.
//
// One entry per date, kept in order, oldest first:
//
//   [
//     { date: "2026-08-02", weight: 160, heightFeet: 5, heightInches: 9, age: 16 },
//     { date: "2026-08-09", weight: 158, heightFeet: 5, heightInches: 9, age: 16 }
//   ]
//
// This is the app's most personal data, and it never leaves the phone — same as
// everything else here. See Settings › Privacy and data.
//
// Stored the same way as the rest of the app; accountStorage.js explains
// localStorage and why every read is wrapped in try/catch.
// ============================================================================

import { todayKey, addDays } from './dates'

const MEASUREMENTS_KEY = 'activeLiving.measurements'

// How often the app asks. Seven days makes it a weekly question.
const DAYS_BETWEEN = 7

// Is this really a measurement? A damaged save could hold anything, and one bad
// entry would break the graph for every good one — so entries are checked
// individually and only the sound ones kept.
function isValid(entry) {
  return (
    entry &&
    typeof entry.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
    Number.isFinite(entry.weight) &&
    Number.isFinite(entry.heightFeet) &&
    Number.isFinite(entry.heightInches)
  )
}

// Reads every measurement, oldest first. Always returns a list.
export function loadMeasurements() {
  try {
    const saved = window.localStorage.getItem(MEASUREMENTS_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    if (!Array.isArray(parsed)) return []

    // Sorting by date as TEXT works because the keys are zero-padded — see the
    // note at the top of dates.js.
    return parsed
      .filter(isValid)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  } catch {
    return []
  }
}

// Adds a measurement, or replaces the one already saved for that date.
//
// Replacing rather than appending matters: someone who mistypes their weight
// and immediately fixes it should end up with one reading for the day, not two
// points a millimetre apart on the graph.
//
// Returns the new list, so the screen can redraw without re-reading storage.
export function addMeasurement(entry) {
  const rest = loadMeasurements().filter((item) => item.date !== entry.date)
  const next = [...rest, entry].sort((a, b) => (a.date < b.date ? -1 : 1))

  try {
    window.localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable. The graph still shows this reading for now — it just
    // won't be there next time.
  }

  return next
}

// The most recent measurement, or null if there are none yet.
export function latestMeasurement() {
  const all = loadMeasurements()
  return all.length ? all[all.length - 1] : null
}

// Is it time to ask again?
//
// True when nothing has been recorded in the last seven days, which is what
// makes the FIRST reminder of each week the one that asks for measurements
// rather than the usual nudge to exercise. Once a reading is saved, this goes
// back to false and the reminders return to normal for the rest of the week.
export function isMeasurementDue() {
  const latest = latestMeasurement()

  // Never recorded anything — definitely due.
  if (!latest) return true

  // The oldest date that still counts as "this week". Comparing date keys as
  // text is safe for the reason given in dates.js.
  const cutoff = addDays(todayKey(), -(DAYS_BETWEEN - 1))

  return latest.date < cutoff
}

// Forgets every measurement. Used by Settings › Reset goals.
export function clearMeasurements() {
  try {
    window.localStorage.removeItem(MEASUREMENTS_KEY)
  } catch {
    // Storage blocked, so there was nothing saved to clear.
  }
}
