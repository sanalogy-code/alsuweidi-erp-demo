import { useState } from 'react'
import { Plus, ShieldCheck, AlertTriangle } from 'lucide-react'
import { daysUntil } from '../../data/pmData'
import { nextId } from '../../utils/id'

// Office registrations & licenses (Batch 15) — the current ERP's licensing
// tracker, redesigned: an expiry radar (matching HR's Renewals pattern) with
// owners who get notified, instead of a modal form. Website passwords are
// deliberately NOT stored here — a demo (or any frontend) is no place for
// credentials; Phase 2 gets a proper secrets vault.

export const OFFICE_LICENSES = [
  { id: 1, title: 'Trade licence (DED)', entity: 'ALSUWEIDI — Abu Dhabi', expiryDate: '2027-06-10', owner: 'Office Document Controller', url: 'tamm.abudhabi', remarks: 'Renewed 10 Jun 2026.', active: true },
  { id: 2, title: 'ADCD Fire & Life Safety classification + CFPE engineer certification', entity: 'ALSUWEIDI — Abu Dhabi', expiryDate: '2026-09-01', owner: 'Sana Diab', url: 'HEMAYA', remarks: 'HARD GATE: from 1 Sept 2026 ADCD will not accept fire-design submissions without this classification and a CFPE-certified registered engineer. Standing action from the PM research — verify status NOW.', active: true },
  { id: 3, title: 'DMT consultant classification (MeCS)', entity: 'ALSUWEIDI — Abu Dhabi', expiryDate: '2026-08-15', owner: 'Office Document Controller', url: 'MEPS / TAMM', remarks: 'Classification renewal — project experience evidence pack being compiled.', active: true },
  { id: 4, title: 'ISO 9001:2015 certification', entity: 'ALSUWEIDI', expiryDate: '2026-11-20', owner: 'QA/QC Manager', url: null, remarks: 'Surveillance audit booked October.', active: true },
  { id: 5, title: 'Professional indemnity insurance', entity: 'ALSUWEIDI', expiryDate: '2027-06-05', owner: 'Finance', url: null, remarks: 'Renewed via Oman Insurance (see Financials expenses).', active: true },
  { id: 6, title: 'Estidama PQP registration (Pearl Qualified Professional)', entity: 'Fatima Al Mansouri', expiryDate: '2026-07-28', owner: 'Sana Diab', url: 'Estidama portal', remarks: 'Exam-certified PQP — required to route all Estidama submissions.', active: true },
  { id: 7, title: 'Tax registration card (VAT)', entity: 'ALSUWEIDI', expiryDate: null, owner: 'Finance', url: 'EmaraTax', remarks: 'No expiry — kept for records.', active: true },
  { id: 8, title: 'Dubai Municipality consultant registration', entity: 'ALSUWEIDI — Dubai branch', expiryDate: '2026-05-30', owner: 'Office Document Controller', url: 'BPS', remarks: 'EXPIRED — renew before the next Dubai submission.', active: true },
]

const expiryMeta = (iso) => {
  if (!iso) return { label: 'No expiry', chip: 'bg-gray-100 text-gray-500', bucket: 'none' }
  const d = daysUntil(iso)
  if (d < 0) return { label: `Expired ${-d}d ago`, chip: 'bg-red-100 text-red-700', bucket: 'expired' }
  if (d <= 30) return { label: `${d}d left`, chip: 'bg-red-100 text-red-700', bucket: '30' }
  if (d <= 60) return { label: `${d}d left`, chip: 'bg-amber-100 text-amber-700', bucket: '60' }
  if (d <= 90) return { label: `${d}d left`, chip: 'bg-yellow-100 text-yellow-700', bucket: '90' }
  return { label: iso, chip: 'bg-green-100 text-green-700', bucket: 'ok' }
}

export default function LicensesView({ items, onChange }) {
  const setItems = onChange
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title: '', entity: '', expiryDate: '', owner: '', url: '', remarks: '' })

  const add = () => {
    if (!form.title.trim() || !form.entity.trim()) return
    setItems([{ id: nextId(items), ...form, expiryDate: form.expiryDate || null, active: true }, ...items])
    setForm({ title: '', entity: '', expiryDate: '', owner: '', url: '', remarks: '' }); setShowAdd(false)
  }

  const withMeta = items.map((i) => ({ ...i, meta: expiryMeta(i.expiryDate) }))
  const count = (b) => withMeta.filter((i) => i.meta.bucket === b).length
  const chips = [
    { key: '', label: `All (${items.length})` },
    { key: 'expired', label: `Expired (${count('expired')})`, tone: 'text-red-700' },
    { key: '30', label: `≤30 days (${count('30')})`, tone: 'text-red-700' },
    { key: '60', label: `≤60 days (${count('60')})`, tone: 'text-amber-700' },
    { key: '90', label: `≤90 days (${count('90')})` },
  ]
  const rows = withMeta
    .filter((i) => !filter || i.meta.bucket === filter)
    .sort((a, b) => (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999'))

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><ShieldCheck size={15} className="text-brand" /> Registrations & licenses</h2>
          <p className="text-xs text-gray-500">Office-level registrations, classifications, and certifications with an expiry radar. Same pattern as HR's Renewals — one habit, two registers.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Add registration</button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button key={c.key} onClick={() => setFilter(filter === c.key ? '' : c.key)}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition ${filter === c.key ? 'border-brand text-brand bg-brand/5 font-semibold' : `border-gray-200 ${c.tone || 'text-gray-500'}`}`}>
            {c.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 grid sm:grid-cols-2 gap-2 text-xs">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title (e.g. Trade licence, ISO, classification) *" className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
          <input value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })} placeholder="Entity / holder *" className="border rounded-md px-2.5 py-1.5" />
          <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Owner (gets renewal notifications)" className="border rounded-md px-2.5 py-1.5" />
          <label className="text-gray-500 flex items-center gap-2">Expiry <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="border rounded-md px-2 py-1.5 flex-1" /></label>
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Portal (e.g. TAMM, HEMAYA) — no passwords here" className="border rounded-md px-2.5 py-1.5" />
          <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Remarks" rows={2} className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 rounded-md bg-brand text-white">Add</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rows.map((i) => (
          <div key={i.id} className={`bg-white rounded-lg border px-4 py-3 ${i.meta.bucket === 'expired' || i.meta.bucket === '30' ? 'border-red-200' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 flex-wrap">
              {(i.meta.bucket === 'expired' || i.meta.bucket === '30') && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-gray-800">{i.title}</span>
                <span className="text-xs text-gray-400">{i.entity}{i.url ? ` · portal: ${i.url}` : ''} · notifies {i.owner || '—'}</span>
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${i.meta.chip}`}>{i.meta.label}</span>
            </div>
            {i.remarks && <p className="text-xs text-gray-500 mt-1.5">{i.remarks}</p>}
          </div>
        ))}
        {rows.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">Nothing in this bucket.</div>}
      </div>

      <p className="text-[11px] text-gray-400">
        Renewal notification emails and document attachments are Phase 2. Portal passwords are deliberately not stored — the current system keeps them in this form; a proper secrets vault comes with the backend.
      </p>
    </div>
  )
}
