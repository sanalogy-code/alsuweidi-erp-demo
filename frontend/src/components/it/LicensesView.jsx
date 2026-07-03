import { AlertTriangle } from 'lucide-react'
import { parseLocalDate, todayLocal } from '../../utils/date'

// Software licenses — seats and renewal dates. Same radar idea as HR's renewals:
// anything within 60 days is flagged, overdue is red.

export default function LicensesView({ licenses }) {
  const daysTo = (d) => Math.ceil((parseLocalDate(d) - todayLocal()) / (1000 * 60 * 60 * 24))
  const rows = [...licenses].sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
  const totalYearly = licenses.reduce((s, l) => s + (l.costAedYearly || 0), 0)
  const dueSoon = rows.filter((l) => daysTo(l.renewalDate) <= 60)

  return (
    <div className="space-y-4">
      {dueSoon.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
            <AlertTriangle size={16} className="text-amber-600" /> {dueSoon.length} renewal{dueSoon.length > 1 ? 's' : ''} within 60 days
          </div>
          <div className="text-xs text-gray-500">Lapsed design software stops the drawing office — renew before expiry, not after.</div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Software licenses ({licenses.length})</h2>
          <p className="text-xs text-gray-500">Total AED {totalYearly.toLocaleString()} / year across all subscriptions.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">License</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Owner</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Seats</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Cost / yr</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Renewal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const days = daysTo(l.renewalDate)
                const seatsFull = l.seatsUsed >= l.seats
                return (
                  <tr key={l.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 font-medium text-gray-800">{l.name}</td>
                    <td className="px-4 py-2 text-gray-600">{l.owner}</td>
                    <td className="px-4 py-2">
                      <span className={seatsFull ? 'text-amber-700 font-medium' : 'text-gray-600'}>
                        {l.seatsUsed} / {l.seats}{seatsFull && ' — full'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">{l.costAedYearly.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={days < 0 ? 'text-red-600 font-medium' : days <= 60 ? 'text-amber-700 font-medium' : 'text-gray-600'}>
                        {l.renewalDate}
                        {days < 0 ? ` — ${-days}d overdue` : days <= 60 ? ` — in ${days}d` : ''}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
