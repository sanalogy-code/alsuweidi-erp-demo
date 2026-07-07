import { useState, Fragment } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, CornerDownRight, Lock } from 'lucide-react'
import { TaskCard } from './PmTasksView'
import {
  daysUntil, taskPriorityMeta, taskStatusMeta, TASK_PRIORITIES, TASK_STATUSES,
  taskBlocked, subtasksOf, taskProgress,
} from '../../../data/pmData'

// The task TABLE (Sana, 7 Jul: "I need all tasks together... a CLEAR table with
// aligned columns, who is it assigned to, due date, who assigned it, sorting by
// date / priority / responsibility"). Shaded container sets the table apart from
// the page; clicking a row expands the full task card for editing.

const PRIORITY_ORDER = Object.fromEntries(TASK_PRIORITIES.map((p, i) => [p.key, i]))
const STATUS_ORDER = Object.fromEntries(TASK_STATUSES.map((s, i) => [s.key, i]))

const COLUMNS = [
  { key: 'title', label: 'Task', sortable: true },
  { key: 'phase', label: 'Phase', sortable: true, optional: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'assignee', label: 'Assigned to', sortable: true },
  { key: 'createdBy', label: 'Assigned by', sortable: true },
  { key: 'due', label: 'Due', sortable: true, align: 'right' },
]

export default function TaskTable({ groups, currentUserName, onLogHoursFor }) {
  // groups: [{ phaseKey, phaseLabel, tasks, patchTask, addSubtask, onLogHours, defaultAssigner }]
  // Single-phase callers pass one group and the Phase column hides itself.
  const [sort, setSort] = useState({ key: 'due', dir: 'asc' })
  const [openId, setOpenId] = useState(null)
  const showPhase = groups.length > 1

  const rows = groups.flatMap((g) =>
    g.tasks.filter((t) => t.parentId == null).map((t) => ({ t, g }))
  )

  const val = (row) => {
    const { t, g } = row
    switch (sort.key) {
      case 'title': return (t.title || '').toLowerCase()
      case 'phase': return g.phaseLabel || ''
      case 'status': return STATUS_ORDER[t.status] ?? 99
      case 'priority': return PRIORITY_ORDER[t.priority] ?? 99
      case 'assignee': return (t.assignee || '').toLowerCase()
      case 'createdBy': return (t.createdBy || g.defaultAssigner || '').toLowerCase()
      case 'due': return t.due || '9999'
      default: return ''
    }
  }
  const sorted = [...rows].sort((a, b) => {
    const av = val(a), bv = val(b)
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sort.dir === 'asc' ? cmp : -cmp
  })

  const clickSort = (key) => setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })

  const cols = COLUMNS.filter((c) => !c.optional || showPhase)

  const cellRow = (t, g, depth = 0) => {
    const d = t.due ? daysUntil(t.due) : null
    const pMeta = taskPriorityMeta(t.priority)
    const sMeta = taskStatusMeta(t.status)
    const blocked = taskBlocked(t, g.tasks)
    const progress = taskProgress(t, g.tasks)
    const isOpen = openId === `${g.phaseKey}-${t.id}`
    return (
      <Fragment key={`${g.phaseKey}-${t.id}`}>
        <tr onClick={() => setOpenId(isOpen ? null : `${g.phaseKey}-${t.id}`)}
          className={`cursor-pointer border-t border-gray-100 transition ${isOpen ? 'bg-brand/5' : 'bg-white hover:bg-gray-50'}`}>
          {/* width 100% + maxWidth 0 makes this the flexible column: long titles
              truncate instead of pushing the people/date columns off-screen */}
          <td className="px-3 py-2" style={{ width: '100%', maxWidth: 0, minWidth: 160 }}>
            <div className={`flex items-center gap-1.5 min-w-0 ${depth ? 'pl-5' : ''}`}>
              {depth > 0 && <CornerDownRight size={11} className="text-gray-300 shrink-0" />}
              {blocked && t.status !== 'done' && <Lock size={10} className="text-amber-500 shrink-0" title="Blocked by a dependency" />}
              <span className={`truncate ${t.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{t.title}</span>
              {t.status !== 'done' && progress > 0 && <span className="text-[10px] text-gray-400 shrink-0">{progress}%</span>}
            </div>
          </td>
          {showPhase && <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{g.phaseLabel}</td>}
          <td className="px-3 py-2 whitespace-nowrap"><span className={`text-[11px] px-2 py-0.5 rounded-full ${sMeta.chip}`}>{sMeta.label}</span></td>
          <td className="px-3 py-2 whitespace-nowrap"><span className={`text-[11px] px-2 py-0.5 rounded-full ${pMeta.chip}`}>{pMeta.label}</span></td>
          <td className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[160px] truncate">{t.assignee || '—'}</td>
          <td className="px-3 py-2 text-gray-500 whitespace-nowrap max-w-[160px] truncate">{t.createdBy || g.defaultAssigner || '—'}</td>
          <td className={`px-3 py-2 text-right whitespace-nowrap ${t.status === 'done' ? 'text-gray-300' : d != null && d < 0 ? 'text-red-600 font-semibold' : d != null && d <= 3 ? 'text-amber-600' : 'text-gray-500'}`}>
            {t.due ? (t.status !== 'done' && d < 0 ? `${t.due} (${-d}d overdue)` : t.status !== 'done' && d === 0 ? `${t.due} (today)` : t.due) : '—'}
          </td>
        </tr>
        {isOpen && (
          <tr className="bg-brand/5">
            <td colSpan={cols.length} className="px-3 pb-3">
              <TaskCard t={t} allTasks={g.tasks} patch={(c) => g.patchTask(t.id, c)} currentUserName={currentUserName}
                onAddSubtask={g.addSubtask} onLogHours={onLogHoursFor ? onLogHoursFor(g) : g.onLogHours} defaultOpen />
            </td>
          </tr>
        )}
        {subtasksOf(t, g.tasks).map((s) => cellRow(s, g, depth + 1))}
      </Fragment>
    )
  }

  return (
    <div className="bg-slate-100 rounded-lg border border-slate-200 p-2">
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr className="bg-slate-50">
              {cols.map((c) => (
                <th key={c.key} className={`px-3 py-2 font-semibold text-[11px] uppercase tracking-wide text-gray-500 whitespace-nowrap ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {c.sortable ? (
                    <button onClick={() => clickSort(c.key)} className={`inline-flex items-center gap-1 hover:text-brand ${sort.key === c.key ? 'text-brand' : ''}`}>
                      {c.label}
                      {sort.key === c.key
                        ? (sort.dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
                        : <ChevronsUpDown size={11} className="text-gray-300" />}
                    </button>
                  ) : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ t, g }) => cellRow(t, g))}
            {sorted.length === 0 && (
              <tr className="bg-white"><td colSpan={cols.length} className="px-3 py-6 text-center text-gray-400">No tasks.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-400 px-1 pt-1.5">Click a column to sort · click a row to open the full task (edit, subtasks, dependencies, log hours).</p>
    </div>
  )
}
