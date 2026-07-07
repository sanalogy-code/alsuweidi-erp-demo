import { useState } from 'react'
import { ChevronDown, ChevronRight, Printer, Plus, X } from 'lucide-react'
import { TRANSMITTAL_PURPOSES, transmittalPurposeMeta } from '../../../data/pmData'

// Drawing transmittals (Batch 17): the formal record of issuing deliverables to
// the contractor / client / authority. Line items are picked from the phase's
// deliverables register at their current rev. Print view is a clean block —
// real PDF generation and attachments are Phase 2.

const todayISO = () => new Date().toISOString().slice(0, 10)
const nextRef = (list) => `TRN-${String(list.reduce((m, t) => Math.max(m, parseInt((t.ref || '').replace(/\D/g, ''), 10) || 0), 0) + 1).padStart(3, '0')}`

export default function TransmittalsView({ phase, onUpdate, project }) {
  const transmittals = phase.transmittals || []
  const deliverables = phase.deliverables || []
  const [expanded, setExpanded] = useState(null)
  const [printId, setPrintId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ to: 'Contractor', purpose: 'for_approval', note: '', ids: [] })

  const toggleId = (id) => setForm((f) => ({ ...f, ids: f.ids.includes(id) ? f.ids.filter((x) => x !== id) : [...f.ids, id] }))

  const create = () => {
    if (!form.ids.length) return
    const t = {
      id: transmittals.reduce((m, x) => Math.max(m, x.id), 0) + 1,
      ref: nextRef(transmittals), date: todayISO(), to: form.to, purpose: form.purpose, note: form.note.trim(),
      items: form.ids.map((id) => {
        const d = deliverables.find((x) => x.id === id)
        return { deliverableId: id, docNo: d.docNo, title: d.title, rev: d.rev }
      }),
    }
    onUpdate({ ...phase, transmittals: [t, ...transmittals] })
    setShowForm(false)
    setForm({ to: 'Contractor', purpose: 'for_approval', note: '', ids: [] })
  }

  const printT = printId != null ? transmittals.find((t) => t.id === printId) : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-700">Drawing transmittals</h2>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-brand text-white">
          <Plus size={13} /> New transmittal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="text-xs text-gray-600 space-y-1">
              <span className="font-medium">To</span>
              <select value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs">
                <option>Contractor</option><option>Client</option><option>Authority</option><option>Sub-consultant</option>
              </select>
            </label>
            <label className="text-xs text-gray-600 space-y-1">
              <span className="font-medium">Purpose</span>
              <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs">
                {TRANSMITTAL_PURPOSES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </label>
            <label className="text-xs text-gray-600 space-y-1">
              <span className="font-medium">Note</span>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Covering note…" className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" />
            </label>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1.5">Deliverables to include (at current rev)</div>
            {deliverables.length ? (
              <div className="grid sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {deliverables.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer border border-gray-200 rounded-md px-2 py-1.5 hover:border-brand/40">
                    <input type="checkbox" checked={form.ids.includes(d.id)} onChange={() => toggleId(d.id)} className="rounded" />
                    <span className="font-mono text-[11px] text-gray-400">{d.docNo}</span>
                    <span className="flex-1 truncate">{d.title}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1">Rev {d.rev}</span>
                  </label>
                ))}
              </div>
            ) : <div className="text-xs text-gray-400">No deliverables in this phase's register yet.</div>}
          </div>
          <div className="flex gap-2">
            <button onClick={create} disabled={!form.ids.length} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white disabled:opacity-40">Issue {nextRef(transmittals)}</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {!transmittals.length && !showForm && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          No transmittals issued yet — create one to formally issue deliverables from this phase.
        </div>
      )}

      {transmittals.map((t) => {
        const pm = transmittalPurposeMeta(t.purpose)
        const open = expanded === t.id
        return (
          <div key={t.id} className="bg-white rounded-lg border border-gray-200">
            <button onClick={() => setExpanded(open ? null : t.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              {open ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
              <span className="text-xs font-mono text-gray-500">{t.ref}</span>
              <span className="text-sm text-gray-800 flex-1 truncate">To {t.to}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${pm.chip}`}>{pm.label}</span>
              <span className="text-[11px] text-gray-400 hidden sm:inline">{(t.items || []).length} item{(t.items || []).length === 1 ? '' : 's'}</span>
              <span className="text-[11px] text-gray-400">{t.date}</span>
            </button>
            {open && (
              <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                {t.note && <p className="text-xs text-gray-500">{t.note}</p>}
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-[11px] text-gray-400">
                    <th className="py-1 pr-3 font-medium">Doc no.</th><th className="py-1 pr-3 font-medium">Title</th><th className="py-1 font-medium">Rev</th>
                  </tr></thead>
                  <tbody>
                    {(t.items || []).map((it, i) => (
                      <tr key={i} className="border-t border-gray-100 text-gray-600">
                        <td className="py-1.5 pr-3 font-mono text-[11px]">{it.docNo}</td>
                        <td className="py-1.5 pr-3">{it.title}</td>
                        <td className="py-1.5">{it.rev}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => setPrintId(t.id)} className="flex items-center gap-1 text-xs text-brand hover:underline"><Printer size={12} /> Print view</button>
              </div>
            )}
          </div>
        )
      })}

      {printT && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setPrintId(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 my-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPrintId(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X size={16} /></button>
            <div className="border-b-2 border-gray-800 pb-3 mb-4">
              <div className="text-lg font-bold text-gray-800">DRAWING TRANSMITTAL</div>
              <div className="text-xs text-gray-500">ALSUWEIDI Engineering Consultancy · {project?.projectNo} — {project?.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-700 mb-4">
              <div><span className="text-gray-400">Transmittal ref:</span> <span className="font-mono">{printT.ref}</span></div>
              <div><span className="text-gray-400">Date:</span> {printT.date}</div>
              <div><span className="text-gray-400">To:</span> {printT.to}</div>
              <div><span className="text-gray-400">Purpose:</span> {transmittalPurposeMeta(printT.purpose).label}</div>
            </div>
            {printT.note && <p className="text-xs text-gray-600 mb-4 italic">{printT.note}</p>}
            <table className="w-full text-xs border-collapse mb-6">
              <thead><tr className="border-y border-gray-800 text-left text-gray-800">
                <th className="py-1.5 pr-3">#</th><th className="py-1.5 pr-3">Document no.</th><th className="py-1.5 pr-3">Title</th><th className="py-1.5">Rev</th>
              </tr></thead>
              <tbody>
                {(printT.items || []).map((it, i) => (
                  <tr key={i} className="border-b border-gray-200 text-gray-700">
                    <td className="py-1.5 pr-3">{i + 1}</td>
                    <td className="py-1.5 pr-3 font-mono">{it.docNo}</td>
                    <td className="py-1.5 pr-3">{it.title}</td>
                    <td className="py-1.5">{it.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-2 gap-8 text-xs text-gray-500">
              <div className="border-t border-gray-300 pt-1">Issued by (sign / date)</div>
              <div className="border-t border-gray-300 pt-1">Received by (sign / date)</div>
            </div>
            <p className="text-[10px] text-gray-400 mt-6">Demo print view — PDF export and document attachments are Phase 2.</p>
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-400">Transmittals capture what was issued, to whom, and at which revision — the audit trail behind “but we sent you Rev C”.</p>
    </div>
  )
}
