import { Fingerprint, MapPin, Plane, UserX } from 'lucide-react'
import { ATTENDANCE_TODAY } from '../../data/hrData'

const STATUS_META = {
  present: { label: 'In Office', color: 'bg-green-100 text-green-700' },
  site: { label: 'On Site', color: 'bg-blue-100 text-blue-700' },
  on_leave: { label: 'On Leave', color: 'bg-yellow-100 text-yellow-700' },
  absent: { label: 'Absent', color: 'bg-red-100 text-red-700' },
}

export default function AttendanceTab({ employees }) {
  const rows = ATTENDANCE_TODAY
    .map((a) => ({ ...a, employee: employees.find((e) => e.id === a.employeeId) }))
    .filter((r) => r.employee)

  const count = (status) => rows.filter((r) => r.status === status).length
  const todayLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2"><Fingerprint size={15} className="text-brand" /> Attendance — {todayLabel}</h2>
        <p className="text-xs text-gray-500">Live feed from the fingerprint/card readers arrives with the Phase 2 backend — today's figures are illustrative for layout sign-off.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Fingerprint size={16} className="text-green-600 mb-1" />
          <div className="text-xs text-gray-500">In Office</div>
          <div className="text-xl font-bold text-gray-800">{count('present')}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <MapPin size={16} className="text-blue-600 mb-1" />
          <div className="text-xs text-gray-500">On Site</div>
          <div className="text-xl font-bold text-gray-800">{count('site')}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Plane size={16} className="text-yellow-600 mb-1" />
          <div className="text-xs text-gray-500">On Leave</div>
          <div className="text-xl font-bold text-gray-800">{count('on_leave')}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <UserX size={16} className="text-red-600 mb-1" />
          <div className="text-xs text-gray-500">Absent</div>
          <div className="text-xl font-bold text-gray-800">{count('absent')}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Employee</th>
              <th className="text-left px-4 py-2">Today</th>
              <th className="text-left px-4 py-2">Check-in</th>
              <th className="text-right px-4 py-2">Hours This Week</th>
              <th className="text-right px-4 py-2">Late (Month)</th>
              <th className="text-right px-4 py-2">Absent (Month)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const meta = STATUS_META[r.status]
              return (
                <tr key={r.employeeId} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-800">{r.employee.name}</div>
                    <div className="text-xs text-gray-500">{r.employee.dept}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>{meta.label}</span>
                    {r.site && <div className="text-xs text-gray-500 mt-0.5">{r.site}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{r.checkIn || <span className="text-red-500 text-xs">No punch recorded</span>}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{r.hoursWeek.toFixed(1)}h</td>
                  <td className={`px-4 py-2.5 text-right ${r.lateMonth > 1 ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>{r.lateMonth || '—'}</td>
                  <td className={`px-4 py-2.5 text-right ${r.absentMonth > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{r.absentMonth || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Weekly project timesheets (design vs. supervision hours) come next as their own module, modeled on the current system.
        </div>
      </div>
    </div>
  )
}
