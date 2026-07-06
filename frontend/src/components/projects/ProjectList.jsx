import { useState } from 'react'
import { Search, Info } from 'lucide-react'
import { PROJECT_TYPES, PROJECT_SCOPES, GENERAL_STATUS, PROJECT_LOCATIONS, scopeOf } from '../../data/projectsData'

const STATUS_CHIP = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700',
}

// The anti-CSV: seven columns, everything else in the drill-in.
export default function ProjectList({ projects, employees, user, onViewProject, onOpenWorkspace }) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [scope, setScope] = useState('')
  const [status, setStatus] = useState('')
  const [location, setLocation] = useState('')
  const [mineOnly, setMineOnly] = useState(false)

  const empName = (id) => employees.find((e) => e.id === id)?.name || null
  const myName = (user?.username || '').toLowerCase()

  const rows = projects
    .filter((p) =>
      (!search || `${p.projectNo} ${p.name} ${p.employer}`.toLowerCase().includes(search.toLowerCase())) &&
      (!type || p.type === type) &&
      (!scope || scopeOf(p) === scope) &&
      (!status || p.generalStatus === status) &&
      (!location || p.location === location) &&
      (!mineOnly || [empName(p.dpmId), empName(p.cpmId)].filter(Boolean).some((n) => n.toLowerCase() === myName))
    )
    .sort((a, b) => a.projectNo.localeCompare(b.projectNo))

  const selectCls = 'border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand text-gray-700 bg-white'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Portfolio ({rows.length})</h2>
            <p className="text-xs text-gray-500">Click a project to open its workspace — tasks, deliverables, inspections, schedule, claims. <span className="font-medium text-gray-600">Details</span> opens the record card.</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search no, name, client..."
              className="pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand w-64"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
            <option value="">All types</option>
            {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={scope} onChange={(e) => setScope(e.target.value)} className={selectCls}>
            <option value="">All scopes</option>
            {PROJECT_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="">All statuses</option>
            {GENERAL_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className={selectCls}>
            <option value="">All locations</option>
            {PROJECT_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 ml-1">
            <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} className="rounded border-gray-300 text-brand focus:ring-brand" />
            My projects
          </label>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-400">No projects match these filters</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2">No</th>
                <th className="text-left px-4 py-2">Project</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Scope</th>
                <th className="text-left px-4 py-2">Stage</th>
                <th className="text-left px-4 py-2">DPM / CPM</th>
                <th className="text-left px-4 py-2">Status</th>
                {onOpenWorkspace && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => (onOpenWorkspace ? onOpenWorkspace(p) : onViewProject(p))}>
                  <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{p.projectNo}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-brand hover:underline">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.employer}</div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs">{p.type}</td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs">{scopeOf(p)}</td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs whitespace-nowrap">{p.currentStage}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">
                    {[empName(p.dpmId), empName(p.cpmId)].filter(Boolean).join(' / ') || '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${STATUS_CHIP[p.generalStatus]}`}>{p.generalStatus}</span>
                  </td>
                  {onOpenWorkspace && (
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewProject(p) }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-500 border border-gray-200 hover:border-brand hover:text-brand transition whitespace-nowrap"
                      >
                        <Info size={12} /> Details
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
