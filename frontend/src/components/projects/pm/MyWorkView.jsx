import { useState } from 'react'
import { ListTodo, ClipboardCheck, AlarmClock } from 'lucide-react'
import { myWorkFor, daysUntil, taskPriorityMeta, PHASE_META } from '../../../data/pmData'

// "My Work" — the daily-driver landing view (Batch 10): everything assigned to or
// waiting on the logged-in person across ALL projects. Tasks / Approvals /
// Deadlines. This is the first thing a PM or engineer sees when opening Projects.

export default function MyWorkView({ user, projects, pmRecords, onOpenWorkspace }) {
  const { tasks, approvals, deadlines } = myWorkFor(user?.username, projects, pmRecords)
  const TABS = [
    { key: 'tasks', label: 'My tasks', icon: ListTodo, count: tasks.length },
    { key: 'approvals', label: 'Waiting on me', icon: ClipboardCheck, count: approvals.length },
    { key: 'deadlines', label: 'Deadlines', icon: AlarmClock, count: deadlines.length },
  ]
  const [tab, setTab] = useState('tasks')
  const nothing = tasks.length + approvals.length + deadlines.length === 0

  if (nothing) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
        <div className="text-sm text-gray-500 font-medium">Nothing waiting on you.</div>
        <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto">
          Tasks, inspections, and deadlines from your project teams land here. You're not on a
          project team yet — try logging in as <span className="font-medium">Samir Al Mazrouei</span> (CPM),{' '}
          <span className="font-medium">Fatima Al Mansouri</span> (DPM), or <span className="font-medium">Mohammad Kubba</span> to see it working.
        </p>
      </div>
    )
  }

  const phaseChip = (ph) => {
    const meta = PHASE_META[ph.key] || { label: ph.label, chip: 'bg-gray-100 text-gray-600' }
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === t.key ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon size={14} /> {t.label}
              {t.count > 0 && <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">{t.count}</span>}
            </button>
          )
        })}
      </div>

      {tab === 'tasks' && (tasks.length === 0
        ? <Empty label="No open tasks assigned to you." />
        : tasks.map(({ project, phase, task }, i) => {
          const d = task.due ? daysUntil(task.due) : null
          const pMeta = taskPriorityMeta(task.priority)
          return (
            <button key={i} onClick={() => onOpenWorkspace(project, phase.key === 'meeting' ? { view: 'meetings' } : { phase: phase.key, view: 'tasks' })} className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 text-left hover:border-brand/40 transition">
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${pMeta.chip}`}>{pMeta.label}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-gray-800 truncate">{task.title}</span>
                <span className="text-xs text-gray-400">{project.projectNo} — {project.name}</span>
              </span>
              {phaseChip(phase)}
              {task.due && (
                <span className={`text-xs w-24 text-right shrink-0 ${d < 0 ? 'text-red-600 font-semibold' : d <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {d < 0 ? `${-d}d overdue` : d === 0 ? 'due today' : `due ${task.due}`}
                </span>
              )}
            </button>
          )
        }))}

      {tab === 'approvals' && (approvals.length === 0
        ? <Empty label="Nothing awaiting your review." />
        : approvals.map((a, i) => (
          <button key={i} onClick={() => onOpenWorkspace(a.project, { phase: a.phase.key, view: a.kind === 'QA' ? 'deliverables' : 'site' })} className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 text-left hover:border-brand/40 transition">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 shrink-0">{a.kind}</span>
            <span className="font-mono text-xs text-gray-500 w-28 shrink-0 truncate">{a.ref}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm text-gray-800 truncate">{a.title}</span>
              <span className="text-xs text-gray-400">{a.project.projectNo} — {a.project.name}</span>
            </span>
            {a.since && <span className="text-xs text-gray-400 shrink-0">since {a.since}</span>}
          </button>
        )))}

      {tab === 'deadlines' && (deadlines.length === 0
        ? <Empty label="No contract deadlines in the next 3 weeks." />
        : deadlines.map((dl, i) => {
          const d = daysUntil(dl.due)
          return (
            <button key={i} onClick={() => onOpenWorkspace(dl.project, { view: dl.kind === 'Claim' ? 'claims' : 'reports' })} className={`w-full rounded-lg border px-4 py-3 flex items-center gap-3 text-left transition ${d < 0 ? 'bg-red-50 border-red-200' : d <= 7 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200 hover:border-brand/40'}`}>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${dl.kind === 'Claim' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{dl.kind}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-gray-800 truncate">{dl.title} ({dl.ref})</span>
                <span className="text-xs text-gray-400">{dl.project.projectNo} — {dl.project.name}</span>
              </span>
              <span className={`text-xs shrink-0 ${d < 0 ? 'text-red-600 font-semibold' : d <= 7 ? 'text-amber-700 font-semibold' : 'text-gray-500'}`}>
                {d < 0 ? `${-d}d OVERDUE` : `due ${dl.due} (${d}d)`}
              </span>
            </button>
          )
        }))}
    </div>
  )
}

const Empty = ({ label }) => (
  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">{label}</div>
)
