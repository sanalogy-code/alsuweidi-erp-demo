import { Inbox, FileText } from 'lucide-react'
import { CERTIFICATE_TYPES, OPEN_POSITIONS } from '../../data/hrData'
import { daysAgo } from '../../utils/date'

const KIND_CHIP = {
  leave: 'bg-amber-100 text-amber-700',
  certificate: 'bg-blue-100 text-blue-700',
  card: 'bg-teal-100 text-teal-700',
  concern: 'bg-red-100 text-red-700',
  candidate: 'bg-green-100 text-green-700',
  joiner: 'bg-purple-100 text-purple-700',
}

const KIND_LABEL = { leave: 'Leave', certificate: 'Certificate', card: 'Business card', concern: 'Concern', candidate: 'Candidate', joiner: 'New joiner' }

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const certLabel = (v) => CERTIFICATE_TYPES.find((t) => t.value === v)?.label || v

// One queue of everything waiting on HR, oldest first — replaces per-type badge chasing.
// Leave shows only once the line manager has approved (status 'pending_hr'; legacy
// 'pending' counts too) — 'pending_manager' weeks sit with the manager, not HR.
export function buildInboxItems({ leaveRequests, certificateRequests, complaints, candidates, businessCardRequests = [] }) {
  return [
    ...leaveRequests.filter((r) => r.status === 'pending' || r.status === 'pending_hr').map((r) => ({
      key: `l${r.id}`, kind: 'leave', date: r.requestedDate || r.startDate, ref: r,
      text: `${r.employeeName} — ${r.type} ${fmt(r.startDate)}–${fmt(r.endDate)} (${r.days}d)`,
      sub: r.managerApprovedBy ? `Manager approved (${r.managerApprovedBy}) — HR final approval${r.reason ? ` • ${r.reason}` : ''}` : `No line manager — HR approves directly${r.reason ? ` • ${r.reason}` : ''}`,
    })),
    ...certificateRequests.filter((r) => r.status === 'pending').map((r) => ({
      key: `c${r.id}`, kind: 'certificate', date: r.requestedDate, ref: r,
      text: `${r.employeeName} — ${certLabel(r.type)} for ${r.addressedTo}`,
      sub: r.nocObject || r.purpose || '',
    })),
    ...businessCardRequests.filter((r) => r.status === 'pending').map((r) => ({
      key: `b${r.id}`, kind: 'card', date: r.requestedDate, ref: r,
      text: `${r.employeeName} — business card: ${r.nameOnCard}, ${r.titleOnCard}`,
      sub: [r.mobile, r.notes].filter(Boolean).join(' • '),
    })),
    ...complaints.filter((c) => c.status === 'submitted' || c.status === 'under_review').map((c) => ({
      key: `x${c.id}`, kind: 'concern', date: c.submittedDate, ref: c,
      text: `${c.anonymous ? 'Anonymous' : c.submittedBy} — ${c.category}`,
      sub: c.description,
    })),
    ...candidates.filter((c) => c.status === 'new').map((c) => ({
      key: `p${c.id}`, kind: 'candidate', date: c.submittedDate, ref: c,
      text: `${c.candidateName} — ${OPEN_POSITIONS.find((p) => p.id === c.positionId)?.title || 'position'} (${c.kind === 'referral' ? `referred by ${c.referredBy}` : 'internal applicant'})`,
      sub: c.note || '',
    })),
  ].sort((a, b) => a.date.localeCompare(b.date))
}

export default function HRInbox({ leaveRequests, certificateRequests, complaints, candidates, businessCardRequests = [], newJoiners = [], onLeaveAction, onPrepareCert, onRejectCert, onAdvanceComplaint, onAdvanceCandidate, onFulfilCard, onReviewJoiner }) {
  const joinerItems = newJoiners.map((j) => ({
    key: `j${j.id}`, kind: 'joiner', date: j.submittedDate, ref: j,
    text: `${j.personal.firstName} ${j.personal.lastName}${j.positionTitle ? ` — ${j.positionTitle}` : ''} (profile submitted)`,
    sub: `${j.documents.length} documents uploaded — verify and complete the employment record`,
  }))
  const items = [...buildInboxItems({ leaveRequests, certificateRequests, complaints, candidates, businessCardRequests }), ...joinerItems]
    .sort((a, b) => a.date.localeCompare(b.date))
  const issuedLetters = certificateRequests
    .filter((r) => r.status === 'issued' && r.letterText)
    .sort((a, b) => (b.resolvedDate || '').localeCompare(a.resolvedDate || ''))
    .slice(0, 5)

  const actionsFor = (item) => {
    if (item.kind === 'leave') return (
      <>
        <button onClick={() => onLeaveAction(item.ref.id, 'approved')} className="text-xs font-medium text-green-700 hover:underline">Approve</button>
        <button onClick={() => onLeaveAction(item.ref.id, 'denied')} className="text-xs font-medium text-red-600 hover:underline">Deny</button>
      </>
    )
    if (item.kind === 'certificate') return (
      <>
        <button onClick={() => onPrepareCert(item.ref)} className="text-xs font-medium text-brand hover:underline">Prepare Letter</button>
        <button onClick={() => onRejectCert(item.ref.id)} className="text-xs font-medium text-red-600 hover:underline">Reject</button>
      </>
    )
    if (item.kind === 'card') return (
      <button onClick={() => onFulfilCard(item.ref.id)} className="text-xs font-medium text-green-700 hover:underline">Mark printed &amp; delivered</button>
    )
    if (item.kind === 'concern') return item.ref.status === 'submitted' ? (
      <button onClick={() => onAdvanceComplaint(item.ref.id, 'under_review')} className="text-xs font-medium text-brand hover:underline">Start Review</button>
    ) : (
      <button onClick={() => onAdvanceComplaint(item.ref.id, 'resolved')} className="text-xs font-medium text-green-700 hover:underline">Mark Resolved</button>
    )
    if (item.kind === 'candidate') return (
      <>
        <button onClick={() => onAdvanceCandidate(item.ref.id, 'interviewing')} className="text-xs font-medium text-brand hover:underline">Interview</button>
        <button onClick={() => onAdvanceCandidate(item.ref.id, 'rejected')} className="text-xs font-medium text-red-600 hover:underline">Reject</button>
      </>
    )
    if (item.kind === 'joiner') return (
      <button onClick={() => onReviewJoiner(item.ref)} className="text-xs font-medium text-brand hover:underline">Review & complete</button>
    )
    return null
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Inbox size={15} className="text-brand" /> Inbox ({items.length})
          </h2>
          <p className="text-xs text-gray-500">Everything waiting on HR — leave, certificates, business cards, concerns, and candidates — oldest first.</p>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Inbox zero — nothing waiting on HR.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Fixed-width columns (chip / description / age / actions) so the eye can run down the queue */}
            {items.map((item) => (
              <div key={item.key} className="px-4 py-3 flex items-center gap-3">
                <span className={`w-24 shrink-0 px-2 py-0.5 rounded text-xs font-medium text-center ${KIND_CHIP[item.kind]}`}>{KIND_LABEL[item.kind]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{item.text}</div>
                  {item.sub && <div className="text-xs text-gray-500 truncate">{item.sub}</div>}
                </div>
                <span className="w-16 shrink-0 text-xs text-gray-400 text-right whitespace-nowrap">{daysAgo(item.date)}</span>
                <div className="w-44 shrink-0 flex items-center justify-end gap-2">{actionsFor(item)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {issuedLetters.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Recently issued letters</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {issuedLetters.map((r) => (
              <div key={r.id} className="px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-700 truncate">{r.employeeName} — {certLabel(r.type)} ({r.language})</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">{r.resolvedDate ? fmt(r.resolvedDate) : ''}</span>
                  <button onClick={() => onPrepareCert(r)} className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
                    <FileText size={12} /> View Letter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
