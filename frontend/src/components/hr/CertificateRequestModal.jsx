import { useState } from 'react'
import Modal from '../crm/Modal'
import { CERTIFICATE_TYPES, CERTIFICATE_LANGUAGES, ADDRESSEE_SUGGESTIONS } from '../../data/hrData'

export default function CertificateRequestModal({ user, employees = [], onClose, onSubmit }) {
  const [type, setType] = useState(CERTIFICATE_TYPES[0].value)
  const [addressedTo, setAddressedTo] = useState('')
  const [language, setLanguage] = useState('English')
  const [purpose, setPurpose] = useState('')
  const [nocObject, setNocObject] = useState('')

  const selectedType = CERTIFICATE_TYPES.find((t) => t.value === type)
  // Requests are always for the logged-in person. Link to their employee record when the
  // demo login name matches one; the name alone is enough for the request either way.
  const matchedEmployee = employees.find((e) => e.name.toLowerCase() === (user?.username || '').toLowerCase())

  const handleSubmit = () => {
    if (!addressedTo.trim()) {
      alert('Please specify who this certificate is addressed to')
      return
    }
    if (type === 'noc' && !nocObject.trim()) {
      alert('Please specify what the NOC is for')
      return
    }
    onSubmit({
      employeeId: matchedEmployee?.id ?? null,
      employeeName: matchedEmployee?.name || user?.username || 'Unknown',
      type,
      addressedTo: addressedTo.trim(),
      language,
      purpose: purpose.trim(),
      nocObject: nocObject.trim(),
      status: 'pending',
      requestedDate: new Date().toISOString().slice(0, 10),
      resolvedDate: null,
    })
    onClose()
  }

  return (
    <Modal title="Request Certificate" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800">
            {matchedEmployee ? `${matchedEmployee.name} — ${matchedEmployee.title}` : user?.username}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {CERTIFICATE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {selectedType && <p className="text-xs text-gray-500 mt-1">{selectedType.description}</p>}
        </div>

        {type === 'noc' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What is the NOC for?</label>
            <input
              value={nocObject}
              onChange={(e) => setNocObject(e.target.value)}
              placeholder="e.g. UAE driving license, part-time work, visa sponsorship transfer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Addressed To</label>
            <input
              list="addressee-suggestions"
              value={addressedTo}
              onChange={(e) => setAddressedTo(e.target.value)}
              placeholder="e.g. To Whom It May Concern"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <datalist id="addressee-suggestions">
              {ADDRESSEE_SUGGESTIONS.map((a) => <option key={a} value={a} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {CERTIFICATE_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose (optional)</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="What is this certificate for?"
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark"
          >
            Submit Request
          </button>
        </div>
      </div>
    </Modal>
  )
}
