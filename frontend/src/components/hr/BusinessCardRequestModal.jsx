import { useState } from 'react'
import Modal from '../crm/Modal'
import { todayISO } from '../../utils/date'

// Self-service business card request — same request → HR inbox → fulfil shape
// as certificates. HR marks it printed & delivered to close it.
export default function BusinessCardRequestModal({ user, employees = [], onClose, onSubmit }) {
  // Requests are always for the logged-in person; link the employee record when the demo login name matches.
  const matchedEmployee = employees.find((e) => e.name.toLowerCase() === (user?.username || '').toLowerCase())

  const [nameOnCard, setNameOnCard] = useState(matchedEmployee?.name || user?.username || '')
  const [titleOnCard, setTitleOnCard] = useState(matchedEmployee?.title || '')
  const [mobile, setMobile] = useState(matchedEmployee?.mobilePhone || '')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!nameOnCard.trim() || !titleOnCard.trim()) {
      alert('Please fill the name and title as they should appear on the card')
      return
    }
    onSubmit({
      employeeId: matchedEmployee?.id ?? null,
      employeeName: matchedEmployee?.name || user?.username || 'Unknown',
      nameOnCard: nameOnCard.trim(),
      titleOnCard: titleOnCard.trim(),
      mobile: mobile.trim(),
      notes: notes.trim(),
      status: 'pending',
      requestedDate: todayISO(),
      resolvedDate: null,
    })
    onClose()
  }

  return (
    <Modal title="Request Business Card" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name (as on card)</label>
          <input
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (as on card)</label>
          <input
            value={titleOnCard}
            onChange={(e) => setTitleOnCard(e.target.value)}
            placeholder="e.g. Senior Structural Engineer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+971-5x-xxx-xxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. bilingual card, quantity, Arabic spelling of the name…"
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
