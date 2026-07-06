import { useState } from 'react'
import { Fingerprint, MapPin, Plane, UserX } from 'lucide-react'
import { ATTENDANCE_TODAY } from '../../data/hrData'

const STATUS_META = {
  present: { label: 'In Office', color: 'bg-green-100 text-green-700' },
  site: { label: 'On Site', color: 'bg-blue-100 text-blue-700' },
  on_leave: { label: 'On Leave', color: 'bg-yellow-100 text-yellow-700' },
  absent: { label: 'Absent', color: 'bg-red-100 text-red-700' },
}

// Period report (Batch 14) — the information from the current ERP's attendance
// report (per-day in/break/out grid, on-time stats, OT estimate) summarized to
// one readable row per person instead of a 40-column punch grid. Deterministic
// mock figures until the Phase 2 device feed; punch-level drill-down comes with it.
const periodStats = (emp, days) => {
  const h = (n) => (emp.id * 37 + n * 13) % 97 // stable pseudo-random
  const lates = h(1) % 5
  const leaveDays = h(2) % 3
  const worked = Math.max(0, days - leaveDays - (h(3) % 2))
  const avgHours = 8 + ((h(4) % 10) - 4) / 10
  const missedPunches = h(5) % 3 === 0 ? 1 : 0
  const ot = Math.max(0, Math.round((avgHours - 8.5) * worked))
  return {
    worked, leaveDays, lates, missedPunches,
    onTimePct: Math.round(((worked - lates) / Math.max(1, worked)) * 100),
    avgHours: avgHours.toFixed(1), ot,
  }
}

function PeriodReport({ employees }) {
  const [dept, setDept] = useState('')
  const [range, setRange] = useState({ from: '2026-06-01', to: '2026-07-06' })
  const days = 26 // working days in the range, illustrative
  const depts = [...new Set(employees.map((e) => e.dept))].sort()
  const rows = employees.filter((e) => e.status !== 'inactive' && (!dept || e.dept === dept))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label className="text-gray-500">From <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
        <label className="text-gray-500">To <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1 bg-white">
          <option value="">All departments</option>
          {depts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Employee</th>
              <th className="text-right px-4 py-2">Days worked</th>
              <th className="text-right px-4 py-2">Leave</th>
              <th className="text-right px-4 py-2">On time</th>
              <th className="text-right px-4 py-2">Lates</th>
              <th className="text-right px-4 py-2">Missed punch</th>
              <th className="text-right px-4 py-2">Avg hrs/day</th>
              <th className="text-right px-4 py-2">Est. OT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((e) => {
              const s = periodStats(e, days)
              return (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-800">{e.name}</div>
                    <div className="text-xs text-gray-500">{e.dept} · {e.location}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{s.worked}/{days}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{s.leaveDays || '—'}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${s.onTimePct >= 95 ? 'text-green-600' : s.onTimePct >= 85 ? 'text-amber-600' : 'text-red-600'}`}>{s.onTimePct}%</td>
                  <td className={`px-4 py-2.5 text-right ${s.lates > 2 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{s.lates || '—'}</td>
                  <td className={`px-4 py-2.5 text-right ${s.missedPunches ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>{s.missedPunches || '—'}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{s.avgHours}h</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{s.ot ? `${s.ot}h` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500">
          Figures are illustrative until the Phase 2 device feed. Clicking through to per-day punches (in/breaks/out) comes with it — the summary row is the daily view; the punch grid is the exception view, not the default.
        </div>
      </div>
    </div>
  )
}

export default function AttendanceTab({ employees }) {
  const [tab, setTab] = useState('today')
  if (tab === 'report') {
    return (
      <div className="space-y-4">
        <Toggle tab={tab} setTab={setTab} />
        <PeriodReport employees={employees} />
      </div>
    )
  }
  return <TodayView employees={employees} tab={tab} setTab={setTab} />
}

const Toggle = ({ tab, setTab }) => (
  <div className="flex text-xs rounded-md border border-gray-200 overflow-hidden w-fit">
    <button onClick={() => setTab('today')} className={`px-3 py-1.5 font-medium ${tab === 'today' ? 'bg-brand text-white' : 'bg-white text-gray-500'}`}>Today</button>
    <button onClick={() => setTab('report')} className={`px-3 py-1.5 font-medium ${tab === 'report' ? 'bg-brand text-white' : 'bg-white text-gray-500'}`}>Period report</button>
  </div>
)

function TodayView({ employees, tab, setTab }) {
  const rows = ATTENDANCE_TODAY
    .map((a) => ({ ...a, employee: employees.find((e) => e.id === a.employeeId) }))
    .filter((r) => r.employee)

  const count = (status) => rows.filter((r) => r.status === status).length
  const todayLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2"><Fingerprint size={15} className="text-brand" /> Attendance — {todayLabel}</h2>
          <p className="text-xs text-gray-500">Live feed from the fingerprint/card readers arrives with the Phase 2 backend — today's figures are illustrative for layout sign-off.</p>
        </div>
        <Toggle tab={tab} setTab={setTab} />
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
