import { useState } from 'react'
import { Lock } from 'lucide-react'
import Modal from '../crm/Modal'
import { COMPLAINT_CATEGORIES } from '../../data/hrData'

export default function ComplaintModal({ user, onClose, onSubmit }) {
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  const handleSubmit = () => {
    if (!description.trim()) {
      alert('Please describe the concern')
      return
    }
    onSubmit({
      category,
      description: description.trim(),
      anonymous,
      submittedBy: anonymous ? null : user?.username,
      submittedDate: new Date().toISOString().slice(0, 10),
      status: 'submitted',
    })
    onClose()
  }

  return (
    <Modal title="Raise a Concern" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs text-gray-600 flex items-start gap-2">
          <Lock size={14} className="shrink-0 mt-0.5 text-gray-400" />
          Concerns go directly to HR and are visible to HR staff only — not to managers or management.
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand">
            {COMPLAINT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What happened?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            placeholder="Describe the issue — what, where, when. The more specific, the faster HR can act."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded border-gray-300 text-brand focus:ring-brand mt-0.5" />
          <span>
            Submit anonymously
            <span className="block text-xs text-gray-400">Anonymous concerns can't receive follow-up questions or status updates.</span>
          </span>
        </label>
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark">Submit to HR</button>
        </div>
      </div>
    </Modal>
  )
}
