import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { claimStatusMeta, claimDeadlines, daysUntil, fidicOf, FIDIC_EDITIONS } from '../../../data/pmData'
import { fmtAED } from '../../../data/financeData'

// FIDIC claims/EOT register — the UAE-critical pillar. The 28-day notice from
// event awareness is a condition precedent (miss it, lose the claim), so the
// countdown is the headline. Contemporary records are a contractual requirement;
// informal notices are logged too (UAE Civil Code good-faith doctrines can turn
// on awareness evidence).

const todayISO = () => new Date().toISOString().slice(0, 10)

function Deadline({ label, iso, done }) {
  if (!iso) return null
  const d = daysUntil(iso)
  const cls = done ? 'text-gray-400' : d < 0 ? 'text-red-600 font-semibold' : d <= 10 ? 'text-amber-600 font-semibold' : 'text-gray-600'
  return (
    <span className={`text-xs ${cls}`}>
      {label}: {iso}{!done && (d < 0 ? ` (${-d}d overdue)` : ` (${d}d left)`)}{done && ' ✓'}
    </span>
  )
}

export default function ClaimsView({ pm, onUpdate }) {
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', party: 'Contractor', eventDate: '', awarenessDate: '' })
  const [recordDraft, setRecordDraft] = useState({})
  const ed = fidicOf(pm.fidicEdition)

  const update = (c, patch) => onUpdate({ ...pm, claims: pm.claims.map((x) => x.id === c.id ? { ...x, ...patch } : x) })

  const addRecord = (c, type) => {
    const note = (recordDraft[c.id] || '').trim()
    if (!note) return
    update(c, { records: [...c.records, { id: Math.max(0, ...c.records.map((r) => r.id)) + 1, date: todayISO(), type, note }] })
    setRecordDraft({ ...recordDraft, [c.id]: '' })
  }

  const addClaim = () => {
    if (!form.title.trim() || !form.awarenessDate) return
    onUpdate({
      ...pm,
      claims: [...pm.claims, {
        id: Math.max(0, ...pm.claims.map((c) => c.id)) + 1,
        ref: `CLM-${String(pm.claims.length + 1).padStart(2, '0')}`,
        ...form, eventDate: form.eventDate || form.awarenessDate,
        noticeDate: null, status: 'event_logged', timeImpactDays: 0, costImpact: 0, records: [],
      }],
    })
    setForm({ title: '', party: 'Contractor', eventDate: '', awarenessDate: '' }); setShowAdd(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-700">Claims & EOT register</h2>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 flex items-center gap-1.5">
            Contract edition:
            <select value={pm.fidicEdition} onChange={(e) => onUpdate({ ...pm, fidicEdition: e.target.value })} className="border rounded-md px-2 py-1 text-xs">
              {FIDIC_EDITIONS.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </label>
          <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Log event</button>
        </div>
      </div>

      <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-[11px] leading-snug text-blue-700">
        {ed.label}: notice within <b>{ed.noticeDays} days</b> of event awareness (condition precedent — a missed notice can extinguish the claim), fully detailed claim within <b>{ed.detailedClaimDays} days</b> of the notice, monthly interim updates for continuing events. Contemporary records are contractually required.
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 grid sm:grid-cols-2 gap-3 text-sm">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event / claim title" className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
          <select value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} className="border rounded-md px-2.5 py-1.5">
            <option>Contractor</option><option>Employer</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-gray-500">Event date<input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="border rounded-md px-2 py-1.5 w-full mt-0.5" /></label>
            <label className="text-xs text-gray-500">Awareness date *<input type="date" value={form.awarenessDate} onChange={(e) => setForm({ ...form, awarenessDate: e.target.value })} className="border rounded-md px-2 py-1.5 w-full mt-0.5" /></label>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs rounded-md border text-gray-600">Cancel</button>
            <button onClick={addClaim} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white">Log event (starts the {ed.noticeDays}-day clock)</button>
          </div>
        </div>
      )}

      {pm.claims.length === 0 && !showAdd && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No claims or EOT events registered.</div>
      )}

      {pm.claims.map((c) => {
        const meta = claimStatusMeta(c.status)
        const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
        const open = expanded === c.id
        const noticeUrgent = c.status === 'event_logged' && noticeDue && daysUntil(noticeDue) <= 10
        return (
          <div key={c.id} className={`bg-white rounded-lg border ${noticeUrgent ? 'border-amber-300' : 'border-gray-200'}`}>
            <button onClick={() => setExpanded(open ? null : c.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              {noticeUrgent && <AlertTriangle size={15} className="text-amber-500 shrink-0" />}
              <span className="font-mono text-xs text-gray-500 w-16 shrink-0">{c.ref}</span>
              <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{c.title}</span>
              <span className="hidden sm:block text-xs text-gray-400 w-20">{c.party}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
              {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {open && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                  <span>Event: <span className="text-gray-700">{c.eventDate}</span></span>
                  <span>Awareness: <span className="text-gray-700">{c.awarenessDate}</span></span>
                  {c.timeImpactDays > 0 && <span>Time impact: <span className="text-gray-700">{c.timeImpactDays}d EOT sought</span></span>}
                  {c.costImpact > 0 && <span>Cost impact: <span className="text-gray-700">{fmtAED(c.costImpact, { compact: true })}</span></span>}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  <Deadline label={`${ed.noticeDays}-day notice`} iso={noticeDue} done={!!c.noticeDate} />
                  {c.noticeDate && <Deadline label={`Detailed claim (${ed.detailedClaimDays}d)`} iso={detailedDue} done={c.status !== 'notice_served'} />}
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Contemporary records & correspondence</div>
                  <div className="space-y-1.5">
                    {c.records.map((r) => (
                      <div key={r.id} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-gray-400 w-20 shrink-0">{r.date}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] shrink-0 ${r.type === 'formal' ? 'bg-blue-100 text-blue-700' : r.type === 'informal' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{r.type}</span>
                        <span>{r.note}</span>
                      </div>
                    ))}
                    {c.records.length === 0 && <div className="text-xs text-gray-400">No records yet — log them as they happen, not at claim time.</div>}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input value={recordDraft[c.id] || ''} onChange={(e) => setRecordDraft({ ...recordDraft, [c.id]: e.target.value })} placeholder="Add a record…" className="flex-1 border rounded-md px-2 py-1 text-xs" />
                    <button onClick={() => addRecord(c, 'formal')} className="px-2 py-1 text-[11px] rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Formal</button>
                    <button onClick={() => addRecord(c, 'informal')} className="px-2 py-1 text-[11px] rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Informal</button>
                    <button onClick={() => addRecord(c, 'correspondence')} className="px-2 py-1 text-[11px] rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Corresp.</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {c.status === 'event_logged' && (
                    <button onClick={() => update(c, { status: 'notice_served', noticeDate: todayISO() })} className="px-2.5 py-1 text-xs rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50">Mark notice served today</button>
                  )}
                  {c.status === 'notice_served' && (
                    <button onClick={() => update(c, { status: 'detailed_submitted' })} className="px-2.5 py-1 text-xs rounded-md border border-purple-300 text-purple-700 hover:bg-purple-50">Detailed claim submitted</button>
                  )}
                  {c.status === 'detailed_submitted' && (
                    <button onClick={() => update(c, { status: 'engineer_response' })} className="px-2.5 py-1 text-xs rounded-md border border-amber-300 text-amber-700 hover:bg-amber-50">Engineer responded</button>
                  )}
                  {c.status === 'engineer_response' && (
                    <button onClick={() => update(c, { status: 'determined' })} className="px-2.5 py-1 text-xs rounded-md border border-green-300 text-green-700 hover:bg-green-50">Mark determined</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">
        Deadline notifications (email/push when a notice window is closing) need the Phase 2 backend — the countdowns here are the spec for them. Informal notices are logged deliberately: UAE Civil Code good-faith doctrines can turn on awareness evidence.
      </p>
    </div>
  )
}
