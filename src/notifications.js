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
// SHOWING a reminder is real. It goes through the service worker, so it is a
// proper system notification: it lands in the phone's notification list next to
// every other app's, survives the page being closed, and can be tapped
// afterwards to open the app on the right page.
//
// DECIDING WHEN to show it is the limit. The timers below are ordinary
// JavaScript, and JavaScript only runs while the app is running. So the clock
// that decides "it's 7:30, show the reminder" needs the app open, or at least
// recently open in the background. Close it for the day and nothing fires that
// day.
//
// Closing that last gap needs WEB PUSH: a server that knows the time and sends
// the notification to the phone, so nothing on the phone has to be awake. That
// means running a server. The notifo folder in this project is a notification
// server of exactly that kind — not wired up here, but it is the piece that
// would do this job.
//
// The screen that sets the time says as much of this as a user needs, rather
// than promising something the app can't deliver.
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

  // The pending timer, kept so it can be canceled by the stop function.
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

// Whatever should happen when a notification is tapped. Set by App.jsx through
// listenForNotificationClicks below, and kept here at module level so the
// fallback path further down can reach it too.
let clickHandler = null

// Passes a tap from the service worker up to the app.
function handleWorkerMessage(event) {
  if (event.data && event.data.type === 'notification-click' && clickHandler) {
    clickHandler(event.data.action)
  }
}

// Starts listening for notification taps. Hand it a function that takes an
// action name — 'checkin' or 'measure' — and does the right thing.
//
// Returns a function that stops listening, so React's useEffect can clean up.
export function listenForNotificationClicks(handler) {
  clickHandler = handler

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handleWorkerMessage)
  }

  return () => {
    clickHandler = null

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', handleWorkerMessage)
    }
  }
}

// Shows one notification.
//
// "action" is a short name for what tapping it should do. It travels WITH the
// notification rather than being a function held in memory, and that is the
// whole point: a function only exists while the page does, but a notification
// can sit in the phone's notification list for hours and be tapped long after
// the page has been closed. A name survives that; a function cannot.
//
// HOW IT IS SHOWN, and why it changed. This used to be `new Notification(...)`,
// created by the page. That has two problems:
//
//   1. Android Chrome REFUSES it outright — it throws, and insists the service
//      worker shows notifications instead. So on Android, reminders were
//      silently doing nothing at all.
//   2. Even where it works, a page-owned notification belongs to the page. Ask
//      the service worker instead and you get a real system notification: it
//      goes to the phone's notification list, survives the page closing, and
//      can still be tapped afterwards.
//
// So the service worker is asked first, and the old way is kept only as a
// fallback for browsers that have no service worker at all.
export async function showNotification(title, body, action) {
  if (notificationPermission() !== 'granted') return

  const options = {
    body,
    // The app's own icon, so the notification is recognisably from here rather
    // than showing the browser's logo.
    icon: `${import.meta.env.BASE_URL}icon-192.png`,
    badge: `${import.meta.env.BASE_URL}icon-192.png`,

    // Notifications sharing a tag REPLACE each other instead of stacking, so a
    // week away from the app doesn't come back to seven identical reminders.
    tag: `active-living-${action}`,

    // What the service worker reads when the notification is tapped.
    data: { action },
  }

  if ('serviceWorker' in navigator) {
    try {
      // .ready waits until a service worker is actually in charge. On the very
      // first visit registration may still be in progress, and asking too early
      // would fail for no good reason.
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, options)
      return
    } catch {
      // Fall through to the older way below.
    }
  }

  // No service worker — an ordinary browser tab on a desktop, most likely.
  try {
    const note = new window.Notification(title, options)

    note.onclick = () => {
      // Brings the app's window to the front. Without this the page would get
      // the click but stay behind whatever the user was looking at.
      window.focus()

      if (clickHandler) clickHandler(action)

      note.close()
    }
  } catch {
    // Nothing useful to do — better a missing reminder than a crashed app.
  }
}
