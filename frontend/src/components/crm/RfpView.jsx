import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, ChevronUp, ExternalLink, UserPlus, ClipboardCheck, Gavel, Clock, Swords, MessageSquareText } from 'lucide-react'
import {
  RFP_STATUSES, rfpStatusMeta, RFP_ENGAGEMENTS,
  bidRecommendation, newChecklist, checklistProgress, BID_HOURLY_RATE,
  FEE_LEVELS, DEBRIEF_REASONS, INITIAL_COMPETITORS,
} from '../../data/rfpData'
import { PROJECT_TYPES, MAIN_FUNCTIONS, PROJECT_LOCATIONS, CONTRACT_TYPES } from '../../data/projectsData'
import { DESIGNATIONS } from '../../data/hrData'

// Proposals / RFP register (Batch 14) — the information from the current ERP's
// RFP form, redesigned: a scannable register with expandable rows and a compact
// add form, instead of a 30-field page. Awarded RFPs link to their delivery
// project; the win rate feeds Marketing analytics in Phase 2.

import { todayISO } from '../../utils/date'
import { nextId } from '../../utils/id'

const scoreTone = (n) => (n == null ? 'text-gray-300' : n >= 70 ? 'text-green-600' : n >= 50 ? 'text-amber-600' : 'text-red-600')

export default function RfpView({ rfps, onUpdate, companies, onRequestStaffing, currentUserName }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [staffFormFor, setStaffFormFor] = useState(null)
  const [staffForm, setStaffForm] = useState({ role: DESIGNATIONS[0]?.title || 'Resident Engineer', count: 1, neededBy: '', note: '' })
  const [staffFlash, setStaffFlash] = useState(null)

  // BD sub-views: the register itself, the competitor register, and the
  // lost-RFP debrief rollup.
  const [tab, setTab] = useState('register')

  // Competitor register — local to the proposals area for now.
  const [competitors, setCompetitors] = useState(INITIAL_COMPETITORS)
  const [compForm, setCompForm] = useState({ name: '', sectors: '', notes: '' })
  const addCompetitor = () => {
    if (!compForm.name.trim()) return
    setCompetitors([...competitors, { id: nextId(competitors), name: compForm.name.trim(), sectors: compForm.sectors.trim(), notes: compForm.notes.trim() }])
    setCompForm({ name: '', sectors: '', notes: '' })
  }

  // Bid/no-bid decision gate
  const [decisionFor, setDecisionFor] = useState(null)
  const [decisionForm, setDecisionForm] = useState({ decision: 'bid', by: '', rationale: '' })

  // Bid cost quick-adds
  const [hourForm, setHourForm] = useState({ person: '', hours: '', date: '' })
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '' })

  // Lost-RFP debrief
  const [debriefFor, setDebriefFor] = useState(null)
  const [debriefForm, setDebriefForm] = useState({ reason: 'price', clientFeedback: '', lessons: '', by: '' })
  const [debriefReasonFilter, setDebriefReasonFilter] = useState('')

  // Pipeline staffing request (Batch 16c): "if this lands we need X of role Y by
  // date Z" — goes straight to HR's Staff planning intake, contingent on award.
  const sendStaffing = (r) => {
    if (!staffForm.neededBy) return
    onRequestStaffing({
      rfpId: r.id, rfpName: r.shortName, role: staffForm.role,
      count: Number(staffForm.count) || 1, neededBy: staffForm.neededBy,
      note: staffForm.note.trim(), requestedBy: currentUserName || r.rfpManager || 'PM',
    })
    setStaffFormFor(null)
    setStaffForm({ role: DESIGNATIONS[0]?.title || 'Resident Engineer', count: 1, neededBy: '', note: '' })
    setStaffFlash(r.id)
    setTimeout(() => setStaffFlash(null), 3000)
  }
  const [form, setForm] = useState({
    name: '', shortName: '', employer: '', engagement: RFP_ENGAGEMENTS[0], projectType: PROJECT_TYPES[0],
    mainFunction: MAIN_FUNCTIONS[0], location: PROJECT_LOCATIONS[0], contractType: CONTRACT_TYPES[0],
    rfpManager: '', invitationDate: '', techSubmittal: '', commSubmittal: '', queriesDeadline: '',
    goScore: '', winScore: '', remarks: '',
  })

  const patch = (id, changes) => onUpdate(rfps.map((r) => (r.id === id ? { ...r, ...changes } : r)))

  const add = () => {
    if (!form.name.trim() || !form.employer.trim()) return
    const company = companies.find((c) => c.name.toLowerCase() === form.employer.trim().toLowerCase())
    onUpdate([{
      id: nextId(rfps),
      refNo: `RFP-2026-${String(Math.max(0, ...rfps.map((r) => Number(r.refNo.split('-')[2]) || 0)) + 1).padStart(3, '0')}`,
      ...form, shortName: form.shortName.trim() || form.name.slice(0, 40),
      goScore: Number(form.goScore) || null, winScore: Number(form.winScore) || null,
      companyId: company?.id ?? null, ownerType: '', ownerName: '', siteVisit: '',
      status: 'invited', dealId: null, projectId: null,
      // Tender checklist template auto-attaches to every new RFP.
      checklist: newChecklist(), bidDecision: null, prepHours: [], expenses: [],
      lostTo: null, feeLevel: null, debrief: null,
    }, ...rfps])
    setShowAdd(false)
  }

  const rows = rfps
    .filter((r) => !statusFilter || r.status === statusFilter)
    .filter((r) => {
      const q = search.trim().toLowerCase()
      return !q || r.refNo.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.shortName.toLowerCase().includes(q) || r.employer.toLowerCase().includes(q)
    })
  const counts = Object.fromEntries(RFP_STATUSES.map((s) => [s.key, rfps.filter((r) => r.status === s.key).length]))
  const decided = counts.awarded + counts.lost
  const winRate = decided ? Math.round((counts.awarded / decided) * 100) : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Proposals (RFPs)</h2>
          <p className="text-xs text-gray-500">
            {rfps.length} tracked · {counts.preparing + counts.invited} in play · {counts.submitted} awaiting decision{winRate != null && <> · win rate <span className="font-semibold text-gray-700">{winRate}%</span></>}
          </p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> New RFP</button>
      </div>

      {/* BD sub-views */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {[
          { key: 'register', label: 'Register', icon: Gavel },
          { key: 'competitors', label: 'Competitors', icon: Swords },
          { key: 'debriefs', label: 'Debriefs', icon: MessageSquareText },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition ${tab === key ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === 'competitors' && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {competitors.map((c) => {
              const losses = rfps.filter((r) => r.status === 'lost' && r.lostTo === c.id)
              return (
                <div key={c.id} className="px-4 py-3 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-gray-800 flex-1 min-w-0">{c.name}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${losses.length ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                      {losses.length} loss{losses.length !== 1 ? 'es' : ''} against
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{c.sectors || '—'}</div>
                  {c.notes && <p className="text-xs text-gray-600">{c.notes}</p>}
                  {losses.map((r) => (
                    <div key={r.id} className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-1.5">
                      <span className="font-mono text-gray-400">{r.refNo}</span> {r.shortName} — fee level: <span className="text-gray-700">{r.feeLevel || 'unknown'}</span>
                    </div>
                  ))}
                </div>
              )
            })}
            {competitors.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No competitors registered yet.</div>}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap items-center gap-2 text-xs">
            <input value={compForm.name} onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} placeholder="Competitor name *" className="w-44 border rounded-md px-2 py-1.5" />
            <input value={compForm.sectors} onChange={(e) => setCompForm({ ...compForm, sectors: e.target.value })} placeholder="Typical sectors" className="w-52 border rounded-md px-2 py-1.5" />
            <input value={compForm.notes} onChange={(e) => setCompForm({ ...compForm, notes: e.target.value })} placeholder="Notes" className="flex-1 min-w-[140px] border rounded-md px-2 py-1.5" />
            <button onClick={addCompetitor} disabled={!compForm.name.trim()} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand text-white disabled:opacity-40"><Plus size={12} /> Add competitor</button>
          </div>
        </div>
      )}

      {tab === 'debriefs' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={() => setDebriefReasonFilter('')} className={`px-2.5 py-1 rounded-full text-[11px] border transition ${!debriefReasonFilter ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>All reasons</button>
            {DEBRIEF_REASONS.map((reason) => (
              <button key={reason} onClick={() => setDebriefReasonFilter(debriefReasonFilter === reason ? '' : reason)}
                className={`px-2.5 py-1 rounded-full text-[11px] border capitalize transition ${debriefReasonFilter === reason ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>
                {reason}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {rfps.filter((r) => r.debrief && (!debriefReasonFilter || r.debrief.reason === debriefReasonFilter)).map((r) => (
              <div key={r.id} className="px-4 py-3 space-y-1 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-gray-400">{r.refNo}</span>
                  <span className="text-sm font-medium text-gray-800 flex-1 min-w-0">{r.shortName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-red-100 text-red-700 capitalize">Lost — {r.debrief.reason}</span>
                </div>
                <div className="text-gray-500">
                  {r.employer}
                  {r.lostTo != null && <> · lost to <span className="text-gray-700">{competitors.find((c) => c.id === r.lostTo)?.name || 'unknown competitor'}</span></>}
                  {r.feeLevel && <> · their fee: <span className="text-gray-700">{r.feeLevel}</span></>}
                </div>
                {r.debrief.clientFeedback && <p className="text-gray-600"><span className="font-semibold text-gray-700">Client feedback:</span> {r.debrief.clientFeedback}</p>}
                {r.debrief.lessons && <p className="text-gray-600 bg-amber-50 border border-amber-100 rounded-md px-3 py-1.5"><span className="font-semibold text-amber-700">Lessons:</span> {r.debrief.lessons}</p>}
                <div className="text-gray-400">Debrief by {r.debrief.by} · {r.debrief.date}</div>
              </div>
            ))}
            {rfps.filter((r) => r.debrief && (!debriefReasonFilter || r.debrief.reason === debriefReasonFilter)).length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400">No debriefs {debriefReasonFilter ? 'for this reason' : 'recorded'} yet — record one on a lost RFP in the register.</div>
            )}
          </div>
        </div>
      )}

      {tab === 'register' && (<>
      <div className="flex flex-wrap items-center gap-1.5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ref, name, employer…" className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white w-48 mr-1" />
        <button onClick={() => setStatusFilter('')} className={`px-2.5 py-1 rounded-full text-[11px] border transition ${!statusFilter ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>All</button>
        {RFP_STATUSES.map((s) => (
          <button key={s.key} onClick={() => setStatusFilter(statusFilter === s.key ? '' : s.key)}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition ${statusFilter === s.key ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>
            {s.label} {counts[s.key] > 0 && <span className="text-gray-400">({counts[s.key]})</span>}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-2 gap-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="RFP name *" className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
            <input value={form.employer} onChange={(e) => setForm({ ...form, employer: e.target.value })} list="rfp-companies" placeholder="Employer * (matches CRM companies)" className="border rounded-md px-2.5 py-1.5" />
            <datalist id="rfp-companies">{companies.map((c) => <option key={c.id} value={c.name} />)}</datalist>
            <input value={form.rfpManager} onChange={(e) => setForm({ ...form, rfpManager: e.target.value })} placeholder="RFP manager" className="border rounded-md px-2.5 py-1.5" />
            <select value={form.engagement} onChange={(e) => setForm({ ...form, engagement: e.target.value })} className="border rounded-md px-2 py-1.5">{RFP_ENGAGEMENTS.map((x) => <option key={x}>{x}</option>)}</select>
            <select value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} className="border rounded-md px-2 py-1.5">{PROJECT_TYPES.map((x) => <option key={x}>{x}</option>)}</select>
            <select value={form.mainFunction} onChange={(e) => setForm({ ...form, mainFunction: e.target.value })} className="border rounded-md px-2 py-1.5">{MAIN_FUNCTIONS.map((x) => <option key={x}>{x}</option>)}</select>
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="border rounded-md px-2 py-1.5">{PROJECT_LOCATIONS.map((x) => <option key={x}>{x}</option>)}</select>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-gray-500">Invitation <input type="date" value={form.invitationDate} onChange={(e) => setForm({ ...form, invitationDate: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <label className="text-gray-500">Queries by <input type="date" value={form.queriesDeadline} onChange={(e) => setForm({ ...form, queriesDeadline: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <label className="text-gray-500">Tech <input type="date" value={form.techSubmittal} onChange={(e) => setForm({ ...form, techSubmittal: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <label className="text-gray-500">Comm <input type="date" value={form.commSubmittal} onChange={(e) => setForm({ ...form, commSubmittal: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <label className="text-gray-500">Go <input type="number" min="0" max="100" value={form.goScore} onChange={(e) => setForm({ ...form, goScore: e.target.value })} className="w-14 border rounded-md px-1.5 py-1 ml-1 text-right" /></label>
            <label className="text-gray-500">Win <input type="number" min="0" max="100" value={form.winScore} onChange={(e) => setForm({ ...form, winScore: e.target.value })} className="w-14 border rounded-md px-1.5 py-1 ml-1 text-right" /></label>
          </div>
          <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Remarks / bid strategy…" rows={2} className="w-full border rounded-md px-2.5 py-1.5" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 rounded-md bg-brand text-white">Register RFP</button>
          </div>
        </div>
      )}

      {rows.map((r) => {
        const meta = rfpStatusMeta(r.status)
        const rec = bidRecommendation(r.goScore, r.winScore)
        const open = expanded === r.id
        const nextDue = r.status === 'invited' || r.status === 'preparing' ? (r.techSubmittal || r.commSubmittal) : null
        return (
          <div key={r.id} className="bg-white rounded-lg border border-gray-200">
            <button onClick={() => setExpanded(open ? null : r.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <span className="font-mono text-xs text-gray-400 w-24 shrink-0">{r.refNo}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-gray-800 truncate">{r.shortName}</span>
                <span className="text-xs text-gray-400">{r.employer} · {r.engagement} · {r.location}</span>
              </span>
              {nextDue && <span className="hidden sm:block text-xs text-amber-600 shrink-0">due {nextDue}</span>}
              {r.checklist?.length > 0 && (r.status === 'invited' || r.status === 'preparing') && (
                <span className={`hidden sm:flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full shrink-0 ${checklistProgress(r.checklist) === 100 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`} title="Tender checklist progress">
                  <ClipboardCheck size={11} /> {checklistProgress(r.checklist)}%
                </span>
              )}
              <span className={`text-xs font-semibold shrink-0 ${scoreTone(r.goScore)}`} title="Go score">{r.goScore ?? '—'}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
              {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {open && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-2.5 text-xs">
                <p className="text-gray-700">{r.name}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-gray-500">
                  <span>Manager: <span className="text-gray-700">{r.rfpManager || '—'}</span></span>
                  <span>Type: <span className="text-gray-700">{r.projectType} / {r.mainFunction}</span></span>
                  <span>Contract: <span className="text-gray-700">{r.contractType}</span></span>
                  {r.siteVisit && <span>Site visit: <span className="text-gray-700">{r.siteVisit}</span></span>}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-gray-500">
                  <span>Invited <span className="text-gray-700">{r.invitationDate || '—'}</span></span>
                  <span>Queries <span className="text-gray-700">{r.queriesDeadline || '—'}</span></span>
                  <span>Tech <span className="text-gray-700">{r.techSubmittal || '—'}</span></span>
                  <span>Commercial <span className="text-gray-700">{r.commSubmittal || '—'}</span></span>
                  <span>Go/Win: <span className={scoreTone(r.goScore)}>{r.goScore ?? '—'}</span> / <span className={scoreTone(r.winScore)}>{r.winScore ?? '—'}</span></span>
                </div>
                {r.remarks && <p className="text-gray-600">{r.remarks}</p>}
                {r.projectId && (
                  <button onClick={() => navigate(`/projects/${r.projectId}`)} className="flex items-center gap-1 text-brand hover:underline font-medium">
                    <ExternalLink size={12} /> Open delivery project
                  </button>
                )}
                {/* Bid decision record — the sign-off behind the status */}
                {r.bidDecision && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 flex items-start gap-2">
                    <Gavel size={13} className={`mt-0.5 shrink-0 ${r.bidDecision.decision === 'bid' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <span className="font-semibold text-gray-700">{r.bidDecision.decision === 'bid' ? 'Bid' : 'No-bid'}</span>
                      <span className="text-gray-500"> — decided by {r.bidDecision.by} on {r.bidDecision.date}</span>
                      {r.bidDecision.rationale && <p className="text-gray-600 mt-0.5">{r.bidDecision.rationale}</p>}
                    </div>
                  </div>
                )}

                {/* Decision gate: an invited RFP can't move to Preparing without a recorded decision */}
                {r.status === 'invited' && !r.bidDecision && (
                  <div className="bg-blue-50/50 border border-blue-200 rounded-md px-3 py-2 space-y-1.5">
                    <div className="text-[11px] font-semibold text-gray-600">
                      Bid / no-bid gate — recommendation from scores:{' '}
                      {rec === 'bid' && <span className="text-green-700">BID (go ≥ 70, win ≥ 50)</span>}
                      {rec === 'no-bid' && <span className="text-red-600">NO-BID (go &lt; 50 or win &lt; 30)</span>}
                      {rec === 'borderline' && <span className="text-amber-600">BORDERLINE — management call</span>}
                      {rec === null && <span className="text-gray-400">no scores yet</span>}
                    </div>
                    {decisionFor === r.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <select value={decisionForm.decision} onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })} className="border rounded-md px-2 py-1 bg-white">
                          <option value="bid">Bid</option>
                          <option value="no-bid">No-bid</option>
                        </select>
                        <input value={decisionForm.by} onChange={(e) => setDecisionForm({ ...decisionForm, by: e.target.value })} placeholder="Decided by *" className="w-36 border rounded-md px-2 py-1" />
                        <input value={decisionForm.rationale} onChange={(e) => setDecisionForm({ ...decisionForm, rationale: e.target.value })} placeholder="Rationale" className="flex-1 min-w-[160px] border rounded-md px-2 py-1" />
                        <button
                          onClick={() => {
                            if (!decisionForm.by.trim()) return
                            patch(r.id, {
                              bidDecision: { decision: decisionForm.decision, by: decisionForm.by.trim(), date: todayISO(), rationale: decisionForm.rationale.trim() },
                              status: decisionForm.decision === 'bid' ? 'preparing' : 'declined',
                            })
                            setDecisionFor(null)
                            setDecisionForm({ decision: 'bid', by: '', rationale: '' })
                          }}
                          className="px-2.5 py-1 rounded-md bg-brand text-white"
                        >Record decision</button>
                        <button onClick={() => setDecisionFor(null)} className="px-2.5 py-1 rounded-md border text-gray-500">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => { setDecisionFor(r.id); setDecisionForm({ decision: rec === 'no-bid' ? 'no-bid' : 'bid', by: currentUserName || '', rationale: '' }) }}
                        className="px-2.5 py-1 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50">
                        Record bid decision
                      </button>
                    )}
                  </div>
                )}

                {/* Tender document checklist */}
                {r.checklist?.length > 0 && (r.status === 'invited' || r.status === 'preparing') && (
                  <div className="border border-gray-200 rounded-md">
                    <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-semibold text-gray-600 flex items-center gap-1.5">
                      <ClipboardCheck size={12} /> Tender checklist — {checklistProgress(r.checklist)}% ready
                    </div>
                    <div className="divide-y divide-gray-50">
                      {r.checklist.map((item) => (
                        <label key={item.key} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50">
                          <input type="checkbox" checked={item.done}
                            onChange={() => patch(r.id, { checklist: r.checklist.map((i) => (i.key === item.key ? { ...i, done: !i.done } : i)) })}
                            className="accent-brand" />
                          <span className={`flex-1 ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.label}</span>
                          <input value={item.owner} placeholder="owner"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => patch(r.id, { checklist: r.checklist.map((i) => (i.key === item.key ? { ...i, owner: e.target.value } : i)) })}
                            className="w-28 border border-gray-200 rounded px-1.5 py-0.5 text-[11px]" />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bid cost tracking — prep hours + expenses */}
                {(r.status !== 'declined') && (
                  <div className="border border-gray-200 rounded-md">
                    <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-semibold text-gray-600 flex items-center justify-between gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> Bid cost</span>
                      <span className="text-gray-500 font-normal">
                        {(r.prepHours || []).reduce((s, h) => s + h.hours, 0)}h × {BID_HOURLY_RATE} AED + {fmtAED((r.expenses || []).reduce((s, x) => s + x.amount, 0))} expenses ={' '}
                        <span className="font-semibold text-gray-700">{fmtAED((r.prepHours || []).reduce((s, h) => s + h.hours, 0) * BID_HOURLY_RATE + (r.expenses || []).reduce((s, x) => s + x.amount, 0))}</span>
                      </span>
                    </div>
                    {(r.prepHours || []).map((h) => (
                      <div key={h.id} className="px-3 py-1 flex items-center gap-3 text-gray-500 border-b border-gray-50">
                        <span className="flex-1 text-gray-700">{h.person}</span><span>{h.hours}h</span><span className="text-gray-400">{h.date}</span>
                      </div>
                    ))}
                    {(r.expenses || []).map((x) => (
                      <div key={x.id} className="px-3 py-1 flex items-center gap-3 text-gray-500 border-b border-gray-50">
                        <span className="flex-1 text-gray-700">{x.description}</span><span>{fmtAED(x.amount)}</span>
                      </div>
                    ))}
                    <div className="px-3 py-2 flex flex-wrap items-center gap-1.5">
                      <input value={hourForm.person} onChange={(e) => setHourForm({ ...hourForm, person: e.target.value })} placeholder="Person" className="w-28 border rounded px-1.5 py-1" />
                      <input type="number" min="0" step="0.5" value={hourForm.hours} onChange={(e) => setHourForm({ ...hourForm, hours: e.target.value })} placeholder="hrs" className="w-14 border rounded px-1.5 py-1 text-right" />
                      <input type="date" value={hourForm.date} onChange={(e) => setHourForm({ ...hourForm, date: e.target.value })} className="border rounded px-1.5 py-1" />
                      <button onClick={() => {
                        if (!hourForm.person.trim() || !Number(hourForm.hours)) return
                        patch(r.id, { prepHours: [...(r.prepHours || []), { id: nextId((r.prepHours || [])), person: hourForm.person.trim(), hours: Number(hourForm.hours), date: hourForm.date || todayISO() }] })
                        setHourForm({ person: '', hours: '', date: '' })
                      }} className="px-2 py-1 rounded border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">+ hours</button>
                      <span className="w-px h-4 bg-gray-200 mx-1" />
                      <input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="Expense" className="w-36 border rounded px-1.5 py-1" />
                      <input type="number" min="0" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="AED" className="w-20 border rounded px-1.5 py-1 text-right" />
                      <button onClick={() => {
                        if (!expenseForm.description.trim() || !Number(expenseForm.amount)) return
                        patch(r.id, { expenses: [...(r.expenses || []), { id: nextId((r.expenses || [])), description: expenseForm.description.trim(), amount: Number(expenseForm.amount) }] })
                        setExpenseForm({ description: '', amount: '' })
                      }} className="px-2 py-1 rounded border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">+ expense</button>
                    </div>
                    <div className="px-3 pb-2 text-[10px] text-gray-400">Hours are manual quick-adds for now — Phase 2 pulls them from timesheet bid codes.</div>
                  </div>
                )}

                {/* Lost RFP: competitor attribution + debrief */}
                {r.status === 'lost' && (
                  <div className="border border-red-100 bg-red-50/40 rounded-md px-3 py-2 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-gray-600">Lost to</span>
                      <select value={r.lostTo ?? ''} onChange={(e) => patch(r.id, { lostTo: e.target.value ? Number(e.target.value) : null })} className="border rounded-md px-2 py-1 bg-white">
                        <option value="">Unknown / not recorded</option>
                        {competitors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <span className="text-[11px] font-semibold text-gray-600 ml-2">Their fee was</span>
                      <select value={r.feeLevel ?? 'unknown'} onChange={(e) => patch(r.id, { feeLevel: e.target.value })} className="border rounded-md px-2 py-1 bg-white capitalize">
                        {FEE_LEVELS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    {r.debrief ? (
                      <div className="text-gray-600 space-y-0.5">
                        <div><span className="font-semibold text-gray-700 capitalize">Debrief — {r.debrief.reason}</span> <span className="text-gray-400">({r.debrief.by}, {r.debrief.date})</span></div>
                        {r.debrief.clientFeedback && <p>Client feedback: {r.debrief.clientFeedback}</p>}
                        {r.debrief.lessons && <p className="text-amber-700">Lessons: {r.debrief.lessons}</p>}
                      </div>
                    ) : debriefFor === r.id ? (
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <select value={debriefForm.reason} onChange={(e) => setDebriefForm({ ...debriefForm, reason: e.target.value })} className="border rounded-md px-2 py-1 bg-white capitalize">
                            {DEBRIEF_REASONS.map((x) => <option key={x} value={x}>{x}</option>)}
                          </select>
                          <input value={debriefForm.by} onChange={(e) => setDebriefForm({ ...debriefForm, by: e.target.value })} placeholder="Debrief by *" className="w-36 border rounded-md px-2 py-1" />
                        </div>
                        <input value={debriefForm.clientFeedback} onChange={(e) => setDebriefForm({ ...debriefForm, clientFeedback: e.target.value })} placeholder="Client feedback" className="w-full border rounded-md px-2 py-1" />
                        <input value={debriefForm.lessons} onChange={(e) => setDebriefForm({ ...debriefForm, lessons: e.target.value })} placeholder="Lessons for next time" className="w-full border rounded-md px-2 py-1" />
                        <div className="flex gap-2">
                          <button onClick={() => {
                            if (!debriefForm.by.trim()) return
                            patch(r.id, { debrief: { reason: debriefForm.reason, clientFeedback: debriefForm.clientFeedback.trim(), lessons: debriefForm.lessons.trim(), by: debriefForm.by.trim(), date: todayISO() } })
                            setDebriefFor(null)
                            setDebriefForm({ reason: 'price', clientFeedback: '', lessons: '', by: '' })
                          }} className="px-2.5 py-1 rounded-md bg-brand text-white">Save debrief</button>
                          <button onClick={() => setDebriefFor(null)} className="px-2.5 py-1 rounded-md border text-gray-500">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setDebriefFor(r.id); setDebriefForm({ reason: 'price', clientFeedback: '', lessons: '', by: currentUserName || '' }) }} className="text-brand hover:underline font-medium">Record debrief</button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {r.status === 'preparing' && <button onClick={() => patch(r.id, { status: 'submitted' })} className="px-2.5 py-1 rounded-md border border-purple-300 text-purple-700 hover:bg-purple-50">Mark submitted</button>}
                  {r.status === 'submitted' && (<>
                    <button onClick={() => patch(r.id, { status: 'awarded' })} className="px-2.5 py-1 rounded-md border border-green-300 text-green-700 hover:bg-green-50">Awarded</button>
                    <button onClick={() => patch(r.id, { status: 'lost' })} className="px-2.5 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50">Lost</button>
                  </>)}
                  {r.status === 'awarded' && !r.projectId && <span className="text-gray-400 self-center">Create the delivery project from the won deal in Pipeline (LOA required).</span>}
                  {onRequestStaffing && r.status !== 'lost' && r.status !== 'declined' && (
                    <button onClick={() => setStaffFormFor(staffFormFor === r.id ? null : r.id)} className="px-2.5 py-1 rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand flex items-center gap-1">
                      <UserPlus size={12} /> Request staffing
                    </button>
                  )}
                  {staffFlash === r.id && <span className="text-green-700 self-center">✓ Sent to HR Staff planning</span>}
                </div>

                {staffFormFor === r.id && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 space-y-1.5">
                    <div className="text-[11px] font-semibold text-gray-500">Expected staffing if this is awarded — goes to HR's Staff planning intake</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="border rounded-md px-2 py-1 bg-white">
                        {DESIGNATIONS.map((d) => <option key={d.title}>{d.title}</option>)}
                      </select>
                      <label className="text-gray-500">× <input type="number" min="1" value={staffForm.count} onChange={(e) => setStaffForm({ ...staffForm, count: e.target.value })} className="w-14 border rounded-md px-1.5 py-1 text-right" /></label>
                      <label className="text-gray-500">needed by <input type="date" value={staffForm.neededBy} onChange={(e) => setStaffForm({ ...staffForm, neededBy: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
                      <input value={staffForm.note} onChange={(e) => setStaffForm({ ...staffForm, note: e.target.value })} placeholder="Note (e.g. site-based, specific experience)" className="flex-1 min-w-[160px] border rounded-md px-2 py-1" />
                      <button onClick={() => sendStaffing(r)} className="px-2.5 py-1 rounded-md bg-brand text-white">Send to HR</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
      {rows.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No RFPs match this filter.</div>}

      <p className="text-[11px] text-gray-400">
        Employers matching a CRM company link automatically; awarded RFPs point at their delivery project. "Repeated proposal from…" (copying a past RFP) and document attachments are Phase 2.
      </p>
      </>)}
    </div>
  )
}
