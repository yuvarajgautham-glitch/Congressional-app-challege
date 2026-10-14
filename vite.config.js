// vite.config.js — settings for Vite, the tool that RUNS and BUILDS the app.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PLUGINS add abilities to Vite.
export default defineConfig({
  plugins: [react()],

  // WHERE THE APP WILL LIVE on the web address.
  base: process.env.GITHUB_PAGES ? '/Active-Living/' : '/',

  // Settings for the dev server that `npm run dev` starts.
  server: {
    // By default the server only answers your own computer.
    host: true,
  },
})
