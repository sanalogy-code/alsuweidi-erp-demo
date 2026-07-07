import { useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import { parseLocalDate, todayLocal } from '../../utils/date'

// Software licenses — seats and renewal dates. Same radar idea as HR's renewals:
// anything within 60 days is flagged, overdue is red.

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export default function LicensesView({ licenses, onAdd }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', owner: '', seats: '', seatsUsed: '', costAedYearly: '', renewalDate: '' })
  const [search, setSearch] = useState('')

  const daysTo = (d) => Math.ceil((parseLocalDate(d) - todayLocal()) / (1000 * 60 * 60 * 24))
  const rows = [...licenses]
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
    .filter((l) => {
      const q = search.trim().toLowerCase()
      return !q || (l.name || '').toLowerCase().includes(q) || (l.owner || '').toLowerCase().includes(q)
    })
  const totalYearly = licenses.reduce((s, l) => s + (l.costAedYearly || 0), 0)
  const dueSoon = rows.filter((l) => daysTo(l.renewalDate) <= 60)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.renewalDate) return
    onAdd({
      name: form.name.trim(),
      owner: form.owner.trim() || '—',
      seats: Number(form.seats) || 1,
      seatsUsed: Number(form.seatsUsed) || 0,
      costAedYearly: Number(form.costAedYearly) || 0,
      renewalDate: form.renewalDate,
    })
    setForm({ name: '', owner: '', seats: '', seatsUsed: '', costAedYearly: '', renewalDate: '' })
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      {dueSoon.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
            <AlertTriangle size={16} className="text-amber-600" /> {dueSoon.length} renewal{dueSoon.length > 1 ? 's' : ''} within 60 days
          </div>
          <div className="text-xs text-gray-500">Lapsed design software stops the drawing office — renew before expiry, not after.</div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-start gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Software licenses ({licenses.length})</h2>
            <p className="text-xs text-gray-500">Total AED {totalYearly.toLocaleString()} / year across all subscriptions.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, owner…" className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white w-52 focus:outline-none focus:ring-1 focus:ring-brand" />
            {!adding && (
              <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand-dark transition">
                <Plus size={13} /> Add license
              </button>
            )}
          </div>
        </div>

        {adding && (
          <form onSubmit={submit} className="p-4 border-b border-gray-200 bg-blue-50/50 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Vendor / owner</label><input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Seats total *</label><input type="number" min="1" required value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Seats used</label><input type="number" min="0" value={form.seatsUsed} onChange={(e) => setForm({ ...form, seatsUsed: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Cost / yr (AED)</label><input type="number" min="0" value={form.costAedYearly} onChange={(e) => setForm({ ...form, costAedYearly: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Renewal date *</label><input type="date" required value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} className={inputCls} /></div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark">Add license</button>
              <button type="button" onClick={() => setAdding(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">License</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Owner</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Seats</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Cost / yr</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Renewal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const days = daysTo(l.renewalDate)
                const seatsFull = l.seatsUsed >= l.seats
                return (
                  <tr key={l.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 font-medium text-gray-800">{l.name}</td>
                    <td className="px-4 py-2 text-gray-600">{l.owner}</td>
                    <td className="px-4 py-2">
                      <span className={seatsFull ? 'text-amber-700 font-medium' : 'text-gray-600'}>
                        {l.seatsUsed} / {l.seats}{seatsFull && ' — full'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">{l.costAedYearly.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={days < 0 ? 'text-red-600 font-medium' : days <= 60 ? 'text-amber-700 font-medium' : 'text-gray-600'}>
                        {l.renewalDate}
                        {days < 0 ? ` — ${-days}d overdue` : days <= 60 ? ` — in ${days}d` : ''}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">No licenses match</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
