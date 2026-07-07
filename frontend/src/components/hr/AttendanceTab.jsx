import { useState, Fragment } from 'react'
import { Fingerprint, MapPin, Plane, UserX, ChevronRight, ChevronDown } from 'lucide-react'
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

const fmtMin = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

// Punch-level drill-down (Batch 16). Deterministic per-day in/break/resume/out
// rows reconstructed so their counts reconcile with the summary row (same number
// of worked days, lates and missed punches). The summary is the default daily
// lens; the punch grid is the exception view you open per person. Real punches
// arrive with the Phase 2 device feed.
const dayPunches = (emp, from, to, summary) => {
  const rows = []
  const start = new Date(from), end = new Date(to)
  for (let d = new Date(start); d <= end && rows.length < 40; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay() // 0 Sun .. 6 Sat
    if (dow === 5 || dow === 6) continue // UAE weekend (Fri/Sat) — illustrative
    rows.push({ date: new Date(d) })
  }
  // Assign leave to the last N working days, lates + one missed punch to the first worked days.
  const worked = rows.slice(0, Math.max(0, rows.length - summary.leaveDays))
  const leave = rows.slice(worked.length)
  return [
    ...worked.map((r, i) => {
      const h = (n) => (emp.id * 37 + i * 13 + n * 7) % 97
      const late = i < summary.lates
      const missed = summary.missedPunches && i === Math.floor(worked.length / 2)
      const inMin = 8 * 60 + (late ? 12 + (h(1) % 40) : -8 + (h(1) % 8)) // ~07:52–08:52
      const breakMin = 12 * 60 + 30 + (h(2) % 20)
      const resumeMin = breakMin + 25 + (h(3) % 15)
      const outMin = missed ? null : 17 * 60 + 30 + (h(4) % 45)
      const total = outMin == null ? null : (outMin - inMin - (resumeMin - breakMin)) / 60
      return {
        date: r.date, kind: 'worked', late, missed,
        in: fmtMin(inMin), break: fmtMin(breakMin), resume: fmtMin(resumeMin),
        out: outMin == null ? null : fmtMin(outMin), total,
      }
    }),
    ...leave.map((r) => ({ date: r.date, kind: 'leave' })),
  ]
}

function PunchDetail({ emp, from, to, summary }) {
  const rows = dayPunches(emp, from, to, summary)
  const fmtDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
  return (
    <div className="bg-gray-50/70 px-4 py-3">
      <div className="text-[11px] font-medium text-gray-500 uppercase mb-1.5">Daily punches — {emp.name}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[560px] bg-white rounded-md border border-gray-200">
          <thead className="text-[10px] text-gray-400 uppercase border-b border-gray-100">
            <tr>
              <th className="text-left px-3 py-1.5">Date</th>
              <th className="text-center px-3 py-1.5">In</th>
              <th className="text-center px-3 py-1.5">Break</th>
              <th className="text-center px-3 py-1.5">Resume</th>
              <th className="text-center px-3 py-1.5">Out</th>
              <th className="text-right px-3 py-1.5">Total</th>
              <th className="text-right px-3 py-1.5">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r, i) => r.kind === 'leave' ? (
              <tr key={i} className="text-gray-400">
                <td className="px-3 py-1.5">{fmtDate(r.date)}</td>
                <td className="px-3 py-1.5 text-center italic" colSpan={5}>On leave</td>
                <td className="px-3 py-1.5 text-right"><span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 text-[10px]">Leave</span></td>
              </tr>
            ) : (
              <tr key={i} className="text-gray-700">
                <td className="px-3 py-1.5">{fmtDate(r.date)}</td>
                <td className={`px-3 py-1.5 text-center ${r.late ? 'text-red-600 font-medium' : ''}`}>{r.in}</td>
                <td className="px-3 py-1.5 text-center text-gray-400">{r.break}</td>
                <td className="px-3 py-1.5 text-center text-gray-400">{r.resume}</td>
                <td className={`px-3 py-1.5 text-center ${r.missed ? 'text-amber-600' : ''}`}>{r.out || '—'}</td>
                <td className="px-3 py-1.5 text-right">{r.total == null ? '—' : `${r.total.toFixed(1)}h`}</td>
                <td className="px-3 py-1.5 text-right space-x-1">
                  {r.late && <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px]">Late</span>}
                  {r.missed && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px]">Missed out</span>}
                  {!r.late && !r.missed && <span className="text-gray-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PeriodReport({ employees }) {
  const [dept, setDept] = useState('')
  const [open, setOpen] = useState(null) // employee id whose punch grid is expanded
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
              <th className="text-left px-4 py-2 w-8"></th>
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
              const isOpen = open === e.id
              return (
                <Fragment key={e.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setOpen(isOpen ? null : e.id)}>
                    <td className="px-4 py-2.5 text-gray-400">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
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
                  {isOpen && (
                    <tr>
                      <td colSpan={9} className="p-0 border-t border-gray-100">
                        <PunchDetail emp={e} from={range.from} to={range.to} summary={s} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500">
          Click any row to drill into that person's daily punches (in / break / resume / out). The summary is the default lens; the punch grid is the exception view. Figures are illustrative until the Phase 2 device feed replaces them with real reader data.
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
