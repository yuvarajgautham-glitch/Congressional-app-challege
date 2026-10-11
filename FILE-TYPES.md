# A guide to the files in this project

For anyone reviewing this code. It explains what each kind of file does, why
it's here, and where to start reading.

---

## The short version

| Extension | Count | What it is | What it does here |
|---|---|---|---|
| `.jsx` | 18 | JavaScript + HTML-like markup | Every screen you see |
| `.css` | 14 | Stylesheets | How everything looks |
| `.js` | 12 | Plain JavaScript | Logic and saved data — no screens |
| `.json` | 3 | Structured data | Project settings |
| `.html` | 1 | Web page | The shell the app loads into |
| `.webmanifest` | 1 | JSON, special name | Lets the app install on a phone |
| `.yml` | 1 | Configuration | The automatic publishing job |
| `.png` `.jpg` `.svg` | 18 | Images | Icons and artwork |
| `.md` | 3 | Markdown | Documentation, including this file |

**Roughly 8,000 lines of hand-written code across 45 source files.**

---

## What each format is

If any of these are unfamiliar, this is the general idea. Each example is a real
line from this project.

### HTML — structure

HyperText Markup Language, the oldest piece of the web. It describes *what
things are* — this is a heading, this is a button — using tags in angle
brackets. It says nothing about appearance or behavior.

```html
<div id="root"></div>
```

Every web page ever made is HTML underneath.

### CSS — appearance

Cascading Style Sheets. Takes the structure HTML describes and says how it
should look. You name something, then list its properties.

```css
.goal-card {
  display: flex;
  justify-content: space-between;
}
```

"Cascading" means rules flow downward and can override one another — a style set
once applies everywhere until something more specific overrides it.

### JavaScript (`.js`) — behavior

The programming language browsers run. If HTML is structure and CSS is
appearance, JavaScript is the part that *does* things: responds to taps,
calculates, remembers.

```js
export function todayKey() {
  return toDateKey(new Date())
}
```

It is the only programming language a browser understands, which is why it isn't
a choice — any app that runs in a browser is written in it.

### JSX (`.jsx`) — JavaScript with markup inside

Not a separate language. JavaScript with one addition: HTML-shaped markup can be
written directly inside it.

```jsx
<h1 className="title">Goals</h1>
```

A browser cannot read that, so a build tool converts it to ordinary JavaScript
first. The benefit is that a screen's appearance and the logic driving it sit
together rather than in two separate files.

### JSON — data

JavaScript Object Notation. A plain-text way of writing structured information:
names paired with values, inside braces.

```json
"dependencies": {
  "react": "^19.2.7"
}
```

It is data, not code — nothing in a JSON file ever runs. It became the standard
way programs exchange information because both people and machines can read it.

### YAML — configuration

Does the same job as JSON, but uses indentation instead of brackets, which makes
it easier to read at a glance.

```yaml
on:
  push:
    branches: [master]
```

Common for configuration files that people edit by hand.

### Markdown (`.md`) — formatted plain text

A way of writing documents with light formatting: `#` for a heading, `**bold**`,
`-` for a list item. It stays readable as plain text, and GitHub renders it as a
formatted page — which is how you are reading this.

### SVG — drawings as instructions

Scalable Vector Graphics. Instead of storing colored dots, it stores
*instructions*: "a line from here to here." Because it is maths rather than
pixels, it stays perfectly sharp at any size.

It is also text, which means it can be written by hand — and that is exactly how
the progress graph in this app is drawn, with no image file involved.

### PNG and JPG — pictures as dots

Both store actual pixels, and they differ in one way that matters here.

**PNG** keeps every pixel exact and supports **transparency**, so part of an
image can be see-through. **JPG** compresses by discarding detail the eye is
unlikely to notice — smaller files, but no transparency, and quality degrades
each time it is re-saved.

That is why the icons in this app are PNG: the runner has to sit on a green
gradient with nothing boxed around it.

---

**In one line:** HTML is the skeleton, CSS is the skin, JavaScript is the
muscles. JSX is a convenience on top of JavaScript. JSON and YAML are not
programming at all — they are ways of writing down settings. Markdown is
documentation. SVG, PNG and JPG are pictures.

---

## How each format is used in this project

### `.html` — the shell · 1 file

**[index.html](index.html)** is the only HTML file in the project, and it is
almost empty on purpose. It holds about ten lines of setup — the page title, the
colors a phone should tint its status bar, the instructions that let the app be
installed to a home screen — and then one empty `<div>`.

Everything a user sees is drawn into that one empty div by JavaScript. This is
how modern web apps are built: one page that rewrites itself, rather than a
separate HTML file per screen.

### `.jsx` — the screens · 18 files

JSX is JavaScript with HTML-like syntax mixed in, so a screen can be described
in the shape it will actually appear:

```jsx
<main className="screen goals-screen">
  <h1 className="title">Goals</h1>
</main>
```

A browser cannot read that directly — it has to be converted first (see
**Building** below). The payoff is that the look of a screen and the logic
driving it sit side by side instead of in two separate files.

These files are organized in three groups:

- **`src/main.jsx`** — the starting point; hands over to React
- **`src/App.jsx`** — the frame that holds the app's memory and picks the screen
- **`src/pages/`** and **`src/components/`** — one file per screen, plus three
  reusable pieces

### `.js` — the logic · 12 files

Plain JavaScript, no markup. These files draw nothing at all, and **none of them
import React**. That separation is deliberate: a date calculation doesn't care
what's on screen, and keeping it apart means it can be tested on its own. The
streak rules and the calendar maths were both verified that way before anything
was wired to a screen.

| File | Responsibility |
|---|---|
| `dates.js` | Calendars, date formats, week arithmetic |
| `passwordSecurity.js` | Scrambling passwords so they are never stored as typed |
| `notifications.js` | Deciding when reminders fire and showing them |
| `exercisePlans.js` | The exercise recommendations, as data |
| `accountStorage.js` | Saving the account |
| `exerciseStorage.js` | Saving ticked exercises and notes |
| `routineStorage.js` | Saving calendar days and reminder time |
| `streakStorage.js` | Saving and calculating the streak |
| `measurementsStorage.js` | Saving weekly measurements |
| `components/tabs.js` | The five menu buttons, as data |
| `vite.config.js` | Build settings |
| `public/sw.js` | The service worker — see below |

**`public/sw.js` is worth singling out.** A "service worker" is a small program
the browser keeps running *after the page is closed*. It is what makes the app
open without an internet connection, deliver notifications to the phone, and
open the right page when one is tapped. It is a separate file rather than part
of the app because it has to run on its own.

### `.css` — the appearance · 14 files

Stylesheets. No framework such as Bootstrap or Tailwind — this is plain CSS.

The organizing rule: a style used by **one** screen lives in that screen's own
file beside it. The moment a **second** screen needs it, it moves up into the
shared `App.css`. You can see that history in the comments — several styles note
when and why they were promoted.

`index.css` sits above both and holds the color palette, the fonts and the
phone-shaped frame.

### `.json` — settings · 3 files

JSON is a plain-text way of writing structured data. Human-readable, used
everywhere for configuration.

- **`package.json`** — the project's name, its five outside packages, and the
  commands (`npm run dev`, `npm run build`)
- **`package-lock.json`** — records the exact version of every package, so the
  project builds identically on any machine. Generated automatically; not
  hand-written
- **`.oxlintrc.json`** — settings for the code checker

### `.webmanifest` — the install file · 1 file

**`public/manifest.webmanifest`** is JSON with a special name that browsers look
for. It carries the app's name, its icons, its colors and the instruction to
open full-screen without a browser bar. It is what turns a web page into
something a phone will install to its home screen.

### `.yml` — automation · 1 file

**`.github/workflows/deploy.yml`** is YAML, a format designed to be readable at
a glance. It describes a job GitHub runs automatically: whenever code is pushed,
GitHub installs the packages, builds the app and publishes it. That is why
updating the live site takes one command.

### Images · 18 files

`.png` for the app icons and the runner silhouette — PNG supports
transparency, which they need. `.jpg` for the original design mock-ups. `.svg`
for a vector icon.

Two of these were generated rather than drawn: the runner was cut out of a
design mock-up and given a transparent background, and the five menu icons were
extracted from source artwork and normalised to the same visual weight.

### `.md` — documentation · 3 files

Markdown — plain text with light formatting. GitHub renders it automatically.
`README.md`, `ABOUT.md` (a non-technical overview) and this file.

---

## Written vs. built — an important distinction

Two folders are **not** hand-written and should not be reviewed as code:

- **`node_modules/`** — the five outside packages and everything they depend on.
  Downloaded, never edited, excluded from the repository
- **`dist/`** — the finished app, produced by the build. The 45 source files are
  compressed into one JavaScript file and one CSS file

So the project ships about **74 kilobytes** to a phone, from roughly 8,000 lines
of source.

### Building

Browsers cannot read `.jsx`. A tool called **Vite** converts it, bundles
everything together and writes `dist/`. Vite runs on the developer's computer
and is never sent to the user — which is why it appears under
*devDependencies* in `package.json`, separate from React, which does ship.

---

## Where to start reading

1. **`ABOUT.md`** — what the app is for, in plain language
2. **`src/App.jsx`** — the frame; shows how the whole app fits together
3. **`src/pages/RoutineScreen.jsx`** — a representative screen, with a calendar
   built from scratch
4. **`src/passwordSecurity.js`** — security handling, and the reasoning behind it
5. **`src/pages/DataScreen.jsx`** — a line graph drawn by hand in SVG, with no
   charting library

**Every file opens with a comment explaining what it is for and why it was built
that way.** Where a decision has a trade-off — why the password hashing works as
it does, why the chart sits on a white card, why a streak counts scheduled days
rather than calendar days — the reasoning is written down next to the code.

---

## A note on dependencies

This project uses **two** outside packages at runtime: React and React DOM.

Everything else is written from scratch — the line graph, the calendar, the
password hashing, the offline support, the notification scheduling, the styling.
A single charting library would have been larger than this entire application.

The result is an app with no supply-chain risk, nothing that breaks when a
dependency updates, and a codebase where every line can be read and explained.
