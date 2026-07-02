import { CheckCircle, Clock, XCircle, Plus } from 'lucide-react'
import { CERTIFICATE_TYPES } from '../../data/hrData'

const STATUS_STYLE = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
  issued: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Issued' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Rejected' },
}

const typeLabel = (value) => CERTIFICATE_TYPES.find((t) => t.value === value)?.label || value

export default function CertificateRequestsList({ requests, isHrStaff, onNewRequest, onIssue, onReject }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-gray-500 mb-3">No certificate requests yet</div>
        <button
          onClick={onNewRequest}
          className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center gap-2 mx-auto"
        >
          <Plus size={14} /> Request Certificate
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Certificate Requests ({requests.length})</h2>
          <p className="text-xs text-gray-500">Salary, employment, NOC, bank, and embassy letters.</p>
        </div>
        <button
          onClick={onNewRequest}
          className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1"
        >
          <Plus size={14} /> Request Certificate
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Employee</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Type</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Addressed To</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Language</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Requested</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
              {isHrStaff && <th className="text-left px-4 py-2 font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => {
              const statusInfo = STATUS_STYLE[req.status]
              const Icon = statusInfo.icon
              return (
                <tr key={req.id} className={`border-b border-gray-100 ${statusInfo.bg} hover:opacity-90 transition`}>
                  <td className="px-4 py-2 font-medium text-gray-800">{req.employeeName}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {typeLabel(req.type)}
                    {req.nocObject && <div className="text-xs text-gray-500">{req.nocObject}</div>}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{req.addressedTo}</td>
                  <td className="px-4 py-2 text-gray-600 text-xs">{req.language}</td>
                  <td className="px-4 py-2 text-gray-600 text-xs">{new Date(req.requestedDate).toLocaleDateString('en-AE')}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <Icon size={14} className={statusInfo.color} />
                      <span className="text-xs font-medium text-gray-700">{statusInfo.label}</span>
                    </div>
                  </td>
                  {isHrStaff && (
                    <td className="px-4 py-2">
                      {req.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => onIssue(req.id)} className="text-xs font-medium text-green-700 hover:underline">Mark Issued</button>
                          <button onClick={() => onReject(req.id)} className="text-xs font-medium text-red-700 hover:underline">Reject</button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
