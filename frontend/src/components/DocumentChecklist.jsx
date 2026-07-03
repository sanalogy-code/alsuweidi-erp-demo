import { useRef, useState } from 'react'
import { FileCheck, Upload, AlertCircle, X } from 'lucide-react'

// Typed document slots: every upload declares what it is, required slots are
// enforced by the parent (missingRequiredDocs helper below). Upload is mocked —
// we keep the file name only; real storage arrives with the Phase 2 backend.

export function missingRequiredDocs(docTypes, documents, ctx = {}) {
  return docTypes.filter((t) => {
    const required = t.requiredWhen === 'always' || (t.requiredWhen === 'nonUaeNational' && ctx.nonUaeNational)
    return required && !documents.some((d) => d.type === t.key)
  })
}

export default function DocumentChecklist({ docTypes, documents, onChange, readOnly = false, ctx = {} }) {
  const fileRef = useRef(null)
  const [pendingType, setPendingType] = useState(null)

  const docsFor = (key) => documents.filter((d) => d.type === key)
  const isRequired = (t) => t.requiredWhen === 'always' || (t.requiredWhen === 'nonUaeNational' && ctx.nonUaeNational)

  const startUpload = (key) => {
    setPendingType(key)
    fileRef.current?.click()
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file && pendingType) {
      onChange([...documents, { type: pendingType, fileName: file.name, uploadedDate: new Date().toISOString().slice(0, 10) }])
    }
    e.target.value = ''
    setPendingType(null)
  }

  const remove = (doc) => onChange(documents.filter((d) => d !== doc))

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
                {uploaded.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                    <span className="text-gray-600 truncate">{d.fileName}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-400">{d.uploadedDate}</span>
                      {!readOnly && (
                        <button type="button" onClick={() => remove(d)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
