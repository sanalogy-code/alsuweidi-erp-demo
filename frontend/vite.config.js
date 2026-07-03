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

const buildMessage = safeExec('git log -1 --pretty=%s', '')
const buildDate = safeExec('git log -1 --pretty=%cI', '')

export default defineConfig({
  plugins: [react()],
  define: {
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
