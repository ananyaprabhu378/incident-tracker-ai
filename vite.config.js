// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Incident-Tracker1/', // <-- set repo name or hosting base path
  plugins: [react()]
})
