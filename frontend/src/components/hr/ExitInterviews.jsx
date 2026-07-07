import { useState } from 'react'
import { UserMinus, Plus } from 'lucide-react'
import { EXIT_REASONS } from '../../data/hrTalentData'

// Exit-interview log + small analytics strip (reasons breakdown, average
// tenure of leavers, rehire-eligible %). HR workspace only.

const EMPTY_FORM = { employeeName: '', dept: '', lastWorkingDay: '', tenureYears: '', reason: EXIT_REASONS[0], destination: '', wouldRehire: true, notes: '' }

export default function ExitInterviews({ exits, onLog }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const reasonRows = EXIT_REASONS.map((r) => ({ label: r, value: exits.filter((e) => e.reason === r).length })).filter((r) => r.value > 0)
  const maxReason = Math.max(...reasonRows.map((r) => r.value), 1)
  const avgTenure = exits.length ? exits.reduce((s, e) => s + (Number(e.tenureYears) || 0), 0) / exits.length : 0
  const rehirePct = exits.length ? Math.round((exits.filter((e) => e.wouldRehire).length / exits.length) * 100) : 0

  const canSubmit = form.employeeName.trim() && form.lastWorkingDay && form.tenureYears !== ''

  const submit = () => {
    onLog({ ...form, employeeName: form.employeeName.trim(), tenureYears: Number(form.tenureYears) })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const input = (label, key, type = 'text', extra = {}) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...extra}
        className="w-full border border-gray-300 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><UserMinus size={15} className="text-brand" /> Exit interviews</h2>
          <p className="text-xs text-gray-500">Log the exit conversation for every leaver — the offboarding checklist prompts it, this is where the substance lives.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-dark flex items-center gap-1.5">
          <Plus size={13} /> Log exit interview
        </button>
      </div>

      {/* Analytics strip */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:col-span-1">
          <div className="text-xs text-gray-500 mb-2">Reasons for leaving</div>
          <div className="space-y-1.5">
            {reasonRows.map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-xs">
                <div className="w-24 shrink-0 text-gray-600 truncate">{r.label}</div>
                <div className="flex-1 h-3.5 bg-gray-50 rounded"><div className="h-3.5 bg-brand/70 rounded" style={{ width: `${(r.value / maxReason) * 100}%` }} /></div>
                <div className="w-5 text-right font-medium text-gray-700">{r.value}</div>
              </div>
            ))}
            {reasonRows.length === 0 && <div className="text-xs text-gray-400">No records yet.</div>}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-center">
          <div className="text-xs text-gray-500">Average tenure of leavers</div>
          <div className="text-2xl font-bold text-gray-800">{avgTenure.toFixed(1)} yrs</div>
          <div className="text-[11px] text-gray-400">across {exits.length} recorded exit{exits.length === 1 ? '' : 's'}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-center">
          <div className="text-xs text-gray-500">Rehire-eligible</div>
          <div className="text-2xl font-bold text-gray-800">{rehirePct}%</div>
          <div className="text-[11px] text-gray-400">left on terms we'd welcome back</div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {input('Employee name', 'employeeName')}
            {input('Department', 'dept')}
            {input('Last working day', 'lastWorkingDay', 'date')}
            {input('Tenure (years)', 'tenureYears', 'number', { step: '0.1', min: '0' })}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Primary reason</label>
              <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border border-gray-300 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                {EXIT_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            {input('Destination (where to)', 'destination')}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes / feedback</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.wouldRehire} onChange={(e) => setForm({ ...form, wouldRehire: e.target.checked })} className="accent-[#c81516]" />
            Would rehire
          </label>
          <div className="flex gap-2">
            <button disabled={!canSubmit} onClick={submit} className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark disabled:opacity-40">Save record</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
        {[...exits].sort((a, b) => b.lastWorkingDay.localeCompare(a.lastWorkingDay)).map((e) => (
          <div key={e.id} className="p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">{e.employeeName} <span className="text-gray-400 font-normal">· {e.dept}</span></div>
                <div className="text-xs text-gray-500 mt-0.5">{e.notes}</div>
                <div className="text-[11px] text-gray-400 mt-1">LWD {e.lastWorkingDay} · {e.tenureYears} yrs tenure{e.destination && ` · → ${e.destination}`}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{e.reason}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${e.wouldRehire ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{e.wouldRehire ? 'Would rehire' : 'Would not rehire'}</span>
              </div>
            </div>
          </div>
        ))}
        {exits.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No exit interviews logged yet.</div>}
      </div>
    </div>
  )
}
