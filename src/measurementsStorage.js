// measurementsStorage.js — the weekly record of weight, height and age.

import { todayKey, addDays } from './dates'

const MEASUREMENTS_KEY = 'activeLiving.measurements'

// How often the app asks.
const DAYS_BETWEEN = 7

// Is this really a measurement?
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

// The measurement saved for one date, or null if that date has none.
export function measurementFor(dateKey) {
  return loadMeasurements().find((entry) => entry.date === dateKey) || null
}

// Reads every measurement, oldest first.
export function loadMeasurements() {
  try {
    const saved = window.localStorage.getItem(MEASUREMENTS_KEY)
    const parsed = saved ? JSON.parse(saved) : null

    if (!Array.isArray(parsed)) return []

    // Sorting by date as TEXT works because the keys are zero-padded.
    return parsed
      .filter(isValid)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  } catch {
    return []
  }
}

// Adds a measurement, or replaces the one already saved for that date.
export function addMeasurement(entry) {
  const rest = loadMeasurements().filter((item) => item.date !== entry.date)
  const next = [...rest, entry].sort((a, b) => (a.date < b.date ? -1 : 1))

  try {
    window.localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable.
  }

  return next
}

// The most recent measurement, or null if there are none yet.
export function latestMeasurement() {
  const all = loadMeasurements()
  return all.length ? all[all.length - 1] : null
}

// Is it time to ask again?
export function isMeasurementDue() {
  const latest = latestMeasurement()

  // Never recorded anything — definitely due.
  if (!latest) return true

  // The oldest date that still counts as "this week".
  const cutoff = addDays(todayKey(), -(DAYS_BETWEEN - 1))

  return latest.date < cutoff
}

// Forgets every measurement.
export function clearMeasurements() {
  try {
    window.localStorage.removeItem(MEASUREMENTS_KEY)
  } catch {
    // Storage blocked, so there was nothing saved to clear.
  }
}
