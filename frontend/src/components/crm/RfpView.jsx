import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, ChevronUp, ExternalLink, UserPlus } from 'lucide-react'
import { RFP_STATUSES, rfpStatusMeta, RFP_ENGAGEMENTS } from '../../data/rfpData'
import { PROJECT_TYPES, MAIN_FUNCTIONS, PROJECT_LOCATIONS, CONTRACT_TYPES } from '../../data/projectsData'
import { DESIGNATIONS } from '../../data/hrData'

// Proposals / RFP register (Batch 14) — the information from the current ERP's
// RFP form, redesigned: a scannable register with expandable rows and a compact
// add form, instead of a 30-field page. Awarded RFPs link to their delivery
// project; the win rate feeds Marketing analytics in Phase 2.

const todayISO = () => new Date().toISOString().slice(0, 10)

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
      id: Math.max(0, ...rfps.map((r) => r.id)) + 1,
      refNo: `RFP-2026-${String(Math.max(0, ...rfps.map((r) => Number(r.refNo.split('-')[2]) || 0)) + 1).padStart(3, '0')}`,
      ...form, shortName: form.shortName.trim() || form.name.slice(0, 40),
      goScore: Number(form.goScore) || null, winScore: Number(form.winScore) || null,
      companyId: company?.id ?? null, ownerType: '', ownerName: '', siteVisit: '',
      status: 'invited', dealId: null, projectId: null,
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
                <div className="flex flex-wrap gap-2 pt-1">
                  {r.status === 'invited' && (<>
                    <button onClick={() => patch(r.id, { status: 'preparing' })} className="px-2.5 py-1 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50">Go — start preparing</button>
                    <button onClick={() => patch(r.id, { status: 'declined' })} className="px-2.5 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50">No-bid</button>
                  </>)}
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
    </div>
  )
}
