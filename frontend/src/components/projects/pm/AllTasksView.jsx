import { useState } from 'react'
import TaskTable from './TaskTable'
import { TASK_STATUSES, TASK_PRIORITIES, taskIsLate } from '../../../data/pmData'
import { todayISO } from '../../../utils/date'
import { nextId } from '../../../utils/id'

// Every task on the project in ONE table, across all phases (Sana, 7 Jul:
// "I need all tasks together with status tags, priority, sorting by date,
// priority, responsibility"). Filters up top; sorting lives in the table header.

export default function AllTasksView({ pm, onUpdatePm, currentUserName, onLogHours }) {
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [search, setSearch] = useState('')

  const updatePhase = (key, next) => onUpdatePm({ ...pm, phases: pm.phases.map((ph) => (ph.key === key ? next : ph)) })

  const assignees = [...new Set(pm.phases.flatMap((ph) => ph.tasks.map((t) => t.assignee)).filter(Boolean))].sort()
  const match = (t) => {
    const q = search.trim().toLowerCase()
    return (!statusFilter || t.status === statusFilter)
      && (!priorityFilter || t.priority === priorityFilter)
      && (!assigneeFilter || t.assignee === assigneeFilter)
      && (!q || t.title.toLowerCase().includes(q) || (t.assignee || '').toLowerCase().includes(q))
  }

  // A filtered-out parent still shows when one of its subtasks matches (and
  // vice versa the table nests subtasks under their parent).
  const groups = pm.phases.map((ph) => {
    const matched = ph.tasks.filter(match)
    const keepIds = new Set(matched.flatMap((t) => [t.id, t.parentId]).filter((x) => x != null))
    return {
      phaseKey: ph.key, phaseLabel: ph.label,
      tasks: ph.tasks.filter((t) => keepIds.has(t.id) || keepIds.has(t.parentId)),
      patchTask: (id, changes) => updatePhase(ph.key, { ...ph, tasks: ph.tasks.map((t) => t.id === id ? { ...t, ...changes } : t) }),
      addSubtask: (parent, title) => updatePhase(ph.key, {
        ...ph,
        tasks: [...ph.tasks, {
          id: nextId(ph.tasks),
          parentId: parent.id, title, assignee: parent.assignee, createdBy: currentUserName || null,
          startDate: todayISO(), due: parent.due || null,
          effortHours: 0, pctComplete: 0, sprintId: parent.sprintId ?? null,
          priority: parent.priority, status: 'open', checklist: [], comments: [],
        }],
      }),
      onLogHours,
      defaultAssigner: ph.team[0]?.name,
    }
  }).filter((g) => g.tasks.length > 0)

  const all = pm.phases.flatMap((ph) => ph.tasks)
  const open = all.filter((t) => t.status !== 'done').length
  const late = all.filter(taskIsLate).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">All tasks — every phase</h2>
          <p className="text-xs text-gray-500">
            {all.length} task{all.length === 1 ? '' : 's'} · {open} open
            {late > 0 && <span className="text-red-600 font-semibold"> · {late} late</span>}. Add tasks from each phase's Plan & tasks.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search task / person…" className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white w-40" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
            <option value="">Everyone</option>
            {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <TaskTable groups={groups} currentUserName={currentUserName} />
    </div>
  )
}
