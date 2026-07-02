import { useState } from 'react'
import { CalendarDays, Check, Pencil, Plus } from 'lucide-react'

const fmtRange = (h) => {
  const opts = { day: 'numeric', month: 'short' }
  const start = new Date(h.date).toLocaleDateString('en-GB', opts)
  if (!h.endDate) return start
  return `${start} – ${new Date(h.endDate).toLocaleDateString('en-GB', opts)}`
}

const EMPTY_FORM = { name: '', date: '', endDate: '', note: '' }

export default function HolidaysTab({ holidays, onUpdateHolidays }) {
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [adding, setAdding] = useState(false)

  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date))
  const year = new Date().getFullYear()

  const startEdit = (h) => {
    setEditingId(h.id)
    setAdding(false)
    setForm({ name: h.name, date: h.date, endDate: h.endDate || '', note: h.note || '' })
  }

  const saveEdit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.date) return
    onUpdateHolidays(holidays.map((h) => (h.id === editingId
      ? { ...h, name: form.name.trim(), date: form.date, endDate: form.endDate || null, note: form.note.trim() }
      : h)))
    setEditingId(null)
  }

  const saveNew = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.date) return
    onUpdateHolidays([...holidays, {
      id: Math.max(...holidays.map((h) => h.id), 0) + 1,
      name: form.name.trim(),
      date: form.date,
      endDate: form.endDate || null,
      note: form.note.trim(),
      status: 'approved',
    }])
    setAdding(false)
    setForm(EMPTY_FORM)
  }

  const approve = (id) => onUpdateHolidays(holidays.map((h) => (h.id === id ? { ...h, status: 'approved' } : h)))

  const formFields = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit} className="grid grid-cols-5 gap-2 items-end bg-blue-50 border border-blue-200 rounded-md p-3">
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
        <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">To (optional)</label>
        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
      </div>
      <div className="flex gap-1">
        <button type="submit" className="flex-1 bg-brand text-white py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark">{submitLabel}</button>
        <button type="button" onClick={() => { setEditingId(null); setAdding(false) }} className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-md text-xs font-medium hover:bg-gray-200">Cancel</button>
      </div>
      <div className="col-span-5">
        <input placeholder="Note (e.g. subject to moon sighting)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand" />
      </div>
    </form>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><CalendarDays size={15} className="text-brand" /> Public Holidays {year}</h2>
          <p className="text-xs text-gray-500">Approved holidays appear automatically on every employee's home dashboard. Islamic dates stay pending until confirmed by moon sighting.</p>
        </div>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditingId(null); setForm(EMPTY_FORM) }}
            className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1 shrink-0"
          >
            <Plus size={13} /> Add Holiday
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {sorted.map((h) => {
          const past = new Date(h.endDate || h.date) < new Date()
          return (
            <div key={h.id} className={`px-4 py-3 ${past ? 'opacity-50' : ''}`}>
              {editingId === h.id ? formFields(saveEdit, 'Save') : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-24 shrink-0 text-sm font-semibold text-gray-800">{fmtRange(h)}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{h.name}</div>
                      {h.note && <div className="text-xs text-gray-500 truncate">{h.note}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${h.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {h.status === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                    {h.status !== 'approved' && (
                      <button onClick={() => approve(h.id)} className="flex items-center gap-1 text-xs font-medium text-green-700 hover:underline">
                        <Check size={13} /> Approve
                      </button>
                    )}
                    <button onClick={() => startEdit(h)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {adding && <div className="px-4 py-3">{formFields(saveNew, 'Add')}</div>}
      </div>
    </div>
  )
}
