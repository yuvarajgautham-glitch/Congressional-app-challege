// dates.js — working with real calendar dates.

// The names across the top of the calendar.
export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Turns a Date into a key: "2026-08-13".
export function toDateKey(date) {
  // padStart(2, '0') turns 8 into "08".
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

// Today's key.
export function todayKey() {
  return toDateKey(new Date())
}

// The full date and time, written the way the user's own device writes them.
export function formatNow(now) {
  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const time = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return `${date} · ${time}`
}

// A date key written out in full: "Sunday, 16 August".
export function formatLongDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// A date key written short, for a chart axis: "16 Aug".
export function formatShortDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

// The heading for one month: "August 2026".
export function formatMonth(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

// The first day of the month, "offset" months from the one "from" is in.
export function addMonths(from, offset) {
  return new Date(from.getFullYear(), from.getMonth() + offset, 1)
}

// Moves a date key forward by a number of days: addDays("2026-08-30", 7) gives "2026-09-06".
export function addDays(dateKey, days) {
  // .split('-') breaks "2026-08-30" into ["2026", "08", "30"].
  const [year, month, day] = dateKey.split('-').map(Number)

  return toDateKey(new Date(year, month - 1, day + days))
}

// Takes the chosen dates and repeats each one every week for "weeks" weeks.
export function repeatWeekly(dateKeys, weeks) {
  // A Set is a list that refuses duplicates.
  const all = new Set(dateKeys)

  for (const key of dateKeys) {
    for (let week = 1; week <= weeks; week += 1) {
      all.add(addDays(key, week * 7))
    }
  }

  // [...all] turns the Set back into an ordinary list.
  return [...all].sort()
}

// Builds the squares for one month's grid.
export function buildMonthGrid(monthStart) {
  const year = monthStart.getFullYear()
  const month = monthStart.getMonth()

  // getDay() gives the weekday of the 1st as a number, 0 for Sunday.
  const leadingBlanks = new Date(year, month, 1).getDay()

  // Day 0 of the NEXT month is the last day of this.
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []

  for (let index = 0; index < leadingBlanks; index += 1) {
    // The id is only there to give React a stable key for each cell.
    cells.push({ blank: true, id: `blank-${index}` })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = toDateKey(new Date(year, month, day))
    cells.push({ blank: false, id: key, day, key })
  }

  return cells
}
