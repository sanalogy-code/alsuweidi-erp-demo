import { useState } from 'react'
import { MessageSquareWarning, X } from 'lucide-react'
import { MODULES } from '../data/dashboardData'
import { todayISO } from '../utils/date'

// System feedback loop (7 Jul goal sweep): any employee can report a bug or
// request a feature from anywhere via the floating button; the queue lives in
// the Admin Center. This is also how Phase 1 requirements-gathering keeps
// working once real staff use the demo.

export const FEEDBACK_TYPES = [
  { key: 'bug', label: 'Something is broken', chip: 'bg-red-100 text-red-700' },
  { key: 'feature', label: 'Request a feature', chip: 'bg-blue-100 text-blue-700' },
  { key: 'question', label: 'Question / unclear', chip: 'bg-gray-100 text-gray-600' },
]
export const FEEDBACK_STATUSES = [
  { key: 'new', label: 'New', chip: 'bg-amber-100 text-amber-700' },
  { key: 'planned', label: 'Planned', chip: 'bg-blue-100 text-blue-700' },
  { key: 'done', label: 'Done', chip: 'bg-green-100 text-green-700' },
  { key: 'declined', label: 'Declined', chip: 'bg-gray-100 text-gray-500' },
]

export const INITIAL_FEEDBACK = [
  { id: 1, type: 'feature', module: 'Projects', text: 'Task dependencies and subtasks — full PMP-style task management.', by: 'Sana Diab', date: '2026-07-06', status: 'planned' },
  { id: 2, type: 'bug', module: 'Financials', text: 'Accountant could not create or log anything — view-only module.', by: 'Sana Diab', date: '2026-07-07', status: 'done' },
]

export default function FeedbackButton({ user, onSubmit }) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ type: 'bug', module: MODULES[0]?.label || '', text: '' })

  const submit = () => {
    if (!form.text.trim()) return
    onSubmit({ ...form, text: form.text.trim(), by: user?.username || 'Anonymous', date: todayISO(), status: 'new' })
    setForm({ type: 'bug', module: MODULES[0]?.label || '', text: '' })
    setSent(true)
    setTimeout(() => { setSent(false); setOpen(false) }, 1400)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} title="Report an issue or request a feature"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-800 text-white text-xs font-medium shadow-lg hover:bg-gray-700 transition">
        <MessageSquareWarning size={14} /> Feedback
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Report an issue / request a feature</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            {sent ? (
              <div className="py-6 text-center text-sm text-green-700 font-medium">Thanks — it's in the Admin queue.</div>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_TYPES.map((t) => (
                    <button key={t.key} onClick={() => setForm({ ...form, type: t.key })}
                      className={`px-2.5 py-1 rounded-full text-[11px] border transition ${form.type === t.key ? `${t.chip} border-transparent font-semibold` : 'border-gray-200 text-gray-500'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className="w-full border rounded-md px-2.5 py-1.5 text-sm bg-white">
                  {MODULES.map((m) => <option key={m.key}>{m.label}</option>)}
                  <option>Home / general</option>
                </select>
                <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} autoFocus
                  placeholder={form.type === 'bug' ? 'What went wrong, and where?' : 'What do you need, and why?'}
                  className="w-full border rounded-md px-2.5 py-1.5 text-sm" />
                <div className="flex justify-end">
                  <button onClick={submit} className="px-3 py-1.5 text-sm rounded-md bg-brand text-white hover:bg-brand-dark">Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Admin Center queue for the feedback above.
export function FeedbackQueue({ items, onUpdate }) {
  const statusMeta = (k) => FEEDBACK_STATUSES.find((s) => s.key === k) || FEEDBACK_STATUSES[0]
  const typeMeta = (k) => FEEDBACK_TYPES.find((t) => t.key === k) || FEEDBACK_TYPES[0]
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">System feedback</h2>
        <p className="text-xs text-gray-500">Bugs and feature requests reported from the floating Feedback button — every employee's direct line into the system's backlog.</p>
      </div>
      {items.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">Queue is empty.</div>}
      {items.map((f) => (
        <div key={f.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${typeMeta(f.type).chip}`}>{typeMeta(f.type).label}</span>
            <span className="text-xs text-gray-400">{f.module}</span>
            <span className="flex-1" />
            <span className="text-xs text-gray-400">{f.by} · {f.date}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusMeta(f.status).chip}`}>{statusMeta(f.status).label}</span>
          </div>
          <p className="text-sm text-gray-700">{f.text}</p>
          <div className="flex gap-2">
            {FEEDBACK_STATUSES.filter((s) => s.key !== f.status).map((s) => (
              <button key={s.key} onClick={() => onUpdate(items.map((x) => x.id === f.id ? { ...x, status: s.key } : x))}
                className="text-[11px] px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 hover:border-brand hover:text-brand">→ {s.label}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
