import { useState } from 'react'

// The search + status + date-range trio that every register/list grew in the
// Batch 18a sweep — one hook + one bar instead of a hand-rolled copy per view.
//
//   const f = useRegisterFilter(rows, { text: ['ref', 'title'], dateField: 'date' })
//   <RegisterFilterBar f={f} statuses={statuses} statusLabel={metaLabel} />
//   ...render f.rows
//
// `status` can be a custom predicate (r, value) => bool for registers whose
// "status" isn't a plain field (e.g. meetings filtered by open actions).
// `text` entries are field names or (row) => string extractors for nested text.
export function useRegisterFilter(rows, { text = [], dateField = 'date', status = (r, v) => r.status === v } = {}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [range, setRange] = useState({ from: '', to: '' })
  const q = search.trim().toLowerCase()
  const filtered = rows
    .filter((r) => statusFilter === 'all' || status(r, statusFilter))
    .filter((r) => (!range.from || (r[dateField] || '') >= range.from) && (!range.to || (r[dateField] || '') <= range.to))
    .filter((r) => !q || text.some((fld) => String((typeof fld === 'function' ? fld(r) : r[fld]) || '').toLowerCase().includes(q)))
  const reset = () => { setSearch(''); setStatusFilter('all'); setRange({ from: '', to: '' }) }
  return { rows: filtered, search, setSearch, statusFilter, setStatusFilter, range, setRange, reset }
}

export function RegisterFilterBar({ f, statuses = [], statusLabel = (s) => s, statusOptions = null, searchPlaceholder = 'Search…', showStatus = true, showDates = true, children }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input value={f.search} onChange={(e) => f.setSearch(e.target.value)} placeholder={searchPlaceholder} className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white w-52" />
      {showDates && (
        <>
          <label className="flex items-center gap-1 text-xs text-gray-500">From <input type="date" value={f.range.from} onChange={(e) => f.setRange({ ...f.range, from: e.target.value })} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white" /></label>
          <label className="flex items-center gap-1 text-xs text-gray-500">To <input type="date" value={f.range.to} onChange={(e) => f.setRange({ ...f.range, to: e.target.value })} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white" /></label>
        </>
      )}
      {showStatus && (
        <select value={f.statusFilter} onChange={(e) => f.setStatusFilter(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
          {statusOptions || (
            <>
              <option value="all">All statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </>
          )}
        </select>
      )}
      {children}
    </div>
  )
}
