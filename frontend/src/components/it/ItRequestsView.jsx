import { useState } from 'react'
import { Plus, Check, X, PackageCheck } from 'lucide-react'
import { IT_REQUEST_TYPES, IT_REQUEST_STATUS } from '../../data/itData'

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

// mode 'mine': the employee's own requests + a new-request form.
// mode 'queue': the IT workspace — every request, actioned inline
// (approve → procure → fulfil, or reject with a reason).
export default function ItRequestsView({ requests, user, mode = 'mine', onSubmit, onAction }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ type: IT_REQUEST_TYPES[0], item: '', justification: '' })
  const [resolutionFor, setResolutionFor] = useState(null)
  const [resolutionText, setResolutionText] = useState('')
  const [resolutionStatus, setResolutionStatus] = useState('approved')

  const myName = (user?.username || '').toLowerCase()
  const rows = (mode === 'mine'
    ? requests.filter((r) => r.requestedBy.toLowerCase() === myName)
    : [...requests]
  ).sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || b.requestedDate.localeCompare(a.requestedDate))

  const submit = (e) => {
    e.preventDefault()
    if (!form.item.trim()) return
    onSubmit({
      requestedBy: user?.username || 'Unknown',
      type: form.type,
      item: form.item.trim(),
      justification: form.justification.trim() || null,
      requestedDate: new Date().toISOString().slice(0, 10),
      status: 'pending',
      resolution: null,
      resolvedDate: null,
    })
    setForm({ type: IT_REQUEST_TYPES[0], item: '', justification: '' })
    setAdding(false)
  }

  const resolve = (req) => {
    onAction({ ...req, status: resolutionStatus, resolution: resolutionText.trim() || null, resolvedDate: new Date().toISOString().slice(0, 10) })
    setResolutionFor(null)
    setResolutionText('')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-start gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            {mode === 'mine' ? 'My IT requests' : `Request queue (${requests.filter((r) => r.status === 'pending').length} pending)`}
          </h2>
          <p className="text-xs text-gray-500">
            {mode === 'mine'
              ? 'Hardware, software seats, repairs, and access — IT actions these from its queue.'
              : 'Approve → procure → fulfil, or reject with a reason. Fulfilments should land in the asset registry.'}
          </p>
        </div>
        {mode === 'mine' && !adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand-dark transition shrink-0">
            <Plus size={13} /> New request
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={submit} className="p-4 border-b border-gray-200 bg-blue-50/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                {IT_REQUEST_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>What do you need? *</label>
              <input required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="e.g. Second monitor" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Why? (helps IT prioritise)</label>
            <input value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} className={inputCls} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark">Submit request</button>
            <button type="button" onClick={() => setAdding(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      {rows.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-400">
          {mode === 'mine' ? 'No requests yet — anything you need to work better?' : 'Queue is empty'}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {rows.map((req) => {
            const status = IT_REQUEST_STATUS[req.status]
            return (
              <div key={req.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800">{req.item}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {req.type} • {mode === 'queue' && `${req.requestedBy} • `}requested {req.requestedDate}
                    </div>
                    {req.justification && <div className="text-xs text-gray-600 mt-1">{req.justification}</div>}
                    {req.resolution && (
                      <div className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1 inline-block">↳ {req.resolution}{req.resolvedDate && ` (${req.resolvedDate})`}</div>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${status.chip}`}>{status.label}</span>
                </div>

                {mode === 'queue' && (req.status === 'pending' || req.status === 'approved') && (
                  resolutionFor === req.id ? (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3 space-y-2">
                      <input
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        placeholder={resolutionStatus === 'rejected' ? 'Reason for rejection…' : 'Resolution note (what was assigned / ordered)…'}
                        className={inputCls}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => resolve(req)} className="px-3 py-1.5 bg-brand text-white rounded-md text-xs font-medium hover:bg-brand-dark">
                          Mark {IT_REQUEST_STATUS[resolutionStatus].label.toLowerCase()}
                        </button>
                        <button onClick={() => setResolutionFor(null)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setResolutionFor(req.id); setResolutionStatus('approved'); setResolutionText('') }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => { setResolutionFor(req.id); setResolutionStatus('rejected'); setResolutionText('') }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}
                      {req.status === 'approved' && (
                        <button
                          onClick={() => { setResolutionFor(req.id); setResolutionStatus('fulfilled'); setResolutionText(req.resolution || '') }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          <PackageCheck size={12} /> Mark fulfilled
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
