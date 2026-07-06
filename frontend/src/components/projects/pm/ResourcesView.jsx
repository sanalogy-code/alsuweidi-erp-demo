import { PM_RECORDS } from '../../../data/pmData'

// Portfolio-level resource allocation — the standard person × project pattern
// (per Sana's 5 Jul decision: build it, she corrects against real staffing
// practice on screen). Assignments come from PM team panels plus the DPM/CPM
// links on every project record; load % is illustrative until real allocations
// exist in Phase 2.

// Deterministic mock load so the heatmap is stable across renders.
const mockLoad = (personKey, projectId) => 20 + ((personKey.length * 7 + projectId * 13) % 61)

export default function ResourcesView({ projects, employees, onViewProject }) {
  const active = projects.filter((p) => p.generalStatus === 'In Progress')

  // person → { name, assignments: [{ project, role, load }] }
  const people = new Map()
  const assign = (name, employeeId, project, role) => {
    const key = employeeId ? `e${employeeId}` : name
    if (!people.has(key)) people.set(key, { name, employeeId, assignments: [] })
    const person = people.get(key)
    if (!person.assignments.some((a) => a.project.id === project.id)) {
      person.assignments.push({ project, role, load: mockLoad(key, project.id) })
    }
  }

  active.forEach((p) => {
    const dpm = employees.find((e) => e.id === p.dpmId)
    const cpm = employees.find((e) => e.id === p.cpmId)
    if (dpm) assign(dpm.name, dpm.id, p, 'DPM')
    if (cpm) assign(cpm.name, cpm.id, p, 'CPM')
    const pm = PM_RECORDS[p.id]
    pm?.team.forEach((m) => assign(m.name, m.employeeId, p, m.role))
  })

  const rows = [...people.values()].sort((a, b) => b.assignments.length - a.assignments.length)
  const loadOf = (person) => person.assignments.reduce((s, a) => s + a.load, 0)
  const loadCls = (l) => l > 100 ? 'bg-red-100 text-red-700' : l >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Resource allocation — active projects</h2>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-50">
        {rows.map((person) => {
          const total = loadOf(person)
          return (
            <div key={person.name} className="px-4 py-3">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">
                  {person.name}{!person.employeeId && <span className="text-[10px] text-gray-400 font-normal"> external</span>}
                </span>
                <span className="text-xs text-gray-400">{person.assignments.length} project{person.assignments.length === 1 ? '' : 's'}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${loadCls(total)}`}>{total}%</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {person.assignments.map((a) => (
                  <button key={a.project.id} onClick={() => onViewProject(a.project)}
                    className="flex items-center gap-1.5 text-[11px] border border-gray-200 rounded-md px-2 py-1 text-gray-600 hover:border-brand hover:text-brand transition">
                    <span className="font-mono text-gray-400">{a.project.projectNo}</span>
                    <span className="max-w-[160px] truncate">{a.project.name}</span>
                    <span className="text-gray-400">· {a.role} · {a.load}%</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        {rows.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No assignments on active projects.</div>}
      </div>
      <p className="text-[11px] text-gray-400">
        Assignments come from project team panels + DPM/CPM links; the load percentages are illustrative
        (real allocations and utilization targets need the Phase 2 backend + timesheet integration).
        Green &lt;80%, amber 80–100%, red over-allocated. Sana: correct this against how we actually staff projects.
      </p>
    </div>
  )
}
