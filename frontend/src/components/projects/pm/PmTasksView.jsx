import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, MessageSquare, Link2, CornerDownRight, Clock3, Lock, LayoutList, Table2 } from 'lucide-react'
import TaskTable from './TaskTable'
import {
  daysUntil, taskPriorityMeta, TASK_PRIORITIES, TASK_STATUSES,
  taskBlocked, subtasksOf, taskProgress,
} from '../../../data/pmData'

// Real per-phase task management (Batch 10, deepened Batch 16 per Sana: "full on
// task management, dependencies, milestones, subtasks"): assignment, dates,
// priorities, checklists, progress notes, SUBTASKS (parentId), DEPENDENCIES
// (dependsOn → blocked until predecessors done), and LOG HOURS (writes straight
// into the assignee's weekly timesheet for this project).

const todayIso = () => new Date().toISOString().slice(0, 10)

// `compact` = board-column layout: title + chips stacked, no fixed-width columns.
export function TaskCard({ t, patch, allTasks, currentUserName, onAddSubtask, onLogHours, depth = 0, defaultOpen = false, compact = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [comment, setComment] = useState('')
  const [newItem, setNewItem] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [depPick, setDepPick] = useState('')
  const [hoursForm, setHoursForm] = useState({ hours: '', date: todayIso() })
  const [hoursFlash, setHoursFlash] = useState(null)

  const d = t.due ? daysUntil(t.due) : null
  const pMeta = taskPriorityMeta(t.priority)
  const subs = subtasksOf(t, allTasks)
  const blocked = taskBlocked(t, allTasks)
  const progress = taskProgress(t, allTasks)
  const doneCount = (t.checklist || []).filter((c) => c.done).length
  const depOptions = allTasks.filter((x) => x.id !== t.id && x.parentId == null && !(t.dependsOn || []).includes(x.id))
  const taskName = (id) => allTasks.find((x) => x.id === id)?.title || `#${id}`

  const toggleItem = (id) => patch({ checklist: t.checklist.map((c) => c.id === id ? { ...c, done: !c.done } : c) })
  const addItem = () => {
    if (!newItem.trim()) return
    patch({ checklist: [...(t.checklist || []), { id: Math.max(0, ...(t.checklist || []).map((c) => c.id)) + 1, text: newItem.trim(), done: false }] })
    setNewItem('')
  }
  const addComment = (text) => {
    if (!text.trim()) return
    patch({ comments: [...(t.comments || []), { id: Math.max(0, ...(t.comments || []).map((c) => c.id)) + 1, author: currentUserName || 'Me', date: todayIso(), text: text.trim() }] })
  }
  const logHours = () => {
    const h = Number(hoursForm.hours)
    if (!h || h <= 0) return
    const result = onLogHours(t.assignee, h, hoursForm.date)
    if (result.ok) {
      addComment(`Logged ${h}h on ${hoursForm.date} — added to ${t.assignee}'s timesheet (week of ${result.weekStart}).`)
      setHoursFlash(`✓ ${h}h added to the timesheet`)
    } else {
      setHoursFlash(result.reason === 'external'
        ? `${t.assignee} isn't an employee record — external staff have no timesheet here.`
        : `That week's timesheet is already ${result.reason} — hours not added.`)
    }
    setHoursForm({ hours: '', date: todayIso() })
    setTimeout(() => setHoursFlash(null), 3500)
  }

  return (
    <div className={depth ? 'ml-6' : ''}>
      <div className={`bg-white rounded-lg border ${blocked && t.status !== 'done' ? 'border-amber-300' : 'border-gray-200'}`}>
        {compact ? (
          <button onClick={() => setOpen((v) => !v)} className="w-full px-3 py-2.5 text-left space-y-1.5">
            <div className="flex items-start gap-2">
              {depth > 0 && <CornerDownRight size={12} className="text-gray-300 shrink-0 mt-0.5" />}
              <span className="flex-1 min-w-0 text-sm text-gray-800 leading-snug">{t.title}</span>
              {open ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${pMeta.chip}`}>{pMeta.label}</span>
              {blocked && t.status !== 'done' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-0.5"><Lock size={9} /> blocked</span>
              )}
              {subs.length > 0 && <span className="text-[10px] text-gray-400">{subs.filter((s) => s.status === 'done').length}/{subs.length} sub</span>}
              {(t.checklist || []).length > 0 && <span className="text-[10px] text-gray-400">☑ {doneCount}/{t.checklist.length}</span>}
              {t.status !== 'done' && progress > 0 && <span className="text-[10px] text-gray-400">{progress}%</span>}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="truncate">{t.assignee}</span>
              {t.due && t.status !== 'done' && (
                <span className={`ml-auto shrink-0 ${d < 0 ? 'text-red-600 font-semibold' : d <= 3 ? 'text-amber-600' : ''}`}>
                  {d < 0 ? `${-d}d overdue` : d === 0 ? 'due today' : `due ${t.due}`}
                </span>
              )}
            </div>
          </button>
        ) : (
        <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
          {depth > 0 && <CornerDownRight size={12} className="text-gray-300 shrink-0" />}
          <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${pMeta.chip}`}>{pMeta.label}</span>
          <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{t.title}</span>
          {blocked && t.status !== 'done' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-0.5 shrink-0"><Lock size={9} /> blocked</span>
          )}
          {subs.length > 0 && <span className="text-[11px] text-gray-400 shrink-0">{subs.filter((s) => s.status === 'done').length}/{subs.length} sub</span>}
          {t.status !== 'done' && progress > 0 && (
            <span className="hidden sm:flex items-center gap-1 shrink-0 w-16">
              <span className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden"><span className="block h-full bg-brand rounded-full" style={{ width: `${progress}%` }} /></span>
              <span className="text-[10px] text-gray-400">{progress}%</span>
            </span>
          )}
          {(t.checklist || []).length > 0 && <span className="text-[11px] text-gray-400 shrink-0">{doneCount}/{t.checklist.length}</span>}
          {(t.comments || []).length > 0 && <span className="text-[11px] text-gray-400 shrink-0 flex items-center gap-0.5"><MessageSquare size={11} />{t.comments.length}</span>}
          <span className="hidden sm:block text-xs text-gray-400 w-32 truncate">{t.assignee}</span>
          {t.due && t.status !== 'done' && (
            <span className={`text-xs w-24 text-right shrink-0 ${d < 0 ? 'text-red-600 font-semibold' : d <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
              {d < 0 ? `${-d}d overdue` : d === 0 ? 'due today' : `due ${t.due}`}
            </span>
          )}
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </button>
        )}

        {open && (
          <div className="border-t border-gray-100 px-4 py-3 space-y-3">
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="text-gray-400">Status:</span>
              {TASK_STATUSES.map((s) => (
                <button key={s.key} onClick={() => patch({ status: s.key })} disabled={blocked && s.key !== 'open'}
                  title={blocked && s.key !== 'open' ? 'Blocked by an unfinished dependency' : ''}
                  className={`px-2 py-0.5 rounded-full border transition disabled:opacity-40 ${t.status === s.key ? `${s.chip} border-transparent font-semibold` : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                  {s.label}
                </button>
              ))}
              <span className="text-gray-400 ml-2">Priority:</span>
              <select value={t.priority} onChange={(e) => patch({ priority: e.target.value })} className="border rounded-md px-1.5 py-0.5">
                {TASK_PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>

            <div className="flex flex-wrap gap-3 items-center text-xs text-gray-500">
              <label className="flex items-center gap-1">Assignee
                <input value={t.assignee} onChange={(e) => patch({ assignee: e.target.value })} className="border rounded-md px-1.5 py-0.5 w-36" />
              </label>
              <label className="flex items-center gap-1">Start
                <input type="date" value={t.startDate || ''} onChange={(e) => patch({ startDate: e.target.value || null })} className="border rounded-md px-1.5 py-0.5" />
              </label>
              <label className="flex items-center gap-1">Due
                <input type="date" value={t.due || ''} onChange={(e) => patch({ due: e.target.value || null })} className="border rounded-md px-1.5 py-0.5" />
              </label>
              <label className="flex items-center gap-1">Effort
                <input type="number" min="0" value={t.effortHours ?? ''} onChange={(e) => patch({ effortHours: Number(e.target.value) || 0 })} className="border rounded-md px-1.5 py-0.5 w-14 text-right" />h
              </label>
              {subs.length === 0 && (
                <label className="flex items-center gap-1">% complete
                  <input type="number" min="0" max="100" value={t.pctComplete ?? 0} onChange={(e) => patch({ pctComplete: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="border rounded-md px-1.5 py-0.5 w-14 text-right" />
                </label>
              )}
              {subs.length > 0 && <span className="text-gray-400">% complete rolls up from subtasks ({progress}%)</span>}
            </div>

            {/* Dependencies */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-semibold text-gray-400 uppercase flex items-center gap-1"><Link2 size={11} /> Blocked by</span>
              {(t.dependsOn || []).map((id) => {
                const dep = allTasks.find((x) => x.id === id)
                return (
                  <span key={id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${dep?.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {taskName(id)}{dep?.status === 'done' ? ' ✓' : ''}
                    <button onClick={() => patch({ dependsOn: (t.dependsOn || []).filter((x) => x !== id) })} className="hover:opacity-70">✕</button>
                  </span>
                )
              })}
              {depOptions.length > 0 && (
                <select value={depPick} onChange={(e) => { const id = Number(e.target.value); if (id) { patch({ dependsOn: [...(t.dependsOn || []), id] }); setDepPick('') } }} className="border rounded-md px-1.5 py-0.5 bg-white">
                  <option value="">+ add dependency…</option>
                  {depOptions.map((x) => <option key={x.id} value={x.id}>{x.title.slice(0, 50)}</option>)}
                </select>
              )}
            </div>

            {/* Subtasks */}
            {depth === 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-gray-400 uppercase">Subtasks</div>
                <div className="flex gap-2">
                  <input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && subTitle.trim() && (onAddSubtask(t, subTitle.trim()), setSubTitle(''))} placeholder="Add a subtask (own assignee, dates, status)…" className="flex-1 border rounded-md px-2 py-1 text-xs" />
                  <button onClick={() => { if (subTitle.trim()) { onAddSubtask(t, subTitle.trim()); setSubTitle('') } }} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Add</button>
                </div>
              </div>
            )}

            {/* Checklist */}
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Checklist</div>
              <div className="space-y-1">
                {(t.checklist || []).map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={c.done} onChange={() => toggleItem(c.id)} className="rounded" />
                    <span className={c.done ? 'line-through text-gray-400' : ''}>{c.text}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-1.5">
                <input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} placeholder="Add checklist item…" className="flex-1 border rounded-md px-2 py-1 text-xs" />
                <button onClick={addItem} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Add</button>
              </div>
            </div>

            {/* Log hours → timesheet */}
            {onLogHours && (
              <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 space-y-1.5">
                <div className="text-[11px] font-semibold text-gray-500 flex items-center gap-1"><Clock3 size={11} /> Log hours — goes straight into {t.assignee}'s timesheet under this project</div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <input type="number" min="0.5" step="0.5" value={hoursForm.hours} onChange={(e) => setHoursForm({ ...hoursForm, hours: e.target.value })} placeholder="hrs" className="w-16 border rounded-md px-2 py-1 text-right" />
                  <input type="date" value={hoursForm.date} onChange={(e) => setHoursForm({ ...hoursForm, date: e.target.value })} className="border rounded-md px-2 py-1" />
                  <button onClick={logHours} className="px-2.5 py-1 rounded-md bg-brand text-white">Log</button>
                  {hoursFlash && <span className={hoursFlash.startsWith('✓') ? 'text-green-700' : 'text-amber-700'}>{hoursFlash}</span>}
                </div>
              </div>
            )}

            {/* Progress notes */}
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Progress notes</div>
              <div className="space-y-1.5">
                {(t.comments || []).map((c) => (
                  <div key={c.id} className="text-xs text-gray-600">
                    <span className="font-medium text-gray-700">{c.author}</span>
                    <span className="text-gray-400"> · {c.date}</span>
                    <div>{c.text}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-1.5">
                <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { addComment(comment); setComment('') } }} placeholder="Add a note…" className="flex-1 border rounded-md px-2 py-1 text-xs" />
                <button onClick={() => { addComment(comment); setComment('') }} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Post</button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default function PmTasksView({ phase, onUpdate, currentUserName, onLogHours }) {
  const [showAdd, setShowAdd] = useState(false)
  // Table is the default lens (Sana: "a CLEAR table with aligned columns");
  // the grouped board stays one click away.
  const [lens, setLens] = useState('table')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const teamNames = phase.team.map((m) => m.name)
  const [form, setForm] = useState({ title: '', assignee: teamNames[0] || '', startDate: todayIso(), due: '', priority: 'normal' })

  const patchTask = (id, changes) => onUpdate({ ...phase, tasks: phase.tasks.map((t) => t.id === id ? { ...t, ...changes } : t) })
  const addSubtask = (parent, title) => {
    onUpdate({
      ...phase,
      tasks: [...phase.tasks, {
        id: Math.max(0, ...phase.tasks.map((t) => t.id)) + 1,
        parentId: parent.id, title, assignee: parent.assignee, createdBy: currentUserName || null,
        startDate: todayIso(), due: parent.due || null, effortHours: 0, pctComplete: 0,
        sprintId: parent.sprintId ?? null, priority: parent.priority, status: 'open',
        checklist: [], comments: [],
      }],
    })
  }
  const add = () => {
    if (!form.title.trim()) return
    onUpdate({ ...phase, tasks: [...phase.tasks, { id: Math.max(0, ...phase.tasks.map((t) => t.id)) + 1, ...form, createdBy: currentUserName || null, effortHours: 0, pctComplete: 0, sprintId: null, status: 'open', checklist: [], comments: [] }] })
    setForm({ title: '', assignee: teamNames[0] || '', startDate: todayIso(), due: '', priority: 'normal' }); setShowAdd(false)
  }

  // Filter at the PARENT level: a parent stays visible if it or any of its
  // subtasks matches, and a visible parent keeps ALL its children (no orphans).
  const match = (t) => {
    const q = search.trim().toLowerCase()
    return (!statusFilter || t.status === statusFilter)
      && (!priorityFilter || t.priority === priorityFilter)
      && (!q || (t.title || '').toLowerCase().includes(q) || (t.assignee || '').toLowerCase().includes(q))
  }
  const visibleParentIds = new Set(phase.tasks
    .filter((t) => t.parentId == null && (match(t) || subtasksOf(t, phase.tasks).some(match)))
    .map((t) => t.id))
  const visibleTasks = phase.tasks.filter((t) => t.parentId == null ? visibleParentIds.has(t.id) : visibleParentIds.has(t.parentId))
  const anyFilter = search.trim() || statusFilter || priorityFilter

  // Only top-level tasks appear in the status groups; subtasks nest under parents.
  const groups = TASK_STATUSES.map((s) => ({
    ...s,
    items: visibleTasks
      .filter((t) => t.parentId == null && t.status === s.key)
      .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')),
  }))

  const card = (t) => (
    <div key={t.id}>
      <TaskCardTree t={t} phase={phase} patchTask={patchTask} currentUserName={currentUserName} onAddSubtask={addSubtask} onLogHours={onLogHours} compact />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-700">{phase.label} tasks</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-gray-200 overflow-hidden text-[11px]">
            <button onClick={() => setLens('table')} className={`flex items-center gap-1 px-2 py-1 transition ${lens === 'table' ? 'bg-brand/10 text-brand font-semibold' : 'bg-white text-gray-500 hover:text-gray-700'}`}><Table2 size={12} /> Table</button>
            <button onClick={() => setLens('board')} className={`flex items-center gap-1 px-2 py-1 border-l border-gray-200 transition ${lens === 'board' ? 'bg-brand/10 text-brand font-semibold' : 'bg-white text-gray-500 hover:text-gray-700'}`}><LayoutList size={12} /> Board</button>
          </div>
          <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Add task</button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap gap-2 text-xs">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task…" className="flex-1 min-w-[200px] border rounded-md px-2 py-1.5" />
          <input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} list="pm-team-names" placeholder="Assignee" className="w-44 border rounded-md px-2 py-1.5" />
          <datalist id="pm-team-names">{teamNames.map((n) => <option key={n} value={n} />)}</datalist>
          <label className="flex items-center gap-1 text-gray-500">Start<input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border rounded-md px-2 py-1.5" /></label>
          <label className="flex items-center gap-1 text-gray-500">Due<input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="border rounded-md px-2 py-1.5" /></label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="border rounded-md px-2 py-1.5">
            {TASK_PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <button onClick={add} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Add</button>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search task / person…" className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white w-52" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      {anyFilter && phase.tasks.length > 0 && visibleTasks.length === 0 && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No tasks match the filters.</div>
      )}

      {lens === 'table' ? (
        <TaskTable
          groups={[{
            phaseKey: phase.key, phaseLabel: phase.label, tasks: visibleTasks,
            patchTask, addSubtask, onLogHours, defaultAssigner: phase.team[0]?.name,
          }]}
          currentUserName={currentUserName}
        />
      ) : (
        // A real board: one column per status, side by side.
        <div className="grid gap-3 md:grid-cols-3 items-start">
          {groups.map((g) => (
            <div key={g.key} className="bg-slate-100 rounded-lg border border-slate-200 p-2 space-y-2 min-h-[80px]">
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${g.chip}`}>{g.label}</span>
                <span className="text-xs text-gray-400">{g.items.length}</span>
              </div>
              {g.items.length === 0
                ? <div className="text-xs text-gray-300 pl-1 pb-1">—</div>
                : g.items.map(card)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// A parent card + its nested subtask cards, all patching through the same
// phase-level task list. Used by the board here and the sprint board in PlanView.
export function TaskCardTree({ t, phase, patchTask, currentUserName, onAddSubtask, onLogHours, compact = false }) {
  const subs = subtasksOf(t, phase.tasks)
  return (
    <div>
      <TaskCard t={t} allTasks={phase.tasks} patch={(c) => patchTask(t.id, c)} currentUserName={currentUserName} onAddSubtask={onAddSubtask} onLogHours={onLogHours} depth={0} compact={compact} />
      {subs.length > 0 && (
        <div className="mt-1.5 space-y-1.5">
          {subs.map((s) => (
            <TaskCard key={s.id} t={s} allTasks={phase.tasks} patch={(c) => patchTask(s.id, c)} currentUserName={currentUserName} onAddSubtask={onAddSubtask} onLogHours={onLogHours} depth={compact ? 0 : 1} compact={compact} />
          ))}
        </div>
      )}
    </div>
  )
}
