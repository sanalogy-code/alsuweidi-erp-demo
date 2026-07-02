import { useState } from 'react'
import { Pencil, Check, X as XIcon, Trash2 } from 'lucide-react'
import Modal from './Modal'

export default function CompanyEditModal({ company, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: company.name,
    industry: company.industry,
    location: company.location,
    status: company.status,
  })

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('Company name is required')
      return
    }
    onSave(company.id, form)
    setEditing(false)
  }

  const handleCancel = () => {
    setForm({ name: company.name, industry: company.industry, location: company.location, status: company.status })
    setEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Delete ${company.name}? This cannot be undone.`)) {
      onDelete(company.id)
      onClose()
    }
  }

  return (
    <Modal wide onClose={onClose} title={company.name}>
      {editing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
              <input
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="Active">Active</option>
              <option value="Prospect">Prospect</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center justify-center gap-1"
            >
              <Check size={15} /> Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
            >
              <XIcon size={15} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-1">Industry</div>
              <div className="font-medium text-gray-800">{company.industry}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Location</div>
              <div className="font-medium text-gray-800">{company.location}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <div className="font-medium text-gray-800">{company.status}</div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center justify-center gap-1"
            >
              <Pencil size={15} /> Edit
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
