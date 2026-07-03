import { useRef, useState } from 'react'
import { FileCheck, Upload, AlertCircle, X, RefreshCw } from 'lucide-react'

// Typed document slots: every upload declares what it is, required slots are
// enforced by the parent (missingRequiredDocs helper below). Upload is mocked —
// we keep the file name only; real storage arrives with the Phase 2 backend.
//
// Review flow (decision 3 Jul): every document carries a status — pending
// (awaiting HR review) → verified, or rejected with a reason that prompts the
// employee to re-upload. Pass canReview for HR-side verify/reject actions;
// docs without a status (older records) count as pending.

export function missingRequiredDocs(docTypes, documents, ctx = {}) {
  return docTypes.filter((t) => {
    const required = t.requiredWhen === 'always' || (t.requiredWhen === 'nonUaeNational' && ctx.nonUaeNational)
    return required && !documents.some((d) => d.type === t.key)
  })
}

export const docStatusOf = (d) => d.status || 'pending'

const DOC_STATUS_CHIP = {
  pending: { label: 'Pending review', chip: 'bg-yellow-100 text-yellow-700' },
  verified: { label: 'Verified', chip: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', chip: 'bg-red-100 text-red-700' },
}

export default function DocumentChecklist({ docTypes, documents, onChange, readOnly = false, canReview = false, reviewerName = '', ctx = {} }) {
  const fileRef = useRef(null)
  const [pendingType, setPendingType] = useState(null)
  // Doc currently being replaced (rejection → re-upload), and one being rejected (reason input)
  const [replacing, setReplacing] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const docsFor = (key) => documents.filter((d) => d.type === key)
  const isRequired = (t) => t.requiredWhen === 'always' || (t.requiredWhen === 'nonUaeNational' && ctx.nonUaeNational)

  const startUpload = (key, replaceDoc = null) => {
    setPendingType(key)
    setReplacing(replaceDoc)
    fileRef.current?.click()
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file && pendingType) {
      const fresh = { type: pendingType, fileName: file.name, uploadedDate: new Date().toISOString().slice(0, 10), status: 'pending', reviewedBy: null, reviewedDate: null, rejectReason: null }
      onChange(replacing ? documents.map((d) => (d === replacing ? fresh : d)) : [...documents, fresh])
    }
    e.target.value = ''
    setPendingType(null)
    setReplacing(null)
  }

  const remove = (doc) => onChange(documents.filter((d) => d !== doc))

  const review = (doc, status, reason = null) => {
    onChange(documents.map((d) => (d === doc
      ? { ...d, status, rejectReason: reason, reviewedBy: reviewerName || 'HR', reviewedDate: new Date().toISOString().slice(0, 10) }
      : d)))
    setRejecting(null)
    setRejectReason('')
  }

  return (
    <div className="space-y-2">
      {!readOnly && <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />}
      {docTypes.map((t) => {
        const uploaded = docsFor(t.key)
        const required = isRequired(t)
        const missing = required && uploaded.length === 0
        return (
          <div key={t.key} className={`rounded-lg border p-3 ${missing ? 'border-red-200 bg-red-50/40' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {uploaded.length > 0
                  ? <FileCheck size={15} className="text-green-600 shrink-0" />
                  : missing
                    ? <AlertCircle size={15} className="text-red-500 shrink-0" />
                    : <Upload size={15} className="text-gray-300 shrink-0" />}
                <span className="text-sm text-gray-800 truncate">{t.label}</span>
                {required && <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${missing ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>Required</span>}
              </div>
              {!readOnly && (
                <button type="button" onClick={() => startUpload(t.key)} className="text-xs font-medium text-brand hover:underline shrink-0">
                  {uploaded.length > 0 ? 'Add another' : 'Upload'}
                </button>
              )}
            </div>
            {uploaded.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploaded.map((d, i) => {
                  const status = docStatusOf(d)
                  const chip = DOC_STATUS_CHIP[status]
                  return (
                    <div key={i} className="bg-gray-50 rounded px-2 py-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 truncate">{d.fileName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-gray-400">{d.uploadedDate}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${chip.chip}`}>{chip.label}</span>
                          {canReview && status !== 'verified' && (
                            <button type="button" onClick={() => review(d, 'verified')} className="text-green-700 font-medium hover:underline">Verify</button>
                          )}
                          {canReview && status !== 'rejected' && (
                            <button type="button" onClick={() => { setRejecting(rejecting === d ? null : d); setRejectReason('') }} className="text-red-600 font-medium hover:underline">Reject</button>
                          )}
                          {!readOnly && status === 'rejected' && (
                            <button type="button" onClick={() => startUpload(t.key, d)} className="text-brand font-medium hover:underline flex items-center gap-0.5">
                              <RefreshCw size={11} /> Re-upload
                            </button>
                          )}
                          {!readOnly && (
                            <button type="button" onClick={() => remove(d)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                          )}
                        </div>
                      </div>
                      {status === 'rejected' && d.rejectReason && (
                        <div className="text-[11px] text-red-600 mt-0.5">
                          Rejected{d.reviewedBy ? ` by ${d.reviewedBy}` : ''}: {d.rejectReason} — please re-upload.
                        </div>
                      )}
                      {canReview && rejecting === d && (
                        <div className="mt-1.5 flex gap-2">
                          <input
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason (goes back to the employee)…"
                            className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                          />
                          <button type="button" onClick={() => review(d, 'rejected', rejectReason.trim() || 'Please re-upload a clearer copy.')} className="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700">Reject</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
