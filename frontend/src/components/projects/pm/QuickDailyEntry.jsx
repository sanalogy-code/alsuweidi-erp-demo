import { useState } from 'react'
import { Smartphone, CheckCircle2 } from 'lucide-react'

// Quick daily entry (Batch 17): the RE's phone-in-hand habit — date, manpower,
// plant count, one-line note — appends a daily report without the full form.
// Deliberately mobile-first: single column, large touch targets, sticky submit.
// The full daily-report form (weather, delays, HSE) stays in the Site view.

import { todayISO } from '../../../utils/date'

export default function QuickDailyEntry({ phase, onUpdate }) {
  const reports = phase.dailyReports || []
  const [form, setForm] = useState({ date: todayISO(), manpower: '', plant: '', note: '' })
  const [saved, setSaved] = useState(false)

  const canSubmit = form.date && form.manpower !== ''

  const submit = () => {
    if (!canSubmit) return
    onUpdate({
      ...phase,
      dailyReports: [{
        id: reports.reduce((m, r) => Math.max(m, r.id), 0) + 1,
        date: form.date, manpower: Number(form.manpower) || 0,
        plant: form.plant !== '' ? `${form.plant} plant items (quick entry)` : '—',
        weather: '—', workDone: form.note.trim() || 'Quick entry — details to follow.',
        delays: '—', hse: '—', quick: true,
      }, ...reports],
    })
    setForm({ date: todayISO(), manpower: '', plant: '', note: '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-3 max-w-md">
      <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        <Smartphone size={15} className="text-gray-400" /> Quick daily entry
      </h2>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <label className="block text-sm text-gray-600 space-y-1.5">
          <span className="font-medium">Date</span>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base" />
        </label>
        <label className="block text-sm text-gray-600 space-y-1.5">
          <span className="font-medium">Manpower on site</span>
          <input type="number" inputMode="numeric" min="0" value={form.manpower} onChange={(e) => setForm({ ...form, manpower: e.target.value })}
            placeholder="e.g. 180" className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base" />
        </label>
        <label className="block text-sm text-gray-600 space-y-1.5">
          <span className="font-medium">Plant / equipment count</span>
          <input type="number" inputMode="numeric" min="0" value={form.plant} onChange={(e) => setForm({ ...form, plant: e.target.value })}
            placeholder="e.g. 6" className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base" />
        </label>
        <label className="block text-sm text-gray-600 space-y-1.5">
          <span className="font-medium">One-line note</span>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="What happened on site today…" className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base" />
        </label>

        <div className="sticky bottom-3 pt-1">
          <button onClick={submit} disabled={!canSubmit}
            className="w-full py-3.5 rounded-lg bg-brand text-white text-base font-semibold shadow-md active:scale-[0.99] transition disabled:opacity-40">
            {saved ? <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={18} /> Logged</span> : 'Log daily entry'}
          </button>
        </div>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
        Built for a phone in one hand at the site gate. Offline capture with sync is Phase 2 — for now this needs a connection.
      </div>

      {reports.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Recent daily reports</div>
          {reports.slice(0, 7).map((r) => (
            <div key={r.id} className="px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{r.date}</span>
                <span className="text-gray-400">· {r.manpower} manpower</span>
                {r.quick && <span className="text-[10px] bg-blue-50 text-blue-600 rounded px-1.5 py-0.5">quick entry</span>}
              </div>
              <div className="text-gray-500 mt-0.5 truncate">{r.workDone}</div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-gray-400">Quick entries land in the same daily-report register as the full form (Site view) — fill in weather / delays / HSE there later.</p>
    </div>
  )
}
