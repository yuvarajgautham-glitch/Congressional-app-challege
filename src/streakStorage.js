// streakStorage.js — the run of days in a row the user has checked in.

import { addDays } from './dates'

const STREAK_KEY = 'activeLiving.streak'

// What "no streak yet" looks like.
const EMPTY = { count: 0, lastDate: '' }

// Reads the streak.
export function loadStreak() {
  try {
    const saved = window.localStorage.getItem(STREAK_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    // A damaged save could hold anything at all.
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

// ---- Which day should have come before this one? ----
// This is the heart of the streak, and it is NOT simply "yesterday".
function previousExpectedDay(dateKey, scheduledDays) {
  if (!scheduledDays || scheduledDays.length === 0) {
    return addDays(dateKey, -1)
  }

  // Sorted defensively: tapping days on the calendar adds them in whatever order they.
  const earlier = scheduledDays
    .filter((day) => day < dateKey)
    .sort((a, b) => (a < b ? -1 : 1))

  return earlier.length ? earlier[earlier.length - 1] : null
}

// Records a check-in and returns the streak as it now stands.
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
    // Storage unavailable.
  }

  return next
}

// The streak as it stands RIGHT NOW, which is not always the number that was saved.
export function currentStreak(scheduledDays, todayDateKey) {
  const streak = loadStreak()

  if (!streak.count) return 0

  const missed = (scheduledDays || []).filter(
    (day) => day > streak.lastDate && day < todayDateKey,
  )

  return missed.length > 0 ? 0 : streak.count
}

// Forgets the streak.
export function clearStreak() {
  try {
    window.localStorage.removeItem(STREAK_KEY)
  } catch {
    // Storage blocked, so there was nothing saved to clear.
  }
}
