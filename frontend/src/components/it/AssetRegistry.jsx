import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ASSET_TYPES, ASSET_STATUS } from '../../data/itData'

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export default function AssetRegistry({ assets, employees, onAdd, onUpdate }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ type: ASSET_TYPES[0], model: '', serial: '', purchaseDate: '', valueAed: '', assignedToId: '', notes: '' })
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const empName = (id) => employees.find((e) => e.id === id)?.name || '—'
  const rows = assets
    .filter((a) => statusFilter === 'all' || a.status === statusFilter)
    .filter((a) => {
      const q = search.trim().toLowerCase()
      return !q || [a.tag, a.type, a.model, a.serial, a.assignedToId ? empName(a.assignedToId) : ''].some((f) => (f || '').toLowerCase().includes(q))
    })
  const totalValue = assets.filter((a) => a.status !== 'retired').reduce((s, a) => s + (a.valueAed || 0), 0)

  const nextTag = `IT-${String(Math.max(...assets.map((a) => Number(a.tag.replace('IT-', '')) || 0)) + 1).padStart(4, '0')}`

  const submit = (e) => {
    e.preventDefault()
    if (!form.model.trim()) return
    onAdd({
      tag: nextTag,
      type: form.type,
      model: form.model.trim(),
      serial: form.serial.trim() || null,
      purchaseDate: form.purchaseDate || null,
      valueAed: Number(form.valueAed) || 0,
      assignedToId: form.assignedToId ? Number(form.assignedToId) : null,
      status: form.assignedToId ? 'in_use' : 'in_stock',
      notes: form.notes.trim() || null,
    })
    setForm({ type: ASSET_TYPES[0], model: '', serial: '', purchaseDate: '', valueAed: '', assignedToId: '', notes: '' })
    setAdding(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-start gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Asset registry ({assets.length})</h2>
          <p className="text-xs text-gray-500">
            Active book value AED {totalValue.toLocaleString()}. Offboarding's equipment-return step checks this list.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tag, model, person…" className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white w-52 focus:outline-none focus:ring-1 focus:ring-brand" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand">
            <option value="all">All statuses</option>
            {Object.entries(ASSET_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {!adding && (
            <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand-dark transition">
              <Plus size={13} /> Add asset
            </button>
          )}
        </div>
      </div>

      {adding && (
        <form onSubmit={submit} className="p-4 border-b border-gray-200 bg-blue-50/50 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Model *</label><input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Serial</label><input value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Purchase date</label><input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Value (AED)</label><input type="number" min="0" value={form.valueAed} onChange={(e) => setForm({ ...form, valueAed: e.target.value })} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Assign to</label>
              <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className={inputCls}>
                <option value="">Keep in stock</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className={labelCls}>Notes</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} /></div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark">Register {nextTag}</button>
            <button type="button" onClick={() => setAdding(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Tag</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Asset</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Serial</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Assigned to</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Value</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-gray-100">
                <td className="px-4 py-2 font-medium text-gray-800">{a.tag}</td>
                <td className="px-4 py-2 text-gray-700">
                  {a.model}
                  <div className="text-xs text-gray-400">{a.type}{a.purchaseDate && ` • bought ${a.purchaseDate}`}</div>
                  {a.notes && <div className="text-xs text-gray-500">{a.notes}</div>}
                </td>
                <td className="px-4 py-2 text-gray-600 text-xs">{a.serial || '—'}</td>
                <td className="px-4 py-2 text-gray-700">
                  <select
                    value={a.assignedToId ?? ''}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null
                      onUpdate({ ...a, assignedToId: id, status: id ? 'in_use' : a.status === 'in_use' ? 'in_stock' : a.status })
                    }}
                    className="border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand max-w-[150px]"
                  >
                    <option value="">— unassigned —</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2 text-right text-gray-600">{a.valueAed ? a.valueAed.toLocaleString() : '—'}</td>
                <td className="px-4 py-2">
                  <select
                    value={a.status}
                    onChange={(e) => onUpdate({ ...a, status: e.target.value, assignedToId: e.target.value === 'in_use' ? a.assignedToId : null })}
                    className={`rounded px-1.5 py-1 text-xs font-medium border-0 focus:outline-none focus:ring-1 focus:ring-brand ${ASSET_STATUS[a.status].chip}`}
                  >
                    {Object.entries(ASSET_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">No assets match</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
