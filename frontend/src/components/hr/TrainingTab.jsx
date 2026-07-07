import { useState } from 'react'
import { GraduationCap, Check, X, Award, Search } from 'lucide-react'
import { TRAINING_COURSES, ENROLLMENT_STATUS_META, COURSE_COST_BANDS } from '../../data/hrTalentData'

// Training & development.
//   mode="self" — course catalogue + my enrollments (request → HR approves)
//   mode="hr"   — approval queue + mark-complete (completion auto-adds an
//                 accomplishment to the employee record via onComplete)

const statusChip = (s) => {
  const m = ENROLLMENT_STATUS_META[s] || ENROLLMENT_STATUS_META.requested
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${m.color}`}>{m.label}</span>
}

const courseOf = (id) => TRAINING_COURSES.find((c) => c.id === id)

function CourseCard({ course, action }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold text-gray-800">{course.title}</div>
        <span className="text-[11px] text-gray-400 shrink-0">{course.mode}</span>
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{course.provider} · {course.duration} · {course.costBand}</div>
      <div className="flex flex-wrap gap-1 mt-2 mb-3">
        {course.tags.map((t) => <span key={t} className="text-[10px] font-medium bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{t}</span>)}
      </div>
      <div className="mt-auto">{action}</div>
    </div>
  )
}

export default function TrainingTab({ mode, enrollments, onRequest, onDecide, onComplete, matchedEmployee, user }) {
  const [search, setSearch] = useState('')
  const [requesting, setRequesting] = useState(null) // courseId being requested
  const [justification, setJustification] = useState('')

  // ---- mode: self --------------------------------------------------------
  if (mode === 'self') {
    const myName = (matchedEmployee?.name || user?.username || '').toLowerCase()
    const mine = enrollments.filter((e) => e.employeeName.toLowerCase() === myName)
    const mineByCourse = new Map(mine.map((e) => [e.courseId, e]))
    const q = search.toLowerCase()
    const courses = TRAINING_COURSES.filter((c) =>
      !q || c.title.toLowerCase().includes(q) || c.provider.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q)))

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Training &amp; development</h2>
          <p className="text-xs text-gray-500">Request enrollment on any course — HR approves and books. Completing a course adds it to your accomplishments automatically.</p>
        </div>

        {mine.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">My enrollments</div>
            {mine.map((e) => {
              const c = courseOf(e.courseId)
              return (
                <div key={e.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{c?.title}</div>
                    <div className="text-xs text-gray-500">Requested {e.requestedDate}{e.completedDate && ` · completed ${e.completedDate}`}</div>
                  </div>
                  {statusChip(e.status)}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title, provider, or tag (PMP, HSE, Revit…)"
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {courses.map((c) => {
            const existing = mineByCourse.get(c.id)
            return (
              <CourseCard
                key={c.id}
                course={c}
                action={existing ? (
                  <div className="text-xs text-gray-500 flex items-center gap-2">Already {statusChip(existing.status)}</div>
                ) : requesting === c.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      rows={2}
                      autoFocus
                      placeholder="Why this course? (goes to HR)"
                      className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onRequest(c.id, justification); setRequesting(null); setJustification('') }}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-dark"
                      >
                        Send request
                      </button>
                      <button onClick={() => setRequesting(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setRequesting(c.id); setJustification('') }} className="w-full px-3 py-1.5 text-xs font-medium text-brand border border-brand/40 rounded-md hover:bg-brand/5 flex items-center justify-center gap-1.5">
                    <GraduationCap size={13} /> Request enrollment
                  </button>
                )}
              />
            )
          })}
          {courses.length === 0 && <div className="text-sm text-gray-400 py-6 text-center sm:col-span-2">No courses match "{search}".</div>}
        </div>
        <p className="text-[11px] text-gray-400">Catalogue is a starter set ({COURSE_COST_BANDS.length} cost bands) — adding/editing courses is an HR admin function planned for Phase 2.</p>
      </div>
    )
  }

  // ---- mode: hr ----------------------------------------------------------
  const pending = enrollments.filter((e) => e.status === 'requested')
  const approved = enrollments.filter((e) => e.status === 'approved')
  const done = enrollments.filter((e) => e.status === 'completed' || e.status === 'declined')

  const row = (e, actions) => {
    const c = courseOf(e.courseId)
    return (
      <div key={e.id} className="px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-800">{e.employeeName} — {c?.title}</div>
            <div className="text-xs text-gray-500">{c?.provider} · {c?.duration} · {c?.costBand} · requested {e.requestedDate}</div>
            {e.justification && <div className="text-xs text-gray-500 italic mt-0.5">“{e.justification}”</div>}
          </div>
          <div className="flex items-center gap-2 shrink-0">{statusChip(e.status)}{actions}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Training approvals</h2>
        <p className="text-xs text-gray-500">Approve enrollment requests and mark courses complete — completion writes an accomplishment onto the employee record automatically.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Awaiting approval ({pending.length})</div>
        {pending.map((e) => row(e, (
          <>
            <button onClick={() => onDecide(e.id, true)} className="px-2.5 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-1"><Check size={13} /> Approve</button>
            <button onClick={() => onDecide(e.id, false)} className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 flex items-center gap-1"><X size={13} /> Decline</button>
          </>
        )))}
        {pending.length === 0 && <div className="px-4 py-6 text-center text-sm text-gray-400">No requests waiting — all caught up.</div>}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">In progress ({approved.length})</div>
        {approved.map((e) => row(e, (
          <button onClick={() => onComplete(e.id)} className="px-2.5 py-1.5 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-dark flex items-center gap-1">
            <Award size={13} /> Mark completed
          </button>
        )))}
        {approved.length === 0 && <div className="px-4 py-6 text-center text-sm text-gray-400">Nothing in progress.</div>}
      </div>

      {done.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">History ({done.length})</div>
          {done.map((e) => row(e, null))}
        </div>
      )}
    </div>
  )
}
