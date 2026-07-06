import { REPORT_CHECKLIST_ITEMS, daysUntil } from '../../../data/pmData'

// Monthly progress reports per FIDIC 4.21: required contents as a checklist,
// due within 7 days of month end. Teeth: non-submission can let the Engineer
// decline a Payment Certificate — hence the compliance tracker.

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function ReportsView({ pm, onUpdate }) {
  const toggle = (r, key) => onUpdate({
    ...pm,
    reports: pm.reports.map((x) => x.id === r.id ? { ...x, checklist: { ...x.checklist, [key]: !x.checklist[key] } } : x),
  })
  const submit = (r) => onUpdate({ ...pm, reports: pm.reports.map((x) => x.id === r.id ? { ...x, submittedDate: todayISO() } : x) })

  if (!pm.reports.length) {
    return <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No monthly reports tracked — typically starts when construction does.</div>
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Monthly progress reports (FIDIC 4.21)</h2>
      {[...pm.reports].sort((a, b) => b.month.localeCompare(a.month)).map((r) => {
        const complete = REPORT_CHECKLIST_ITEMS.every((i) => r.checklist[i.key])
        const d = daysUntil(r.dueDate)
        return (
          <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-800">{r.month} report</span>
              {r.submittedDate
                ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Submitted {r.submittedDate}</span>
                : <span className={`text-[11px] px-2 py-0.5 rounded-full ${d < 0 ? 'bg-red-100 text-red-700' : d <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    Due {r.dueDate}{d < 0 ? ` — ${-d}d overdue` : ` (${d}d left)`}
                  </span>}
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {REPORT_CHECKLIST_ITEMS.map((item) => (
                <label key={item.key} className={`flex items-center gap-2 text-xs ${r.submittedDate ? 'text-gray-400' : 'text-gray-600 cursor-pointer'}`}>
                  <input type="checkbox" checked={!!r.checklist[item.key]} disabled={!!r.submittedDate} onChange={() => toggle(r, item.key)} className="rounded" />
                  {item.label}
                </label>
              ))}
            </div>
            {!r.submittedDate && (
              <div className="flex items-center gap-3">
                <button onClick={() => submit(r)} disabled={!complete} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white disabled:opacity-40">Mark submitted</button>
                {!complete && <span className="text-[11px] text-gray-400">All contents required before submission — non-submission can block the Payment Certificate.</span>}
              </div>
            )}
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">Covers each calendar month, due within 7 days of month end. Auto-generating report content from these registers is a natural Phase 2 step.</p>
    </div>
  )
}
