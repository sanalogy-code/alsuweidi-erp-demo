import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function safeExec(cmd, fallback) {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim()
  } catch {
    return fallback
  }
}

const buildMessage = safeExec('git log -1 --pretty=%s', '')
const buildDate = safeExec('git log -1 --pretty=%cI', '')

// ---------------------------------------------------------------------------
// Dev-dashboard stats, computed at build time so they never drift from reality.
// Everything degrades gracefully: git may be shallow/absent on CI, BACKLOG.md
// may move — each stat has a fallback and the dashboard renders what it gets.
// ---------------------------------------------------------------------------

const commitCount = Number(safeExec('git rev-list --count HEAD', '0')) || 0
// Root-commit date without shell pipes (must work on Windows dev + Linux CI):
// find the parentless commit, then ask for its date.
const rootHash = safeExec('git rev-list --max-parents=0 HEAD', '').split('\n')[0].trim()
const firstCommitDate = rootHash ? safeExec(`git show -s --format=%cI ${rootHash}`, '') : ''

// Count source files + lines with fs (no wc/find — cross-platform).
function walkSrc(dir, acc = { files: 0, lines: 0, components: 0 }) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkSrc(full, acc)
    else if (/\.(jsx?|css)$/.test(entry.name)) {
      acc.files += 1
      acc.lines += fs.readFileSync(full, 'utf-8').split('\n').length
      if (entry.name.endsWith('.jsx')) acc.components += 1
    }
  }
  return acc
}
let srcStats = { files: 0, lines: 0, components: 0 }
try {
  srcStats = walkSrc(path.join(__dirname, 'src'))
} catch { /* keep zeros */ }

// Parse BACKLOG.md (repo root) into per-section open/done counts and item
// titles, so the dashboard's backlog view is always the real backlog.
function parseBacklog() {
  const sections = []
  let raw
  try {
    raw = fs.readFileSync(path.join(__dirname, '..', 'BACKLOG.md'), 'utf-8')
  } catch {
    return sections
  }
  let current = null
  for (const line of raw.split('\n')) {
    const heading = line.match(/^##\s+(.+)/)
    if (heading) {
      current = { title: heading[1].trim(), open: 0, done: 0, items: [] }
      sections.push(current)
      continue
    }
    if (!current) continue
    const item = line.match(/^- \[( |x)\] (.+)/)
    if (item) {
      const done = item[1] === 'x'
      if (done) current.done += 1
      else current.open += 1
      // Title = bold text if present, else strikethrough text, else the raw line
      const bold = item[2].match(/\*\*(.+?)\*\*/)
      const strike = item[2].match(/~~(.+?)~~/)
      const title = (bold?.[1] || strike?.[1] || item[2]).replace(/[*~]/g, '').trim()
      current.items.push({ title: title.slice(0, 90), done })
    }
  }
  return sections
}

const devStats = {
  commits: commitCount,
  firstCommitDate,
  buildDate,
  buildMessage,
  loc: srcStats.lines,
  files: srcStats.files,
  components: srcStats.components,
  backlog: parseBacklog(),
}

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_MESSAGE__: JSON.stringify(buildMessage),
    __BUILD_DATE__: JSON.stringify(buildDate),
    __DEV_STATS__: JSON.stringify(devStats),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
