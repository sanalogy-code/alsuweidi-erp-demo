import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toLocalISO, weekStartOf } from '../../../data/timesheetData'
import { nextId } from '../../../utils/id'

// Weekly progress updates per phase (Batch 10): what moved, % complete, blockers.
// The latest update feeds the phase overview and is the raw material for the
// monthly FIDIC 4.21 report.

export default function WeeklyUpdatesView({ phase, onUpdate, currentUserName }) {
  const [showAdd, setShowAdd] = useState(false)
  const latestPct = phase.weeklyUpdates[0]?.pctComplete ?? ''
  const [form, setForm] = useState({ summary: '', pctComplete: latestPct, blockers: '' })

  const add = () => {
    if (!form.summary.trim()) return
    const entry = {
      id: nextId(phase.weeklyUpdates),
      weekStart: toLocalISO(weekStartOf(new Date())),
      author: currentUserName || 'Me',
      pctComplete: Math.max(0, Math.min(100, Number(form.pctComplete) || 0)),
      summary: form.summary.trim(),
      blockers: form.blockers.trim() || 'None.',
    }
    onUpdate({ ...phase, weeklyUpdates: [entry, ...phase.weeklyUpdates] })
    setForm({ summary: '', pctComplete: entry.pctComplete, blockers: '' }); setShowAdd(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{phase.label} — weekly updates</h2>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Post this week's update</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="What moved this week…" rows={3} className="w-full border rounded-md px-2.5 py-1.5 text-sm" />
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-xs text-gray-500 flex items-center gap-1.5">% complete
              <input type="number" min="0" max="100" value={form.pctComplete} onChange={(e) => setForm({ ...form, pctComplete: e.target.value })} className="w-16 border rounded-md px-2 py-1 text-xs text-right" />
            </label>
            <input value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} placeholder="Blockers (optional)" className="flex-1 min-w-[200px] border rounded-md px-2 py-1 text-xs" />
            <button onClick={add} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white">Post update</button>
          </div>
        </div>
      )}

      {phase.weeklyUpdates.length === 0 && !showAdd && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No weekly updates yet — the PM posts one at the end of each week.</div>
      )}

      {phase.weeklyUpdates.map((u) => (
        <div key={u.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-800">Week of {u.weekStart}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand/10 text-brand font-semibold">{u.pctComplete}%</span>
            <span className="text-xs text-gray-400">{u.author}</span>
          </div>
          <p className="text-xs text-gray-600">{u.summary}</p>
          <p className="text-xs"><span className="text-gray-400">Blockers:</span> <span className={u.blockers === 'None.' ? 'text-gray-400' : 'text-amber-700'}>{u.blockers}</span></p>
        </div>
      ))}

      <p className="text-[11px] text-gray-400">The latest update's % complete is the phase headline; these are the raw material for the monthly FIDIC 4.21 report. Auto-compiling the monthly report from four weeklies is a natural Phase 2 step.</p>
    </div>
  )
}
