import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { wirStatusMeta, ncrStatusMeta, NCR_PRIORITIES } from '../../../data/pmData'

// Site-supervision field registers: WIR / MIR / NCR / site instructions / daily
// reports. WIR resubmissions stay under the same reference with rev history —
// approved WIRs are the verification basis for interim payment certificates.

const todayISO = () => new Date().toISOString().slice(0, 10)

const TABS = [
  { key: 'wir', label: 'WIRs' },
  { key: 'mir', label: 'MIRs' },
  { key: 'ncr', label: 'NCRs' },
  { key: 'si', label: 'Site instructions' },
  { key: 'daily', label: 'Daily reports' },
]

function WirRegister({ pm, onUpdate, rows }) {
  const [expanded, setExpanded] = useState(null)
  const decide = (w, status, remark) => {
    // The rev bumps when the CONTRACTOR RESUBMITS (resubmit → pending_re), matching
    // the button's "resubmits (Rev X)" promise — not at rejection time.
    const bumped = w.status === 'resubmit' && status === 'pending_re'
    const rev = bumped ? String.fromCharCode(w.rev.charCodeAt(0) + 1) : w.rev
    onUpdate({
      ...pm,
      wirs: pm.wirs.map((x) => x.id === w.id ? {
        ...x, status, rev,
        history: [...x.history, { rev, date: todayISO(), event: remark }],
      } : x),
    })
  }
  if (!pm.wirs.length) return <Empty label="No work inspection requests." />
  if (!rows.length) return <Empty label="No WIRs match the filters." />
  return (
    <div className="space-y-2">
      {rows.map((w) => {
        const meta = wirStatusMeta(w.status)
        const open = expanded === w.id
        return (
          <div key={w.id} className="bg-white rounded-lg border border-gray-200">
            <button onClick={() => setExpanded(open ? null : w.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <span className="font-mono text-xs text-gray-500 w-20 shrink-0">{w.ref}</span>
              <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{w.title}</span>
              <span className="hidden sm:block text-xs text-gray-400 w-28 truncate">{w.location}</span>
              <span className="text-xs font-semibold text-gray-500 w-12 text-right">Rev {w.rev}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
              {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {open && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3 text-xs text-gray-600">
                <div className="flex flex-wrap gap-4">
                  <span>Drawing: <span className="font-mono text-gray-700">{w.drawingRef}</span></span>
                  <span>Inspection requested for: <span className="text-gray-700">{w.requestedFor}</span></span>
                </div>
                {w.remarks && <p className="text-gray-500">{w.remarks}</p>}
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">History</div>
                  {w.history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="font-semibold w-10">Rev {h.rev}</span>
                      <span className="text-gray-400 w-20">{h.date}</span>
                      <span>{h.event}</span>
                    </div>
                  ))}
                </div>
                {w.status === 'pending_re' && (
                  <button onClick={() => decide(w, 'pending_trade', 'RE review complete — passed to trade engineer')} className="px-2.5 py-1 rounded-md border border-gray-300 text-gray-700 hover:border-brand hover:text-brand transition">
                    RE review done → trade engineer
                  </button>
                )}
                {(w.status === 'pending_trade' || w.status === 'resubmit') && (
                  <div className="flex flex-wrap gap-2">
                    {w.status === 'resubmit' && (
                      <button onClick={() => decide(w, 'pending_re', 'Contractor resubmitted')} className="px-2.5 py-1 rounded-md border border-gray-300 text-gray-700 hover:border-brand hover:text-brand transition">Contractor resubmits (Rev {String.fromCharCode(w.rev.charCodeAt(0) + 1)})</button>
                    )}
                    {w.status === 'pending_trade' && (<>
                      <button onClick={() => decide(w, 'approved', 'Approved')} className="px-2.5 py-1 rounded-md border border-green-300 text-green-700 hover:bg-green-50 transition">Approve</button>
                      <button onClick={() => decide(w, 'approved_as_noted', 'Approved as noted')} className="px-2.5 py-1 rounded-md border border-teal-300 text-teal-700 hover:bg-teal-50 transition">Approve as noted</button>
                      <button onClick={() => decide(w, 'resubmit', 'Rejected — resubmission required')} className="px-2.5 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition">Reject / resubmit</button>
                    </>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">Lifecycle: contractor submits → Resident Engineer → trade engineer → Approved / Approved as noted / Resubmit (same WIR, rev history preserved). Approved WIRs back the interim payment certificates — IPC linkage is a Phase 2 wiring item.</p>
    </div>
  )
}

function MirRegister({ pm, onUpdate, rows }) {
  if (!pm.mirs.length) return <Empty label="No material inspection requests." />
  if (!rows.length) return <Empty label="No MIRs match the filters." />
  const decide = (m, status) => onUpdate({ ...pm, mirs: pm.mirs.map((x) => x.id === m.id ? { ...x, status } : x) })
  return (
    <div className="space-y-2">
      {rows.map((m) => {
        const meta = wirStatusMeta(m.status)
        return (
          <div key={m.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <span className="font-mono text-xs text-gray-500 w-20 shrink-0">{m.ref}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-800 truncate">{m.title}</div>
              <div className="text-xs text-gray-400 truncate">{m.supplier} · delivered {m.deliveryDate}{m.remarks ? ` · ${m.remarks}` : ''}</div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
            {m.status === 'pending_re' && (
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => decide(m, 'approved')} className="px-2 py-1 text-xs rounded-md border border-green-300 text-green-700 hover:bg-green-50">Approve</button>
                <button onClick={() => decide(m, 'resubmit')} className="px-2 py-1 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50">Reject</button>
              </div>
            )}
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">Verification against delivered materials; approved MIRs support materials-on-site certification.</p>
    </div>
  )
}

function NcrRegister({ pm, onUpdate, rows }) {
  const [caDraft, setCaDraft] = useState({})
  const update = (n, patch) => onUpdate({ ...pm, ncrs: pm.ncrs.map((x) => x.id === n.id ? { ...x, ...patch } : x) })
  if (!pm.ncrs.length) return <Empty label="No non-conformance reports. Long may it last." />
  if (!rows.length) return <Empty label="No NCRs match the filters." />
  return (
    <div className="space-y-2">
      {rows.map((n) => {
        const meta = ncrStatusMeta(n.status)
        return (
          <div key={n.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-500 w-16 shrink-0">{n.ref}</span>
              <span className="flex-1 min-w-0 text-sm text-gray-800">{n.description}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${n.priority === 'High' ? 'bg-red-100 text-red-700' : n.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{n.priority}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
            </div>
            <div className="text-xs text-gray-400 pl-16 ml-3">Raised {n.date} by {n.raisedBy} · {n.location}{n.closedDate ? ` · closed ${n.closedDate}` : ''}</div>
            {n.correctiveAction && <div className="text-xs text-gray-600 pl-16 ml-3">Corrective action: {n.correctiveAction}</div>}
            <div className="pl-16 ml-3 flex flex-wrap gap-2">
              {n.status === 'open' && (
                <div className="flex gap-2 w-full max-w-xl">
                  <input value={caDraft[n.id] || ''} onChange={(e) => setCaDraft({ ...caDraft, [n.id]: e.target.value })} placeholder="Proposed corrective action…" className="flex-1 border rounded-md px-2 py-1 text-xs" />
                  <button disabled={!(caDraft[n.id] || '').trim()} onClick={() => update(n, { status: 'ca_proposed', correctiveAction: caDraft[n.id] })} className="px-2.5 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:border-brand hover:text-brand disabled:opacity-40">Propose CA</button>
                </div>
              )}
              {n.status === 'ca_proposed' && (
                <button onClick={() => update(n, { status: 'ca_approved' })} className="px-2.5 py-1 text-xs rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50">Approve corrective action</button>
              )}
              {n.status === 'ca_approved' && (
                <button onClick={() => update(n, { status: 'closed', closedDate: todayISO() })} className="px-2.5 py-1 text-xs rounded-md border border-green-300 text-green-700 hover:bg-green-50">Verify & close</button>
              )}
            </div>
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">Closure requires a formally approved corrective action first — the workflow enforces it.</p>
    </div>
  )
}

function SiRegister({ pm, onUpdate, rows }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ subject: '', costImpact: false, timeImpact: false })
  if (!pm.siteInstructions.length && !showAdd) return (
    <div className="space-y-2">
      <Empty label="No site instructions issued." />
      <button onClick={() => setShowAdd(true)} className="text-xs font-medium text-brand hover:underline">+ Issue instruction</button>
    </div>
  )
  const add = () => {
    if (!form.subject.trim()) return
    const nextNo = Math.max(0, ...pm.siteInstructions.map((s) => parseInt(s.ref.split('-')[1], 10) || 0)) + 1
    onUpdate({ ...pm, siteInstructions: [...pm.siteInstructions, { id: Math.max(0, ...pm.siteInstructions.map((s) => s.id)) + 1, ref: `SI-${String(nextNo).padStart(3, '0')}`, date: todayISO(), status: 'issued', ...form }] })
    setForm({ subject: '', costImpact: false, timeImpact: false }); setShowAdd(false)
  }
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd((v) => !v)} className="text-xs font-medium text-brand hover:underline">+ Issue instruction</button>
      </div>
      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap items-center gap-3 text-xs">
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Instruction subject…" className="flex-1 min-w-[200px] border rounded-md px-2 py-1.5" />
          <label className="flex items-center gap-1 text-gray-600"><input type="checkbox" checked={form.costImpact} onChange={(e) => setForm({ ...form, costImpact: e.target.checked })} /> Cost impact</label>
          <label className="flex items-center gap-1 text-gray-600"><input type="checkbox" checked={form.timeImpact} onChange={(e) => setForm({ ...form, timeImpact: e.target.checked })} /> Time impact</label>
          <button onClick={add} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Issue</button>
        </div>
      )}
      {pm.siteInstructions.length > 0 && rows.length === 0 && <Empty label="No site instructions match the filters." />}
      {rows.map((s) => (
        <div key={s.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
          <span className="font-mono text-xs text-gray-500 w-16 shrink-0">{s.ref}</span>
          <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{s.subject}</span>
          <span className="text-xs text-gray-400 w-20 text-right shrink-0">{s.date}</span>
          {s.costImpact && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">Cost</span>}
          {s.timeImpact && <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">Time</span>}
          <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${s.status === 'actioned' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{s.status === 'actioned' ? 'Actioned' : 'Issued'}</span>
          {s.status !== 'actioned' && (
            <button onClick={() => onUpdate({ ...pm, siteInstructions: pm.siteInstructions.map((x) => x.id === s.id ? { ...x, status: 'actioned' } : x) })} className="text-xs text-brand hover:underline shrink-0">Mark actioned</button>
          )}
        </div>
      ))}
      <p className="text-[11px] text-gray-400">Instructions flagged for cost/time impact feed the variations and claims registers.</p>
    </div>
  )
}

function DailyLog({ pm, rows }) {
  if (!pm.dailyReports.length) return <Empty label="No daily reports logged." />
  if (!rows.length) return <Empty label="No daily reports match the filters." />
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-800">{r.date}</span>
            <span className="text-gray-400">Manpower {r.manpower} · {r.weather}</span>
          </div>
          <div><span className="text-gray-400">Work:</span> {r.workDone}</div>
          <div><span className="text-gray-400">Plant:</span> {r.plant}</div>
          <div className="flex flex-wrap gap-4">
            <span><span className="text-gray-400">Delays:</span> {r.delays}</span>
            <span><span className="text-gray-400">HSE:</span> {r.hse}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const Empty = ({ label }) => (
  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">{label}</div>
)

export default function SiteView({ pm, onUpdate }) {
  const [tab, setTab] = useState('wir')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [range, setRange] = useState({ from: '', to: '' })
  const switchTab = (k) => { setTab(k); setStatusFilter('all') }

  // Shared filter row config per register: display rows only — updates still go through the full pm lists.
  const cfg = {
    wir: { rows: pm.wirs, dateField: 'requestedFor', text: ['ref', 'title', 'location'] },
    mir: { rows: pm.mirs, dateField: 'deliveryDate', text: ['ref', 'title', 'supplier'] },
    ncr: { rows: pm.ncrs, dateField: 'date', text: ['ref', 'description', 'location'] },
    si: { rows: pm.siteInstructions, dateField: 'date', text: ['ref', 'subject'] },
    daily: { rows: pm.dailyReports, dateField: 'date', text: ['workDone', 'plant'], noStatus: true },
  }[tab]
  const statuses = cfg.noStatus ? [] : [...new Set(cfg.rows.map((r) => r.status))]
  const statusLabel = (s) => tab === 'ncr' ? ncrStatusMeta(s).label : (tab === 'wir' || tab === 'mir') ? wirStatusMeta(s).label : s
  const filtered = cfg.rows
    .filter((r) => cfg.noStatus || statusFilter === 'all' || r.status === statusFilter)
    .filter((r) => (!range.from || (r[cfg.dateField] || '') >= range.from) && (!range.to || (r[cfg.dateField] || '') <= range.to))
    .filter((r) => { const q = search.trim().toLowerCase(); return !q || cfg.text.some((f) => (r[f] || '').toLowerCase().includes(q)) })

  const counts = {
    wir: pm.wirs.filter((w) => w.status !== 'approved' && w.status !== 'approved_as_noted').length,
    mir: pm.mirs.filter((m) => m.status === 'pending_re').length,
    ncr: pm.ncrs.filter((n) => n.status !== 'closed').length,
    si: pm.siteInstructions.filter((s) => s.status !== 'actioned').length,
    daily: 0,
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => switchTab(t.key)} className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === t.key ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}{counts[t.key] > 0 && <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">{counts[t.key]}</span>}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search register…" className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white w-52" />
        <label className="text-xs text-gray-500">From</label>
        <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white" />
        <label className="text-xs text-gray-500">To</label>
        <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white" />
        {!cfg.noStatus && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
            <option value="all">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        )}
      </div>
      {tab === 'wir' && <WirRegister pm={pm} onUpdate={onUpdate} rows={filtered} />}
      {tab === 'mir' && <MirRegister pm={pm} onUpdate={onUpdate} rows={filtered} />}
      {tab === 'ncr' && <NcrRegister pm={pm} onUpdate={onUpdate} rows={filtered} />}
      {tab === 'si' && <SiRegister pm={pm} onUpdate={onUpdate} rows={filtered} />}
      {tab === 'daily' && <DailyLog pm={pm} rows={filtered} />}
    </div>
  )
}
