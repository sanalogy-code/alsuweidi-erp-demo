import { Diamond, AlertTriangle, Clock3, FolderKanban, ListTodo } from 'lucide-react'
import {
  projectProgress, projectHealth, lateTasksOf, nextMilestoneOf, worstSpiOf,
  hoursUsedOn, manhourBudgetOf, daysUntil, PM_METHODS,
} from '../../../data/pmData'
import { scopeOf } from '../../../data/projectsData'

// Management dashboard (Batch 11): one row per active project — health (RAG),
// % complete, late tasks, next milestone, SPI, hours used vs manhour budget.
// The answer to "how are my projects doing?" in one screen.

export default function PmDashboard({ projects, pmRecords, timesheets = [], onOpenWorkspace }) {
  const rows = projects
    .filter((p) => p.generalStatus === 'In Progress' && pmRecords[p.id])
    .map((p) => {
      const pm = pmRecords[p.id]
      return {
        p, pm,
        health: projectHealth(pm),
        progress: projectProgress(pm),
        late: lateTasksOf(pm).length,
        milestone: nextMilestoneOf(pm),
        spi: worstSpiOf(pm),
        hours: hoursUsedOn(timesheets, p.id),
        hoursBudget: manhourBudgetOf(pm),
      }
    })
    .sort((a, b) => ({ red: 0, amber: 1, green: 2 })[a.health.key] - ({ red: 0, amber: 1, green: 2 })[b.health.key])

  const totals = {
    projects: rows.length,
    atRisk: rows.filter((r) => r.health.key === 'red').length,
    late: rows.reduce((s, r) => s + r.late, 0),
    msThisMonth: rows.filter((r) => r.milestone && daysUntil(r.milestone.forecast || r.milestone.baseline) <= 31).length,
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={FolderKanban} label="Active projects" value={totals.projects} />
        <Stat icon={AlertTriangle} label="At risk" value={totals.atRisk} tone={totals.atRisk ? 'red' : 'gray'} />
        <Stat icon={ListTodo} label="Late tasks (portfolio)" value={totals.late} tone={totals.late ? 'amber' : 'gray'} />
        <Stat icon={Diamond} label="Milestones next 30 days" value={totals.msThisMonth} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Project</th>
              <th className="text-left px-4 py-2">Health</th>
              <th className="text-left px-4 py-2">Progress</th>
              <th className="text-left px-4 py-2">Late</th>
              <th className="text-left px-4 py-2">Next milestone</th>
              <th className="text-left px-4 py-2">SPI</th>
              <th className="text-left px-4 py-2">Hours</th>
              <th className="text-left px-4 py-2">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(({ p, pm, health, progress, late, milestone, spi, hours, hoursBudget }) => (
              <tr key={p.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => onOpenWorkspace(p)}>
                <td className="px-4 py-3">
                  <div className="font-medium text-brand">{p.name}</div>
                  <div className="text-[11px] text-gray-400">{p.projectNo} · {scopeOf(p)}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full ${health.chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} /> {health.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {progress == null ? <span className="text-xs text-gray-300">—</span> : (
                    <div className="flex items-center gap-2 w-28">
                      <span className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><span className="block h-full bg-brand rounded-full" style={{ width: `${progress}%` }} /></span>
                      <span className="text-xs text-gray-600 font-medium">{progress}%</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {late ? <span className="text-xs font-semibold text-red-600">{late}</span> : <span className="text-xs text-gray-300">0</span>}
                </td>
                <td className="px-4 py-3">
                  {milestone ? (
                    <div className="text-xs">
                      <div className={`flex items-center gap-1 ${milestone.atRisk ? 'text-red-600' : 'text-gray-700'}`}>
                        <Diamond size={9} className={milestone.atRisk ? 'text-red-500' : 'text-gray-400'} /> {milestone.label}
                      </div>
                      <div className="text-gray-400">{milestone.forecast || milestone.baseline}{milestone.atRisk && ` (baseline ${milestone.baseline})`}</div>
                    </div>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {spi == null ? <span className="text-xs text-gray-300">—</span> : (
                    <span className={`text-xs font-semibold ${spi >= 1 ? 'text-green-600' : spi >= 0.9 ? 'text-amber-600' : 'text-red-600'}`}>{spi.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock3 size={11} className="text-gray-400" />
                    {hours}h{hoursBudget ? <span className="text-gray-400"> / {hoursBudget.toLocaleString()}h</span> : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{PM_METHODS.find((m) => m.key === pm.method)?.label || '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400">
        Health: red = overdue claim deadline, 3+ late tasks, or SPI &lt; 0.85 · amber = any late task, overdue report, slipping milestone, or SPI &lt; 0.95 · green otherwise. Hours are timesheet actuals coded to the project (one seeded week in the demo). Click a row to open the workspace.
      </p>
    </div>
  )
}

const Stat = ({ icon: Icon, label, value, tone = 'gray' }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <Icon size={15} className={{ gray: 'text-gray-400', red: 'text-red-500', amber: 'text-amber-500' }[tone] + ' mb-1'} />
    <div className="text-xs text-gray-500">{label}</div>
    <div className={`text-xl font-bold ${{ gray: 'text-gray-800', red: 'text-red-600', amber: 'text-amber-600' }[tone]}`}>{value}</div>
  </div>
)
