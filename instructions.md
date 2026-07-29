# How to Run This App

A step-by-step guide for `health-app`. Written for a beginner — you can follow this
top to bottom without knowing anything beforehand.

---

## The 10-second version

Open the VSCode terminal (`` Ctrl+` ``) and run:

```
npm run dev
```

Then click the `http://localhost:5173/` link it prints. That's it.

Leave the terminal running while you work. **Do not close it** — closing it stops the app.

---

## What's actually in this folder

```
App 0.00/
  index.html           <- the page that loads your app
  src/
    main.jsx           <- entry point (starts React)
    App.jsx            <- YOUR APP. Edit this one.
    App.css
    index.css
  public/              <- images/files served as-is
  package.json         <- lists your commands and dependencies
  vite.config.js       <- build tool settings
  node_modules/        <- installed libraries (never edit, never commit)

  notifo/              <- SEPARATE .NET notification server. Not part of `npm run dev`.
  ninja-business-.../  <- an old plain-HTML template, unrelated to the React app
```

**The file you actually edit is [src/App.jsx](src/App.jsx).** Save it and the browser
updates by itself — no refresh needed.

---

## Running it with F5 (the VSCode debugger)

`launch.json` is **not** a one-button launcher. It only opens a browser window —
it does not start the app. It takes two steps, in this order:

**Step 1.** Start the server first:

```
npm run dev
```

**Step 2.** Now press `F5` and pick a configuration:

| Configuration | What it opens |
| --- | --- |
| `Open my React app (needs npm run dev)` | Your app at `localhost:5173` |
| `Open ninja template (plain HTML)` | The old static template — works without Step 1 |

If you press `F5` without doing Step 1 first, Chrome opens and shows
**"This site can't be reached."** That is the #1 thing that goes wrong. It does not
mean your code is broken — it means nothing is running yet.

For everyday work you can ignore `F5` entirely. It only adds the Chrome debugger
(so you can set breakpoints in VSCode). `npm run dev` + clicking the link is enough.

---

## All the commands

| Command | What it does | When to use it |
| --- | --- | --- |
| `npm run dev` | Starts the live dev server on port 5173 | Every time you sit down to work |
| `npm run build` | Bundles a minified copy into `dist/` | When you're ready to publish |
| `npm run preview` | Serves the built `dist/` folder | To check the build before publishing |
| `npm run lint` | Scans your code for mistakes | Any time; especially before committing |
| `npm install` | Re-installs libraries into `node_modules/` | After cloning, or if imports break |

---

## Stopping the server

**The normal way:** click into the terminal running `npm run dev` and press `Ctrl+C`.
If it asks `Terminate batch job (Y/N)?`, press `Y` then Enter.

Closing the terminal entirely (the trash-can icon in VSCode) also stops it.

### When Ctrl+C isn't an option

Sometimes a server is running with no terminal you can type into — you closed the
window, or something else started it. There's nothing to press `Ctrl+C` in, but the
server is still holding the port.

Stop every Vite server at once:

```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -like '*vite*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

This is the reliable reset whenever ports get tangled. It only stops Vite dev
servers — it won't touch other Node programs on your machine.

To confirm everything is stopped:

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -ge 5170 -and $_.LocalPort -le 5180 } |
  Select-Object LocalPort, OwningProcess
```

No output means nothing is running — you're clean.

**Always stop the server before shutting down for the day.** Leftover servers are the
single most common source of confusion here: they squat on port 5173, push your next
`npm run dev` onto 5174, and then `F5` opens the stale one and your edits seem to
vanish.

---

## Troubleshooting

### "Port 5173 is in use, trying another one..."

You have an old dev server still running from a previous session. Vite will fall back
to port **5174**, but `launch.json` still points at **5173** — so `F5` opens the *stale*
server and your edits appear to do nothing. Confusing and worth fixing.

Find and stop the leftover server (PowerShell):

```powershell
# See what's holding the port
Get-NetTCPConnection -State Listen -LocalPort 5173 |
  Select-Object LocalPort, OwningProcess

# Stop it (use the OwningProcess number from above)
Stop-Process -Id <PID> -Force
```

Or stop every Vite server at once:

```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -like '*vite*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

Then run `npm run dev` again and confirm it says `localhost:5173`.

**Rule of thumb:** if the URL Vite prints is not 5173, stop and clean up before continuing.

### The browser shows a blank white page

Open the browser console (`F12` → **Console** tab) and read the red error. A blank page
almost always means a JavaScript error in `src/App.jsx`, and the real message is there.

### "'npm' is not recognized"

Node.js isn't on your PATH. Check with `node --version` — it should print something like
`v22.23.1`. If it errors, reinstall Node.js and restart VSCode.

### Imports fail / "cannot find module"

```
npm install
```

### Edits don't show up

1. Confirm the `npm run dev` terminal is still running and shows no errors.
2. Confirm the browser is on the same port the terminal printed.
3. Hard-refresh: `Ctrl+Shift+R`.

---

## About the `notifo/` folder

`notifo/` is a **separate application** — a .NET notification server with its own
`backend/`, `frontend/`, and `Dockerfile`. Things to know:

- `npm run dev` does **not** run it. It has a completely different startup process.
- It is its own git repository with its own remote, so it is listed in `.gitignore`.
  Commit changes to it from *inside* the `notifo/` folder; commit your React app from
  the parent folder.
- Its `frontend/` folder is Notifo's own admin UI — **it is not your app**. Yours is `src/`.

Your React app and Notifo are meant to talk to each other over the network later.
That's a separate setup step, not part of running the app day to day.

---

## Known quirks in this project

- **`.vscode/.vscode/launch.json`** is a stray leftover pointing at port 8080. VSCode
  ignores it (only `.vscode/launch.json` is read). It is safe to delete.
- **Nothing is committed to git yet.** There are ~10,000 uncommitted changes in this
  folder — the deleted old templates plus this entire app. Until you commit, a bad
  `git checkout` would erase your work.
