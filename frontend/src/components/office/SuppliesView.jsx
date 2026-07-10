import { useState } from 'react'
import { Plus } from 'lucide-react'
import { SUPPLY_STATUSES } from '../../data/officeData'
import { todayISO } from '../../utils/date'
import { nextId } from '../../utils/id'

// Office supplies request register — requested → ordered → delivered, or
// declined with a note. Admin staff fulfil; everyone-can-request lands with
// the notifications/home phase (module is admin-staff-gated for now).

export default function SuppliesView({ requests, onChange, user }) {
  const [status, setStatus] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ item: '', qty: 1, requestedBy: user?.name || '', neededBy: '', note: '' })

  const add = () => {
    if (!form.item.trim() || !form.requestedBy.trim()) return
    onChange([{
      id: nextId(requests),
      ...form, qty: Number(form.qty) || 1, neededBy: form.neededBy || null, note: form.note.trim() || null,
      requestedDate: todayISO(), status: 'requested',
    }, ...requests])
    setForm({ item: '', qty: 1, requestedBy: user?.name || '', neededBy: '', note: '' })
    setShowAdd(false)
  }

  const setReqStatus = (id, s, note) => onChange(requests.map((r) => (r.id === id ? { ...r, status: s, note: note ?? r.note } : r)))

  const shown = requests.filter((r) => !status || r.status === status)
  const open = requests.filter((r) => r.status === 'requested' || r.status === 'ordered').length

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Office supplies</h2>
          <p className="text-xs text-gray-500">Request register — {open} open. Admin staff order and mark delivery.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
          <Plus size={13} /> New request
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1.5 bg-white">
          <option value="">All statuses</option>
          {Object.entries(SUPPLY_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="text-gray-400 ml-auto">{shown.length} of {requests.length}</span>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-2 gap-2">
            <input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="Item *" className="border rounded-md px-2.5 py-1.5" />
            <div className="flex gap-2">
              <label className="text-gray-500 w-24">Qty <input type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>
              <label className="text-gray-500 flex-1">Needed by <input type="date" value={form.neededBy} onChange={(e) => setForm({ ...form, neededBy: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>
            </div>
            <input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} placeholder="Requested by *" className="border rounded-md px-2.5 py-1.5" />
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note (optional)" className="border rounded-md px-2.5 py-1.5" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 rounded-md bg-brand text-white">Submit</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {shown.map((r) => {
          const meta = SUPPLY_STATUSES[r.status]
          return (
            <div key={r.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-gray-800 truncate">{r.item} <span className="text-gray-400">× {r.qty}</span></span>
                  <span className="text-xs text-gray-400">
                    {r.requestedBy} · {r.requestedDate}{r.neededBy ? ` · needed by ${r.neededBy}` : ''}{r.note ? ` · ${r.note}` : ''}
                  </span>
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
                {r.status === 'requested' && (
                  <span className="flex gap-2 shrink-0">
                    <button onClick={() => setReqStatus(r.id, 'ordered')} className="text-[11px] text-brand hover:underline">Mark ordered</button>
                    <button onClick={() => setReqStatus(r.id, 'declined')} className="text-[11px] text-red-500 hover:underline">Decline</button>
                  </span>
                )}
                {r.status === 'ordered' && (
                  <button onClick={() => setReqStatus(r.id, 'delivered')} className="text-[11px] text-green-600 hover:underline shrink-0">Mark delivered</button>
                )}
              </div>
            </div>
          )
        })}
        {shown.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No supply requests match this filter.</div>}
      </div>
    </div>
  )
}
