import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Play, PartyPopper } from 'lucide-react'
import { ONBOARDING_SECTIONS, TYPE_META } from '../../data/hrData'

export default function OnboardingChecklist({ userName }) {
  const [completed, setCompleted] = useState(new Set())
  const [expandedId, setExpandedId] = useState(ONBOARDING_SECTIONS[0].id)
  const [watched, setWatched] = useState(new Set())
  const [acknowledged, setAcknowledged] = useState(false)

  const total = ONBOARDING_SECTIONS.length
  const done = completed.size
  const allDone = done === total
  const pct = Math.round((done / total) * 100)

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id)
  }

  function toggleComplete(id) {
    const next = new Set(completed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCompleted(next)
  }

  function playVideo(id) {
    setWatched(new Set(watched).add(id))
  }

  if (acknowledged) {
    return (
      <div className="bg-white rounded-lg border border-green-200 shadow-sm p-12 text-center">
        <PartyPopper size={40} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Onboarding Complete!</h2>
        <p className="text-sm text-gray-500 mb-1">
          {userName ? `${userName}, y` : 'Y'}ou've read, watched, and acknowledged all {total} onboarding items.
        </p>
        <p className="text-xs text-gray-400">Completed today. HR has been notified.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-800">Your Onboarding Progress</h3>
          <span className="text-sm font-bold text-brand">{done} / {total} complete</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Section cards */}
      <div className="space-y-3">
        {ONBOARDING_SECTIONS.map((s) => {
          const isDone = completed.has(s.id)
          const isExpanded = expandedId === s.id
          const meta = TYPE_META[s.type]
          return (
            <div
              key={s.id}
              className={`bg-white rounded-lg border shadow-sm overflow-hidden transition ${isDone ? 'border-green-300' : 'border-gray-200'}`}
            >
              <button onClick={() => toggleExpand(s.id)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                  {isDone && <Check size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{s.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                    <span className="text-xs text-gray-400">{s.estMinutes} min</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.summary}</p>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-100">
                  {s.type === 'video' ? (
                    <div className="mb-4">
                      <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                        {watched.has(s.id) ? (
                          <div className="text-center text-white/90">
                            <Check size={32} className="mx-auto mb-2 text-green-400" />
                            <p className="text-sm">Watched</p>
                          </div>
                        ) : (
                          <button onClick={() => playVideo(s.id)} className="flex flex-col items-center gap-2 text-white/90 hover:text-white transition">
                            <div className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                              <Play size={22} fill="currentColor" />
                            </div>
                            <span className="text-xs">{s.videoLabel}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {s.content.map((p, i) => (
                        <p key={i} className="text-sm text-gray-600 leading-relaxed">{p}</p>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleComplete(s.id)}
                      className="w-4 h-4 accent-current text-brand rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {s.type === 'video' ? "I've watched this" : "I've read and understood this"}
                    </span>
                  </label>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Final acknowledgement */}
      <div className={`rounded-lg border-2 p-6 text-center transition ${allDone ? 'border-brand bg-brand-light' : 'border-dashed border-gray-200 bg-gray-50'}`}>
        <p className={`text-sm mb-4 ${allDone ? 'text-gray-700' : 'text-gray-400'}`}>
          {allDone
            ? 'By clicking below, you confirm you have read, watched, and understood all onboarding materials above.'
            : `Complete all ${total} items above to unlock your final acknowledgement.`}
        </p>
        <button
          disabled={!allDone}
          onClick={() => setAcknowledged(true)}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${allDone ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          I Acknowledge & Complete Onboarding
        </button>
      </div>
    </div>
  )
}
