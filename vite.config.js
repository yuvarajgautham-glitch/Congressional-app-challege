// ============================================================================
// vite.config.js — settings for Vite, the tool that RUNS and BUILDS the app.
//
// Vite does two jobs for you:
//   npm run dev   → starts the live server on localhost:5173, and reloads the
//                   browser by itself every time you save a file
//   npm run build → packs everything into a dist/ folder ready to publish
//
// This file is tiny and you are unlikely to need to change it. It only exists
// to tell Vite that this project is written in React.
// ============================================================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PLUGINS add abilities to Vite. The React plugin lets it understand JSX (the
// HTML-looking code in .jsx files) and powers the instant-refresh-on-save.
//
// Official documentation: https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // WHERE THE APP WILL LIVE on the web address.
  //
  // Most hosts serve a site from the root of a domain, so "/" is right and
  // nothing needs saying. GitHub Pages is the exception for a project repo: it
  // serves from a folder named after the repository, so every file has to be
  // asked for at /Congressional-app-challege/... instead. Get this wrong and
  // the page loads but every script, style and icon comes back 404 — the
  // classic "blank white page on GitHub Pages".
  //
  // The environment variable keeps the two apart: the GitHub Actions workflow
  // in .github/workflows sets it, while `npm run dev` and any other host stay
  // at the root. Note the trailing slash — Vite requires it.
  base: process.env.GITHUB_PAGES ? '/Congressional-app-challege/' : '/',

  // Settings for the dev server that `npm run dev` starts.
  server: {
    // By default the server only answers your own computer, so a phone on the
    // same Wi-Fi cannot reach it. host: true makes it answer every device on
    // your home network, which is what lets you open the app on your iPhone.
    //
    // This affects `npm run dev` ONLY — your home Wi-Fi, not the internet.
    // Nobody outside your house can reach it.
    host: true,
  },
})
