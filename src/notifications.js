// ============================================================================
// notifications.js — the daily reminder.
//
// There are TWO each day: the reminder at the time the user chose, and a
// follow-up an hour later asking whether they actually did it. The follow-up is
// what opens the check-in, where the streak is kept.
//
// ---------------------------------------------------------------------------
// WHAT THIS CAN AND CANNOT DO — worth understanding before demonstrating it.
//
// A web page can only run code while it is OPEN. So this reminder fires at the
// chosen time each day as long as the app is open in the browser. If the app is
// closed, nothing runs, and nothing arrives.
//
// Real reminders that arrive with the app closed need something running
// elsewhere: a proper phone app, or a server that pushes to the phone. The
// notifo folder in this project is a notification server of exactly that kind —
// it isn't wired up to this app, but it's the piece that would do this job.
//
// The screen that sets the time says all this plainly rather than promising
// something the app can't deliver.
// ---------------------------------------------------------------------------
// ============================================================================

// Whether this browser can show notifications at all. Older browsers, and
// iPhone Safari until fairly recently, simply don't have the feature — so every
// function below checks first rather than assuming.
export function supportsNotifications() {
  return 'Notification' in window
}

// Whether the user has already allowed notifications.
//   'granted' → allowed          'denied' → refused
//   'default' → not asked yet    'unsupported' → this browser can't
export function notificationPermission() {
  if (!supportsNotifications()) return 'unsupported'
  return window.Notification.permission
}

// Asks the user's permission to show notifications. The browser shows its own
// pop-up; all we get back is the answer.
//
// "async" means this function hands back a PROMISE — a value that isn't ready
// yet. Whoever calls it uses "await" to wait for the user to decide.
export async function requestPermission() {
  if (!supportsNotifications()) return 'unsupported'

  try {
    return await window.Notification.requestPermission()
  } catch {
    // Some browsers reject the request outright, for instance when the page
    // isn't served over a secure connection.
    return 'denied'
  }
}

// How many milliseconds until the next time the clock reads hh:mm.
//
// Worked out by building today's hh:mm and comparing it with now. If that
// moment has already passed today, add a day and aim at tomorrow instead.
function millisecondsUntil(hours, minutes) {
  const now = new Date()

  const target = new Date()
  // Hours, minutes, then seconds and milliseconds zeroed so it fires exactly on
  // the minute rather than at whatever fraction of a second we set it up.
  target.setHours(hours, minutes, 0, 0)

  if (target <= now) {
    // setDate handles the end of the month by itself: setting "the 32nd" of a
    // 31-day month rolls over to the 1st of the next one.
    target.setDate(target.getDate() + 1)
  }

  // Subtracting two dates gives the gap between them in milliseconds.
  return target - now
}

// Starts the daily reminder at a time given as "07:30".
//
// It hands back a STOP function. That matters: React calls it when the time
// changes or the app closes, and without it an old timer would keep running
// alongside the new one, and you'd get two reminders.
export function startDailyReminder(time, onFire) {
  // Split "07:30" into 7 and 30. Number() converts the text to a real number.
  const [hoursText, minutesText] = time.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  // A damaged or half-typed time would otherwise schedule something nonsensical.
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    // Returning a function that does nothing keeps the caller simple — it can
    // always call the result without checking what it got back.
    return () => {}
  }

  // The pending timer, kept so it can be cancelled by the stop function.
  let timerId = null

  // Sets the timer for the next occurrence. It calls ITSELF after firing, which
  // is what makes this repeat every day.
  //
  // Note it works the delay out fresh each time rather than just adding 24
  // hours. That's deliberate: on the days the clocks change, a fixed 24 hours
  // would drift the reminder an hour off, while recalculating from the clock
  // keeps it at the time the user actually asked for.
  function schedule() {
    timerId = window.setTimeout(() => {
      onFire()
      schedule()
    }, millisecondsUntil(hours, minutes))
  }

  schedule()

  // The stop function.
  return () => {
    if (timerId !== null) window.clearTimeout(timerId)
  }
}

// Moves a time forward by whole hours: addHours("23:30", 1) gives "00:30".
//
// The % 24 is what wraps past midnight. A reminder set for 11:30pm has its
// follow-up at half past midnight, which is the next day — the timer above
// works that out by itself, because it always aims at the next time the clock
// reads those digits.
export function addHours(time, hours) {
  const [hoursText, minutesText] = time.split(':')
  const nextHour = (Number(hoursText) + hours) % 24

  // padStart(2, '0') keeps it as "00:30" rather than "0:30", which is the shape
  // the rest of the code and the time box both expect.
  return `${String(nextHour).padStart(2, '0')}:${minutesText}`
}

// Shows one notification. Kept here so the wording lives next to the rest of
// the notification code rather than being buried in a screen.
//
// onClick runs when the user taps the notification itself. That's what lets a
// reminder open the app on the right page instead of just wherever they left
// it — see App.jsx, which uses it to open the check-in.
export function showNotification(title, body, onClick) {
  if (notificationPermission() !== 'granted') return

  try {
    const note = new window.Notification(title, { body })

    note.onclick = () => {
      // Brings the app's window to the front. Without this the page would get
      // the click but stay behind whatever the user was looking at.
      window.focus()

      onClick()

      // Tidies the notification away, since it has now been acted on.
      note.close()
    }
  } catch {
    // Some browsers refuse to build a Notification directly and insist on a
    // service worker. Nothing useful to do about it here — better a missing
    // reminder than a crashed app.
  }
}
