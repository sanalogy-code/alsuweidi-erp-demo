import { useState } from 'react'
import { Ticket, Plus } from 'lucide-react'
import { EVENT_TYPES, EVENT_STATUSES } from '../../data/marketingData'

// Event / exhibition tracker — the register of exhibitions, conferences and
// client events, with budget and outcomes (leads count + note) after the fact.
export default function EventsView({ events, onUpdate }) {
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', dates: '', venue: '', type: EVENT_TYPES[0], owner: '', budget: '', status: 'planned' })
  const [outcomeFor, setOutcomeFor] = useState(null)
  const [outcomeForm, setOutcomeForm] = useState({ outcomes: '', leadsCount: 0 })

  const add = () => {
    if (!form.name.trim()) return
    onUpdate([...events, {
      ...form, name: form.name.trim(), venue: form.venue.trim(), owner: form.owner.trim() || 'Marketing',
      budget: Number(form.budget) || 0, outcomes: '', leadsCount: 0,
      id: Math.max(0, ...events.map((e) => e.id)) + 1,
    }])
    setForm({ name: '', dates: '', venue: '', type: EVENT_TYPES[0], owner: '', budget: '', status: 'planned' })
    setShowAdd(false)
  }

  const patch = (id, changes) => onUpdate(events.map((e) => (e.id === id ? { ...e, ...changes } : e)))

  const saveOutcome = (id) => {
    patch(id, { outcomes: outcomeForm.outcomes.trim(), leadsCount: Number(outcomeForm.leadsCount) || 0, status: 'attended' })
    setOutcomeFor(null)
  }

  const rows = events.filter((e) => !statusFilter || e.status === statusFilter)
  const committed = events.filter((e) => e.status !== 'skipped').reduce((s, e) => s + (e.budget || 0), 0)
  const totalLeads = events.reduce((s, e) => s + (e.leadsCount || 0), 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Ticket size={15} className="text-brand" /> Events & exhibitions</h2>
          <p className="text-xs text-gray-500">{events.length} tracked · {committed.toLocaleString()} AED committed · {totalLeads} leads captured</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Add event</button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button onClick={() => setStatusFilter('')} className={`px-2.5 py-1 rounded-full text-[11px] border transition ${!statusFilter ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>All</button>
        {Object.entries(EVENT_STATUSES).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(statusFilter === k ? '' : k)}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition ${statusFilter === k ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-2 gap-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Event name *" className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
            <input value={form.dates} onChange={(e) => setForm({ ...form, dates: e.target.value })} placeholder="Date(s), e.g. 2026-09-14 → 2026-09-16" className="border rounded-md px-2.5 py-1.5" />
            <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue / city" className="border rounded-md px-2.5 py-1.5" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border rounded-md px-2 py-1.5">{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Owner (default Marketing)" className="border rounded-md px-2.5 py-1.5" />
            <input type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Budget AED" className="border rounded-md px-2.5 py-1.5" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border rounded-md px-2 py-1.5">
              {Object.entries(EVENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} disabled={!form.name.trim()} className="px-3 py-1.5 rounded-md bg-brand text-white disabled:opacity-40">Add event</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {rows.map((ev) => {
          const meta = EVENT_STATUSES[ev.status] || EVENT_STATUSES.planned
          return (
            <div key={ev.id} className="px-4 py-3 space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-800 font-medium flex-1 min-w-0">{ev.name}</span>
                <span className="text-xs text-gray-400">{ev.dates}</span>
                {ev.budget > 0 && <span className="text-xs text-gray-500">{ev.budget.toLocaleString()} AED</span>}
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${meta.chip}`}>{meta.label}</span>
                <select value={ev.status} onChange={(e) => patch(ev.id, { status: e.target.value })} className="text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white">
                  {Object.entries(EVENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="text-xs text-gray-500">{ev.type} · {ev.venue || '—'} · owner {ev.owner}</div>
              {(ev.outcomes || ev.leadsCount > 0) && (
                <p className="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2">
                  <span className="font-semibold text-gray-700">{ev.leadsCount} lead{ev.leadsCount !== 1 ? 's' : ''}</span>{ev.outcomes && <> — {ev.outcomes}</>}
                </p>
              )}
              {outcomeFor === ev.id ? (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <label className="text-gray-500">Leads <input type="number" min="0" value={outcomeForm.leadsCount} onChange={(e) => setOutcomeForm({ ...outcomeForm, leadsCount: e.target.value })} className="w-16 border rounded-md px-1.5 py-1 ml-1 text-right" /></label>
                  <input value={outcomeForm.outcomes} onChange={(e) => setOutcomeForm({ ...outcomeForm, outcomes: e.target.value })} placeholder="Outcomes note…" className="flex-1 min-w-[180px] border rounded-md px-2 py-1" />
                  <button onClick={() => saveOutcome(ev.id)} className="px-2.5 py-1 rounded-md bg-brand text-white">Save</button>
                  <button onClick={() => setOutcomeFor(null)} className="px-2.5 py-1 rounded-md border text-gray-500">Cancel</button>
                </div>
              ) : (
                ev.status !== 'skipped' && (
                  <button onClick={() => { setOutcomeFor(ev.id); setOutcomeForm({ outcomes: ev.outcomes || '', leadsCount: ev.leadsCount || 0 }) }} className="text-xs font-medium text-brand hover:underline">
                    {ev.outcomes || ev.leadsCount ? 'Edit outcomes' : 'Record outcomes'}
                  </button>
                )
              )}
            </div>
          )
        })}
        {rows.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No events match this filter.</div>}
      </div>
      <p className="text-[11px] text-gray-400">Leads captured here are a count + note for now — pushing them into CRM contacts/deals is Phase 2.</p>
    </div>
  )
}
