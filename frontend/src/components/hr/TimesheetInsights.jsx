import { useState } from 'react'
import { PieChart, Users2, Gauge } from 'lucide-react'
import { OVERHEAD_CODES, timesheetTotal } from '../../data/timesheetData'
import { workWeekOf } from '../../data/hrData'

// Timesheet insights (Batch 15) — the information from the current ERP's
// timesheet cost dashboard and Employee Efforts Review, redesigned: readable
// bar breakdowns instead of pie charts, and a workload table with one derived
// index instead of nine cumulative-hour columns. Cost uses an illustrative
// blended rate until the Phase 2 payroll link provides per-person rates.

const BLENDED_RATE = 210 // AED/h — same illustrative rate as the DMR

function Bars({ rows, unit, fmt }) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  const total = rows.reduce((s, r) => s + r.value, 0)
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 text-xs">
          <div className="w-52 shrink-0 text-gray-600 truncate" title={r.label}>{r.label}</div>
          <div className="flex-1 h-4 bg-gray-50 rounded">
            <div className="h-4 bg-brand/70 rounded" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <div className="w-20 text-right font-medium text-gray-700">{fmt(r.value)}</div>
          <div className="w-10 text-right text-gray-400">{total ? Math.round((r.value / total) * 100) : 0}%</div>
        </div>
      ))}
      {rows.length === 0 && <div className="text-xs text-gray-400 py-3 text-center">No {unit} in this period.</div>}
    </div>
  )
}

export default function TimesheetInsights({ timesheets, employees, projects }) {
  const [tab, setTab] = useState('projects')
  const [resultType, setResultType] = useState('hours') // hours | cost
  const fmt = (v) => (resultType === 'cost' ? `AED ${(v * BLENDED_RATE / 1000).toFixed(0)}k` : `${v}h`)

  // hours per code (projectId number, or overhead string) and per person
  const byCode = new Map()
  const byPerson = new Map()
  timesheets.forEach((ts) => {
    const person = ts.employeeName
    ts.entries.forEach((e) => {
      const h = e.hours.reduce((a, b) => a + (Number(b) || 0), 0)
      byCode.set(e.code, (byCode.get(e.code) || 0) + h)
      byPerson.set(person, (byPerson.get(person) || 0) + h)
    })
  })

  const projectRows = [...byCode.entries()]
    .filter(([code]) => typeof code === 'number')
    .map(([code, value]) => {
      const p = projects.find((x) => x.id === code)
      return { label: p ? `${p.projectNo} — ${p.name}` : `Project ${code}`, value }
    }).sort((a, b) => b.value - a.value)

  const overheadRows = [...byCode.entries()]
    .filter(([code]) => typeof code === 'string')
    .map(([code, value]) => ({ label: OVERHEAD_CODES.find((o) => o.code === code)?.label || code, value }))
    .sort((a, b) => b.value - a.value)

  const personRows = [...byPerson.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)

  const projectHours = projectRows.reduce((s, r) => s + r.value, 0)
  const overheadHours = overheadRows.reduce((s, r) => s + r.value, 0)
  const totalHours = projectHours + overheadHours

  // Workload review: registered vs standard per employee with a timesheet,
  // collapsed to one Workload Index = (registered − standard) / standard.
  const workloadRows = employees
    .filter((e) => e.status !== 'inactive')
    .map((e) => {
      const sheets = timesheets.filter((t) => t.employeeId === e.id)
      if (!sheets.length) return null
      const ww = workWeekOf(e)
      const standard = sheets.length * (7 - ww.weekend.length) * 8
      const registered = sheets.reduce((s, t) => s + timesheetTotal(t), 0)
      const wli = standard ? (registered - standard) / standard : 0
      const status = wli > 0.1 ? { label: 'Above average', chip: 'bg-amber-100 text-amber-700' }
        : wli < -0.1 ? { label: 'Below average', chip: 'bg-red-100 text-red-700' }
        : { label: 'Average', chip: 'bg-green-100 text-green-700' }
      return { e, weeks: sheets.length, standard, registered, wli, status }
    })
    .filter(Boolean)
    .sort((a, b) => b.wli - a.wli)

  const TABS = [
    { key: 'projects', label: 'By project', icon: PieChart },
    { key: 'people', label: 'By person', icon: Users2 },
    { key: 'workload', label: 'Workload review', icon: Gauge },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Timesheet insights</h2>
          <p className="text-xs text-gray-500">
            {totalHours}h logged across {timesheets.length} submitted week{timesheets.length === 1 ? '' : 's'} · {Math.round((projectHours / Math.max(1, totalHours)) * 100)}% on projects, {Math.round((overheadHours / Math.max(1, totalHours)) * 100)}% overhead
            {resultType === 'cost' && <> · cost at blended AED {BLENDED_RATE}/h</>}
          </p>
        </div>
        <div className="flex text-xs rounded-md border border-gray-200 overflow-hidden">
          <button onClick={() => setResultType('hours')} className={`px-2.5 py-1.5 font-medium ${resultType === 'hours' ? 'bg-brand text-white' : 'bg-white text-gray-500'}`}>Hours</button>
          <button onClick={() => setResultType('cost')} className={`px-2.5 py-1.5 font-medium ${resultType === 'cost' ? 'bg-brand text-white' : 'bg-white text-gray-500'}`}>Cost (AED)</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === t.key ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'projects' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-600 mb-3">Project work</h3>
            <Bars rows={projectRows} unit="project hours" fmt={fmt} />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-600 mb-3">Overhead (non-project)</h3>
            <Bars rows={overheadRows} unit="overhead hours" fmt={fmt} />
          </div>
        </div>
      )}

      {tab === 'people' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Bars rows={personRows} unit="hours" fmt={fmt} />
        </div>
      )}

      {tab === 'workload' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2">Employee</th>
                <th className="text-right px-4 py-2">Weeks</th>
                <th className="text-right px-4 py-2">Standard hrs</th>
                <th className="text-right px-4 py-2">Registered hrs</th>
                <th className="text-right px-4 py-2">Over / under</th>
                <th className="text-right px-4 py-2">Workload index</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workloadRows.map(({ e, weeks, standard, registered, wli, status }) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-800">{e.name}</div>
                    <div className="text-xs text-gray-500">{e.dept}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{weeks}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{standard}h</td>
                  <td className="px-4 py-2.5 text-right text-gray-700 font-medium">{registered}h</td>
                  <td className={`px-4 py-2.5 text-right ${registered > standard ? 'text-amber-600' : registered < standard ? 'text-red-600' : 'text-gray-400'}`}>
                    {registered - standard > 0 ? '+' : ''}{registered - standard}h
                  </td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${wli > 0.1 ? 'text-amber-600' : wli < -0.1 ? 'text-red-600' : 'text-green-600'}`}>
                    {(wli * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-2.5"><span className={`text-[11px] px-2 py-0.5 rounded-full ${status.chip}`}>{status.label}</span></td>
                </tr>
              ))}
              {workloadRows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">No timesheets in this period.</td></tr>}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500">
            Standard = working days × 8h per the employee's own work-week pattern. Workload index = (registered − standard) ÷ standard — one number instead of the current system's nine cumulative-hour columns; carried-forward balances need the Phase 2 backend. Only the seeded demo week is populated.
          </div>
        </div>
      )}
    </div>
  )
}
