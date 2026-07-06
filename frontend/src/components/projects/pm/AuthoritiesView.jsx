import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Landmark } from 'lucide-react'
import { AUTHORITY_TEMPLATES, authorityStageMeta } from '../../../data/pmData'

// UAE authority approvals tracker — Abu Dhabi-first (DMT/Binaa permits, ADCD fire
// track, utility NOC ladders, Estidama Pearl), Dubai secondary. Each workflow is a
// parallel track with a submit → comments → resubmit cycle history. Portals are
// data, not code; timelines are user-entered, never hardcoded (per research).

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function AuthoritiesView({ pm, onUpdate }) {
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [emirate, setEmirate] = useState('Abu Dhabi')

  const addWorkflow = (tpl) => {
    onUpdate({
      ...pm,
      authorities: [...pm.authorities, {
        id: Math.max(0, ...pm.authorities.map((a) => a.id)) + 1,
        authority: tpl.authority, type: tpl.type, portal: tpl.portal, notes: '',
        stages: tpl.stages.map((s) => ({ key: s, status: 'not_started', date: null })),
        cycles: [],
      }],
    })
    setShowAdd(false)
  }

  const setStage = (wf, stageKey, status) => {
    const event = { submitted: 'Submitted', comments: 'Comments received', resubmitted: 'Resubmitted', approved: 'Approved' }[status]
    onUpdate({
      ...pm,
      authorities: pm.authorities.map((a) => a.id === wf.id ? {
        ...a,
        stages: a.stages.map((s) => s.key === stageKey ? { ...s, status, date: todayISO() } : s),
        cycles: [...a.cycles, { id: Math.max(0, ...a.cycles.map((c) => c.id)) + 1, date: todayISO(), event: `${stageKey} — ${event}` }],
      } : a),
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Authority approvals ({pm.authorities.length} workflows)</h2>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Add workflow</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Emirate profile:</span>
            {Object.keys(AUTHORITY_TEMPLATES).map((e) => (
              <button key={e} onClick={() => setEmirate(e)} className={`px-2.5 py-1 rounded-md border ${emirate === e ? 'border-brand text-brand bg-brand/5' : 'border-gray-300 text-gray-600'}`}>{e}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {AUTHORITY_TEMPLATES[emirate].map((tpl, i) => (
              <button key={i} onClick={() => addWorkflow(tpl)} className="text-left border border-gray-200 rounded-md px-3 py-2 hover:border-brand transition">
                <div className="text-sm text-gray-800">{tpl.authority}</div>
                <div className="text-[11px] text-gray-400">{tpl.type} · portal: {tpl.portal} · {tpl.stages.length} stages</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {pm.authorities.length === 0 && !showAdd && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No authority workflows tracked yet.</div>
      )}

      {pm.authorities.map((wf) => {
        const open = expanded === wf.id
        const done = wf.stages.filter((s) => s.status === 'approved').length
        const waiting = wf.stages.some((s) => s.status === 'submitted' || s.status === 'comments' || s.status === 'resubmitted')
        return (
          <div key={wf.id} className="bg-white rounded-lg border border-gray-200">
            <button onClick={() => setExpanded(open ? null : wf.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <Landmark size={15} className="text-gray-400 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="text-sm text-gray-800">{wf.authority}</span>
                <span className="text-xs text-gray-400"> — {wf.type} · {wf.portal}</span>
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${done === wf.stages.length ? 'bg-green-100 text-green-700' : waiting ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {done === wf.stages.length ? 'Complete' : waiting ? 'Awaiting response' : `${done}/${wf.stages.length} stages`}
              </span>
              {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {open && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                {wf.notes && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">{wf.notes}</p>}
                <div className="space-y-1.5">
                  {wf.stages.map((s, i) => {
                    const meta = authorityStageMeta(s.status)
                    const prevApproved = i === 0 || wf.stages[i - 1].status === 'approved'
                    return (
                      <div key={s.key} className="flex items-center gap-3 text-sm">
                        <span className="w-5 text-xs text-gray-300">{i + 1}.</span>
                        <span className="flex-1 min-w-0 text-gray-700 truncate">{s.key}</span>
                        {s.date && <span className="text-xs text-gray-400">{s.date}</span>}
                        <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
                        {prevApproved && s.status !== 'approved' && (
                          <div className="flex gap-1 shrink-0">
                            {s.status === 'not_started' && <button onClick={() => setStage(wf, s.key, 'submitted')} className="px-2 py-0.5 text-[11px] rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand">Submit</button>}
                            {(s.status === 'submitted' || s.status === 'resubmitted') && (<>
                              <button onClick={() => setStage(wf, s.key, 'comments')} className="px-2 py-0.5 text-[11px] rounded-md border border-amber-300 text-amber-700 hover:bg-amber-50">Comments</button>
                              <button onClick={() => setStage(wf, s.key, 'approved')} className="px-2 py-0.5 text-[11px] rounded-md border border-green-300 text-green-700 hover:bg-green-50">Approved</button>
                            </>)}
                            {s.status === 'comments' && <button onClick={() => setStage(wf, s.key, 'resubmitted')} className="px-2 py-0.5 text-[11px] rounded-md border border-purple-300 text-purple-700 hover:bg-purple-50">Resubmit</button>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {wf.cycles.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Submission history</div>
                    {wf.cycles.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="text-gray-400 w-20">{c.date}</span><span>{c.event}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      <p className="text-[11px] text-gray-400">
        Abu Dhabi profile: utility NOC ladders (NOI → Preliminary → Final → Construction NOC) are prerequisites to the building permit; ADCD fire approval is its own two-stage track ending in a Certificate of Conformity; Estidama gates both permit and completion. Portal names (Binaa/MEPS/TAMM) are stored per workflow — they keep changing. Timelines are user-entered, never hardcoded.
      </p>
    </div>
  )
}
