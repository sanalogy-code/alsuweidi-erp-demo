import { todayISO } from '../../utils/date'
import { useState } from 'react'
import { Star, CheckCircle, Send } from 'lucide-react'
import {
  APPRAISAL_CYCLE, APPRAISAL_COMPETENCIES, APPRAISAL_STEP_META, RATING_LABELS, appraisalScore,
} from '../../data/hrTalentData'

// Appraisals — one component, three lenses:
//   mode="self"    — my appraisal: fill & submit the self-assessment
//   mode="manager" — my team's appraisals: rate + comment, forward to HR
//   mode="hr"      — cycle overview: who's at which step, sign-off action
// Default model to react to; see the on-screen note.

const chip = (status) => {
  const m = APPRAISAL_STEP_META[status] || APPRAISAL_STEP_META.self
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${m.color}`}>{m.label}</span>
}

function ModelNote() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-800">
      Default model for sign-off — cycle, competencies and rating scale to be agreed.
    </div>
  )
}

function RatingPicker({ value, onChange, readOnly }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          title={RATING_LABELS[n]}
          className={`w-7 h-7 rounded text-xs font-semibold transition ${value >= n ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'} ${readOnly ? 'cursor-default' : 'hover:bg-brand/70 hover:text-white'}`}
        >
          {n}
        </button>
      ))}
      <span className="text-[11px] text-gray-400 ml-1 w-28 truncate">{value ? RATING_LABELS[value] : ''}</span>
    </div>
  )
}

// One step's rating form (used for both self and manager steps).
function RatingsForm({ ratings, setRatings, comments, setComments, commentsLabel, readOnly }) {
  return (
    <div className="space-y-3">
      {APPRAISAL_COMPETENCIES.map((c) => (
        <div key={c.key} className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-700">{c.label}</div>
            <div className="text-[11px] text-gray-400">{c.hint}</div>
          </div>
          <RatingPicker
            value={ratings[c.key] || 0}
            readOnly={readOnly}
            onChange={(v) => setRatings({ ...ratings, [c.key]: v })}
          />
        </div>
      ))}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{commentsLabel}</label>
        <textarea
          value={comments}
          readOnly={readOnly}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand read-only:bg-gray-50"
          placeholder="Highlights, challenges, and goals for the next period…"
        />
      </div>
    </div>
  )
}

// Read-only recap of a completed step.
function StepRecap({ title, ratings, comments }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
        {APPRAISAL_COMPETENCIES.map((c) => (
          <span key={c.key}>{c.label}: <span className="font-semibold text-gray-800">{ratings[c.key] || '—'}</span></span>
        ))}
      </div>
      {comments && <p className="text-xs text-gray-600 italic">“{comments}”</p>}
    </div>
  )
}

export default function AppraisalsView({ mode, appraisals, onUpdate, matchedEmployee, teamIds, user }) {
  const [openId, setOpenId] = useState(null)
  const [draftRatings, setDraftRatings] = useState({})
  const [draftComments, setDraftComments] = useState('')

  const startEditing = (a, ratings, comments) => {
    setOpenId(a.id)
    setDraftRatings(ratings || {})
    setDraftComments(comments || '')
  }

  const ratingsComplete = APPRAISAL_COMPETENCIES.every((c) => draftRatings[c.key] > 0)

  // ---- mode: self --------------------------------------------------------
  if (mode === 'self') {
    const mine = appraisals.find((a) => matchedEmployee && a.employeeId === matchedEmployee.id)
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">My appraisal — {APPRAISAL_CYCLE.name}</h2>
          <p className="text-xs text-gray-500">{APPRAISAL_CYCLE.period} · self-assessment due {APPRAISAL_CYCLE.dueDate}</p>
        </div>
        <ModelNote />
        {!mine && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-400">
            You're not part of the current appraisal cycle — nothing to fill in. HR opens cycles and adds participants.
          </div>
        )}
        {mine && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800">{mine.employeeName}</div>
              {chip(mine.status)}
            </div>
            {mine.status === 'self' ? (
              <>
                {openId !== mine.id ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">Your self-assessment is waiting — rate yourself on {APPRAISAL_COMPETENCIES.length} competencies (1–5) and add comments.</p>
                    <button onClick={() => startEditing(mine, mine.selfRatings, mine.selfComments)} className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark inline-flex items-center gap-1.5">
                      <Star size={14} /> Start self-assessment
                    </button>
                  </div>
                ) : (
                  <>
                    <RatingsForm ratings={draftRatings} setRatings={setDraftRatings} comments={draftComments} setComments={setDraftComments} commentsLabel="Your comments" />
                    <button
                      disabled={!ratingsComplete}
                      onClick={() => { onUpdate({ ...mine, selfRatings: draftRatings, selfComments: draftComments, status: 'manager' }); setOpenId(null) }}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      <Send size={14} /> Submit to manager
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <StepRecap title="Your self-assessment" ratings={mine.selfRatings} comments={mine.selfComments} />
                {(mine.status === 'hr' || mine.status === 'complete') && <StepRecap title="Manager review" ratings={mine.managerRatings} comments={mine.managerComments} />}
                {mine.status === 'complete' && (
                  <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    Signed off by {mine.signedOffBy} on {mine.signedOffDate} — overall score {appraisalScore(mine)?.toFixed(1)} / 5.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // ---- mode: manager -----------------------------------------------------
  if (mode === 'manager') {
    const team = appraisals.filter((a) => teamIds.has(a.employeeId))
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Team appraisals — {APPRAISAL_CYCLE.name}</h2>
          <p className="text-xs text-gray-500">Review each self-assessment, add your ratings and comments, then forward to HR for sign-off.</p>
        </div>
        <ModelNote />
        {team.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-400">
            None of your direct reports are in the current cycle.
          </div>
        )}
        {team.map((a) => (
          <div key={a.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800">{a.employeeName}</div>
              {chip(a.status)}
            </div>
            {a.status === 'self' && <p className="text-xs text-gray-400">Waiting for {a.employeeName.split(' ')[0]}'s self-assessment.</p>}
            {a.status !== 'self' && <StepRecap title="Self-assessment" ratings={a.selfRatings} comments={a.selfComments} />}
            {a.status === 'manager' && (
              openId === a.id ? (
                <>
                  <RatingsForm ratings={draftRatings} setRatings={setDraftRatings} comments={draftComments} setComments={setDraftComments} commentsLabel="Manager comments" />
                  <button
                    disabled={!ratingsComplete}
                    onClick={() => { onUpdate({ ...a, managerRatings: draftRatings, managerComments: draftComments, status: 'hr' }); setOpenId(null) }}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <Send size={14} /> Submit to HR
                  </button>
                </>
              ) : (
                <button onClick={() => startEditing(a, a.managerRatings, a.managerComments)} className="px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-dark inline-flex items-center gap-1.5">
                  <Star size={13} /> Rate &amp; review
                </button>
              )
            )}
            {(a.status === 'hr' || a.status === 'complete') && <StepRecap title="Your review" ratings={a.managerRatings} comments={a.managerComments} />}
            {a.status === 'complete' && <div className="text-xs text-green-700">Signed off — overall {appraisalScore(a)?.toFixed(1)} / 5.</div>}
          </div>
        ))}
      </div>
    )
  }

  // ---- mode: hr ----------------------------------------------------------
  const counts = ['self', 'manager', 'hr', 'complete'].map((s) => ({ s, n: appraisals.filter((a) => a.status === s).length }))
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Appraisal cycle — {APPRAISAL_CYCLE.name}</h2>
        <p className="text-xs text-gray-500">{APPRAISAL_CYCLE.period} · {appraisals.length} participants · self-assessment → manager review → HR sign-off</p>
      </div>
      <ModelNote />
      <div className="grid grid-cols-4 gap-3">
        {counts.map(({ s, n }) => (
          <div key={s} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{n}</div>
            <div className="mt-1">{chip(s)}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
        {appraisals.map((a) => {
          const score = appraisalScore(a)
          return (
            <div key={a.id} className="p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{a.employeeName}</div>
                  <div className="text-xs text-gray-500">
                    {score !== null ? `Overall (manager avg): ${score.toFixed(1)} / 5` : a.status === 'self' ? 'Waiting on self-assessment' : 'Waiting on manager review'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {chip(a.status)}
                  {a.status === 'hr' && (
                    <button
                      onClick={() => onUpdate({ ...a, status: 'complete', signedOffBy: user?.username, signedOffDate: todayISO() })}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-dark inline-flex items-center gap-1"
                    >
                      <CheckCircle size={13} /> Sign off
                    </button>
                  )}
                  {a.status === 'complete' && <span className="text-[11px] text-gray-400">by {a.signedOffBy} · {a.signedOffDate}</span>}
                  <button onClick={() => setOpenId(openId === a.id ? null : a.id)} className="text-xs text-brand font-medium hover:underline">{openId === a.id ? 'Hide' : 'Details'}</button>
                </div>
              </div>
              {openId === a.id && (
                <div className="mt-3 space-y-2">
                  {Object.keys(a.selfRatings).length > 0 ? <StepRecap title="Self-assessment" ratings={a.selfRatings} comments={a.selfComments} /> : <div className="text-xs text-gray-400">Self-assessment not submitted yet.</div>}
                  {Object.keys(a.managerRatings).length > 0 && <StepRecap title="Manager review" ratings={a.managerRatings} comments={a.managerComments} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
