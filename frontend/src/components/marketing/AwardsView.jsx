import { useState } from 'react'
import { Trophy, Plus } from 'lucide-react'
import { AWARD_STATUSES } from '../../data/marketingData'
import { nextId } from '../../utils/id'

// Award submissions register — every industry award the company enters,
// which project it entered, and how it went.
export default function AwardsView({ awards, onUpdate, projects = [] }) {
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ award: '', organiser: '', category: '', projectId: '', deadline: '', owner: '', notes: '' })

  const showable = projects.filter((p) => !p.confidential)

  const add = () => {
    if (!form.award.trim()) return
    const project = projects.find((p) => p.id === Number(form.projectId))
    onUpdate([...awards, {
      id: nextId(awards),
      award: form.award.trim(), organiser: form.organiser.trim(), category: form.category.trim(),
      projectId: project?.id ?? null, projectName: project ? `${project.projectNo} — ${project.name}` : '',
      deadline: form.deadline, status: 'considering', owner: form.owner.trim() || 'Marketing', notes: form.notes.trim(),
    }])
    setForm({ award: '', organiser: '', category: '', projectId: '', deadline: '', owner: '', notes: '' })
    setShowAdd(false)
  }

  const patch = (id, changes) => onUpdate(awards.map((a) => (a.id === id ? { ...a, ...changes } : a)))

  const rows = awards.filter((a) => !statusFilter || a.status === statusFilter)
  const won = awards.filter((a) => a.status === 'won').length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Trophy size={15} className="text-brand" /> Award submissions</h2>
          <p className="text-xs text-gray-500">{awards.length} tracked · {won} won</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> New submission</button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button onClick={() => setStatusFilter('')} className={`px-2.5 py-1 rounded-full text-[11px] border transition ${!statusFilter ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>All</button>
        {Object.entries(AWARD_STATUSES).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(statusFilter === k ? '' : k)}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition ${statusFilter === k ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-2 gap-2">
            <input value={form.award} onChange={(e) => setForm({ ...form, award: e.target.value })} placeholder="Award name *" className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
            <input value={form.organiser} onChange={(e) => setForm({ ...form, organiser: e.target.value })} placeholder="Organiser" className="border rounded-md px-2.5 py-1.5" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="border rounded-md px-2.5 py-1.5" />
            <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="border rounded-md px-2 py-1.5">
              <option value="">Project entered (optional)</option>
              {showable.map((p) => <option key={p.id} value={p.id}>{p.projectNo} — {p.name}</option>)}
            </select>
            <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Owner (default Marketing)" className="border rounded-md px-2.5 py-1.5" />
            <label className="text-gray-500 flex items-center">Deadline <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="border rounded-md px-2 py-1 ml-2" /></label>
          </div>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes…" rows={2} className="w-full border rounded-md px-2.5 py-1.5" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} disabled={!form.award.trim()} className="px-3 py-1.5 rounded-md bg-brand text-white disabled:opacity-40">Register submission</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {rows.map((a) => {
          const meta = AWARD_STATUSES[a.status] || AWARD_STATUSES.considering
          return (
            <div key={a.id} className="px-4 py-3 space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-800 font-medium flex-1 min-w-0">{a.award}</span>
                {a.deadline && <span className="text-xs text-gray-400">due {a.deadline}</span>}
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${meta.chip}`}>{meta.label}</span>
                <select value={a.status} onChange={(e) => patch(a.id, { status: e.target.value })} className="text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white">
                  {Object.entries(AWARD_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="text-xs text-gray-500">
                {a.organiser || '—'}{a.category && <> · {a.category}</>} · owner {a.owner}
                {a.projectName && <> · entered: <span className="text-gray-700">{a.projectName}</span></>}
              </div>
              {a.notes && <p className="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2">{a.notes}</p>}
            </div>
          )
        })}
        {rows.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No award submissions match this filter.</div>}
      </div>
    </div>
  )
}
