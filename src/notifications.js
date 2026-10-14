// notifications.js — the daily reminder.
// WHAT THIS CAN AND CANNOT DO — worth understanding before demonstrating it.

// Whether this browser can show notifications at all.
export function supportsNotifications() {
  return 'Notification' in window
}

// Whether the user has already allowed notifications. 'granted' → allowed 'denied' → refused.
export function notificationPermission() {
  if (!supportsNotifications()) return 'unsupported'
  return window.Notification.permission
}

// Asks the user's permission to show notifications.
export async function requestPermission() {
  if (!supportsNotifications()) return 'unsupported'

  try {
    return await window.Notification.requestPermission()
  } catch {
    // Some browsers reject the request outright.
    return 'denied'
  }
}

// How many milliseconds until the next time the clock reads hh:mm.
function millisecondsUntil(hours, minutes) {
  const now = new Date()

  const target = new Date()
  // Hours, minutes, then seconds and milliseconds zeroed so it fires exactly on the minute.
  target.setHours(hours, minutes, 0, 0)

  if (target <= now) {
    // setDate handles the end of the month by itself.
    target.setDate(target.getDate() + 1)
  }

  // Subtracting two dates gives the gap between them in milliseconds.
  return target - now
}

// Starts the daily reminder at a time given as "07:30".
export function startDailyReminder(time, onFire) {
  // Split "07:30" into 7 and 30.
  const [hoursText, minutesText] = time.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  // A damaged or half-typed time would otherwise schedule something nonsensical.
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    // Returning a function that does nothing keeps the caller simple.
    return () => {}
  }

  // The pending timer, kept so it can be canceled by the stop function.
  let timerId = null

  // Sets the timer for the next occurrence.
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
export function addHours(time, hours) {
  const [hoursText, minutesText] = time.split(':')
  const nextHour = (Number(hoursText) + hours) % 24

  // padStart(2, '0') keeps it as "00:30" rather than "0:30".
  return `${String(nextHour).padStart(2, '0')}:${minutesText}`
}

// Whatever should happen when a notification is tapped.
let clickHandler = null

// Passes a tap from the service worker up to the app.
function handleWorkerMessage(event) {
  if (event.data && event.data.type === 'notification-click' && clickHandler) {
    clickHandler(event.data.action)
  }
}

// Starts listening for notification taps.
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
export async function showNotification(title, body, action) {
  if (notificationPermission() !== 'granted') return

  const options = {
    body,
    // The app's own icon, so the notification is recognisably from here rather than showing.
    icon: `${import.meta.env.BASE_URL}icon-192.png`,
    badge: `${import.meta.env.BASE_URL}icon-192.png`,

    // Notifications sharing a tag REPLACE each other instead of stacking.
    tag: `active-living-${action}`,

    // What the service worker reads when the notification is tapped.
    data: { action },
  }

  if ('serviceWorker' in navigator) {
    try {
      // .ready waits until a service worker is actually in charge.
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
      // Brings the app's window to the front.
      window.focus()

      if (clickHandler) clickHandler(action)

      note.close()
    }
  } catch {
    // Nothing useful to do — better a missing reminder than a crashed app.
  }
}
