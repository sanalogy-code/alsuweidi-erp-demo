import { useState } from 'react'
import { Search, Plus, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'
import { RFI_STATUSES, rfiStatusMeta } from '../../../data/pmData'

// RFI register (Batch 17): contractor requests for information during
// construction — distinct from WIRs (inspection requests). Cost/time impact
// flags nudge the team toward a site instruction or claim record.

import { todayISO } from '../../../utils/date'
const nextRef = (list) => `RFI-${String(list.reduce((m, r) => Math.max(m, parseInt((r.ref || '').replace(/\D/g, ''), 10) || 0), 0) + 1).padStart(3, '0')}`

const DISCIPLINES = ['Architecture', 'Structural', 'Mechanical', 'Electrical', 'Civil / Drainage', 'Other']

export default function RfiView({ phase, onUpdate, currentUserName }) {
  const rfis = phase.rfis || []
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: '', question: '', raisedBy: '', discipline: 'Architecture', costImpact: false, timeImpact: false })
  const [answerDraft, setAnswerDraft] = useState('')

  const save = (next) => onUpdate({ ...phase, rfis: next })

  const create = () => {
    if (!form.subject.trim() || !form.question.trim()) return
    save([{
      id: rfis.reduce((m, r) => Math.max(m, r.id), 0) + 1, ref: nextRef(rfis),
      subject: form.subject.trim(), question: form.question.trim(), raisedBy: form.raisedBy.trim() || 'Contractor',
      date: todayISO(), discipline: form.discipline, status: 'open',
      answer: null, answeredBy: null, answeredDate: null,
      costImpact: form.costImpact, timeImpact: form.timeImpact,
    }, ...rfis])
    setShowForm(false)
    setForm({ subject: '', question: '', raisedBy: '', discipline: 'Architecture', costImpact: false, timeImpact: false })
  }

  const answer = (r) => {
    if (!answerDraft.trim()) return
    save(rfis.map((x) => x.id === r.id ? { ...x, status: 'answered', answer: answerDraft.trim(), answeredBy: currentUserName || 'Engineer', answeredDate: todayISO() } : x))
    setAnswerDraft('')
  }
  const close = (r) => save(rfis.map((x) => x.id === r.id ? { ...x, status: 'closed' } : x))

  const filtered = rfis.filter((r) =>
    (status === 'all' || r.status === status) &&
    (!from || r.date >= from) &&
    (!q || `${r.ref} ${r.subject} ${r.question} ${r.discipline} ${r.raisedBy}`.toLowerCase().includes(q.toLowerCase()))
  )
  const openCount = rfis.filter((r) => r.status === 'open').length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-700">RFI register <span className="font-normal text-gray-400">— {openCount} open of {rfis.length}</span></h2>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-brand text-white"><Plus size={13} /> Log RFI</button>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative">
          <Search size={13} className="absolute left-2 top-2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search RFIs…" className="pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-md w-48" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs border border-gray-300 rounded-md px-2 py-1.5">
          <option value="all">All statuses</option>
          {RFI_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <label className="text-xs text-gray-500 flex items-center gap-1">From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="text-xs border border-gray-300 rounded-md px-2 py-1" /></label>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="text-xs text-gray-600 space-y-1 sm:col-span-2"><span className="font-medium">Subject</span>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" /></label>
            <label className="text-xs text-gray-600 space-y-1"><span className="font-medium">Discipline</span>
              <select value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs">
                {DISCIPLINES.map((d) => <option key={d}>{d}</option>)}
              </select></label>
          </div>
          <label className="text-xs text-gray-600 space-y-1 block"><span className="font-medium">Question</span>
            <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" /></label>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-xs text-gray-600 flex items-center gap-1">Raised by
              <input value={form.raisedBy} onChange={(e) => setForm({ ...form, raisedBy: e.target.value })} placeholder="Contractor" className="border border-gray-300 rounded-md px-2 py-1 text-xs w-40" /></label>
            <label className="text-xs text-gray-600 flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={form.costImpact} onChange={(e) => setForm({ ...form, costImpact: e.target.checked })} className="rounded" /> Potential cost impact</label>
            <label className="text-xs text-gray-600 flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={form.timeImpact} onChange={(e) => setForm({ ...form, timeImpact: e.target.checked })} className="rounded" /> Potential time impact</label>
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white">Log {nextRef(rfis)}</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {!filtered.length && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          {rfis.length ? 'No RFIs match the current filters.' : 'No RFIs yet — contractor questions land here, separate from inspection requests (WIRs).'}
        </div>
      )}

      {filtered.map((r) => {
        const sm = rfiStatusMeta(r.status)
        const open = expanded === r.id
        return (
          <div key={r.id} className="bg-white rounded-lg border border-gray-200">
            <button onClick={() => { setExpanded(open ? null : r.id); setAnswerDraft('') }} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              {open ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
              <span className="text-xs font-mono text-gray-500 shrink-0">{r.ref}</span>
              <span className="text-sm text-gray-800 flex-1 truncate">{r.subject}</span>
              {(r.costImpact || r.timeImpact) && <AlertTriangle size={13} className="text-amber-500 shrink-0" />}
              <span className="text-[11px] text-gray-400 hidden sm:inline">{r.discipline}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${sm.chip}`}>{sm.label}</span>
              <span className="text-[11px] text-gray-400 shrink-0">{r.date}</span>
            </button>
            {open && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3 text-xs">
                <div><span className="text-gray-400">Raised by {r.raisedBy} · {r.date}</span><p className="text-gray-700 mt-1">{r.question}</p></div>
                {(r.costImpact || r.timeImpact) && (
                  <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-amber-700">
                    Flagged with {[r.costImpact && 'cost', r.timeImpact && 'time'].filter(Boolean).join(' + ')} impact — consider issuing a Site Instruction and/or opening a claim record under Claims &amp; EOT.
                  </div>
                )}
                {r.answer ? (
                  <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2">
                    <div className="text-[11px] text-green-700 font-medium">Answer — {r.answeredBy}, {r.answeredDate}</div>
                    <p className="text-gray-700 mt-0.5">{r.answer}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea value={answerDraft} onChange={(e) => setAnswerDraft(e.target.value)} rows={2} placeholder="Engineer's answer…" className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" />
                    <button onClick={() => answer(r)} disabled={!answerDraft.trim()} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white disabled:opacity-40">Answer RFI</button>
                  </div>
                )}
                {r.status === 'answered' && <button onClick={() => close(r)} className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600">Close RFI</button>}
              </div>
            )}
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">RFIs are contractor questions needing engineering answers; inspection requests stay in the Site view (WIRs). Response-time SLAs and reminders are Phase 2.</p>
    </div>
  )
}
