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

// ---- Which day should have come before this one? ---------------------------
//
// This is the heart of the streak, and it is NOT simply "yesterday".
//
// The user picks their workout days on the Routine calendar, and reminders only
// arrive on those days. So for someone training Monday, Wednesday and Friday,
// the day before Wednesday is MONDAY. Treating it as Tuesday would break their
// streak every single Wednesday for missing a rest day — punishing them for
// following the routine they set.
//
// Returns the latest scheduled day strictly before dateKey, or null if this is
// the first one. With no routine saved at all it falls back to yesterday, which
// is the only sensible reading of "in a row" when nothing is scheduled.
function previousExpectedDay(dateKey, scheduledDays) {
  if (!scheduledDays || scheduledDays.length === 0) {
    return addDays(dateKey, -1)
  }

  // Sorted defensively: tapping days on the calendar adds them in whatever
  // order they were tapped, so the saved list is not reliably in date order.
  // Comparing keys as text works — see the note at the top of dates.js.
  const earlier = scheduledDays
    .filter((day) => day < dateKey)
    .sort((a, b) => (a < b ? -1 : 1))

  return earlier.length ? earlier[earlier.length - 1] : null
}

// Records a check-in and returns the streak as it now stands.
//
// scheduledDays is the list of dates picked on the Routine calendar.
//
// THE CASES:
//
//   already checked in today  → nothing changes. Confirming twice in one day is
//                               still one day, so the count holds. This is what
//                               stops the number being tapped upwards on demand.
//   last workout day was done → the run continues, so add one.
//   first workout day ever    → the run starts at one.
//   anything else             → a scheduled day was skipped, so it starts over
//                               at one. That cost is the whole reason a streak
//                               is worth keeping.
export function recordCheckIn(dateKey, scheduledDays) {
  const streak = loadStreak()
  const expected = previousExpectedDay(dateKey, scheduledDays)

  let next

  if (streak.lastDate === dateKey) {
    next = streak
  } else if (expected && streak.lastDate === expected) {
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

// The streak as it stands RIGHT NOW, which is not always the number that was
// saved.
//
// The saved count only changes when the user checks in. So someone on a run of
// five who then skips a workout still has "5" sitting in storage — and would
// see it, wrongly, until the next time they confirmed something.
//
// This works out whether a scheduled day has gone by unconfirmed and reports 0
// if so. Today is deliberately not counted: the day isn't over, and telling
// someone their streak is gone at breakfast for a workout they still intend to
// do would be both wrong and discouraging.
export function currentStreak(scheduledDays, todayDateKey) {
  const streak = loadStreak()

  if (!streak.count) return 0

  const missed = (scheduledDays || []).filter(
    (day) => day > streak.lastDate && day < todayDateKey,
  )

  return missed.length > 0 ? 0 : streak.count
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
