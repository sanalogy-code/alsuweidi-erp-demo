import { Wrench, AlertTriangle } from 'lucide-react'
import { daysUntil } from '../../data/pmData'
import { parseLocalDate, todayISO } from '../../utils/date'

// Preventive-maintenance schedule for site/survey equipment — calibration and
// service intervals with next-due tracking. "Mark done" stamps today and
// advances next-due by the interval.

const addMonths = (iso, months) => {
  const d = parseLocalDate(iso)
  d.setMonth(d.getMonth() + months)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function MaintenanceView({ items, onChange }) {
  const markDone = (item) => {
    const today = todayISO()
    onChange(items.map((x) => (x.id === item.id ? { ...x, lastDone: today, nextDue: addMonths(today, x.everyMonths) } : x)))
  }

  const sorted = [...items].sort((a, b) => a.nextDue.localeCompare(b.nextDue))
  const overdue = items.filter((i) => daysUntil(i.nextDue) < 0).length

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Preventive maintenance</h2>
        <p className="text-xs text-gray-500">
          Calibration and service schedule for site &amp; survey equipment.
          {overdue > 0 ? ` ${overdue} item(s) overdue.` : ' Everything on schedule.'}
        </p>
      </div>

      <div className="space-y-2">
        {sorted.map((m) => {
          const dd = daysUntil(m.nextDue)
          const over = dd < 0
          const soon = !over && dd <= 30
          return (
            <div key={m.id} className={`bg-white rounded-lg border px-4 py-3 ${over ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 flex-wrap">
                {over
                  ? <AlertTriangle size={14} className="text-red-500 shrink-0" />
                  : <Wrench size={14} className="text-gray-400 shrink-0" />}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-gray-800 truncate">{m.asset}</span>
                  <span className="text-xs text-gray-400">{m.task} · every {m.everyMonths} months · last done {m.lastDone}</span>
                </span>
                <span className={`text-xs shrink-0 ${over ? 'text-red-600 font-semibold' : soon ? 'text-amber-600' : 'text-gray-500'}`}>
                  due {m.nextDue}{over ? ` — ${Math.abs(dd)}d overdue` : soon ? ` — in ${dd}d` : ''}
                </span>
                <button onClick={() => markDone(m)} className="text-[11px] text-brand hover:underline shrink-0">Mark done</button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No maintenance items scheduled.</div>}
      </div>

      <p className="text-[11px] text-gray-400">Survey kit lives outside the IT asset registry for now — free-text asset names until an equipment register lands (Phase 2, with calibration certificates attached).</p>
    </div>
  )
}
