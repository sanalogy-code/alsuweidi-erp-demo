import { useState } from 'react'
import { ChevronLeft, ChevronRight, AlertTriangle, Plane, Clock } from 'lucide-react'
import { ANNUAL_LEAVE_ENTITLEMENT } from '../../data/hrData'

const MS_DAY = 1000 * 60 * 60 * 24
const overlap = (aStart, aEnd, bStart, bEnd) => aStart <= bEnd && bStart <= aEnd

export default function LeaveDashboard({ employees, requests, holidays }) {
  const [monthDate, setMonthDate] = useState(new Date(2026, 6, 1)) // July 2026 — where the seed data lives

  const y = monthDate.getFullYear()
  const m = monthDate.getMonth()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const monthStart = new Date(y, m, 1)
  const monthEnd = new Date(y, m, daysInMonth)
  const monthLabel = monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const active = requests.filter((r) => r.status !== 'denied')
  const inMonth = active.filter((r) => overlap(new Date(r.startDate), new Date(r.endDate), monthStart, monthEnd))
  const byEmployee = [...new Set(inMonth.map((r) => r.employeeName))].map((name) => ({
    name,
    dept: employees.find((e) => e.name === name)?.dept || '',
    requests: inMonth.filter((r) => r.employeeName === name),
  }))

  const approvedHolidayDates = new Set()
  holidays.filter((h) => h.status === 'approved').forEach((h) => {
    const end = new Date(h.endDate || h.date)
    for (let d = new Date(h.date); d <= end; d = new Date(d.getTime() + MS_DAY)) {
      if (d.getFullYear() === y && d.getMonth() === m) approvedHolidayDates.add(d.getDate())
    }
  })

  // Conflicts: two people from the same department off at the same time (any status)
  const conflicts = []
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j]
      if (a.employeeName === b.employeeName) continue
      const deptA = employees.find((e) => e.id === a.employeeId)?.dept
      const deptB = employees.find((e) => e.id === b.employeeId)?.dept
      if (!deptA || deptA !== deptB) continue
      if (overlap(new Date(a.startDate), new Date(a.endDate), new Date(b.startDate), new Date(b.endDate))) {
        conflicts.push({ dept: deptA, a, b })
      }
    }
  }

  const today = new Date()
  const onLeaveToday = active.filter((r) => r.status === 'approved' && new Date(r.startDate) <= today && today <= new Date(r.endDate)).length
  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const fmtShort = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  const cellFor = (emp, day) => {
    const date = new Date(y, m, day)
    const req = emp.requests.find((r) => new Date(r.startDate) <= date && date <= new Date(r.endDate))
    if (!req) return null
    return req.status === 'approved' ? 'bg-green-500' : 'bg-yellow-400'
  }

  const balances = employees.map((e) => {
    const used = requests
      .filter((r) => r.employeeId === e.id && r.status === 'approved' && r.type === 'Vacation')
      .reduce((s, r) => s + r.days, 0)
    const scheduled = requests
      .filter((r) => r.employeeId === e.id && r.status === 'pending' && r.type === 'Vacation')
      .reduce((s, r) => s + r.days, 0)
    return { employee: e, used, scheduled, remaining: ANNUAL_LEAVE_ENTITLEMENT - used }
  }).sort((a, b) => a.remaining - b.remaining)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Plane size={16} className="text-brand mb-1" />
          <div className="text-xs text-gray-500">On Leave Today</div>
          <div className="text-xl font-bold text-gray-800">{onLeaveToday}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Clock size={16} className="text-yellow-600 mb-1" />
          <div className="text-xs text-gray-500">Pending Requests</div>
          <div className="text-xl font-bold text-gray-800">{pendingCount}</div>
        </div>
        <div className={`bg-white rounded-lg border shadow-sm p-4 ${conflicts.length ? 'border-red-200' : 'border-gray-200'}`}>
          <AlertTriangle size={16} className={conflicts.length ? 'text-red-600 mb-1' : 'text-gray-300 mb-1'} />
          <div className="text-xs text-gray-500">Team Overlaps</div>
          <div className="text-xl font-bold text-gray-800">{conflicts.length}</div>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1.5">
          <div className="text-xs font-semibold text-red-700 uppercase tracking-wide">Same-team overlaps</div>
          {conflicts.map((c, i) => (
            <div key={i} className="text-sm text-red-800">
              <span className="font-medium">{c.dept}:</span> {c.a.employeeName} ({fmtShort(c.a.startDate)}–{fmtShort(c.a.endDate)}{c.a.status === 'pending' ? ', pending' : ''}) overlaps {c.b.employeeName} ({fmtShort(c.b.startDate)}–{fmtShort(c.b.endDate)}{c.b.status === 'pending' ? ', pending' : ''})
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-800">Leave Calendar — {monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button onClick={() => setMonthDate(new Date(y, m - 1, 1))} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16} /></button>
            <button onClick={() => setMonthDate(new Date(y, m + 1, 1))} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          {byEmployee.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-4">No leave scheduled this month</div>
          ) : (
            <table className="text-xs">
              <thead>
                <tr>
                  <th className="text-left pr-4 pb-2 font-semibold text-gray-600 whitespace-nowrap">Employee</th>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                    const dow = new Date(y, m, d).getDay()
                    const weekend = dow === 5 || dow === 6
                    return (
                      <th key={d} className={`pb-2 font-normal w-6 text-center ${approvedHolidayDates.has(d) ? 'text-brand font-semibold' : weekend ? 'text-gray-300' : 'text-gray-500'}`}>
                        {d}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {byEmployee.map((emp) => (
                  <tr key={emp.name}>
                    <td className="pr-4 py-1 whitespace-nowrap">
                      <span className="font-medium text-gray-800">{emp.name}</span>
                      <span className="text-gray-400 ml-1">({emp.dept})</span>
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const dow = new Date(y, m, d).getDay()
                      const weekend = dow === 5 || dow === 6
                      const fill = cellFor(emp, d)
                      return (
                        <td key={d} className="p-0.5">
                          <div className={`w-5 h-5 rounded-sm ${fill || (approvedHolidayDates.has(d) ? 'bg-brand/15' : weekend ? 'bg-gray-100' : 'bg-gray-50')}`} />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Approved</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" /> Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand/15 inline-block" /> Public holiday</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-100 inline-block" /> Weekend</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Annual Leave Balances</h3>
          <p className="text-xs text-gray-500">Entitlement {ANNUAL_LEAVE_ENTITLEMENT} days/year — vacation only; sick and other leave tracked separately.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Employee</th>
              <th className="text-left px-4 py-2">Department</th>
              <th className="text-right px-4 py-2">Used</th>
              <th className="text-right px-4 py-2">Pending</th>
              <th className="text-right px-4 py-2">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {balances.map(({ employee, used, scheduled, remaining }) => (
              <tr key={employee.id}>
                <td className="px-4 py-2 font-medium text-gray-800">{employee.name}</td>
                <td className="px-4 py-2 text-gray-600">{employee.dept}</td>
                <td className="px-4 py-2 text-right text-gray-700">{used}</td>
                <td className="px-4 py-2 text-right text-gray-500">{scheduled || '—'}</td>
                <td className={`px-4 py-2 text-right font-semibold ${remaining < 10 ? 'text-red-600' : 'text-gray-800'}`}>{remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
