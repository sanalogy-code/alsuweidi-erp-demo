import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlarmClock, Lock, X } from 'lucide-react'
import { weekStartOf, addDays, toLocalISO, fmtWeekRange, lastWorkingDayIndex } from '../data/timesheetData'
import { EMPLOYEES, workWeekOf } from '../data/hrData'

// Timesheet reminder + ERP lockout (decision 3 Jul), rendered at the App level
// so it appears on any page:
//  - Reminder banner: on the employee's LAST WORKING DAY of the week (per their
//    own work-week pattern) if this week's timesheet isn't submitted yet.
//  - Lockout: if LAST week's timesheet is still unsubmitted, ERP access is
//    blocked by a full-screen modal whose only real exit is "Fill timesheet now".
//    A small "demo: dismiss" escape hatch keeps demos from being bricked —
//    real enforcement (and email nudges) arrive with the Phase 2 backend.
// Only applies to logins that map to an employee record that actually uses
// timesheets (has at least one week on file) — so HR/management demo logins
// without timesheet history aren't locked out.
export default function TimesheetGate({ user, timesheets }) {
  const navigate = useNavigate()
  const [dismissedLockout, setDismissedLockout] = useState(false)
  const [dismissedReminder, setDismissedReminder] = useState(false)
  const [wentToFill, setWentToFill] = useState(false)

  const employee = EMPLOYEES.find((e) => e.name.toLowerCase() === (user?.username || '').toLowerCase())
  if (!employee) return null

  const mine = timesheets.filter((t) => t.employeeId === employee.id)
  if (mine.length === 0) return null // not a timesheet user (demo logins, new hires)

  const thisWeek = toLocalISO(weekStartOf(new Date()))
  const lastWeek = toLocalISO(addDays(weekStartOf(new Date()), -7))
  const isSubmitted = (weekISO) => mine.some((t) => t.weekStart === weekISO && (t.status === 'submitted' || t.status === 'approved'))

  const goFill = () => {
    setWentToFill(true)
    navigate('/hr', { state: { view: 'mytimesheet' } })
  }

  // Lockout: last week still unsubmitted → block everything until it's filled.
  if (!isSubmitted(lastWeek) && !dismissedLockout && !wentToFill) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900/70 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
            <Lock size={22} className="text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Timesheet overdue — ERP access blocked</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your timesheet for <span className="font-semibold">{fmtWeekRange(lastWeek)}</span> was never
            submitted. Per policy, ERP access is blocked until it's filled — unsubmitted weeks also hold
            your payroll on the WPS run.
          </p>
          <button
            onClick={goFill}
            className="w-full bg-brand text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-brand-dark transition"
          >
            Fill timesheet now →
          </button>
          <button onClick={() => setDismissedLockout(true)} className="mt-3 text-[11px] text-gray-400 hover:text-gray-600 underline">
            demo: dismiss
          </button>
        </div>
      </div>
    )
  }

  // Reminder: last working day of the current week and this week's sheet isn't in yet.
  const todayIsLastWorkingDay = new Date().getDay() === lastWorkingDayIndex(workWeekOf(employee))
  if (todayIsLastWorkingDay && !isSubmitted(thisWeek) && !dismissedReminder) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between gap-3 text-sm">
        <span className="text-amber-800 flex items-center gap-2 min-w-0">
          <AlarmClock size={15} className="shrink-0" />
          <span className="truncate">
            <span className="font-semibold">Today is your last working day of the week</span> — your timesheet
            for {fmtWeekRange(thisWeek)} isn't submitted yet. Unsubmitted weeks block ERP access next week.
          </span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <button onClick={goFill} className="text-xs font-medium text-brand hover:underline">Fill timesheet</button>
          <button onClick={() => setDismissedReminder(true)} className="text-amber-500 hover:text-amber-700"><X size={14} /></button>
        </span>
      </div>
    )
  }

  return null
}
