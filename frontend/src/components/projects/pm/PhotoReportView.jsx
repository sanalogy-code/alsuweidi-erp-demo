import { useState } from 'react'
import { Camera, Plus, Printer, X, Image } from 'lucide-react'

// Photo-report builder (Batch 17): photo entries per month feeding the FIDIC
// 4.21 monthly report's "photographs of works" item. File-name-only with
// caption/date/location — real file storage & upload are Phase 2, so the
// print-style grid shows name-card placeholders.

import { todayISO } from '../../../utils/date'
const thisMonth = () => todayISO().slice(0, 7)

export default function PhotoReportView({ pm, onUpdate, project }) {
  const months = pm.photoReports || []
  const [sel, setSel] = useState(months[0]?.month || thisMonth())
  const [showPrint, setShowPrint] = useState(false)
  const [form, setForm] = useState({ fileName: '', caption: '', date: todayISO(), location: '' })

  const current = months.find((m) => m.month === sel)
  const photos = current?.photos || []

  const addPhoto = () => {
    if (!form.fileName.trim() || !form.caption.trim()) return
    const entry = { id: photos.reduce((m, p) => Math.max(m, p.id), 0) + 1, fileName: form.fileName.trim(), caption: form.caption.trim(), date: form.date, location: form.location.trim() }
    const next = current
      ? months.map((m) => m.month === sel ? { ...m, photos: [...m.photos, entry] } : m)
      : [{ id: months.reduce((m, x) => Math.max(m, x.id), 0) + 1, month: sel, photos: [entry] }, ...months]
    onUpdate({ ...pm, photoReports: next })
    setForm({ fileName: '', caption: '', date: todayISO(), location: '' })
  }

  const removePhoto = (id) => onUpdate({ ...pm, photoReports: months.map((m) => m.month === sel ? { ...m, photos: m.photos.filter((p) => p.id !== id) } : m) })

  // Month options: existing months + current month + linked 4.21 report months.
  const monthOptions = [...new Set([...months.map((m) => m.month), ...(pm.reports || []).map((r) => r.month), thisMonth()])].sort().reverse()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Camera size={15} className="text-gray-400" /> Photo report (FIDIC 4.21)</h2>
        <div className="flex items-center gap-2">
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="text-xs border border-gray-300 rounded-md px-2 py-1.5">
            {monthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={() => setShowPrint(true)} disabled={!photos.length} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand disabled:opacity-40">
            <Printer size={13} /> Photo report preview
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
        <div className="text-xs font-medium text-gray-600">Add photo entry — {sel}</div>
        <div className="grid sm:grid-cols-4 gap-2">
          <input value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="File name (e.g. site-east-wing.jpg)" className="border border-gray-300 rounded-md px-2 py-1.5 text-xs sm:col-span-2" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border border-gray-300 rounded-md px-2 py-1.5 text-xs" />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="border border-gray-300 rounded-md px-2 py-1.5 text-xs" />
        </div>
        <div className="flex gap-2">
          <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addPhoto()} placeholder="Caption…" className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-xs" />
          <button onClick={addPhoto} disabled={!form.fileName.trim() || !form.caption.trim()} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-brand text-white disabled:opacity-40"><Plus size={13} /> Add</button>
        </div>
        <p className="text-[11px] text-gray-400">File-name-only for the demo — actual photo upload and storage are Phase 2.</p>
      </div>

      {photos.length ? (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {photos.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-xs">
              <Image size={14} className="text-gray-300 shrink-0" />
              <span className="font-mono text-[11px] text-gray-500 truncate max-w-[180px]">{p.fileName}</span>
              <span className="text-gray-700 flex-1 truncate">{p.caption}</span>
              <span className="text-gray-400 hidden sm:inline">{p.location}</span>
              <span className="text-gray-400">{p.date}</span>
              <button onClick={() => removePhoto(p.id)} className="text-gray-300 hover:text-red-500"><X size={13} /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          No photos logged for {sel} — the 4.21 checklist's “Photographs of works” item draws from here.
        </div>
      )}

      {showPrint && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowPrint(false)}>
          <div className="bg-white rounded-lg max-w-3xl w-full p-8 my-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPrint(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X size={16} /></button>
            <div className="border-b-2 border-gray-800 pb-3 mb-5">
              <div className="text-lg font-bold text-gray-800">MONTHLY PHOTO REPORT — {sel}</div>
              <div className="text-xs text-gray-500">{project?.projectNo} — {project?.name} · Progress report appendix (FIDIC Sub-Clause 4.21)</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {photos.map((p, i) => (
                <div key={p.id} className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="h-32 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                    <Image size={24} />
                    <span className="text-[10px] font-mono mt-1 px-2 text-center break-all">{p.fileName}</span>
                  </div>
                  <div className="px-3 py-2 text-xs text-gray-700">
                    <span className="font-medium">Photo {i + 1}.</span> {p.caption}
                    <div className="text-[10px] text-gray-400 mt-0.5">{p.location ? `${p.location} · ` : ''}{p.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-5">Placeholder cards — actual images render here once file storage lands in Phase 2.</p>
          </div>
        </div>
      )}
    </div>
  )
}
