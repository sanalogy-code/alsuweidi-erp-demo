import { useState } from 'react'
import { Megaphone, Plus, Link2 } from 'lucide-react'
import { CAMPAIGN_STATUSES, CONTENT_STATUSES } from '../../data/marketingData'

// Campaigns — LIGHTWEIGHT FIRST SHAPE (backlog said "needs scoping").
// A campaign is a name + goal + date range + status; content items attach to it
// via campaignId. Progress = published items / all items in the campaign.
export default function CampaignsView({ campaigns, onUpdate, items, onUpdateItem }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '', status: 'planning' })

  const add = () => {
    if (!form.name.trim()) return
    onUpdate([...campaigns, { ...form, name: form.name.trim(), goal: form.goal.trim(), owner: 'Marketing', id: Math.max(0, ...campaigns.map((c) => c.id)) + 1 }])
    setForm({ name: '', goal: '', startDate: '', endDate: '', status: 'planning' })
    setShowAdd(false)
  }

  const patch = (id, changes) => onUpdate(campaigns.map((c) => (c.id === id ? { ...c, ...changes } : c)))
  const unassigned = items.filter((i) => !i.campaignId && i.status !== 'published')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Megaphone size={15} className="text-brand" /> Campaigns</h2>
          <p className="text-xs text-gray-500">Group content-calendar items under a goal and a date range.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> New campaign</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Campaign name *" className="w-full border rounded-md px-2.5 py-1.5" />
          <textarea value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Goal — what should this campaign achieve?" rows={2} className="w-full border rounded-md px-2.5 py-1.5" />
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-gray-500">From <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <label className="text-gray-500">To <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border rounded-md px-2 py-1.5">
              {Object.entries(CAMPAIGN_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} disabled={!form.name.trim()} className="px-3 py-1.5 rounded-md bg-brand text-white disabled:opacity-40">Create campaign</button>
          </div>
        </div>
      )}

      {campaigns.map((c) => {
        const meta = CAMPAIGN_STATUSES[c.status] || CAMPAIGN_STATUSES.planning
        const cItems = items.filter((i) => i.campaignId === c.id)
        const published = cItems.filter((i) => i.status === 'published').length
        return (
          <div key={c.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800">{c.name}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${meta.chip}`}>{meta.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{c.goal}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{c.startDate || '—'} → {c.endDate || '—'} · {c.owner}</p>
              </div>
              <select value={c.status} onChange={(e) => patch(c.id, { status: e.target.value })} className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white">
                {Object.entries(CAMPAIGN_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            {/* Progress line: published vs total content items */}
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: cItems.length ? `${(published / cItems.length) * 100}%` : 0 }} />
              </div>
              <span className="shrink-0">{published} of {cItems.length} published</span>
            </div>

            {cItems.length > 0 ? (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-md">
                {cItems.map((i) => {
                  const s = CONTENT_STATUSES[i.status] || CONTENT_STATUSES.idea
                  return (
                    <div key={i.id} className="px-3 py-2 flex items-center gap-3 text-xs">
                      <span className="flex-1 min-w-0 text-gray-700 truncate">{i.title}</span>
                      <span className="text-gray-400 shrink-0 hidden sm:block">{i.type} · {i.channel} · {i.date}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${s.chip}`}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No content attached yet — attach an item below or set its campaign from the calendar in Phase 2.</p>
            )}

            {unassigned.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link2 size={12} className="shrink-0" />
                <select defaultValue="" onChange={(e) => { const id = Number(e.target.value); if (id) onUpdateItem({ ...items.find((i) => i.id === id), campaignId: c.id }); e.target.value = '' }} className="border border-gray-200 rounded-md px-2 py-1 bg-white">
                  <option value="">Attach a calendar item…</option>
                  {unassigned.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
                </select>
              </div>
            )}
          </div>
        )
      })}
      {campaigns.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No campaigns yet — create the first one above.</div>}

      <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        Lightweight first shape — scope to be confirmed with Sana. Budgets, audiences, and results tracking are deliberately left out until then.
      </p>
    </div>
  )
}
