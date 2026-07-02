import { useState } from 'react'
import { Plane, FileText, ShieldAlert, Plus } from 'lucide-react'
import { CERTIFICATE_TYPES } from '../../data/hrData'

const KIND_META = {
  leave: { label: 'Leave', color: 'bg-amber-100 text-amber-700', icon: Plane },
  certificate: { label: 'Certificate', color: 'bg-blue-100 text-blue-700', icon: FileText },
  concern: { label: 'Concern', color: 'bg-red-100 text-red-700', icon: ShieldAlert },
}

const STATUS_CHIP = {
  pending: 'bg-yellow-100 text-yellow-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  issued: 'bg-green-100 text-green-700',
  resolved: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
}

const STATUS_LABEL = {
  pending: 'Pending', submitted: 'Submitted', under_review: 'Under Review',
  approved: 'Approved', issued: 'Issued', resolved: 'Resolved',
  denied: 'Denied', rejected: 'Rejected',
}

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const certLabel = (v) => CERTIFICATE_TYPES.find((t) => t.value === v)?.label || v

export default function MyRequests({ user, matchedEmployee, leaveRequests, certificateRequests, complaints, onNewLeave, onNewCertificate, onNewConcern }) {
  const [filter, setFilter] = useState('all')

  const myNames = [user?.username, matchedEmployee?.name].filter(Boolean).map((n) => n.toLowerCase())
  const isMine = (name) => myNames.includes((name || '').toLowerCase())

  const items = [
    ...leaveRequests.filter((r) => isMine(r.employeeName)).map((r) => ({
      key: `l${r.id}`, kind: 'leave', date: r.requestedDate || r.startDate, status: r.status,
      text: `${r.type} leave — ${fmt(r.startDate)} to ${fmt(r.endDate)} (${r.days} day${r.days === 1 ? '' : 's'})`,
    })),
    ...certificateRequests.filter((r) => isMine(r.employeeName)).map((r) => ({
      key: `c${r.id}`, kind: 'certificate', date: r.requestedDate, status: r.status,
      text: `${certLabel(r.type)} — ${r.addressedTo}`,
    })),
    ...complaints.filter((c) => !c.anonymous && isMine(c.submittedBy)).map((c) => ({
      key: `x${c.id}`, kind: 'concern', date: c.submittedDate, status: c.status,
      text: c.category,
    })),
  ]
    .filter((i) => filter === 'all' || i.kind === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <button onClick={onNewLeave} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-left hover:border-brand hover:shadow-md transition">
          <Plane size={18} className="text-brand mb-2" />
          <div className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Plus size={13} /> Request leave</div>
        </button>
        <button onClick={onNewCertificate} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-left hover:border-brand hover:shadow-md transition">
          <FileText size={18} className="text-brand mb-2" />
          <div className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Plus size={13} /> Request certificate</div>
        </button>
        <button onClick={onNewConcern} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-left hover:border-brand hover:shadow-md transition">
          <ShieldAlert size={18} className="text-brand mb-2" />
          <div className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Plus size={13} /> Raise a concern</div>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">My Requests</h2>
            <p className="text-xs text-gray-500">Everything you've submitted to HR, newest first. Anonymous concerns aren't tracked here.</p>
          </div>
          <div className="inline-flex bg-gray-100 rounded-md p-1 gap-1">
            {[['all', 'All'], ['leave', 'Leave'], ['certificate', 'Certificates'], ['concern', 'Concerns']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${filter === key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Nothing here yet — use the buttons above to submit a request.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((i) => {
              const kind = KIND_META[i.kind]
              const Icon = kind.icon
              return (
                <div key={i.key} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 flex items-center gap-1 ${kind.color}`}>
                      <Icon size={11} /> {kind.label}
                    </span>
                    <span className="text-sm text-gray-700 truncate">{i.text}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400">{fmt(i.date)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CHIP[i.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[i.status] || i.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
