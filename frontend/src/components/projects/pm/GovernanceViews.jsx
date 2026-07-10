import { useState } from 'react'
import { Plus, Diamond } from 'lucide-react'
import {
  RISK_LEVELS, riskLevelMeta, RISK_STATUSES, riskStatusMeta,
  IPC_STATUSES, ipcStatusMeta, daysUntil,
  FEEDBACK_ISSUE_TYPES, feedbackTypeMeta, FEEDBACK_IMPACTS,
  CONSTRUCTION_FEEDBACK_STATUSES, cfStatusMeta,
} from '../../../data/pmData'
import { fmtAED } from '../../../data/financeData'

// Project-level governance registers (Batch 12, closing out the PM_RESEARCH.md
// nice-to-have tier): risk register, meeting minutes + action tracking, payment
// certificates (IPC), and the FIDIC handover chain (TOC → DLP → Performance
// Certificate with snagging).

import { todayISO } from '../../../utils/date'
import { nextId } from '../../../utils/id'
import { useRegisterFilter, RegisterFilterBar } from '../../RegisterFilter'
const Empty = ({ label }) => (
  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">{label}</div>
)

// --- Risks --------------------------------------------------------------------------
export function RisksView({ pm, onUpdate }) {
  const risks = pm.risks || []
  const [showAdd, setShowAdd] = useState(false)
  const f = useRegisterFilter(risks, { text: ['ref', 'description', 'owner', 'mitigation'], dateField: 'reviewDate' })
  const [form, setForm] = useState({ description: '', probability: 'medium', impact: 'medium', owner: '', mitigation: '' })

  const patch = (id, changes) => onUpdate({ ...pm, risks: risks.map((r) => (r.id === id ? { ...r, ...changes } : r)) })
  const add = () => {
    if (!form.description.trim()) return
    onUpdate({ ...pm, risks: [...risks, { id: nextId(risks), ref: `R-${String(risks.length + 1).padStart(2, '0')}`, ...form, status: 'open', reviewDate: null }] })
    setForm({ description: '', probability: 'medium', impact: 'medium', owner: '', mitigation: '' }); setShowAdd(false)
  }
  const score = (r) => riskLevelMeta(r.probability).score * riskLevelMeta(r.impact).score

  // "What's going on, what's bad" at a glance before the register itself.
  const live = risks.filter((r) => r.status === 'open' || r.status === 'mitigating')
  const severe = live.filter((r) => score(r) >= 6)
  const realized = risks.filter((r) => r.status === 'realized')
  const worst = [...live].sort((a, b) => score(b) - score(a))[0]

  const statusesPresent = RISK_STATUSES.filter((s) => risks.some((r) => r.status === s.key))
  const filtered = f.rows

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-700">Risk register</h2>
        <RegisterFilterBar f={f} statuses={statusesPresent.map((s) => s.key)} statusLabel={(k) => riskStatusMeta(k).label}>
          <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Log risk</button>
        </RegisterFilterBar>
      </div>

      {risks.length > 0 && (
        <div className={`rounded-lg border px-4 py-3 ${severe.length ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            <span className="text-gray-600"><span className="font-semibold text-gray-800">{live.length}</span> live</span>
            <span className={severe.length ? 'text-red-700 font-semibold' : 'text-gray-500'}>{severe.length} high/critical</span>
            {realized.length > 0 && <span className="text-purple-700 font-semibold">{realized.length} realized</span>}
          </div>
          {worst && <p className="text-xs text-gray-600 mt-1"><span className="text-gray-400">Biggest live risk:</span> {worst.description} <span className="text-gray-400">({worst.owner || 'no owner'})</span></p>}
        </div>
      )}

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
      {risks.length > 0 && filtered.length === 0 && <Empty label="No risks match the filters." />}
      {[...filtered].sort((a, b) => score(b) - score(a)).map((r) => {
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
  const [form, setForm] = useState({ title: '', date: todayISO(), attendees: '', notes: '' })
  const [actionDrafts, setActionDrafts] = useState({})
  const [editingNotes, setEditingNotes] = useState(null) // meeting id whose notes are being edited
  // "status" here means: does the meeting still have open actions?
  const f = useRegisterFilter(meetings, {
    text: ['title', 'attendees', 'notes', (m) => m.actions.map((a) => a.text).join(' ')],
    dateField: 'date',
    status: (m) => m.actions.some((a) => a.status !== 'done'),
  })

  const patchMeeting = (id, changes) => onUpdate({ ...pm, meetings: meetings.map((m) => (m.id === id ? { ...m, ...changes } : m)) })
  const add = () => {
    if (!form.title.trim()) return
    onUpdate({ ...pm, meetings: [{ id: nextId(meetings), ref: `MTG-${String(meetings.length + 1).padStart(2, '0')}`, ...form, actions: [] }, ...meetings] })
    setForm({ title: '', date: todayISO(), attendees: '', notes: '' }); setShowAdd(false)
  }
  const addAction = (m) => {
    const d = actionDrafts[m.id] || {}
    if (!(d.text || '').trim()) return
    patchMeeting(m.id, { actions: [...m.actions, { id: nextId(m.actions), text: d.text.trim(), owner: d.owner || '', due: d.due || null, status: 'open' }] })
    setActionDrafts({ ...actionDrafts, [m.id]: {} })
  }

  const openActions = meetings.flatMap((m) => m.actions.filter((a) => a.status !== 'done'))

  const filtered = f.rows

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Meetings & actions</h2>
          <p className="text-xs text-gray-500">{openActions.length} open action{openActions.length === 1 ? '' : 's'} across {meetings.length} meeting{meetings.length === 1 ? '' : 's'}. Open actions appear in each owner's My Work.</p>
        </div>
        <RegisterFilterBar f={f} statusOptions={<><option value="all">All</option><option value="open_actions">With open actions</option></>}>
          <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Log meeting</button>
        </RegisterFilterBar>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap gap-2 text-xs">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Meeting title" className="flex-1 min-w-[200px] border rounded-md px-2 py-1.5" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded-md px-2 py-1.5" />
          <input value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} placeholder="Attendees" className="flex-1 min-w-[160px] border rounded-md px-2 py-1.5" />
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="What was discussed — decisions, points raised, anything worth remembering (actions can be added after logging)…" className="w-full border rounded-md px-2 py-1.5" />
          <button onClick={add} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Log</button>
        </div>
      )}

      {meetings.length === 0 && !showAdd && <Empty label="No meetings logged." />}
      {meetings.length > 0 && filtered.length === 0 && <Empty label="No meetings match the filters." />}
      {filtered.map((m) => (
        <div key={m.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-500">{m.ref}</span>
            <span className="text-sm font-medium text-gray-800">{m.title}</span>
            <span className="text-xs text-gray-400">{m.date}</span>
          </div>
          {m.attendees && <div className="text-xs text-gray-500">Attendees: {m.attendees}</div>}
          {editingNotes === m.id ? (
            <div className="space-y-1.5">
              <textarea autoFocus defaultValue={m.notes || ''} rows={3} id={`mtg-notes-${m.id}`} placeholder="What was discussed…" className="w-full border rounded-md px-2 py-1.5 text-xs" />
              <div className="flex gap-2">
                <button onClick={() => { patchMeeting(m.id, { notes: document.getElementById(`mtg-notes-${m.id}`).value.trim() }); setEditingNotes(null) }} className="px-2 py-0.5 text-[11px] rounded-md bg-brand text-white">Save</button>
                <button onClick={() => setEditingNotes(null)} className="px-2 py-0.5 text-[11px] rounded-md border text-gray-500">Cancel</button>
              </div>
            </div>
          ) : m.notes ? (
            <div className="bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Discussed</div>
              <p className="text-xs text-gray-700 whitespace-pre-wrap">{m.notes}</p>
              <button onClick={() => setEditingNotes(m.id)} className="text-[11px] text-brand hover:underline mt-1">Edit notes</button>
            </div>
          ) : (
            <button onClick={() => setEditingNotes(m.id)} className="text-[11px] text-brand hover:underline">+ Add discussion notes</button>
          )}
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
  const f = useRegisterFilter(ipcs, { text: ['ref', 'period', 'note'] })
  const patch = (id, changes) => onUpdate({ ...pm, ipcs: ipcs.map((i) => (i.id === id ? { ...i, ...changes } : i)) })
  const NEXT = { draft: 'submitted', submitted: 'under_review', under_review: 'certified', certified: 'paid' }

  const statusesPresent = IPC_STATUSES.filter((s) => ipcs.some((i) => i.status === s.key))
  const filtered = f.rows

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-700">Interim payment certificates</h2>
        <RegisterFilterBar f={f} showDates={false} statuses={statusesPresent.map((s) => s.key)} statusLabel={(k) => ipcStatusMeta(k).label} />
      </div>
      {ipcs.length === 0 && <Empty label="No payment certificates — typically starts with construction." />}
      {ipcs.length > 0 && filtered.length === 0 && <Empty label="No payment certificates match the filters." />}
      {filtered.map((i) => {
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

// --- Construction feedback (Batch 16b) — site → design lessons loop --------------------
export function ConstructionFeedbackView({ pm, onUpdate, project, onUpdateProject, currentUserName }) {
  const items = pm.constructionFeedback || []
  const [showAdd, setShowAdd] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const f = useRegisterFilter(items, { text: ['issueIn', 'description', 'improvement'] })
  const [form, setForm] = useState({ type: 'discrepancy', issueIn: '', impact: FEEDBACK_IMPACTS[0], description: '', reason: '', improvement: '' })

  const patch = (id, changes) => onUpdate({ ...pm, constructionFeedback: items.map((f) => (f.id === id ? { ...f, ...changes } : f)) })
  const add = () => {
    if (!form.issueIn.trim() || !form.description.trim()) return
    onUpdate({
      ...pm,
      constructionFeedback: [{
        id: nextId(items), ...form,
        issueIn: form.issueIn.trim(), description: form.description.trim(),
        reason: form.reason.trim(), improvement: form.improvement.trim(),
        reportedBy: currentUserName || 'Site team', date: todayISO(), status: 'open',
      }, ...items],
    })
    setForm({ type: 'discrepancy', issueIn: '', impact: FEEDBACK_IMPACTS[0], description: '', reason: '', improvement: '' })
    setShowAdd(false)
  }
  // Completing feedback with an improvement worth keeping → project Lessons tab.
  const copyToLessons = (f) => {
    if (!onUpdateProject) return
    const lessons = project.lessons || []
    onUpdateProject({
      ...project,
      lessons: [...lessons, {
        id: nextId(lessons),
        text: `${f.issueIn}: ${f.improvement || f.description}`,
        date: todayISO(), author: f.reportedBy,
      }],
    })
    patch(f.id, { inLessons: true })
  }

  const rows = f.rows.filter((x) => !typeFilter || x.type === typeFilter)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Construction feedback → design</h2>
          <p className="text-xs text-gray-500">Issues found on site that design should fix at the source — {items.filter((f) => f.status !== 'completed').length} open. Completed items with an improvement can be pushed to the project's Lessons.</p>
        </div>
        <RegisterFilterBar f={f} statuses={CONSTRUCTION_FEEDBACK_STATUSES.map((s) => s.key)} statusLabel={(k) => cfStatusMeta(k).label}>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
            <option value="">All types</option>
            {FEEDBACK_ISSUE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Raise feedback</button>
        </RegisterFilterBar>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {FEEDBACK_ISSUE_TYPES.map((t) => (
              <button key={t.key} onClick={() => setForm({ ...form, type: t.key })}
                className={`px-2.5 py-1 rounded-full border transition ${form.type === t.key ? `${t.chip} border-transparent font-semibold` : 'border-gray-200 text-gray-500'}`}>
                {t.label}
              </button>
            ))}
            <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="border rounded-md px-2 py-1 ml-auto">
              {FEEDBACK_IMPACTS.map((i) => <option key={i}>{i} impact</option>)}
            </select>
          </div>
          <input value={form.issueIn} onChange={(e) => setForm({ ...form, issueIn: e.target.value })} placeholder="Issue in… (e.g. approved materials list, ARC vs MEP drawings) *" className="w-full border rounded-md px-2.5 py-1.5" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What happened on site? *" className="w-full border rounded-md px-2.5 py-1.5" />
          <div className="grid sm:grid-cols-2 gap-2">
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Issue reason (e.g. improper data collection)" className="border rounded-md px-2.5 py-1.5" />
            <input value={form.improvement} onChange={(e) => setForm({ ...form, improvement: e.target.value })} placeholder="Proposed improvement for design" className="border rounded-md px-2.5 py-1.5" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 rounded-md bg-brand text-white">Raise</button>
          </div>
        </div>
      )}

      {items.length === 0 && !showAdd && <Empty label="No construction feedback logged." />}
      {items.length > 0 && rows.length === 0 && <Empty label="No feedback items match the filters." />}
      {rows.map((f) => {
        const tMeta = feedbackTypeMeta(f.type)
        const sMeta = cfStatusMeta(f.status)
        return (
          <div key={f.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${tMeta.chip}`}>{tMeta.label}</span>
              <span className="text-sm font-medium text-gray-800 flex-1 min-w-0">{f.issueIn}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{f.impact}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${sMeta.chip}`}>{sMeta.label}</span>
            </div>
            <p className="text-xs text-gray-600">{f.description}</p>
            <div className="text-xs text-gray-500 space-y-0.5">
              {f.reason && <div><span className="text-gray-400">Reason:</span> {f.reason}</div>}
              {f.improvement && <div><span className="text-gray-400">Proposed improvement:</span> {f.improvement}</div>}
              <div className="text-gray-400">{f.reportedBy} · {f.date}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {f.status === 'open' && <button onClick={() => patch(f.id, { status: 'with_design' })} className="text-[11px] px-2 py-0.5 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50">Send to design section</button>}
              {f.status === 'with_design' && <button onClick={() => patch(f.id, { status: 'completed' })} className="text-[11px] px-2 py-0.5 rounded-md border border-green-300 text-green-700 hover:bg-green-50">Mark completed</button>}
              {f.status === 'completed' && !f.inLessons && onUpdateProject && (
                <button onClick={() => copyToLessons(f)} className="text-[11px] px-2 py-0.5 rounded-md border border-purple-300 text-purple-700 hover:bg-purple-50">→ Add to project Lessons</button>
              )}
              {f.inLessons && <span className="text-[11px] text-purple-600">✓ in Lessons</span>}
            </div>
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">
        The register mirrors the current ERP's "Feedback Required" screen (issue type / issue in / impact / reason / proposed improvement). Routing to a named design owner + notification is Phase 2.
      </p>
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
    patch({ snags: [...h.snags, { id: nextId(h.snags), ref: `SNAG-${String(h.snags.length + 1).padStart(3, '0')}`, description: snagDraft.trim(), status: 'open', closedDate: null }] })
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
