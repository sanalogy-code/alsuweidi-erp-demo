// ISO 'YYYY-MM-DD' strings parse as UTC midnight via new Date(str) — in UTC+ timezones
// (like the UAE) that lands on the *previous* local day, so date-only comparisons drift
// by a day. Always parse date-only strings to local midnight instead.
export function parseLocalDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Today at local midnight — for comparing against parseLocalDate() values.
export function todayLocal() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

// Today as a LOCAL 'YYYY-MM-DD' string. new Date().toISOString().slice(0, 10)
// is the classic bug here: it's UTC, so in the UAE (UTC+4) it stamps yesterday
// until 4am. Use this instead of hand-rolling it per view.
export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Compact age for queue/inbox rows — 'today' or 'Nd ago'.
export function daysAgo(iso) {
  const n = Math.floor((todayLocal() - parseLocalDate(iso)) / (1000 * 60 * 60 * 24))
  return n <= 0 ? 'today' : `${n}d ago`
}
