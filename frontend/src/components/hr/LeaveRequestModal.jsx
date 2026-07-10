import { useState } from 'react'
import Modal from '../crm/Modal'
import { LEAVE_TYPES } from '../../data/hrData'
import { todayISO } from '../../utils/date'

export default function LeaveRequestModal({ employee, onClose, onSubmit }) {
  const [type, setType] = useState('Vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const calculateDays = () => {
    if (!startDate || !endDate || endDate < startDate) return 0
    const diffTime = new Date(endDate) - new Date(startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const days = calculateDays()
  const invertedRange = startDate && endDate && endDate < startDate

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates')
      return
    }
    if (endDate < startDate) {
      alert('End date must be on or after the start date')
      return
    }
    onSubmit({
      employeeId: employee.id,
      employeeName: employee.name,
      type,
      startDate,
      endDate,
      days,
      reason,
      status: 'pending',
      requestedDate: todayISO(),
    })
    onClose()
  }

  return (
    <Modal title="Request Leave" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {days > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm font-medium text-blue-900">{days} day(s)</div>
          </div>
        )}
        {invertedRange && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm font-medium text-red-700">End date must be on or after the start date</div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you requesting leave?"
            rows="3"
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
