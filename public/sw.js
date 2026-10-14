// sw.js — the SERVICE WORKER: what lets the app open without a connection.

const CACHE_NAME = 'active-living-v2'

// Where the app is served from: "/" on most hosts, "/Active-Living/" on GitHub Pages.
const BASE = self.location.pathname.replace(/sw\.js$/, '')

// The bare minimum needed to draw something.
const CORE = [BASE, `${BASE}index.html`, `${BASE}manifest.webmanifest`]

// ---- 1. Install: runs once, when a new version of this file is found ----
self.addEventListener('install', (event) => {
  // waitUntil tells the browser "don't call this step finished until my promise is done".
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // addAll fails as a whole if any one file 404s.
      .then((cache) => cache.addAll(CORE))
      // Take over straight away rather than waiting for every tab to close.
      .then(() => self.skipWaiting()),
  )
})

// ---- 2. Activate: tidy up after the old version ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      // Start controlling pages that are already open, instead of only ones loaded from now on.
      .then(() => self.clients.claim()),
  )
})

// ---- 3. Notification tapped ----
// This is the part that makes a reminder actually useful.
self.addEventListener('notificationclick', (event) => {
  // Takes the notification out of the phone's notification list.
  event.notification.close()

  // What this notification was for — put there by showNotification().
  const action = (event.notification.data && event.notification.data.action) || 'checkin'

  // waitUntil keeps the worker alive until the work below finishes.
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        // Windows this worker isn't controlling yet count too.
        includeUncontrolled: true,
      })

      for (const client of windows) {
        if (client.url.includes(BASE)) {
          await client.focus()

          // postMessage is how a service worker talks to a page.
          client.postMessage({ type: 'notification-click', action })
          return
        }
      }

      // Nothing open.
      await self.clients.openWindow(`${BASE}?open=${action}`)
    })(),
  )
})

// ---- 4. Fetch: answer every request the app makes ----
self.addEventListener('fetch', (event) => {
  const request = event.request

  // Only GET is cacheable.
  if (request.method !== 'GET') return

  // Leave other sites alone entirely.
  if (new URL(request.url).origin !== self.location.origin) return

  // NAVIGATION — the user opening the app.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(`${BASE}index.html`)),
    )
    return
  }

  // EVERYTHING ELSE — scripts, styles, icons.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        // Only store proper, complete responses.
        if (response.ok && response.type === 'basic') {
          // The body can only be read once.
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }

        return response
      })
    }),
  )
})
