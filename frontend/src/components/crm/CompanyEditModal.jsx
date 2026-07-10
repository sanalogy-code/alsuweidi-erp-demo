import { useState } from 'react'
import { Pencil, Check, X as XIcon, Trash2 } from 'lucide-react'
import Modal from './Modal'
import { COMPANY_TAGS, COMPANY_TAG_COLOR, COMPANY_SIZES } from '../../data/crmData'

export default function CompanyEditModal({ company, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const isIndividual = company.kind === 'individual'
  const initialForm = () => ({
    kind: company.kind || 'company',
    name: company.name,
    industry: company.industry,
    location: company.location,
    status: company.status,
    website: company.website || '',
    size: company.size || '',
    tags: company.tags || [],
    servicesText: (company.services || []).join(', '),
  })
  const [form, setForm] = useState(initialForm)

  const toggleTag = (tag) => {
    setForm((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag] }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('Company name is required')
      return
    }
    const { servicesText, ...fields } = form
    onSave(company.id, {
      ...fields,
      website: form.website.trim(),
      services: servicesText.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setForm(initialForm())
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
          {/* Website / size don't apply to an individual client */}
          {form.kind !== 'individual' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
              <input
                placeholder="https://..."
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company Size</label>
              <select
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">Not set</option>
                {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
          </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Relationship Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {COMPANY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border transition ${form.tags.includes(tag) ? `${COMPANY_TAG_COLOR[tag]} border-transparent ring-1 ring-brand/40` : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'}`}
                >
                  {form.tags.includes(tag) ? '✓ ' : ''}{tag}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">A company can hold several roles at once, e.g. Client and Supplier.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Main Services / Disciplines</label>
            <input
              placeholder="e.g. Structural, MEP, Surveying (comma-separated)"
              value={form.servicesText}
              onChange={(e) => setForm({ ...form, servicesText: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
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
          {isIndividual && (
            <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium bg-teal-100 text-teal-700">
              Individual client — same record, no company fields (default pending the individuals-as-clients decision)
            </span>
          )}
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
            {!isIndividual && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Website</div>
                <div className="font-medium text-gray-800 truncate">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                      {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  ) : '—'}
                </div>
              </div>
            )}
            {!isIndividual && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Company Size</div>
                <div className="font-medium text-gray-800">{company.size ? `${company.size} employees` : '—'}</div>
              </div>
            )}
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Relationship Tags</div>
            {(company.tags || []).length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {company.tags.map((t) => (
                  <span key={t} className={`text-xs px-2.5 py-1 rounded-full font-medium ${COMPANY_TAG_COLOR[t] || 'bg-gray-100 text-gray-700'}`}>{t}</span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">No tags yet</div>
            )}
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Main Services / Disciplines</div>
            <div className="font-medium text-gray-800 text-sm">{(company.services || []).join(', ') || '—'}</div>
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
