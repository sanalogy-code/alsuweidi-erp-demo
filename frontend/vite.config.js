import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

function safeExec(cmd, fallback) {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim()
  } catch {
    return fallback
  }
}

// Cloudflare Pages injects the deployed commit SHA as an env var; fall back to git for local dev.
const buildHash = (process.env.CF_PAGES_COMMIT_SHA || safeExec('git rev-parse HEAD', '')).slice(0, 7) || 'local'
const buildNumber = safeExec('git rev-list --count HEAD', '?')
const buildMessage = safeExec('git log -1 --pretty=%s', '')
const buildDate = safeExec('git log -1 --pretty=%cI', '')

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_NUMBER__: JSON.stringify(buildNumber),
    __BUILD_HASH__: JSON.stringify(buildHash),
    __BUILD_MESSAGE__: JSON.stringify(buildMessage),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
