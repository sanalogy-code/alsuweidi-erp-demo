import { useState } from 'react'
import { Search, Plus, ShieldCheck, Minus } from 'lucide-react'
import { SAFETY_CATEGORIES, SAFETY_SEVERITIES, SAFETY_OBS_STATUSES, safetyCategoryMeta, safetyObsStatusMeta } from '../../../data/pmData'

// Safety observation log (Batch 17): HSE observations on supervision phases,
// plus the monthly stat strip the 4.21 report's "safety statistics" checklist
// item references. LTI-free days is a manual counter for the demo.

const todayISO = () => new Date().toISOString().slice(0, 10)
const nextRef = (list) => `HSE-${String(list.reduce((m, o) => Math.max(m, parseInt((o.ref || '').replace(/\D/g, ''), 10) || 0), 0) + 1).padStart(3, '0')}`

export default function SafetyLogView({ phase, onUpdate, currentUserName }) {
  const obs = phase.safetyObservations || []
  const hse = phase.hse || { ltiFreeDays: 0 }
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: 'unsafe_condition', severity: 'Medium', description: '', action: '', observer: currentUserName || '' })

  const save = (patch) => onUpdate({ ...phase, ...patch })

  const create = () => {
    if (!form.description.trim()) return
    save({ safetyObservations: [{
      id: obs.reduce((m, o) => Math.max(m, o.id), 0) + 1, ref: nextRef(obs), date: todayISO(),
      observer: form.observer.trim() || currentUserName || 'Site team', category: form.category, severity: form.severity,
      description: form.description.trim(), action: form.action.trim() || null, status: 'open',
    }, ...obs] })
    setShowForm(false)
    setForm({ category: 'unsafe_condition', severity: 'Medium', description: '', action: '', observer: currentUserName || '' })
  }

  const closeObs = (o) => save({ safetyObservations: obs.map((x) => x.id === o.id ? { ...x, status: 'closed' } : x) })
  const bumpLti = (d) => save({ hse: { ...hse, ltiFreeDays: Math.max(0, (hse.ltiFreeDays || 0) + d) } })

  const month = todayISO().slice(0, 7)
  const monthObs = obs.filter((o) => (o.date || '').startsWith(month))
  const openCount = obs.filter((o) => o.status === 'open').length

  const filtered = obs.filter((o) =>
    (status === 'all' || o.status === status) &&
    (!q || `${o.ref} ${o.description} ${o.observer} ${o.action || ''}`.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><ShieldCheck size={15} className="text-gray-400" /> Safety observation log</h2>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-brand text-white"><Plus size={13} /> Log observation</button>
      </div>

      {/* Monthly HSE stat strip — feeds the 4.21 report's safety statistics item */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-center">
          <div className="text-lg font-semibold text-gray-800 tabular-nums">{monthObs.length}</div>
          <div className="text-[11px] text-gray-400">Observations this month</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-center">
          <div className={`text-lg font-semibold tabular-nums ${openCount ? 'text-red-600' : 'text-gray-800'}`}>{openCount}</div>
          <div className="text-[11px] text-gray-400">Open observations</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => bumpLti(-1)} className="text-gray-300 hover:text-gray-500"><Minus size={13} /></button>
            <div className="text-lg font-semibold text-green-600 tabular-nums">{hse.ltiFreeDays || 0}</div>
            <button onClick={() => bumpLti(1)} className="text-gray-300 hover:text-gray-500"><Plus size={13} /></button>
          </div>
          <div className="text-[11px] text-gray-400">LTI-free days (manual)</div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative">
          <Search size={13} className="absolute left-2 top-2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search observations…" className="pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-md w-48" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs border border-gray-300 rounded-md px-2 py-1.5">
          <option value="all">All statuses</option>
          {SAFETY_OBS_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="text-xs text-gray-600 space-y-1"><span className="font-medium">Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs">
                {SAFETY_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select></label>
            <label className="text-xs text-gray-600 space-y-1"><span className="font-medium">Severity</span>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs">
                {SAFETY_SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select></label>
            <label className="text-xs text-gray-600 space-y-1"><span className="font-medium">Observer</span>
              <input value={form.observer} onChange={(e) => setForm({ ...form, observer: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" /></label>
          </div>
          <label className="text-xs text-gray-600 space-y-1 block"><span className="font-medium">Description</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" /></label>
          <label className="text-xs text-gray-600 space-y-1 block"><span className="font-medium">Action taken (optional)</span>
            <input value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" /></label>
          <div className="flex gap-2">
            <button onClick={create} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white">Log {nextRef(obs)}</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {!filtered.length && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          {obs.length ? 'No observations match the current filters.' : 'No HSE observations yet — unsafe acts, unsafe conditions, and positive observations all belong here.'}
        </div>
      )}

      {filtered.map((o) => {
        const cm = safetyCategoryMeta(o.category)
        const sm = safetyObsStatusMeta(o.status)
        return (
          <div key={o.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-gray-500">{o.ref}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${cm.chip}`}>{cm.label}</span>
              <span className="text-[11px] text-gray-400">Severity: {o.severity}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ml-auto ${sm.chip}`}>{sm.label}</span>
              <span className="text-[11px] text-gray-400">{o.date}</span>
            </div>
            <p className="text-xs text-gray-700">{o.description}</p>
            <div className="text-[11px] text-gray-400">
              Observed by {o.observer}{o.action ? <> · Action: <span className="text-gray-500">{o.action}</span></> : ' · No action recorded yet'}
            </div>
            {o.status === 'open' && <button onClick={() => closeObs(o)} className="text-[11px] text-brand hover:underline">Mark closed</button>}
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">The monthly strip above feeds the “Safety &amp; environment statistics” item on the FIDIC 4.21 report checklist. Automated LTI tracking and incident workflows are Phase 2.</p>
    </div>
  )
}
