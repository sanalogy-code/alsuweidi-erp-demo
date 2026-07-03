import { useState } from 'react'
import { ClipboardCheck, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { GENERAL_CODES, DAY_LABELS, weekStartOf, addDays, toLocalISO, fmtWeekRange, timesheetTotal } from '../../data/timesheetData'
import { workWeekOf } from '../../data/hrData'

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

// The timesheet approval queue, in two modes:
//   mode 'manager'  — a line manager approving their own team's weeks (the
//                     normal path; timesheets/employees are pre-filtered to the team)
//   mode 'oversight'— HR's company-wide view: sees every week and which manager
//                     it's waiting on, and can step in where there is no line
//                     manager or the manager is unavailable
// Both also list who hasn't submitted last week at all — those employees are
// flagged to payroll (unsubmitted timesheets block WPS processing per policy).
export default function TimesheetApprovals({ timesheets, employees = [], projects = [], onAction, mode = 'oversight' }) {
  const [expanded, setExpanded] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')

  const pending = timesheets.filter((t) => t.status === 'submitted').sort((a, b) => (a.submittedDate || '').localeCompare(b.submittedDate || ''))
  const recent = timesheets.filter((t) => t.status === 'approved' || t.status === 'rejected')
    .sort((a, b) => (b.approvedDate || b.weekStart).localeCompare(a.approvedDate || a.weekStart)).slice(0, 5)

  // Last fully-elapsed week: the one before the current week.
  const lastWeek = toLocalISO(addDays(weekStartOf(new Date()), -7))
  const submittedIds = new Set(timesheets.filter((t) => t.weekStart === lastWeek && (t.status === 'submitted' || t.status === 'approved')).map((t) => t.employeeId))
  const missing = employees.filter((e) => e.status === 'active' && !submittedIds.has(e.id))

  const codeLabel = (code) => {
    if (typeof code === 'number') {
      const p = projects.find((x) => x.id === code)
      return p ? `${p.projectNo} — ${p.name}` : `Project #${code}`
    }
    return GENERAL_CODES.find((g) => g.code === code)?.label || code
  }

  // Who a submitted week is waiting on: the employee's line manager, or HR if none.
  const approverFor = (t) => {
    const emp = employees.find((e) => e.id === t.employeeId)
    const manager = emp?.managerId ? employees.find((e) => e.id === emp.managerId) : null
    return manager ? manager.name : 'HR (no line manager)'
  }

  const approve = (t) => onAction({ ...t, status: 'approved', approvedDate: toLocalISO(new Date()) })
  const confirmReject = (t) => {
    onAction({ ...t, status: 'rejected', rejectReason: reason.trim() || 'Please review and resubmit.' })
    setRejecting(null)
    setReason('')
  }

  return (
    <div className="space-y-4">
      {missing.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-gray-800">
              {missing.length} unsubmitted timesheet{missing.length > 1 ? 's' : ''} for {fmtWeekRange(lastWeek)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">Unsubmitted timesheets block payroll processing — these employees are flagged on the WPS run.</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((e) => (
              <span key={e.id} className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs">{e.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardCheck size={15} className="text-brand" /> Awaiting approval ({pending.length})
          </h2>
          <p className="text-xs text-gray-500">
            {mode === 'manager'
              ? "Your team's submitted weeks, oldest first — as line manager, you approve them."
              : 'Every submitted week company-wide, oldest first. Line managers approve their own team — HR steps in where there is no manager or the manager is away.'}
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Nothing waiting — all submitted weeks are approved.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pending.map((t) => (
              <div key={t.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800">{t.employeeName} — {fmtWeekRange(t.weekStart)}</div>
                    <div className="text-xs text-gray-500">
                      {timesheetTotal(t)}h across {t.entries.length} code{t.entries.length > 1 ? 's' : ''}
                      {t.submittedDate && ` • submitted ${fmt(t.submittedDate)}`}
                      {mode === 'oversight' && <span className="text-amber-600"> • awaiting {approverFor(t)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setExpanded(expanded === t.id ? null : t.id)} className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-0.5">
                      {expanded === t.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Details
                    </button>
                    <button onClick={() => approve(t)} className="text-xs font-medium text-green-700 hover:underline">Approve</button>
                    <button onClick={() => { setRejecting(rejecting === t.id ? null : t.id); setReason('') }} className="text-xs font-medium text-red-600 hover:underline">Reject</button>
                  </div>
                </div>

                {rejecting === t.id && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason (goes back to the employee)…"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <button onClick={() => confirmReject(t)} className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700">Reject week</button>
                  </div>
                )}

                {expanded === t.id && (() => {
                  // Weekend shading follows the submitting employee's own work week
                  const weekendDays = workWeekOf(employees.find((e) => e.id === t.employeeId)).weekend
                  return (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400">
                          <th className="text-left py-1 font-medium min-w-[180px]">Code</th>
                          {DAY_LABELS.map((d, i) => (
                            <th key={d} className={`py-1 font-medium text-center w-12 ${weekendDays.includes(i) ? 'text-gray-300' : ''}`}>{d}</th>
                          ))}
                          <th className="text-right py-1 font-medium w-12">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.entries.map((e, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="py-1 text-gray-700">{codeLabel(e.code)}</td>
                            {e.hours.map((h, di) => (
                              <td key={di} className={`py-1 text-center ${weekendDays.includes(di) ? 'bg-gray-50 text-gray-400' : 'text-gray-700'}`}>{h || '—'}</td>
                            ))}
                            <td className="py-1 text-right font-medium text-gray-800">{e.hours.reduce((a, b) => a + b, 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  )
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Recently actioned</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.map((t) => (
              <div key={t.id} className="px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-600 truncate">{t.employeeName} — {fmtWeekRange(t.weekStart)} ({timesheetTotal(t)}h)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {t.status === 'approved' ? `Approved${t.approvedBy ? ` by ${t.approvedBy}` : ''}` : 'Rejected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
