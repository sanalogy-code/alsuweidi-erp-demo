import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { daysUntil } from '../../../data/pmData'

// Project task list — assignments + deadlines with overdue flags, reusing the
// house queue-row pattern. Dependencies-lite: free text is enough for the demo.

export default function PmTasksView({ pm, onUpdate, teamNames }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', assignee: teamNames[0] || '', due: '' })

  const add = () => {
    if (!form.title.trim()) return
    onUpdate({ ...pm, tasks: [...pm.tasks, { id: Math.max(0, ...pm.tasks.map((t) => t.id)) + 1, ...form, status: 'open' }] })
    setForm({ title: '', assignee: teamNames[0] || '', due: '' }); setShowAdd(false)
  }
  const complete = (t) => onUpdate({ ...pm, tasks: pm.tasks.map((x) => x.id === t.id ? { ...x, status: 'done' } : x) })

  const open = pm.tasks.filter((t) => t.status === 'open').sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))
  const done = pm.tasks.filter((t) => t.status === 'done')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Project tasks</h2>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Add task</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap gap-2 text-xs">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task…" className="flex-1 min-w-[200px] border rounded-md px-2 py-1.5" />
          <input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} list="pm-team-names" placeholder="Assignee" className="w-44 border rounded-md px-2 py-1.5" />
          <datalist id="pm-team-names">{teamNames.map((n) => <option key={n} value={n} />)}</datalist>
          <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="border rounded-md px-2 py-1.5" />
          <button onClick={add} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Add</button>
        </div>
      )}

      {open.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No open tasks.</div>}
      {open.map((t) => {
        const d = t.due ? daysUntil(t.due) : null
        return (
          <div key={t.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <button onClick={() => complete(t)} title="Mark done" className="w-5 h-5 rounded-full border border-gray-300 hover:border-green-500 hover:bg-green-50 flex items-center justify-center shrink-0">
              <Check size={11} className="text-transparent hover:text-green-600" />
            </button>
            <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{t.title}</span>
            <span className="hidden sm:block text-xs text-gray-400 w-40 truncate">{t.assignee}</span>
            {t.due && (
              <span className={`text-xs w-28 text-right shrink-0 ${d < 0 ? 'text-red-600 font-semibold' : d <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                {d < 0 ? `${-d}d overdue` : d === 0 ? 'due today' : `due ${t.due}`}
              </span>
            )}
          </div>
        )
      })}

      {done.length > 0 && (
        <details className="text-sm">
          <summary className="text-xs text-gray-400 cursor-pointer">Done ({done.length})</summary>
          <div className="mt-2 space-y-1">
            {done.map((t) => (
              <div key={t.id} className="px-4 py-2 text-xs text-gray-400 line-through flex items-center gap-3">
                <Check size={12} className="text-green-500 no-underline" /> {t.title} — {t.assignee}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
