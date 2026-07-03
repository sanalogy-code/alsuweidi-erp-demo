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
