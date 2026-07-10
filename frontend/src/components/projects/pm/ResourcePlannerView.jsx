import { useState, Fragment } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { CAPACITY_HOURS_PER_WEEK } from '../../../data/pmData'
import { toLocalISO, weekStartOf, addDays } from '../../../data/timesheetData'
import { parseLocalDate } from '../../../utils/date'
import { nextId } from '../../../utils/id'

// Resource PLANNING (Batch 12) — the person × week capacity heatmap from
// PM_RESEARCH.md §5: planned hours per person per project per week vs a 40h
// capacity, forward-looking, editable. "Who has room in two weeks?" is the
// question this answers.

const WEEKS_SHOWN = 6

const fmtWeek = (iso) => {
  const d = parseLocalDate(iso)
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : iso
}

const cellTone = (h) => {
  if (h === 0) return 'bg-gray-50 text-gray-300'
  const pct = h / CAPACITY_HOURS_PER_WEEK
  if (pct > 1) return 'bg-red-100 text-red-700 font-semibold'
  if (pct >= 0.85) return 'bg-amber-100 text-amber-700'
  if (pct >= 0.5) return 'bg-green-100 text-green-700'
  return 'bg-blue-50 text-blue-600'
}

const loggedHoursIn = (timesheets, personName, projectId) => timesheets
  .filter((ts) => ts.employeeName === personName)
  .reduce((sum, ts) => sum + ts.entries.filter((e) => e.code === projectId)
    .reduce((s, e) => s + e.hours.reduce((a, b) => a + (Number(b) || 0), 0), 0), 0)

const MONTHLY_CAPACITY = CAPACITY_HOURS_PER_WEEK * 4.33

export default function ResourcePlannerView({ projects, pmRecords, employees, timesheets = [], allocations, onUpdateAllocations, onOpenWorkspace }) {
  const loggedHours = (name, projectId) => loggedHoursIn(timesheets, name, projectId)
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [mode, setMode] = useState('weeks') // weeks (planning grid) | months (utilization outlook)

  // Weeks: current week + forward.
  const weeks = Array.from({ length: WEEKS_SHOWN }, (_, i) => toLocalISO(addDays(weekStartOf(new Date()), i * 7)))

  const [form, setForm] = useState({ name: '', projectId: '', weekStart: weeks[0], hours: 8 })

  // Everyone who appears in allocations or on a phase team or as DPM/CPM.
  const people = new Map()
  const ensure = (name, employeeId = null) => {
    if (!people.has(name)) people.set(name, { name, employeeId })
    return people.get(name)
  }
  allocations.forEach((a) => ensure(a.name, a.employeeId))
  projects.filter((p) => p.generalStatus === 'In Progress').forEach((p) => {
    const dpm = employees.find((e) => e.id === p.dpmId); if (dpm) ensure(dpm.name, dpm.id)
    const cpm = employees.find((e) => e.id === p.cpmId); if (cpm) ensure(cpm.name, cpm.id)
    pmRecords[p.id]?.phases.forEach((ph) => ph.team.forEach((m) => ensure(m.name, m.employeeId)))
  })

  const allocFor = (name, week) => allocations.filter((a) => a.name === name && a.weekStart === week)
  const totalFor = (name, week) => allocFor(name, week).reduce((s, a) => s + a.hours, 0)

  const setAlloc = (name, employeeId, projectId, weekStart, hours) => {
    const existing = allocations.find((a) => a.name === name && a.projectId === projectId && a.weekStart === weekStart)
    if (existing) {
      onUpdateAllocations(hours > 0
        ? allocations.map((a) => (a.id === existing.id ? { ...a, hours } : a))
        : allocations.filter((a) => a.id !== existing.id))
    } else if (hours > 0) {
      onUpdateAllocations([...allocations, { id: nextId(allocations), name, employeeId, projectId, weekStart, hours }])
    }
  }

  const addFromForm = () => {
    const name = form.name.trim()
    const projectId = Number(form.projectId)
    if (!name || !projectId) return
    const emp = employees.find((e) => e.name === name)
    setAlloc(name, emp?.id ?? null, projectId, form.weekStart, Number(form.hours) || 0)
    setShowAdd(false)
  }

  const rows = [...people.values()].sort((a, b) => totalFor(b.name, weeks[0]) - totalFor(a.name, weeks[0]))
  const activeProjects = projects.filter((p) => p.generalStatus === 'In Progress')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Resource planner</h2>
          <p className="text-xs text-gray-500">{mode === 'weeks' ? `Planned hours vs ${CAPACITY_HOURS_PER_WEEK}h/week capacity over the next ${WEEKS_SHOWN} weeks. Click a row to edit per-project allocations.` : 'Monthly utilization outlook — same allocations rolled up per month.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex text-xs rounded-md border border-gray-200 overflow-hidden">
            <button onClick={() => setMode('weeks')} className={`px-2.5 py-1.5 font-medium ${mode === 'weeks' ? 'bg-brand text-white' : 'bg-white text-gray-500'}`}>Weeks</button>
            <button onClick={() => setMode('months')} className={`px-2.5 py-1.5 font-medium ${mode === 'months' ? 'bg-brand text-white' : 'bg-white text-gray-500'}`}>Months</button>
          </div>
          {mode === 'weeks' && <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Allocate</button>}
        </div>
      </div>

      {mode === 'months' && (() => {
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + i)
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        })
        const monthHours = (name, m) => allocations.filter((a) => a.name === name && a.weekStart.slice(0, 7) === m).reduce((s, a) => s + a.hours, 0)
        return (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-4 py-2">Person</th>
                  {months.map((m) => <th key={m} className="text-center px-2 py-2">{m}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((person) => (
                  <tr key={person.name}>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{person.name}</td>
                    {months.map((m) => {
                      const u = monthHours(person.name, m) / MONTHLY_CAPACITY
                      return (
                        <td key={m} className="px-2 py-2.5 text-center">
                          <span className={`inline-block min-w-[48px] px-1.5 py-1 rounded text-xs ${u === 0 ? 'bg-gray-50 text-gray-300' : u > 1 ? 'bg-red-100 text-red-700 font-semibold' : u >= 0.85 ? 'bg-amber-100 text-amber-700' : u >= 0.5 ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                            {u === 0 ? '—' : `${Math.round(u * 100)}%`}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-gray-400 px-4 py-2">Rolled up from the weekly plan (allocated hours ÷ ~{Math.round(MONTHLY_CAPACITY)}h/month). Empty months = unplanned capacity, not absence.</p>
          </div>
        )
      })()}

      {mode === 'weeks' && (<>
      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap gap-2 text-xs">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} list="planner-people" placeholder="Person" className="w-44 border rounded-md px-2 py-1.5" />
          <datalist id="planner-people">
            {[...new Set([...employees.map((e) => e.name), ...rows.map((r) => r.name)])].map((n) => <option key={n} value={n} />)}
          </datalist>
          <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="border rounded-md px-2 py-1.5 max-w-[220px]">
            <option value="">Project…</option>
            {activeProjects.map((p) => <option key={p.id} value={p.id}>{p.projectNo} — {p.name}</option>)}
          </select>
          <select value={form.weekStart} onChange={(e) => setForm({ ...form, weekStart: e.target.value })} className="border rounded-md px-2 py-1.5">
            {weeks.map((w) => <option key={w} value={w}>wk {fmtWeek(w)}</option>)}
          </select>
          <input type="number" min="0" max="60" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className="w-16 border rounded-md px-2 py-1.5 text-right" />
          <span className="self-center text-gray-400">h</span>
          <button onClick={addFromForm} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Allocate</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Person</th>
              {weeks.map((w, i) => (
                <th key={w} className="text-center px-2 py-2 whitespace-nowrap">{i === 0 ? 'This wk' : fmtWeek(w)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((person) => {
              const open = expanded === person.name
              const personProjects = [...new Set(allocations.filter((a) => a.name === person.name).map((a) => a.projectId))]
                .map((pid) => projects.find((p) => p.id === pid)).filter(Boolean)
              return (
                <Fragment key={person.name}>
                  <tr className="hover:bg-blue-50 cursor-pointer transition" onClick={() => setExpanded(open ? null : person.name)}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                        <span className="font-medium text-gray-800">{person.name}</span>
                        {!person.employeeId && <span className="text-[10px] text-gray-400">external</span>}
                      </div>
                    </td>
                    {weeks.map((w) => {
                      const h = totalFor(person.name, w)
                      return (
                        <td key={w} className="px-2 py-2.5 text-center">
                          <span className={`inline-block min-w-[44px] px-1.5 py-1 rounded text-xs ${cellTone(h)}`}>
                            {h > 0 ? `${h}h` : '—'}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                  {open && (
                    <tr className="bg-gray-50/60">
                      <td colSpan={weeks.length + 1} className="px-4 py-3">
                        <div className="space-y-2">
                          {personProjects.length === 0 && <div className="text-xs text-gray-400">No allocations yet — use "Allocate" above.</div>}
                          {personProjects.map((p) => (
                            <div key={p.id} className="flex items-center gap-2 flex-wrap">
                              <button onClick={() => onOpenWorkspace(p)} className="w-56 shrink-0 text-left text-xs text-brand hover:underline truncate">
                                {p.projectNo} — {p.name}
                              </button>
                              {weeks.map((w) => {
                                const a = allocations.find((x) => x.name === person.name && x.projectId === p.id && x.weekStart === w)
                                return (
                                  <input key={w} type="number" min="0" max="60" value={a?.hours ?? ''}
                                    placeholder="0"
                                    onChange={(e) => setAlloc(person.name, person.employeeId, p.id, w, Number(e.target.value) || 0)}
                                    className="w-14 border border-gray-200 rounded-md px-1.5 py-1 text-xs text-center bg-white" />
                                )
                              })}
                              <span className="text-[10px] text-gray-400">{loggedHours(person.name, p.id) > 0 ? `${loggedHours(person.name, p.id)}h logged so far` : ''}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-100 inline-block" /> Light (&lt;50%)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 inline-block" /> Healthy (50–85%)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 inline-block" /> Near capacity</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Over-allocated (&gt;{CAPACITY_HOURS_PER_WEEK}h)</span>
        <span>Capacity is a flat {CAPACITY_HOURS_PER_WEEK}h/week for the demo — per-person work weeks, leave, and holidays refine it in Phase 2.</span>
      </div>
      </>)}
    </div>
  )
}
