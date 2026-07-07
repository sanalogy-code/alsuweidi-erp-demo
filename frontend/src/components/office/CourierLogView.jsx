import { useState } from 'react'
import { Plus, ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react'
import { COURIER_COMPANIES, COURIER_STATUSES } from '../../data/officeData'

// Courier / dispatch log — the physical twin of the correspondence register:
// every package in or out with waybill, party, and an optional related ref
// (letter OUT-2026-NNN, project no, invoice…). Same register styling.

export default function CourierLogView({ entries, onChange }) {
  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ direction: 'out', date: new Date().toISOString().slice(0, 10), company: COURIER_COMPANIES[0], waybill: '', party: '', ref: '', contents: '' })

  const add = () => {
    if (!form.party.trim() || !form.contents.trim()) return
    onChange([{
      id: Math.max(0, ...entries.map((c) => c.id)) + 1,
      ...form, waybill: form.waybill.trim() || '—', ref: form.ref.trim() || null,
      status: form.direction === 'out' ? 'sent' : 'received',
      receivedBy: null,
    }, ...entries])
    setForm({ direction: 'out', date: new Date().toISOString().slice(0, 10), company: COURIER_COMPANIES[0], waybill: '', party: '', ref: '', contents: '' })
    setShowAdd(false)
  }

  const advance = (c) => {
    if (c.direction === 'out') {
      const next = c.status === 'sent' ? 'in_transit' : 'delivered'
      onChange(entries.map((x) => (x.id === c.id ? { ...x, status: next } : x)))
    }
  }

  const shown = entries
    .filter((c) => !direction || c.direction === direction)
    .filter((c) => {
      const q = search.trim().toLowerCase()
      return !q || c.waybill.toLowerCase().includes(q) || c.party.toLowerCase().includes(q) || (c.ref || '').toLowerCase().includes(q) || c.contents.toLowerCase().includes(q)
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Courier &amp; dispatch log</h2>
          <p className="text-xs text-gray-500">Physical packages in and out — waybills, parties, and the letter or project each one relates to.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
          <Plus size={13} /> Log dispatch
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search waybill, party, ref…" className="pl-6 pr-2 py-1.5 border border-gray-200 rounded-md w-56 bg-white" />
        </div>
        <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1.5 bg-white">
          <option value="">In + out</option><option value="in">Incoming</option><option value="out">Outgoing</option>
        </select>
        <span className="text-gray-400 ml-auto">{shown.length} of {entries.length}</span>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="flex gap-2">
            <button onClick={() => setForm({ ...form, direction: 'out' })} className={`px-2.5 py-1 rounded-md border ${form.direction === 'out' ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>Outgoing</button>
            <button onClick={() => setForm({ ...form, direction: 'in' })} className={`px-2.5 py-1 rounded-md border ${form.direction === 'in' ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>Incoming</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <select value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="border rounded-md px-2 py-1.5">
              {COURIER_COMPANIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input value={form.waybill} onChange={(e) => setForm({ ...form, waybill: e.target.value })} placeholder="Waybill no" className="border rounded-md px-2.5 py-1.5" />
            <input value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder={form.direction === 'out' ? 'To (party + address) *' : 'From (party) *'} className="border rounded-md px-2.5 py-1.5" />
            <input value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} placeholder="Related ref (OUT-2026-…, P-…, INV-…)" className="border rounded-md px-2.5 py-1.5" />
            <input value={form.contents} onChange={(e) => setForm({ ...form, contents: e.target.value })} placeholder="Contents *" className="border rounded-md px-2.5 py-1.5" />
            <label className="text-gray-500">Date <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 rounded-md bg-brand text-white">Log</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {shown.map((c) => {
          const meta = COURIER_STATUSES[c.status]
          return (
            <div key={c.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3 flex-wrap">
                {c.direction === 'in'
                  ? <ArrowDownLeft size={14} className="text-blue-500 shrink-0" />
                  : <ArrowUpRight size={14} className="text-gray-400 shrink-0" />}
                <span className="font-mono text-xs text-gray-500 w-28 shrink-0 truncate">{c.waybill}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-gray-800 truncate">{c.contents}</span>
                  <span className="text-xs text-gray-400">
                    {c.direction === 'in' ? 'From' : 'To'} {c.party} · {c.company}{c.ref ? ` · ref ${c.ref}` : ''}{c.receivedBy ? ` · received by ${c.receivedBy}` : ''}
                  </span>
                </span>
                <span className="text-xs text-gray-400 shrink-0">{c.date}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
                {c.direction === 'out' && (c.status === 'sent' || c.status === 'in_transit') && (
                  <button onClick={() => advance(c)} className="text-[11px] text-brand hover:underline shrink-0">
                    {c.status === 'sent' ? 'Mark in transit' : 'Mark delivered'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {shown.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No dispatches match these filters.</div>}
      </div>
    </div>
  )
}
