import { useState } from 'react'
import { Plus, ShieldCheck } from 'lucide-react'
import { PERMISSION_MODULES, ACCESS_LEVELS, DEFAULT_PERMISSIONS } from '../../data/adminData'
import { ROLES } from '../../data/dashboardData'

// Access-request workflow — tied to the Admin Center's role × module matrix.
// Requesters ask for a level on a module; IT/admin approve or decline with the
// requester's current default access shown for context. Approval is a RECORD
// only in this demo: actual enforcement is the Phase 2 auth backend.

const STATUS = {
  pending: { label: 'Pending', chip: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', chip: 'bg-green-100 text-green-700' },
  declined: { label: 'Declined', chip: 'bg-red-100 text-red-700' },
}

export default function AccessRequestsView({ requests, onChange, user }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ requestedBy: user?.name || '', role: ROLES[0].value, module: PERMISSION_MODULES[0].key, level: 'view', justification: '' })

  const moduleLabel = (k) => PERMISSION_MODULES.find((m) => m.key === k)?.label || k
  const levelLabel = (k) => ACCESS_LEVELS.find((l) => l.key === k)?.label || k
  const roleLabel = (v) => ROLES.find((r) => r.value === v)?.label || v
  const currentAccess = (role, module) => DEFAULT_PERMISSIONS[role]?.[module] || 'none'

  const add = () => {
    if (!form.requestedBy.trim() || !form.justification.trim()) return
    onChange([{
      id: Math.max(0, ...requests.map((r) => r.id)) + 1,
      ...form, requestedDate: new Date().toISOString().slice(0, 10),
      status: 'pending', decidedBy: null, decidedDate: null, decisionNote: null,
    }, ...requests])
    setForm({ requestedBy: user?.name || '', role: ROLES[0].value, module: PERMISSION_MODULES[0].key, level: 'view', justification: '' })
    setShowAdd(false)
  }

  const decide = (r, status) => {
    const note = window.prompt(status === 'approved' ? 'Approval note (optional)' : 'Reason for declining?')
    if (status === 'declined' && note === null) return
    onChange(requests.map((x) => (x.id === r.id ? {
      ...x, status, decidedBy: user?.name || 'IT', decidedDate: new Date().toISOString().slice(0, 10), decisionNote: note || null,
    } : x)))
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const handled = requests.filter((r) => r.status !== 'pending')

  const card = (r, actions) => {
    const meta = STATUS[r.status]
    const cur = currentAccess(r.role, r.module)
    return (
      <div key={r.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex-1 min-w-0">
            <span className="block text-sm text-gray-800">
              {moduleLabel(r.module)} — <span className="font-semibold">{levelLabel(r.level)}</span> access
            </span>
            <span className="text-xs text-gray-400 block truncate">
              {r.requestedBy} ({roleLabel(r.role)}) · currently: {levelLabel(cur)} · {r.requestedDate}
            </span>
            <span className="text-xs text-gray-500 block">{r.justification}</span>
            {r.decisionNote && <span className="text-[11px] text-gray-400 block italic">{r.decidedBy}: {r.decisionNote}</span>}
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
          {actions && (
            <span className="flex gap-2 shrink-0">
              <button onClick={() => decide(r, 'approved')} className="text-[11px] text-green-600 hover:underline">Approve</button>
              <button onClick={() => decide(r, 'declined')} className="text-[11px] text-red-500 hover:underline">Decline</button>
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Access requests</h2>
          <p className="text-xs text-gray-500">Requests against the role × module matrix (see Admin Center → Permissions). {pending.length} awaiting decision.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
          <Plus size={13} /> Request access
        </button>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-700 flex items-start gap-2">
        <ShieldCheck size={13} className="shrink-0 mt-0.5" />
        <span>Approval here is a record only — permissions are not actually changed. Enforcement wires up with the Phase 2 auth backend, using this queue as its input.</span>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-2 gap-2">
            <input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} placeholder="Requested by *" className="border rounded-md px-2.5 py-1.5" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border rounded-md px-2 py-1.5">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className="border rounded-md px-2 py-1.5">
              {PERMISSION_MODULES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="border rounded-md px-2 py-1.5">
              <option value="view">View</option><option value="full">Full</option>
            </select>
            <input value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} placeholder="Justification *" className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
          </div>
          <p className="text-gray-400">
            Current default for {roleLabel(form.role)} on {moduleLabel(form.module)}: <span className="font-semibold text-gray-600">{levelLabel(currentAccess(form.role, form.module))}</span>
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 rounded-md bg-brand text-white">Submit</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {pending.map((r) => card(r, true))}
        {pending.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">No pending access requests.</div>}
      </div>

      {handled.length > 0 && (
        <>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pt-2">Decided</div>
          <div className="space-y-2">{handled.map((r) => card(r, false))}</div>
        </>
      )}
    </div>
  )
}
