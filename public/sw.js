// ============================================================================
// sw.js — the SERVICE WORKER: what lets the app open without a connection.
//
// A service worker is a small script the browser keeps AFTER the page closes.
// It sits between the app and the network, and gets a say in every file the app
// asks for. That's what makes an installed web app feel native: tapping the
// icon on the home screen opens it instantly, on the underground, on a plane,
// with no "you are offline" page.
//
// Two things worth knowing before editing this:
//
//   1. It is NOT part of the React app. It runs on its own, has no access to
//      the screen, and cannot use anything from src/. That's why it's a plain
//      file in public/ rather than something Vite bundles.
//
//   2. Bump CACHE_NAME whenever you change this file. The name is the only way
//      the browser can tell an old cache from a new one — see the activate
//      step below, which deletes every cache that isn't the current name.
// ============================================================================

const CACHE_NAME = 'active-living-v2'

// Where the app is served from: "/" on most hosts, "/Active-Living/"
// on GitHub Pages, which serves a project from a folder named after the repo.
//
// This file is copied across untouched — it is never bundled — so it cannot be
// given the value at build time the way the React code is. Instead it works it
// out for itself: self.location is this worker's own address, and everything up
// to the last slash of it is the folder the app lives in. That makes the file
// correct on any host without being edited.
const BASE = self.location.pathname.replace(/sw\.js$/, '')

// The bare minimum needed to draw something. Everything else is cached as it's
// asked for, which matters because Vite gives the built files names like
// index-B7PVQftd.js that change on EVERY build — a fixed list of those would be
// out of date the moment you rebuilt.
const CORE = [BASE, `${BASE}index.html`, `${BASE}manifest.webmanifest`]

// ---- 1. Install: runs once, when a new version of this file is found -------
self.addEventListener('install', (event) => {
  // waitUntil tells the browser "don't call this step finished until my promise
  // is done". Without it the browser may shut the worker down mid-job.
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // addAll fails as a whole if any one file 404s, so it's kept to the few
      // files that definitely exist.
      .then((cache) => cache.addAll(CORE))
      // Take over straight away rather than waiting for every tab to close,
      // which is the default and is confusing during development.
      .then(() => self.skipWaiting()),
  )
})

// ---- 2. Activate: tidy up after the old version ----------------------------
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
      // Start controlling pages that are already open, instead of only ones
      // loaded from now on.
      .then(() => self.clients.claim()),
  )
})

// ---- 3. Notification tapped -------------------------------------------------
//
// This is the part that makes a reminder actually useful. Because it runs in
// the service worker rather than in the page, it works even when the app has
// been closed since the notification appeared: the browser wakes this worker up
// to handle the tap.
//
// Two cases, in order of preference:
//
//   the app is still open somewhere → bring that window to the front and tell
//                                     it which page to show. Far better than
//                                     opening a second copy of the app.
//   the app is closed               → open it, with the destination written
//                                     into the address so it knows where to go
//                                     the moment it starts.
self.addEventListener('notificationclick', (event) => {
  // Takes the notification out of the phone's notification list. Without this
  // it sits there looking unread after being acted on.
  event.notification.close()

  // What this notification was for — put there by showNotification().
  const action = (event.notification.data && event.notification.data.action) || 'checkin'

  // waitUntil keeps the worker alive until the work below finishes. Service
  // workers are shut down aggressively when idle, and without this the browser
  // could stop it mid-way through opening the window.
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        // Windows this worker isn't controlling yet count too — on the very
        // first visit the page is open but not yet under the worker's control.
        includeUncontrolled: true,
      })

      for (const client of windows) {
        if (client.url.includes(BASE)) {
          await client.focus()

          // postMessage is how a service worker talks to a page. App.jsx is
          // listening for this — see listenForNotificationClicks.
          client.postMessage({ type: 'notification-click', action })
          return
        }
      }

      // Nothing open. Start the app, with ?open=... telling it where to go.
      await self.clients.openWindow(`${BASE}?open=${action}`)
    })(),
  )
})

// ---- 4. Fetch: answer every request the app makes ---------------------------
self.addEventListener('fetch', (event) => {
  const request = event.request

  // Only GET is cacheable. Anything else goes straight to the network.
  if (request.method !== 'GET') return

  // Leave other sites alone entirely.
  if (new URL(request.url).origin !== self.location.origin) return

  // NAVIGATION — the user opening the app. Network first, so a fresh version is
  // picked up as soon as one is published; the cached page is the fallback when
  // there's no connection.
  //
  // This is a single-page app, so every route is answered by index.html.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(`${BASE}index.html`)),
    )
    return
  }

  // EVERYTHING ELSE — scripts, styles, icons. Cache first, because Vite stamps
  // a hash into each filename: a given name always means the same content, so a
  // cached copy can never be out of date. A new build asks for new names.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        // Only store proper, complete responses. Caching an error page would
        // keep serving that error long after the problem was fixed.
        if (response.ok && response.type === 'basic') {
          // The body can only be read once, so the copy is cached and the
          // original handed back to the app.
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }

        return response
      })
    }),
  )
})
