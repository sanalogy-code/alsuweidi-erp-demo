import { CheckCircle, Clock, XCircle, Plus } from 'lucide-react'

// Two-step chain: line manager first, then HR final approval.
const STATUS_STYLE = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Awaiting HR' },
  pending_manager: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Awaiting manager' },
  pending_hr: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Awaiting HR' },
  approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Approved' },
  denied: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Denied' },
}

// actionable: which statuses the current viewer may action. Managers act on
// 'pending_manager'; HR acts on 'pending_hr' (and may step in on any pending).
export default function LeaveRequestsList({ requests, onRequestNewLeave, onApprove, onDeny, actionable = ['pending', 'pending_manager', 'pending_hr'], approveLabel = 'Approve' }) {
  const canAct = !!onApprove && !!onDeny
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-gray-500 mb-3">No leave requests yet</div>
        <button
          onClick={onRequestNewLeave}
          className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center gap-2 mx-auto"
        >
          <Plus size={14} /> Request Leave
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Leave Requests ({requests.length})</h2>
          <p className="text-xs text-gray-500">Pending and approved leave requests.</p>
        </div>
        <button
          onClick={onRequestNewLeave}
          className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1"
        >
          <Plus size={14} /> Request Leave
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Employee</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Type</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Dates</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Days</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Reason</th>
              {canAct && <th className="text-right px-4 py-2 font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => {
              const statusInfo = STATUS_STYLE[req.status] || STATUS_STYLE.pending
              const Icon = statusInfo.icon
              return (
                <tr key={req.id} className={`border-b border-gray-100 ${statusInfo.bg} hover:opacity-80 transition`}>
                  <td className="px-4 py-2 font-medium text-gray-800">{req.employeeName}</td>
                  <td className="px-4 py-2 text-gray-700">{req.type}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">
                    {new Date(req.startDate).toLocaleDateString('en-AE')} → {new Date(req.endDate).toLocaleDateString('en-AE')}
                  </td>
                  <td className="px-4 py-2 text-center font-medium text-gray-800">{req.days}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <Icon size={14} className={statusInfo.color} />
                      <span className="text-xs font-medium text-gray-700">{statusInfo.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-600">
                    {req.reason || '—'}
                    {req.managerApprovedBy && <div className="text-[10px] text-gray-400">Manager approved by {req.managerApprovedBy}</div>}
                  </td>
                  {canAct && (
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      {actionable.includes(req.status) && (
                        <span className="flex items-center justify-end gap-2">
                          <button onClick={() => onApprove(req.id)} className="text-xs font-medium text-green-700 hover:underline">{approveLabel}</button>
                          <button onClick={() => onDeny(req.id)} className="text-xs font-medium text-red-600 hover:underline">Deny</button>
                        </span>
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
