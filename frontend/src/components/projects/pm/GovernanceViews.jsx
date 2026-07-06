import { useState } from 'react'
import { Plus, Diamond } from 'lucide-react'
import {
  RISK_LEVELS, riskLevelMeta, RISK_STATUSES, riskStatusMeta,
  IPC_STATUSES, ipcStatusMeta, daysUntil,
} from '../../../data/pmData'
import { fmtAED } from '../../../data/financeData'

// Project-level governance registers (Batch 12, closing out the PM_RESEARCH.md
// nice-to-have tier): risk register, meeting minutes + action tracking, payment
// certificates (IPC), and the FIDIC handover chain (TOC → DLP → Performance
// Certificate with snagging).

const todayISO = () => new Date().toISOString().slice(0, 10)
const Empty = ({ label }) => (
  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">{label}</div>
)

// --- Risks --------------------------------------------------------------------------
export function RisksView({ pm, onUpdate }) {
  const risks = pm.risks || []
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ description: '', probability: 'medium', impact: 'medium', owner: '', mitigation: '' })

  const patch = (id, changes) => onUpdate({ ...pm, risks: risks.map((r) => (r.id === id ? { ...r, ...changes } : r)) })
  const add = () => {
    if (!form.description.trim()) return
    onUpdate({ ...pm, risks: [...risks, { id: Math.max(0, ...risks.map((r) => r.id)) + 1, ref: `R-${String(risks.length + 1).padStart(2, '0')}`, ...form, status: 'open', reviewDate: null }] })
    setForm({ description: '', probability: 'medium', impact: 'medium', owner: '', mitigation: '' }); setShowAdd(false)
  }
  const score = (r) => riskLevelMeta(r.probability).score * riskLevelMeta(r.impact).score

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Risk register</h2>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Log risk</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Risk description…" className="w-full border rounded-md px-2.5 py-1.5" />
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1 text-gray-500">Probability
              <select value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} className="border rounded-md px-1.5 py-1">
                {RISK_LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1 text-gray-500">Impact
              <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="border rounded-md px-1.5 py-1">
                {RISK_LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </label>
            <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Owner" className="w-40 border rounded-md px-2 py-1" />
            <input value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })} placeholder="Mitigation" className="flex-1 min-w-[180px] border rounded-md px-2 py-1" />
            <button onClick={add} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Log</button>
          </div>
        </div>
      )}

      {risks.length === 0 && !showAdd && <Empty label="No risks logged." />}
      {[...risks].sort((a, b) => score(b) - score(a)).map((r) => {
        const sMeta = riskStatusMeta(r.status)
        return (
          <div key={r.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-gray-500">{r.ref}</span>
              <span className="flex-1 min-w-0 text-sm text-gray-800">{r.description}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${riskLevelMeta(r.probability).chip}`}>P: {riskLevelMeta(r.probability).label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${riskLevelMeta(r.impact).chip}`}>I: {riskLevelMeta(r.impact).label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${sMeta.chip}`}>{sMeta.label}</span>
            </div>
            <div className="text-xs text-gray-500">Owner: <span className="text-gray-700">{r.owner || '—'}</span>{r.reviewDate && <> · Review {r.reviewDate}{daysUntil(r.reviewDate) < 0 && <span className="text-red-600 font-semibold"> (overdue)</span>}</>}</div>
            {r.mitigation && <div className="text-xs text-gray-600"><span className="text-gray-400">Mitigation:</span> {r.mitigation}</div>}
            <div className="flex gap-2">
              {RISK_STATUSES.filter((s) => s.key !== r.status).map((s) => (
                <button key={s.key} onClick={() => patch(r.id, { status: s.key })} className="text-[11px] px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 hover:border-brand hover:text-brand">→ {s.label}</button>
              ))}
            </div>
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">Sorted by probability × impact. A realized risk usually becomes a claim — link it in the claim's records.</p>
    </div>
  )
}

// --- Meetings & actions ---------------------------------------------------------------
export function MeetingsView({ pm, onUpdate }) {
  const meetings = pm.meetings || []
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', date: todayISO(), attendees: '' })
  const [actionDrafts, setActionDrafts] = useState({})

  const patchMeeting = (id, changes) => onUpdate({ ...pm, meetings: meetings.map((m) => (m.id === id ? { ...m, ...changes } : m)) })
  const add = () => {
    if (!form.title.trim()) return
    onUpdate({ ...pm, meetings: [{ id: Math.max(0, ...meetings.map((m) => m.id)) + 1, ref: `MTG-${String(meetings.length + 1).padStart(2, '0')}`, ...form, actions: [] }, ...meetings] })
    setForm({ title: '', date: todayISO(), attendees: '' }); setShowAdd(false)
  }
  const addAction = (m) => {
    const d = actionDrafts[m.id] || {}
    if (!(d.text || '').trim()) return
    patchMeeting(m.id, { actions: [...m.actions, { id: Math.max(0, ...m.actions.map((a) => a.id)) + 1, text: d.text.trim(), owner: d.owner || '', due: d.due || null, status: 'open' }] })
    setActionDrafts({ ...actionDrafts, [m.id]: {} })
  }

  const openActions = meetings.flatMap((m) => m.actions.filter((a) => a.status !== 'done'))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Meetings & actions</h2>
          <p className="text-xs text-gray-500">{openActions.length} open action{openActions.length === 1 ? '' : 's'} across {meetings.length} meeting{meetings.length === 1 ? '' : 's'}. Open actions appear in each owner's My Work.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Log meeting</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap gap-2 text-xs">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Meeting title" className="flex-1 min-w-[200px] border rounded-md px-2 py-1.5" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded-md px-2 py-1.5" />
          <input value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} placeholder="Attendees" className="flex-1 min-w-[160px] border rounded-md px-2 py-1.5" />
          <button onClick={add} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Log</button>
        </div>
      )}

      {meetings.length === 0 && !showAdd && <Empty label="No meetings logged." />}
      {meetings.map((m) => (
        <div key={m.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-500">{m.ref}</span>
            <span className="text-sm font-medium text-gray-800">{m.title}</span>
            <span className="text-xs text-gray-400">{m.date}</span>
          </div>
          {m.attendees && <div className="text-xs text-gray-500">Attendees: {m.attendees}</div>}
          <div className="space-y-1">
            {m.actions.map((a) => {
              const d = a.due ? daysUntil(a.due) : null
              return (
                <label key={a.id} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={a.status === 'done'} onChange={() => patchMeeting(m.id, { actions: m.actions.map((x) => x.id === a.id ? { ...x, status: x.status === 'done' ? 'open' : 'done' } : x) })} className="rounded" />
                  <span className={`flex-1 ${a.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{a.text}</span>
                  <span className="text-gray-400 w-36 truncate">{a.owner}</span>
                  {a.due && a.status !== 'done' && (
                    <span className={`w-24 text-right ${d < 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>{d < 0 ? `${-d}d overdue` : `due ${a.due}`}</span>
                  )}
                </label>
              )
            })}
          </div>
          <div className="flex gap-2 pt-1">
            <input value={actionDrafts[m.id]?.text || ''} onChange={(e) => setActionDrafts({ ...actionDrafts, [m.id]: { ...actionDrafts[m.id], text: e.target.value } })} placeholder="New action…" className="flex-1 border rounded-md px-2 py-1 text-xs" />
            <input value={actionDrafts[m.id]?.owner || ''} onChange={(e) => setActionDrafts({ ...actionDrafts, [m.id]: { ...actionDrafts[m.id], owner: e.target.value } })} placeholder="Owner" className="w-32 border rounded-md px-2 py-1 text-xs" />
            <input type="date" value={actionDrafts[m.id]?.due || ''} onChange={(e) => setActionDrafts({ ...actionDrafts, [m.id]: { ...actionDrafts[m.id], due: e.target.value } })} className="border rounded-md px-2 py-1 text-xs" />
            <button onClick={() => addAction(m)} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Add</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Payment certificates (IPC) --------------------------------------------------------
export function PaymentsView({ pm, onUpdate }) {
  const ipcs = pm.ipcs || []
  const patch = (id, changes) => onUpdate({ ...pm, ipcs: ipcs.map((i) => (i.id === id ? { ...i, ...changes } : i)) })
  const NEXT = { draft: 'submitted', submitted: 'under_review', under_review: 'certified', certified: 'paid' }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Interim payment certificates</h2>
      {ipcs.length === 0 && <Empty label="No payment certificates — typically starts with construction." />}
      {ipcs.map((i) => {
        const meta = ipcStatusMeta(i.status)
        const deduction = i.amountCertified != null ? i.amountClaimed - i.amountCertified : null
        return (
          <div key={i.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs text-gray-500">{i.ref}</span>
              <span className="text-sm font-medium text-gray-800">Period {i.period}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${meta.chip}`}>{meta.label}</span>
              {NEXT[i.status] && (
                <button onClick={() => patch(i.id, { status: NEXT[i.status], ...(NEXT[i.status] === 'certified' && i.amountCertified == null ? { amountCertified: i.amountClaimed } : {}) })}
                  className="text-[11px] px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 hover:border-brand hover:text-brand">
                  → {ipcStatusMeta(NEXT[i.status]).label}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
              <span>Claimed: <span className="text-gray-700 font-medium">{fmtAED(i.amountClaimed, { compact: true })}</span></span>
              <span>Certified: <span className="text-gray-700 font-medium">{i.amountCertified != null ? fmtAED(i.amountCertified, { compact: true }) : 'pending'}</span></span>
              {deduction > 0 && <span className="text-amber-700">Deducted: {fmtAED(deduction, { compact: true })}</span>}
            </div>
            {i.note && <div className="text-xs text-gray-500">{i.note}</div>}
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">Approved WIRs are the verification basis for certified amounts; MIRs support materials-on-site. Line-item WIR linkage is Phase 2 wiring.</p>
    </div>
  )
}

// --- Handover: TOC → DLP → Performance Certificate --------------------------------------
export function HandoverView({ pm, onUpdate }) {
  const h = pm.handover
  const [snagDraft, setSnagDraft] = useState('')

  const start = () => onUpdate({ ...pm, handover: { tocDate: null, dlpMonths: 12, dlpEndDate: null, performanceCertDate: null, retentionReleased: false, snags: [] } })
  const patch = (changes) => onUpdate({ ...pm, handover: { ...h, ...changes } })

  if (!h) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-500 mb-3">Handover hasn't started — the chain is Taking-Over Certificate → Defects Liability Period → Performance Certificate → retention release.</p>
        <button onClick={start} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white">Start handover tracking</button>
      </div>
    )
  }

  const openSnags = h.snags.filter((s) => s.status !== 'closed')
  const addSnag = () => {
    if (!snagDraft.trim()) return
    patch({ snags: [...h.snags, { id: Math.max(0, ...h.snags.map((s) => s.id)) + 1, ref: `SNAG-${String(h.snags.length + 1).padStart(3, '0')}`, description: snagDraft.trim(), status: 'open', closedDate: null }] })
    setSnagDraft('')
  }

  const steps = [
    { label: 'Taking-Over Certificate', done: !!h.tocDate, detail: h.tocDate || 'Snag list must be workably complete first' },
    { label: `Defects Liability Period (${h.dlpMonths} months)`, done: !!h.dlpEndDate, detail: h.dlpEndDate ? `ends ${h.dlpEndDate}` : 'starts at TOC' },
    { label: 'Performance Certificate', done: !!h.performanceCertDate, detail: h.performanceCertDate || 'issued after defects rectified' },
    { label: 'Retention released', done: h.retentionReleased, detail: h.retentionReleased ? 'Released' : 'after Performance Certificate' },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Handover — TOC → DLP → Performance Certificate</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <Diamond size={11} className={s.done ? 'text-green-500' : 'text-gray-300'} />
            <span className={`flex-1 ${s.done ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{s.label}</span>
            <span className="text-xs text-gray-400">{s.detail}</span>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 pt-2 text-xs">
          {!h.tocDate && (
            <button onClick={() => { const toc = todayISO(); const end = new Date(); end.setMonth(end.getMonth() + h.dlpMonths); patch({ tocDate: toc, dlpEndDate: end.toISOString().slice(0, 10) }) }}
              disabled={openSnags.length > 0}
              className="px-2.5 py-1 rounded-md border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-40" title={openSnags.length ? `${openSnags.length} open snags` : ''}>
              Issue TOC {openSnags.length > 0 && `(${openSnags.length} open snags)`}
            </button>
          )}
          {h.tocDate && !h.performanceCertDate && (
            <button onClick={() => patch({ performanceCertDate: todayISO() })} className="px-2.5 py-1 rounded-md border border-green-300 text-green-700 hover:bg-green-50">Issue Performance Certificate</button>
          )}
          {h.performanceCertDate && !h.retentionReleased && (
            <button onClick={() => patch({ retentionReleased: true })} className="px-2.5 py-1 rounded-md border border-teal-300 text-teal-700 hover:bg-teal-50">Release retention</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Snag list ({openSnags.length} open)</h3>
        </div>
        <div className="flex gap-2">
          <input value={snagDraft} onChange={(e) => setSnagDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSnag()} placeholder="Add a snag…" className="flex-1 border rounded-md px-2 py-1 text-xs" />
          <button onClick={addSnag} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Add</button>
        </div>
        {h.snags.map((s) => (
          <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={s.status === 'closed'} onChange={() => patch({ snags: h.snags.map((x) => x.id === s.id ? { ...x, status: x.status === 'closed' ? 'open' : 'closed', closedDate: x.status === 'closed' ? null : todayISO() } : x) })} className="rounded" />
            <span className="font-mono text-gray-400">{s.ref}</span>
            <span className={s.status === 'closed' ? 'line-through text-gray-400' : 'text-gray-700'}>{s.description}</span>
          </label>
        ))}
        {h.snags.length === 0 && <div className="text-xs text-gray-400">No snags logged.</div>}
      </div>
      <p className="text-[11px] text-gray-400">TOC is blocked while snags are open (workably-complete rule, simplified). DLP defect notifications and rectification tracking refine this in Phase 2.</p>
    </div>
  )
}
