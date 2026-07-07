import { useState } from 'react'
import { Send, Download, Plus } from 'lucide-react'

import { todayISO } from '../../utils/date'

// Asset usage tracking — who sent/downloaded which portfolio pack, to whom.
// Rendered under the Portfolio packs card. Manual "Log a send" for now:
// the CRM download button lives in the CRM module, so auto-logging that click
// is Phase 2 (needs the shared packs store to carry the log too).
export default function PackUsageLog({ packs, usage, onLog, companies = [] }) {
  const [form, setForm] = useState({ packId: '', action: 'sent', by: '', client: '', note: '' })

  const add = (e) => {
    e.preventDefault()
    const pack = packs.find((p) => p.id === Number(form.packId))
    if (!pack || !form.by.trim()) return
    onLog({
      id: Math.max(0, ...usage.map((u) => u.id)) + 1,
      packId: pack.id, packName: pack.fileName, action: form.action,
      by: form.by.trim(), date: todayISO(), client: form.client.trim(), note: form.note.trim(),
    })
    setForm({ packId: '', action: 'sent', by: '', client: '', note: '' })
  }

  const sorted = [...usage].sort((a, b) => (b.date > a.date ? 1 : -1))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Pack usage <span className="text-xs font-normal text-gray-400">{usage.length} logged</span></h3>
        <p className="text-xs text-gray-500">Every send/download of a portfolio pack, and to which client. Logged manually for now — auto-logging the CRM download click is Phase 2.</p>
      </div>
      <div className="divide-y divide-gray-100">
        {sorted.map((u) => (
          <div key={u.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
            {u.action === 'sent' ? <Send size={12} className="text-brand shrink-0" /> : <Download size={12} className="text-gray-400 shrink-0" />}
            <span className="flex-1 min-w-0 font-mono text-gray-700 truncate">{u.packName}</span>
            <span className="text-gray-500 shrink-0">{u.action} by <span className="text-gray-700">{u.by}</span>{u.client && <> → <span className="text-gray-700">{u.client}</span></>}</span>
            <span className="text-gray-400 shrink-0">{u.date}</span>
          </div>
        ))}
        {usage.length === 0 && <div className="p-6 text-center text-sm text-gray-400">No usage logged yet.</div>}
      </div>
      <form onSubmit={add} className="p-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
        <select value={form.packId} onChange={(e) => setForm({ ...form, packId: e.target.value })} className="border border-gray-200 rounded-md px-2 py-1.5 bg-white max-w-[220px]">
          <option value="">Which pack? *</option>
          {packs.map((p) => <option key={p.id} value={p.id}>{p.category} — {p.fileName}</option>)}
        </select>
        <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className="border border-gray-200 rounded-md px-2 py-1.5 bg-white">
          <option value="sent">Sent</option>
          <option value="downloaded">Downloaded</option>
        </select>
        <input value={form.by} onChange={(e) => setForm({ ...form, by: e.target.value })} placeholder="By whom *" className="w-32 border border-gray-200 rounded-md px-2 py-1.5" />
        <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} list="usage-companies" placeholder="Client / company" className="w-40 border border-gray-200 rounded-md px-2 py-1.5" />
        <datalist id="usage-companies">{companies.map((c) => <option key={c.id ?? c.name} value={c.name} />)}</datalist>
        <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note" className="flex-1 min-w-[120px] border border-gray-200 rounded-md px-2 py-1.5" />
        <button type="submit" disabled={!form.packId || !form.by.trim()} className="flex items-center gap-1 px-3 py-1.5 rounded-md font-medium bg-brand text-white hover:bg-brand-dark disabled:opacity-40">
          <Plus size={12} /> Log a send
        </button>
      </form>
    </div>
  )
}
