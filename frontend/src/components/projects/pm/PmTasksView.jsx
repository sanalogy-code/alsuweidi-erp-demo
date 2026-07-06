import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { daysUntil, taskPriorityMeta, taskStatusMeta, TASK_PRIORITIES, TASK_STATUSES } from '../../../data/pmData'

// Real per-phase task management (Batch 10): assignment, due dates, priorities,
// checklists, and progress comments. Grouped To do / In progress / Done — the
// screen a PM and their team live in.

const todayISO = () => new Date().toISOString().slice(0, 10)

export function TaskCard({ t, patch, currentUserName }) {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [newItem, setNewItem] = useState('')
  const d = t.due ? daysUntil(t.due) : null
  const pMeta = taskPriorityMeta(t.priority)
  const sMeta = taskStatusMeta(t.status)
  const doneCount = t.checklist.filter((c) => c.done).length

  const toggleItem = (id) => patch({ checklist: t.checklist.map((c) => c.id === id ? { ...c, done: !c.done } : c) })
  const addItem = () => {
    if (!newItem.trim()) return
    patch({ checklist: [...t.checklist, { id: Math.max(0, ...t.checklist.map((c) => c.id)) + 1, text: newItem.trim(), done: false }] })
    setNewItem('')
  }
  const addComment = () => {
    if (!comment.trim()) return
    patch({ comments: [...t.comments, { id: Math.max(0, ...t.comments.map((c) => c.id)) + 1, author: currentUserName || 'Me', date: todayISO(), text: comment.trim() }] })
    setComment('')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${pMeta.chip}`}>{pMeta.label}</span>
        <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{t.title}</span>
        {t.status !== 'done' && t.pctComplete > 0 && (
          <span className="hidden sm:flex items-center gap-1 shrink-0 w-16">
            <span className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden"><span className="block h-full bg-brand rounded-full" style={{ width: `${t.pctComplete}%` }} /></span>
            <span className="text-[10px] text-gray-400">{t.pctComplete}%</span>
          </span>
        )}
        {t.checklist.length > 0 && <span className="text-[11px] text-gray-400 shrink-0">{doneCount}/{t.checklist.length}</span>}
        {t.comments.length > 0 && <span className="text-[11px] text-gray-400 shrink-0 flex items-center gap-0.5"><MessageSquare size={11} />{t.comments.length}</span>}
        <span className="hidden sm:block text-xs text-gray-400 w-36 truncate">{t.assignee}</span>
        {t.due && t.status !== 'done' && (
          <span className={`text-xs w-24 text-right shrink-0 ${d < 0 ? 'text-red-600 font-semibold' : d <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
            {d < 0 ? `${-d}d overdue` : d === 0 ? 'due today' : `due ${t.due}`}
          </span>
        )}
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-gray-400">Status:</span>
            {TASK_STATUSES.map((s) => (
              <button key={s.key} onClick={() => patch({ status: s.key })}
                className={`px-2 py-0.5 rounded-full border transition ${t.status === s.key ? `${s.chip} border-transparent font-semibold` : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
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
            <label className="flex items-center gap-1">% complete
              <input type="number" min="0" max="100" value={t.pctComplete ?? 0} onChange={(e) => patch({ pctComplete: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="border rounded-md px-1.5 py-0.5 w-14 text-right" />
            </label>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Checklist</div>
            <div className="space-y-1">
              {t.checklist.map((c) => (
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

          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Progress notes</div>
            <div className="space-y-1.5">
              {t.comments.map((c) => (
                <div key={c.id} className="text-xs text-gray-600">
                  <span className="font-medium text-gray-700">{c.author}</span>
                  <span className="text-gray-400"> · {c.date}</span>
                  <div>{c.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1.5">
              <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment()} placeholder="Add a note…" className="flex-1 border rounded-md px-2 py-1 text-xs" />
              <button onClick={addComment} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PmTasksView({ phase, onUpdate, currentUserName }) {
  const [showAdd, setShowAdd] = useState(false)
  const teamNames = phase.team.map((m) => m.name)
  const [form, setForm] = useState({ title: '', assignee: teamNames[0] || '', due: '', priority: 'normal' })

  const patchTask = (id, changes) => onUpdate({ ...phase, tasks: phase.tasks.map((t) => t.id === id ? { ...t, ...changes } : t) })
  const add = () => {
    if (!form.title.trim()) return
    onUpdate({ ...phase, tasks: [...phase.tasks, { id: Math.max(0, ...phase.tasks.map((t) => t.id)) + 1, ...form, status: 'open', checklist: [], comments: [] }] })
    setForm({ title: '', assignee: teamNames[0] || '', due: '', priority: 'normal' }); setShowAdd(false)
  }

  const groups = TASK_STATUSES.map((s) => ({
    ...s,
    items: phase.tasks
      .filter((t) => t.status === s.key)
      .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')),
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{phase.label} tasks</h2>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Add task</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap gap-2 text-xs">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task…" className="flex-1 min-w-[200px] border rounded-md px-2 py-1.5" />
          <input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} list="pm-team-names" placeholder="Assignee" className="w-44 border rounded-md px-2 py-1.5" />
          <datalist id="pm-team-names">{teamNames.map((n) => <option key={n} value={n} />)}</datalist>
          <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="border rounded-md px-2 py-1.5" />
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="border rounded-md px-2 py-1.5">
            {TASK_PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <button onClick={add} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Add</button>
        </div>
      )}

      {groups.map((g) => (
        <div key={g.key} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${g.chip}`}>{g.label}</span>
            <span className="text-xs text-gray-400">{g.items.length}</span>
          </div>
          {g.items.length === 0
            ? <div className="text-xs text-gray-300 pl-1">—</div>
            : g.items.map((t) => <TaskCard key={t.id} t={t} patch={(c) => patchTask(t.id, c)} currentUserName={currentUserName} />)}
        </div>
      ))}
    </div>
  )
}
