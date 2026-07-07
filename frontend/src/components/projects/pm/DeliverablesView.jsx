import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { DELIVERABLE_STATUSES, DELIVERABLE_NEXT, deliverableStatusMeta } from '../../../data/pmData'
import { DESIGN_DISCIPLINES } from '../../../data/projectsData'

// Deliverable register — the Aconex-model backbone: unique doc no. + revision,
// review workflow (internal QA → issue → comments → revise → resubmit), history
// preserved per revision. Resubmitting bumps the rev letter.

const nextRev = (rev) => String.fromCharCode((rev || 'A').charCodeAt(0) + 1)
import { todayISO } from '../../../utils/date'

export default function DeliverablesView({ pm, onUpdate }) {
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [form, setForm] = useState({ docNo: '', title: '', discipline: DESIGN_DISCIPLINES[0], dueDate: '' })

  const advance = (d, status) => {
    const bump = status === 'issued' && d.status === 'revising'
    const rev = bump ? nextRev(d.rev) : d.rev
    const eventLabel = {
      internal_review: 'Sent to internal QA', issued: bump ? 'Resubmitted to client' : 'Issued to client',
      comments: 'Client comments received', revising: 'Revision started', approved: 'Approved',
      approved_as_noted: 'Approved as noted', draft: 'Returned to draft',
    }[status]
    onUpdate({
      ...pm,
      deliverables: pm.deliverables.map((x) => x.id === d.id
        ? { ...x, status, rev, history: [...x.history, { rev, date: todayISO(), event: eventLabel }] }
        : x),
    })
  }

  const addDeliverable = () => {
    if (!form.docNo.trim() || !form.title.trim()) return
    onUpdate({
      ...pm,
      deliverables: [...pm.deliverables, {
        id: Math.max(0, ...pm.deliverables.map((d) => d.id)) + 1,
        ...form, rev: 'A', status: 'draft',
        history: [{ rev: 'A', date: todayISO(), event: 'Registered' }],
      }],
    })
    setForm({ docNo: '', title: '', discipline: DESIGN_DISCIPLINES[0], dueDate: '' })
    setShowAdd(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-700">Deliverables register ({pm.deliverables.length})</h2>
        <div className="flex items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doc no, title…" className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white w-44" />
          <label className="text-xs text-gray-500">From</label>
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white" />
          <label className="text-xs text-gray-500">To</label>
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
            <option value="">All statuses</option>
            {DELIVERABLE_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
            <Plus size={13} /> Register deliverable
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 grid sm:grid-cols-2 gap-3 text-sm">
          <input value={form.docNo} onChange={(e) => setForm({ ...form, docNo: e.target.value })} placeholder="Doc no. (e.g. HPM-ARC-DWG-002)" className="border rounded-md px-2.5 py-1.5" />
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="border rounded-md px-2.5 py-1.5" />
          <select value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })} className="border rounded-md px-2.5 py-1.5">
            {DESIGN_DISCIPLINES.map((d) => <option key={d}>{d}</option>)}
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="border rounded-md px-2.5 py-1.5" />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs rounded-md border text-gray-600">Cancel</button>
            <button onClick={addDeliverable} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white">Register (rev A)</button>
          </div>
        </div>
      )}

      {pm.deliverables.length === 0 && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          No deliverables registered yet.
        </div>
      )}

      {(() => {
        const filtered = pm.deliverables
          .filter((d) => !statusFilter || d.status === statusFilter)
          .filter((d) => (!range.from || (d.dueDate || '') >= range.from) && (!range.to || (d.dueDate || '') <= range.to))
          .filter((d) => {
            const q = search.trim().toLowerCase()
            return !q || (d.docNo || '').toLowerCase().includes(q) || (d.title || '').toLowerCase().includes(q) || (d.discipline || '').toLowerCase().includes(q)
          })
        if (pm.deliverables.length > 0 && filtered.length === 0) {
          return <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No deliverables match the filters.</div>
        }
        return filtered.map((d) => {
        const meta = deliverableStatusMeta(d.status)
        const open = expanded === d.id
        const nexts = DELIVERABLE_NEXT[d.status] || []
        return (
          <div key={d.id} className="bg-white rounded-lg border border-gray-200">
            <button onClick={() => setExpanded(open ? null : d.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <span className="font-mono text-xs text-gray-500 w-40 shrink-0 truncate">{d.docNo}</span>
              <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{d.title}</span>
              <span className="hidden sm:block text-xs text-gray-400 w-36 truncate">{d.discipline}</span>
              <span className="text-xs font-semibold text-gray-500 w-12 text-right">Rev {d.rev}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
              {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {open && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {d.dueDate && <span>Due: <span className="text-gray-700">{d.dueDate}</span></span>}
                  <span>Discipline: <span className="text-gray-700">{d.discipline}</span></span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Revision history</div>
                  <div className="space-y-1">
                    {d.history.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="font-semibold w-10">Rev {h.rev}</span>
                        <span className="text-gray-400 w-20">{h.date}</span>
                        <span>{h.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {nexts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {nexts.map((n) => (
                      <button key={n} onClick={() => advance(d, n)} className="px-2.5 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:border-brand hover:text-brand transition">
                        {n === 'issued' && d.status === 'revising' ? `Resubmit as Rev ${nextRev(d.rev)}` : `→ ${deliverableStatusMeta(n).label}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })
      })()}

      <p className="text-[11px] text-gray-400">
        Review workflow: internal QA → issued to client → comments → revise → resubmit (rev bumps). The same register pattern serves incoming contractor documents in Phase 2. File storage is Phase 2 — entries are metadata-only.
      </p>
    </div>
  )
}
