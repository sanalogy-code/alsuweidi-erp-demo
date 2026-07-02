import { useState } from 'react'
import Modal from '../crm/Modal'
import { CERTIFICATE_TYPES, CERTIFICATE_LANGUAGES, ADDRESSEE_SUGGESTIONS } from '../../data/hrData'

export default function CertificateRequestModal({ employees, defaultEmployeeId, onClose, onSubmit }) {
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId || employees[0]?.id)
  const [type, setType] = useState(CERTIFICATE_TYPES[0].value)
  const [addressedTo, setAddressedTo] = useState('')
  const [language, setLanguage] = useState('English')
  const [purpose, setPurpose] = useState('')
  const [nocObject, setNocObject] = useState('')

  const selectedType = CERTIFICATE_TYPES.find((t) => t.value === type)

  const handleSubmit = () => {
    const employee = employees.find((e) => e.id === Number(employeeId))
    if (!employee) {
      alert('Select an employee')
      return
    }
    if (!addressedTo.trim()) {
      alert('Please specify who this certificate is addressed to')
      return
    }
    if (type === 'noc' && !nocObject.trim()) {
      alert('Please specify what the NOC is for')
      return
    }
    onSubmit({
      employeeId: employee.id,
      employeeName: employee.name,
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.title}</option>
            ))}
          </select>
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
