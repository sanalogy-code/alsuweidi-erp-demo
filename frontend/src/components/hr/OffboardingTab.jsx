import { useState } from 'react'
import { UserMinus, CalendarX, ClipboardCheck } from 'lucide-react'
import Modal from '../crm/Modal'
import { OFFBOARDING_REASONS, OFFBOARDING_CHECKLIST_TEMPLATE } from '../../data/hrData'
import { parseLocalDate, todayLocal } from '../../utils/date'

const fmt = (d) => (d ? parseLocalDate(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

function StartOffboardingModal({ employees, offboardings, onClose, onStart }) {
  const active = employees.filter((e) => !offboardings.some((o) => o.employeeId === e.id && o.status !== 'completed'))
  const [form, setForm] = useState({ employeeId: '', reason: 'Resignation', lastWorkingDay: '', exitInterviewDate: '' })

  const employee = employees.find((e) => e.id === Number(form.employeeId))
  const noticeDays = employee?.compensation?.noticePeriodDays

  return (
    <Modal title="Start offboarding" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Employee *</label>
          <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
            <option value="">Select…</option>
            {active.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.title}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason *</label>
            <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
              {OFFBOARDING_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last working day *</label>
            <input type="date" value={form.lastWorkingDay} onChange={(e) => setForm({ ...form, lastWorkingDay: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            {noticeDays && <div className="text-[10px] text-gray-400 mt-0.5">Contract notice period: {noticeDays} days</div>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exit interview date</label>
            <input type="date" value={form.exitInterviewDate} max={form.lastWorkingDay || undefined} onChange={(e) => setForm({ ...form, exitInterviewDate: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
        </div>
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button
            onClick={() => {
              if (!form.employeeId || !form.lastWorkingDay) { alert('Employee and last working day are required'); return }
              onStart({
                employeeId: Number(form.employeeId),
                employeeName: employee.name,
                reason: form.reason,
                startedDate: new Date().toISOString().slice(0, 10),
                lastWorkingDay: form.lastWorkingDay,
                exitInterviewDate: form.exitInterviewDate || null,
                exitInterviewNotes: '',
                checklist: Object.fromEntries(OFFBOARDING_CHECKLIST_TEMPLATE.map((c) => [c.key, false])),
                status: 'in_progress',
              })
              onClose()
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark"
          >
            Start offboarding
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function OffboardingTab({ employees, offboardings, onUpdate, onStart }) {
  const [showStart, setShowStart] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const inProgress = offboardings.filter((o) => o.status === 'in_progress')
  const completed = offboardings.filter((o) => o.status === 'completed')

  const daysLeft = (o) => Math.ceil((parseLocalDate(o.lastWorkingDay) - todayLocal()) / (1000 * 60 * 60 * 24))
  const doneCount = (o) => Object.values(o.checklist).filter(Boolean).length

  const toggleItem = (o, key) => {
    const checklist = { ...o.checklist, [key]: !o.checklist[key] }
    const allDone = OFFBOARDING_CHECKLIST_TEMPLATE.every((c) => checklist[c.key])
    onUpdate({ ...o, checklist, status: allDone ? 'completed' : 'in_progress' })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><UserMinus size={15} className="text-brand" /> Offboarding ({inProgress.length} in progress)</h2>
          <p className="text-xs text-gray-500">Last working day, exit interview, and the leaver checklist — nothing falls through the cracks.</p>
        </div>
        <button onClick={() => setShowStart(true)} className="text-xs font-medium text-white bg-brand px-3 py-1.5 rounded-md hover:bg-brand-dark shrink-0">
          Start offboarding
        </button>
      </div>

      {inProgress.length === 0 && completed.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-sm text-gray-400">No offboarding in progress.</div>
      )}

      {inProgress.map((o) => {
        const left = daysLeft(o)
        const open = expanded === o.id
        return (
          <div key={o.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <button onClick={() => setExpanded(open ? null : o.id)} className="w-full p-4 text-left flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-800">{o.employeeName}</div>
                <div className="text-xs text-gray-500">{o.reason} • started {fmt(o.startedDate)}</div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className={`text-xs font-medium flex items-center gap-1 ${left < 14 ? 'text-red-600' : 'text-gray-700'}`}>
                    <CalendarX size={12} /> Last day {fmt(o.lastWorkingDay)}
                  </div>
                  <div className="text-[10px] text-gray-400">{left >= 0 ? `${left} days left` : `${-left} days ago`}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-700 flex items-center gap-1"><ClipboardCheck size={12} /> {doneCount(o)}/{OFFBOARDING_CHECKLIST_TEMPLATE.length}</div>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1"><div className="h-1.5 bg-brand rounded-full" style={{ width: `${(doneCount(o) / OFFBOARDING_CHECKLIST_TEMPLATE.length) * 100}%` }} /></div>
                </div>
              </div>
            </button>
            {open && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    {OFFBOARDING_CHECKLIST_TEMPLATE.map((c) => (
                      <label key={c.key} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={!!o.checklist[c.key]} onChange={() => toggleItem(o, c.key)} className="rounded border-gray-300 text-brand focus:ring-brand mt-0.5" />
                        <span className={o.checklist[c.key] ? 'line-through text-gray-400' : ''}>{c.label}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">Exit interview {o.exitInterviewDate ? `— ${fmt(o.exitInterviewDate)}` : '(not scheduled)'}</div>
                    <textarea
                      value={o.exitInterviewNotes}
                      onChange={(e) => onUpdate({ ...o, exitInterviewNotes: e.target.value })}
                      placeholder="Notes from the exit interview — reasons for leaving, feedback, rehire recommendation…"
                      rows="7"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {completed.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed</div>
          <div className="divide-y divide-gray-100">
            {completed.map((o) => (
              <div key={o.id} className="px-4 py-2.5 flex justify-between items-center text-sm">
                <span className="text-gray-700">{o.employeeName} — {o.reason}</span>
                <span className="text-xs text-gray-400">Last day {fmt(o.lastWorkingDay)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showStart && (
        <StartOffboardingModal employees={employees} offboardings={offboardings} onClose={() => setShowStart(false)} onStart={onStart} />
      )}
    </div>
  )
}
