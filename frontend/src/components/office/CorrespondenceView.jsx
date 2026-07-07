import { useState } from 'react'
import { Plus, ArrowDownLeft, ArrowUpRight, Paperclip, Search } from 'lucide-react'
import { LETTER_TYPES, LETTER_STATUSES, letterStatusMeta } from '../../data/officeData'
import { PROJECTS } from '../../data/projectsData'
import { daysUntil } from '../../data/pmData'

// Correspondence register — the ODC's core tool: every incoming/outgoing letter
// with its reference number, linked project, and reply-due tracking. Filters,
// search, and date range included (the "basics" every register should have).

export default function CorrespondenceView({ letters, onChange }) {
  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState('')
  const [status, setStatus] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ direction: 'in', party: '', subject: '', type: LETTER_TYPES[0], projectId: '', date: new Date().toISOString().slice(0, 10), attachment: '', dueBy: '' })

  const nextRef = (dir) => {
    const prefix = dir === 'in' ? 'IN' : 'OUT'
    const max = Math.max(0, ...letters.filter((l) => l.ref.startsWith(prefix)).map((l) => Number(l.ref.split('-')[2]) || 0))
    return `${prefix}-2026-${String(max + 1).padStart(3, '0')}`
  }

  const add = () => {
    if (!form.party.trim() || !form.subject.trim()) return
    onChange([{
      id: Math.max(0, ...letters.map((l) => l.id)) + 1,
      ref: nextRef(form.direction), ...form,
      projectId: form.projectId ? Number(form.projectId) : null,
      attachment: form.attachment.trim() || null, dueBy: form.dueBy || null,
      status: form.direction === 'in' ? 'action_required' : 'filed',
    }, ...letters])
    setForm({ direction: 'in', party: '', subject: '', type: LETTER_TYPES[0], projectId: '', date: new Date().toISOString().slice(0, 10), attachment: '', dueBy: '' })
    setShowAdd(false)
  }

  const shown = letters
    .filter((l) => !direction || l.direction === direction)
    .filter((l) => !status || l.status === status)
    .filter((l) => (!range.from || l.date >= range.from) && (!range.to || l.date <= range.to))
    .filter((l) => {
      const q = search.trim().toLowerCase()
      return !q || l.ref.toLowerCase().includes(q) || l.party.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q)
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  const awaiting = letters.filter((l) => l.status === 'action_required').length

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Correspondence register</h2>
          <p className="text-xs text-gray-500">Every letter in and out with its reference number. {awaiting} awaiting action.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
          <Plus size={13} /> Log letter
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ref, party, subject…" className="pl-6 pr-2 py-1.5 border border-gray-200 rounded-md w-56 bg-white" />
        </div>
        <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1.5 bg-white">
          <option value="">In + out</option><option value="in">Incoming</option><option value="out">Outgoing</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1.5 bg-white">
          <option value="">All statuses</option>
          {LETTER_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <label className="text-gray-500">From <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="border border-gray-200 rounded-md px-2 py-1 ml-1 bg-white" /></label>
        <label className="text-gray-500">To <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="border border-gray-200 rounded-md px-2 py-1 ml-1 bg-white" /></label>
        <span className="text-gray-400 ml-auto">{shown.length} of {letters.length}</span>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="flex gap-2">
            <button onClick={() => setForm({ ...form, direction: 'in' })} className={`px-2.5 py-1 rounded-md border ${form.direction === 'in' ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>Incoming ({nextRef('in')})</button>
            <button onClick={() => setForm({ ...form, direction: 'out' })} className={`px-2.5 py-1 rounded-md border ${form.direction === 'out' ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>Outgoing ({nextRef('out')})</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <input value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder={form.direction === 'in' ? 'From (party) *' : 'To (party) *'} className="border rounded-md px-2.5 py-1.5" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border rounded-md px-2 py-1.5">
              {LETTER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject *" className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
            <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="border rounded-md px-2 py-1.5">
              <option value="">Link to project (optional)…</option>
              {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.projectNo} — {p.name}</option>)}
            </select>
            <div className="flex gap-2">
              <label className="text-gray-500 flex-1">Date <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>
              {form.direction === 'in' && <label className="text-gray-500 flex-1">Reply by <input type="date" value={form.dueBy} onChange={(e) => setForm({ ...form, dueBy: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>}
            </div>
            <label className="flex items-center gap-1 text-gray-500 sm:col-span-2"><Paperclip size={11} /><input value={form.attachment} onChange={(e) => setForm({ ...form, attachment: e.target.value })} placeholder="Scan / PDF file name" className="flex-1 border rounded-md px-2 py-1" /></label>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 rounded-md bg-brand text-white">Log as {nextRef(form.direction)}</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {shown.map((l) => {
          const meta = letterStatusMeta(l.status)
          const proj = PROJECTS.find((p) => p.id === l.projectId)
          const overdue = l.status === 'action_required' && l.dueBy && daysUntil(l.dueBy) < 0
          return (
            <div key={l.id} className={`bg-white rounded-lg border px-4 py-3 ${overdue ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 flex-wrap">
                {l.direction === 'in'
                  ? <ArrowDownLeft size={14} className="text-blue-500 shrink-0" />
                  : <ArrowUpRight size={14} className="text-gray-400 shrink-0" />}
                <span className="font-mono text-xs text-gray-500 w-28 shrink-0">{l.ref}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-gray-800 truncate">{l.subject}</span>
                  <span className="text-xs text-gray-400">
                    {l.direction === 'in' ? 'From' : 'To'} {l.party} · {l.type}{proj ? ` · ${proj.projectNo}` : ''}{l.attachment ? ` · 📎 ${l.attachment}` : ''}
                  </span>
                </span>
                <span className="text-xs text-gray-400 shrink-0">{l.date}</span>
                {l.dueBy && l.status === 'action_required' && (
                  <span className={`text-[11px] shrink-0 ${overdue ? 'text-red-600 font-semibold' : 'text-amber-600'}`}>
                    reply by {l.dueBy}{overdue && ' — overdue'}
                  </span>
                )}
                <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
                {l.status === 'action_required' && (
                  <button onClick={() => onChange(letters.map((x) => x.id === l.id ? { ...x, status: 'replied' } : x))} className="text-[11px] text-brand hover:underline shrink-0">Mark replied</button>
                )}
                {l.status === 'replied' && (
                  <button onClick={() => onChange(letters.map((x) => x.id === l.id ? { ...x, status: 'filed' } : x))} className="text-[11px] text-gray-400 hover:underline shrink-0">File</button>
                )}
              </div>
            </div>
          )
        })}
        {shown.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No letters match these filters.</div>}
      </div>
    </div>
  )
}
