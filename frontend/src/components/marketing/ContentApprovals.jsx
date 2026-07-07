import { useState } from 'react'
import { BadgeCheck, Check, X } from 'lucide-react'
import { CONTENT_STATUSES } from '../../data/marketingData'

import { todayISO } from '../../utils/date'

// Content approval chain — content statuses already flow
// idea → draft → pending approval → approved → published; this view makes the
// approval step an explicit RECORD (who, when, optional comment) instead of a
// silent status flip, and gives management/marketing lead a "pending my
// approval" queue. Rejection sends the item back to draft with the comment.
export default function ContentApprovals({ items, user, onUpdateItem }) {
  const [commentFor, setCommentFor] = useState(null)
  const [comment, setComment] = useState('')

  const pending = items.filter((i) => i.status === 'pending_approval')
  const approved = items.filter((i) => i.approval).sort((a, b) => (b.approval.date > a.approval.date ? 1 : -1))

  const approve = (item) => {
    onUpdateItem({ ...item, status: 'approved', approval: { by: user?.name || 'Approver', date: todayISO(), comment: comment.trim() } })
    setCommentFor(null); setComment('')
  }
  const sendBack = (item) => {
    onUpdateItem({ ...item, status: 'draft', notes: comment.trim() ? `Sent back: ${comment.trim()}` : item.notes })
    setCommentFor(null); setComment('')
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><BadgeCheck size={15} className="text-brand" /> Content approvals</h2>
        <p className="text-xs text-gray-500">Approving here records who signed off, when, and any comment — shown on the item.</p>
      </div>

      {/* Pending my approval */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-700">
          Pending my approval <span className="font-normal text-gray-400">({pending.length})</span>
        </div>
        <div className="divide-y divide-gray-100">
          {pending.map((i) => (
            <div key={i.id} className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-800 flex-1 min-w-0">{i.title}</span>
                <span className="text-xs text-gray-400">{i.type} · {i.channel} · planned {i.date}</span>
              </div>
              {i.copy && <p className="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2">{i.copy}</p>}
              {commentFor === i.id ? (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment…" className="flex-1 min-w-[180px] border rounded-md px-2 py-1.5" autoFocus />
                  <button onClick={() => approve(i)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-green-600 text-white"><Check size={12} /> Approve</button>
                  <button onClick={() => sendBack(i)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50"><X size={12} /> Send back to draft</button>
                  <button onClick={() => { setCommentFor(null); setComment('') }} className="px-2.5 py-1.5 rounded-md border text-gray-500">Cancel</button>
                </div>
              ) : (
                <button onClick={() => { setCommentFor(i.id); setComment('') }} className="text-xs font-medium text-brand hover:underline">Review & decide</button>
              )}
            </div>
          ))}
          {pending.length === 0 && <div className="p-6 text-center text-sm text-gray-400">Nothing waiting for approval — all clear.</div>}
        </div>
      </div>

      {/* Approval history */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-700">Approval records</div>
        <div className="divide-y divide-gray-100">
          {approved.map((i) => {
            const s = CONTENT_STATUSES[i.status] || CONTENT_STATUSES.approved
            return (
              <div key={i.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                <span className="flex-1 min-w-0 text-gray-700 truncate">{i.title}</span>
                <span className="text-gray-500 shrink-0">approved by <span className="text-gray-700 font-medium">{i.approval.by}</span> · {i.approval.date}</span>
                {i.approval.comment && <span className="text-gray-400 italic hidden sm:block truncate max-w-[220px]" title={i.approval.comment}>"{i.approval.comment}"</span>}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${s.chip}`}>{s.label}</span>
              </div>
            )
          })}
          {approved.length === 0 && <div className="p-6 text-center text-sm text-gray-400">No approvals recorded yet.</div>}
        </div>
      </div>

      <p className="text-[11px] text-gray-400">Approval-request notifications (email / in-app to the approver) are Phase 2 — for now the approver checks this queue.</p>
    </div>
  )
}
