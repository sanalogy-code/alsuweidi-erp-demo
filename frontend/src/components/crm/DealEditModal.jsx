import { useState } from 'react'
import { Check, X as XIcon, Trash2 } from 'lucide-react'
import Modal from './Modal'
import { STAGES } from '../../data/crmData'

export default function DealEditModal({ deal, companies, contacts, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: deal.title,
    value: deal.value,
    stage: deal.stage,
    probability: deal.probability,
    closeDate: deal.closeDate,
  })

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      alert('Deal title is required')
      return
    }
    onSave(deal.id, form)
    setEditing(false)
  }

  const handleCancel = () => {
    setForm({ title: deal.title, value: deal.value, stage: deal.stage, probability: deal.probability, closeDate: deal.closeDate })
    setEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${deal.title}"? This cannot be undone.`)) {
      onDelete(deal.id)
      onClose()
    }
  }

  const company = companies.find((c) => c.id === deal.companyId)
  const contact = contacts.find((c) => c.id === deal.contactId)

  return (
    <Modal wide onClose={onClose} title={deal.title}>
      {editing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Deal Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Value (AED)</label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.probability}
                onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
              <select
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expected Close</label>
              <input
                placeholder="e.g. 2026-Q4"
                value={form.closeDate}
                onChange={(e) => setForm({ ...form, closeDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button type="submit" className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center justify-center gap-1">
              <Check size={15} /> Save
            </button>
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1">
              <XIcon size={15} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-1">Company</div>
              <div className="font-medium text-gray-800">{company?.name || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Contact</div>
              <div className="font-medium text-gray-800">{contact?.name || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Value</div>
              <div className="font-medium text-brand text-lg">AED {form.value.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Stage</div>
              <div className="font-medium text-gray-800">{form.stage}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Probability</div>
              <div className="font-medium text-gray-800">{form.probability}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Expected Close</div>
              <div className="font-medium text-gray-800">{form.closeDate}</div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center justify-center gap-1"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-50 text-red-700 py-2 rounded-md text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
