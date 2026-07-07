import { AlertTriangle, Timer } from 'lucide-react'
import { SLA_TARGETS, IT_REQUEST_STATUS } from '../../data/itData'
import { parseLocalDate, todayLocal } from '../../utils/date'

// Incident SLA timers — reads the same request state IT.jsx holds. Open
// requests (pending / approved-procuring) get an SLA target by type; elapsed
// age vs target, with over-SLA flagged red. Targets are calendar days for the
// demo (working-day calendars are a Phase 2 refinement).

const ageDays = (iso) => Math.max(0, Math.round((todayLocal() - parseLocalDate(iso)) / (1000 * 60 * 60 * 24)))

export default function ItSlaView({ requests }) {
  const open = requests.filter((r) => r.status === 'pending' || r.status === 'approved')
  const rows = open.map((r) => {
    const target = SLA_TARGETS[r.type] ?? 3
    const age = ageDays(r.requestedDate)
    return { ...r, target, age, over: age > target }
  }).sort((a, b) => (b.age - b.target) - (a.age - a.target))

  const overCount = rows.filter((r) => r.over).length
  const avgAge = rows.length ? Math.round(rows.reduce((s, r) => s + r.age, 0) / rows.length) : 0

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">SLA timers</h2>
        <p className="text-xs text-gray-500">Every open request against its response target by type — access 1d, software 2d, repair 3d, hardware 5d (calendar days in this demo).</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open requests', value: rows.length, cls: 'text-gray-800' },
          { label: 'Over SLA', value: overCount, cls: overCount > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Avg age (days)', value: avgAge, cls: 'text-gray-800' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <div className={`text-xl font-semibold ${c.cls}`}>{c.value}</div>
            <div className="text-[11px] text-gray-400">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map((r) => {
          const meta = IT_REQUEST_STATUS[r.status]
          const pct = Math.min(100, Math.round((r.age / r.target) * 100))
          return (
            <div key={r.id} className={`bg-white rounded-lg border px-4 py-3 ${r.over ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 flex-wrap">
                {r.over
                  ? <AlertTriangle size={14} className="text-red-500 shrink-0" />
                  : <Timer size={14} className="text-gray-400 shrink-0" />}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-gray-800 truncate">{r.item}</span>
                  <span className="text-xs text-gray-400">{r.requestedBy} · {r.type} · raised {r.requestedDate}</span>
                </span>
                <span className="w-36 shrink-0 hidden sm:block">
                  <span className="block h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <span className={`block h-full rounded-full ${r.over ? 'bg-red-500' : pct > 70 ? 'bg-amber-400' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                  </span>
                </span>
                <span className={`text-xs shrink-0 ${r.over ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {r.age}d / {r.target}d{r.over && ` — ${r.age - r.target}d over`}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
              </div>
            </div>
          )
        })}
        {rows.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No open requests — the queue is clear.</div>}
      </div>
    </div>
  )
}
