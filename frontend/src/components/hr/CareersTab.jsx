import { useState } from 'react'
import { Briefcase, UserPlus, Send, Gift } from 'lucide-react'
import Modal from '../crm/Modal'
import { REFERRAL_BONUS_AED } from '../../data/hrData'
import { todayISO } from '../../utils/date'

const CAND_STATUS = {
  new: { label: 'New', color: 'bg-yellow-100 text-yellow-700' },
  interviewing: { label: 'Interviewing', color: 'bg-blue-100 text-blue-700' },
  hired: { label: 'Hired', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-gray-100 text-gray-500' },
}

function CandidateModal({ kind, position, user, onClose, onSubmit }) {
  const [name, setName] = useState(kind === 'internal' ? (user?.username || '') : '')
  const [contact, setContact] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Candidate name is required')
      return
    }
    onSubmit({
      positionId: position.id,
      kind,
      candidateName: name.trim(),
      contact: contact.trim(),
      referredBy: kind === 'referral' ? user?.username : null,
      note: note.trim(),
      status: 'new',
      submittedDate: todayISO(),
    })
    onClose()
  }

  return (
    <Modal title={kind === 'referral' ? `Refer someone — ${position.title}` : `Apply internally — ${position.title}`} onClose={onClose}>
      <div className="space-y-4">
        {kind === 'referral' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-xs text-green-800">
            AED {REFERRAL_BONUS_AED} gift for you if your candidate is hired — paid with the next payroll run.
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{kind === 'referral' ? 'Candidate Name' : 'Your Name'}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            readOnly={kind === 'internal'}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand ${kind === 'internal' ? 'bg-gray-50 text-gray-600' : ''}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{kind === 'referral' ? 'Contact (email or phone)' : 'Contact (optional)'}</label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{kind === 'referral' ? 'Why are they a good fit?' : 'Why are you a good fit?'}</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand" />
        </div>
        <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-500">CV upload arrives with Phase 2 document storage — for now HR will contact the candidate directly.</div>
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark">Submit</button>
        </div>
      </div>
    </Modal>
  )
}

export default function CareersTab({ positions, candidates, user, isHrStaff, onSubmitCandidate, onAdvanceCandidate, referralBonuses = [] }) {
  const [modal, setModal] = useState(null) // { kind, position }

  const mine = candidates.filter((c) => c.referredBy === user?.username || (c.kind === 'internal' && c.candidateName === user?.username))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2"><Briefcase size={15} className="text-brand" /> Open Positions ({positions.length})</h2>
        <p className="text-xs text-gray-500">Refer a candidate or apply internally — referral bonus paid if your candidate is hired.</p>
      </div>

      <div className="space-y-4">
        {positions.map((p) => {
          const pipeline = candidates.filter((c) => c.positionId === p.id)
          return (
            <div key={p.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 flex justify-between items-start gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{p.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.dept} • {p.location} • {p.type} • Posted {new Date(p.postedDate).toLocaleDateString('en-AE')}</div>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                    <Gift size={11} /> AED {REFERRAL_BONUS_AED} referral gift
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setModal({ kind: 'referral', position: p })}
                    className="flex items-center gap-1 text-xs font-medium text-brand border border-brand/30 px-3 py-1.5 rounded-md hover:bg-brand/5"
                  >
                    <UserPlus size={13} /> Refer someone
                  </button>
                  <button
                    onClick={() => setModal({ kind: 'internal', position: p })}
                    className="flex items-center gap-1 text-xs font-medium text-white bg-brand px-3 py-1.5 rounded-md hover:bg-brand-dark"
                  >
                    <Send size={13} /> Apply internally
                  </button>
                </div>
              </div>

              {isHrStaff && pipeline.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pipeline ({pipeline.length})</div>
                  {pipeline.map((c) => {
                    const meta = CAND_STATUS[c.status]
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-4 text-sm">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-800">{c.candidateName}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {c.kind === 'referral' ? `referred by ${c.referredBy}` : 'internal applicant'}{c.contact ? ` • ${c.contact}` : ''}
                          </span>
                          {c.note && <div className="text-xs text-gray-500 truncate">{c.note}</div>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {c.status === 'hired' && c.referredBy && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
                              <Gift size={11} /> AED {REFERRAL_BONUS_AED} to {c.referredBy}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>{meta.label}</span>
                          {c.status === 'new' && (
                            <button onClick={() => onAdvanceCandidate(c.id, 'interviewing')} className="text-xs font-medium text-brand hover:underline">Interview</button>
                          )}
                          {c.status === 'interviewing' && (
                            <>
                              <button onClick={() => onAdvanceCandidate(c.id, 'hired')} className="text-xs font-medium text-green-700 hover:underline">Hire</button>
                              <button onClick={() => onAdvanceCandidate(c.id, 'rejected')} className="text-xs font-medium text-red-600 hover:underline">Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!isHrStaff && mine.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">My referrals & applications</div>
          <div className="space-y-1.5">
            {mine.map((c) => {
              const pos = positions.find((p) => p.id === c.positionId)
              const meta = CAND_STATUS[c.status]
              return (
                <div key={c.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{c.kind === 'referral' ? `${c.candidateName} → ` : 'Internal application → '}{pos?.title}</span>
                  <span className="flex items-center gap-2">
                    {c.status === 'hired' && c.kind === 'referral' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700"><Gift size={11} /> AED {REFERRAL_BONUS_AED} on its way</span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>{meta.label}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {modal && (
        <CandidateModal
          kind={modal.kind}
          position={modal.position}
          user={user}
          onClose={() => setModal(null)}
          onSubmit={onSubmitCandidate}
        />
      )}
    </div>
  )
}
