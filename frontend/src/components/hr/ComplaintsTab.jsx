import { useState } from 'react'
import { ShieldAlert, Plus, Lock } from 'lucide-react'
import Modal from '../crm/Modal'
import { COMPLAINT_CATEGORIES } from '../../data/hrData'

const STATUS_META = {
  submitted: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-700', next: 'under_review', action: 'Start Review' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', next: 'resolved', action: 'Mark Resolved' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', next: null, action: null },
}

function ComplaintModal({ user, onClose, onSubmit }) {
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

export default function ComplaintsTab({ complaints, user, isHrStaff, onSubmit, onAdvance }) {
  const [showModal, setShowModal] = useState(false)

  const mine = complaints.filter((c) => !c.anonymous && c.submittedBy === user?.username)
  const visible = isHrStaff ? complaints : mine

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <ShieldAlert size={15} className="text-brand" /> {isHrStaff ? `Complaints & Concerns (${complaints.length})` : 'My Concerns'}
            </h2>
            <p className="text-xs text-gray-500">
              {isHrStaff ? 'Visible to HR staff only. Anonymous submissions carry no name.' : 'Visible to HR only — raise anything from safety issues to conduct concerns.'}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1 shrink-0"
          >
            <Plus size={13} /> Raise a Concern
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            {isHrStaff ? 'No complaints on file' : "You haven't raised any concerns (anonymous submissions aren't listed here)."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visible.map((c) => {
              const meta = STATUS_META[c.status]
              return (
                <div key={c.id} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">{c.category}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>{meta.label}</span>
                    </div>
                    <div className="text-sm text-gray-600">{c.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {c.anonymous ? 'Anonymous' : c.submittedBy} • {new Date(c.submittedDate).toLocaleDateString('en-AE')}
                    </div>
                  </div>
                  {isHrStaff && meta.next && (
                    <button
                      onClick={() => onAdvance(c.id, meta.next)}
                      className="text-xs font-medium text-brand hover:underline shrink-0"
                    >
                      {meta.action}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && <ComplaintModal user={user} onClose={() => setShowModal(false)} onSubmit={onSubmit} />}
    </div>
  )
}
