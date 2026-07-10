import { History } from 'lucide-react'

// Audit trail (demo scope) — the app-wide audit log (state/auditLog.js) filtered
// to Financials. Wired create/edit paths append entries (invoice created/sent,
// payment recorded, receipt recorded, credit note issued, expense added/approved,
// payables actions, petty cash, month-end ticks). Not every legacy code path is
// instrumented — a real immutable audit log is Phase 2.
export default function ActivityView({ log }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
        <p className="text-sm text-gray-500">Who did what in Finance this session — the shape of the Phase 2 audit trail.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-50">
        {log.map((e) => (
          <div key={e.id} className="px-4 py-2.5 flex items-baseline gap-3 text-sm">
            <span className="text-[11px] text-gray-400 tabular-nums whitespace-nowrap w-32 shrink-0">{e.ts}</span>
            <span className="text-xs font-medium text-gray-600 w-28 shrink-0 truncate">{e.user}</span>
            <span className="text-gray-700">{e.detail}</span>
          </div>
        ))}
        {log.length === 0 && (
          <div className="px-4 py-10 text-center text-gray-400 text-sm">
            <History size={20} className="mx-auto mb-2 opacity-40" />
            Nothing yet this session. Create an invoice, record a receipt, approve an expense — actions land here.
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400">
        Demo scope: session-only, covers the main Finance actions (not every legacy path). Phase 2 is a proper
        immutable audit log on the server, per record, with before/after values.
      </p>
    </div>
  )
}
