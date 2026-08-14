// ============================================================================
// streakStorage.js — the run of days in a row the user has checked in.
//
// A streak is two numbers pretending to be one: how many days long it is, and
// which day it last counted. Both are needed — without the date there's no way
// to tell "checked in today" from "checked in three weeks ago", and the streak
// would keep climbing forever.
//
//   { count: 5, lastDate: "2026-08-14" }
//
// Stored the same way as everything else in this app — see accountStorage.js
// for the full explanation of localStorage and why every read is wrapped in
// try/catch.
// ============================================================================

import { addDays } from './dates'

const STREAK_KEY = 'activeLiving.streak'

// What "no streak yet" looks like. Returned whenever there's nothing saved, so
// callers can always read .count and .lastDate without checking for null.
const EMPTY = { count: 0, lastDate: '' }

// Reads the streak. Always returns an object of the shape above.
export function loadStreak() {
  try {
    const saved = window.localStorage.getItem(STREAK_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    // A damaged save could hold anything at all. Checking the two fields are
    // the right kind of thing is cheaper than every screen guarding against a
    // count that turns out to be text.
    if (
      !parsed ||
      typeof parsed.count !== 'number' ||
      typeof parsed.lastDate !== 'string'
    ) {
      return EMPTY
    }

    return parsed
  } catch {
    return EMPTY
  }
}

// Has the user already checked in on this date?
export function isCheckedIn(dateKey) {
  return loadStreak().lastDate === dateKey
}

// Records a check-in and returns the streak as it now stands.
//
// THE THREE CASES, which are what make this a streak rather than a tally:
//
//   already checked in today → nothing changes. Confirming twice in one day is
//                              still one day, so the count holds. This is what
//                              stops the number being tapped upwards on demand.
//   checked in yesterday     → the run continues, so add one.
//   anything else            → the run was broken, so it starts again at one.
//                              A missed day costs the streak, which is the
//                              whole reason a streak is worth keeping.
export function recordCheckIn(dateKey) {
  const streak = loadStreak()

  let next

  if (streak.lastDate === dateKey) {
    next = streak
  } else if (streak.lastDate === addDays(dateKey, -1)) {
    next = { count: streak.count + 1, lastDate: dateKey }
  } else {
    next = { count: 1, lastDate: dateKey }
  }

  try {
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable. The number still shows for this visit — it just
    // won't be remembered next time.
  }

  return next
}

// Forgets the streak. Used by Settings › Reset goals — a streak is something
// the user DID, so it goes with the rest of their progress.
export function clearStreak() {
  try {
    window.localStorage.removeItem(STREAK_KEY)
  } catch {
    // Storage blocked, so there was nothing saved to clear.
  }
}
