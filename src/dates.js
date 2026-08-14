// ============================================================================
// dates.js — working with real calendar dates.
//
// The Routine calendar shows actual months now, so several parts of the app
// need to agree on what "a date" means. They all use the same thing: a DATE KEY
// like "2026-08-13". Text rather than a Date object, because it can be stored,
// compared and used as a list entry without any fuss.
//
// A key is also directly comparable: "2026-08-13" < "2026-09-01" is true as
// plain text, because the year comes first and every part is zero-padded. That
// is the whole reason for this format, and why the padding matters.
// ============================================================================

// The names across the top of the calendar. Sunday first, as US calendars are
// printed — and the same order JavaScript's getDay() uses, where Sunday is 0.
export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Turns a Date into a key: "2026-08-13".
//
// It's built by hand rather than with toISOString(), which is the
// obvious-looking choice and is WRONG here: that converts to UTC first, so a
// date read late in the evening would come out as tomorrow's. getFullYear and
// friends read the phone's own local date, which is the date the user means.
export function toDateKey(date) {
  // padStart(2, '0') turns 8 into "08", which is what keeps the keys the same
  // length and therefore comparable. getMonth() counts from 0 for January — a
  // classic JavaScript trap, hence the + 1.
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

// Today's key. A shorthand, since this is by far the most common use.
export function todayKey() {
  return toDateKey(new Date())
}

// The full date and time, written the way the user's own device writes them —
// so someone in the US sees "Thursday, August 13" and "2:05 PM", while someone
// elsewhere sees their own format. toLocale... does all of that for us; writing
// it out by hand would only work for one country.
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

// The heading for one month: "August 2026".
export function formatMonth(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

// The first day of the month, "offset" months from the one "from" is in.
//
// new Date(year, month, 1) handles the rollover by itself: month 12 of 2026
// becomes January 2027, so adding twelve months needs no special case.
export function addMonths(from, offset) {
  return new Date(from.getFullYear(), from.getMonth() + offset, 1)
}

// Moves a date key forward by a number of days: addDays("2026-08-30", 7) gives
// "2026-09-06".
//
// The month rollover is handled by Date itself. Asking for "the 37th of August"
// gives the 6th of September, which is exactly what's wanted and far safer than
// working out month lengths by hand.
export function addDays(dateKey, days) {
  // .split('-') breaks "2026-08-30" into ["2026", "08", "30"], and .map(Number)
  // turns those into real numbers. The - 1 on the month is the usual correction
  // for JavaScript counting January as 0.
  const [year, month, day] = dateKey.split('-').map(Number)

  return toDateKey(new Date(year, month - 1, day + days))
}

// Takes the chosen dates and repeats each one every week for "weeks" weeks.
//
// So picking a Monday and a Thursday gives every Monday and Thursday from then
// on — which is what "repeat weekly" means to the person asking for it.
export function repeatWeekly(dateKeys, weeks) {
  // A Set is a list that refuses duplicates. That does the tidying for us: two
  // chosen dates a week apart would otherwise produce the same date twice.
  const all = new Set(dateKeys)

  for (const key of dateKeys) {
    for (let week = 1; week <= weeks; week += 1) {
      all.add(addDays(key, week * 7))
    }
  }

  // [...all] turns the Set back into an ordinary list. Sorting keeps the dates
  // in order — as plain text, which works here because of the zero-padding
  // explained at the top of this file.
  return [...all].sort()
}

// Builds the squares for one month's grid.
//
// The list starts with a few BLANKS, one for each weekday before the 1st falls,
// which is what lines the dates up under the right weekday names. A month
// starting on a Wednesday gets three blanks; one starting on Sunday gets none.
//
// Each entry is either:
//   { blank: true, id }              → an empty cell, just for spacing
//   { blank: false, id, day, key }   → a real date
export function buildMonthGrid(monthStart) {
  const year = monthStart.getFullYear()
  const month = monthStart.getMonth()

  // getDay() gives the weekday of the 1st as a number, 0 for Sunday. That count
  // is exactly how many blanks are needed in front of it.
  const leadingBlanks = new Date(year, month, 1).getDay()

  // Day 0 of the NEXT month is the last day of this one — the neatest way to
  // ask "how many days in this month?" without a table of lengths, and it gets
  // February in a leap year right for free.
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
