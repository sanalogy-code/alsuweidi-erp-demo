import { useState } from 'react'
import { Landmark, Plus } from 'lucide-react'
import Modal from '../crm/Modal'
import DocumentChecklist from '../DocumentChecklist'
import { PRO_TASK_TYPES, EMPLOYEE_DOCUMENT_TYPES } from '../../data/hrData'
import { parseLocalDate, todayLocal, todayISO } from '../../utils/date'

// Government-services queue. HR creates tasks; the PRO company logs in with the
// 'PRO / Government Services' role and works them directly here — status, notes,
// and the resulting documents — instead of email/WhatsApp back-and-forth.

const STATUS = {
  open: { label: 'Open', color: 'bg-yellow-100 text-yellow-700', next: 'in_progress', nextLabel: 'Start' },
  in_progress: { label: 'In progress', color: 'bg-blue-100 text-blue-700', next: 'done', nextLabel: 'Mark done' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', next: null },
}

const fmt = (d) => (d ? parseLocalDate(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—')

function NewTaskModal({ employees, onClose, onCreate }) {
  const [form, setForm] = useState({ employeeName: '', taskType: PRO_TASK_TYPES[0], details: '', dueDate: '' })
  return (
    <Modal title="New PRO task" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Employee / person *</label>
          <input list="pro-emp-names" value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
          <datalist id="pro-emp-names">{employees.map((e) => <option key={e.id} value={e.name} />)}</datalist>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Task *</label>
            <select value={form.taskType} onChange={(e) => setForm({ ...form, taskType: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
              {PRO_TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Due date</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Details</label>
          <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} rows="2" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
        </div>
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button
            onClick={() => {
              if (!form.employeeName.trim()) { alert('Employee name is required'); return }
              onCreate({ ...form, status: 'open', createdDate: todayISO(), documents: [], notes: '' })
              onClose()
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark"
          >
            Create task
          </button>
        </div>
      </div>
    </Modal>
  )
}

// PRO dashboard (default shape pending the tenant-vs-role decision: PRO is
// currently a ROLE within ALSUWEIDI, not a separate org). Task velocity, overdue
// pressure and a by-type breakdown so the PRO company can run itself.
function ProDashboard({ tasks, openTasks, doneTasks, overdue }) {
  const overdueCount = openTasks.filter(overdue).length
  // Age of the open queue (days since created), worst first.
  const ages = openTasks.map((t) => Math.max(0, Math.floor((todayLocal() - parseLocalDate(t.createdDate)) / 86400000)))
  const avgAge = ages.length ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0
  // Velocity: created vs completed per ISO week over the last 6 weeks.
  const weekOf = (iso) => {
    const d = parseLocalDate(iso)
    if (!d) return null
    d.setDate(d.getDate() - d.getDay()) // week starts Sunday, matching timesheets
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const weeks = []
  {
    const d = todayLocal(); d.setDate(d.getDate() - d.getDay())
    for (let i = 5; i >= 0; i--) {
      const w = new Date(d); w.setDate(w.getDate() - i * 7)
      weeks.push(`${w.getFullYear()}-${String(w.getMonth() + 1).padStart(2, '0')}-${String(w.getDate()).padStart(2, '0')}`)
    }
  }
  const velocity = weeks.map((w) => ({
    week: w.slice(5),
    created: tasks.filter((t) => weekOf(t.createdDate) === w).length,
    done: tasks.filter((t) => t.status === 'done' && weekOf(t.doneDate) === w).length,
  }))
  const maxV = Math.max(1, ...velocity.flatMap((v) => [v.created, v.done]))
  const byType = [...tasks.reduce((m, t) => m.set(t.taskType, (m.get(t.taskType) || 0) + 1), new Map()).entries()]
    .map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
  const maxType = Math.max(1, ...byType.map((r) => r.value))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Open tasks', value: openTasks.length },
          { label: 'Overdue', value: overdueCount, bad: overdueCount > 0 },
          { label: 'Completed (all time)', value: doneTasks.length },
          { label: 'Avg age of open queue', value: `${avgAge}d` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className={`text-2xl font-bold ${s.bad ? 'text-red-600' : 'text-gray-800'}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Task velocity — last 6 weeks</div>
          <div className="flex items-end gap-2 h-24">
            {velocity.map((v) => (
              <div key={v.week} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 h-16 w-full justify-center">
                  <div className="w-3 bg-brand/70 rounded-t" style={{ height: `${(v.created / maxV) * 100}%` }} title={`${v.created} created`} />
                  <div className="w-3 bg-emerald-400 rounded-t" style={{ height: `${(v.done / maxV) * 100}%` }} title={`${v.done} completed`} />
                </div>
                <div className="text-[10px] text-gray-400">{v.week}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-brand/70 rounded-sm inline-block" /> Created</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm inline-block" /> Completed</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">By task type</div>
          <div className="space-y-1.5">
            {byType.map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-xs">
                <div className="w-40 shrink-0 text-gray-600 truncate" title={r.label}>{r.label}</div>
                <div className="flex-1 h-3.5 bg-gray-50 rounded"><div className="h-3.5 rounded bg-brand/70" style={{ width: `${(r.value / maxType) * 100}%` }} /></div>
                <div className="w-6 text-right font-medium text-gray-700">{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-gray-400">Default shape — PRO runs as a role within ALSUWEIDI for now; a separate-tenant portal (own org, own users) is the open decision with management.</p>
    </div>
  )
}

export default function ProTasksView({ tasks, employees = [], isPro = false, onUpdate, onCreate }) {
  const [showNew, setShowNew] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const openTasks = tasks.filter((t) => t.status !== 'done').sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const overdue = (t) => t.dueDate && parseLocalDate(t.dueDate) < todayLocal() && t.status !== 'done'

  return (
    <div className="space-y-4">
      {isPro && <ProDashboard tasks={tasks} openTasks={openTasks} doneTasks={doneTasks} overdue={overdue} />}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Landmark size={15} className="text-brand" /> PRO tasks ({openTasks.length} open)</h2>
          <p className="text-xs text-gray-500">
            {isPro
              ? 'Tasks assigned by ALSUWEIDI HR — update status, add notes, and attach the resulting documents here.'
              : 'Government-services work assigned to the PRO company — they log in and action these directly.'}
          </p>
        </div>
        {!isPro && (
          <button onClick={() => setShowNew(true)} className="text-xs font-medium text-white bg-brand px-3 py-1.5 rounded-md hover:bg-brand-dark shrink-0 flex items-center gap-1">
            <Plus size={13} /> New task
          </button>
        )}
      </div>

      {openTasks.length === 0 && <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-sm text-gray-400">Nothing in the queue.</div>}

      {openTasks.map((t) => {
        const meta = STATUS[t.status]
        const open = expanded === t.id
        return (
          <div key={t.id} className={`bg-white rounded-lg border shadow-sm ${overdue(t) ? 'border-red-200' : 'border-gray-200'}`}>
            {/* Fixed-width columns (task type / person / due / status) so the eye can run down the queue */}
            <button onClick={() => setExpanded(open ? null : t.id)} className="w-full px-4 py-3 text-left flex items-center gap-3">
              <span className="w-40 shrink-0 px-2 py-0.5 rounded text-xs font-medium text-center truncate bg-gray-100 text-gray-700">{t.taskType}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{t.employeeName}</div>
                {t.details && <div className="text-xs text-gray-500 truncate">{t.details}</div>}
              </div>
              <span className={`w-20 shrink-0 text-right text-xs whitespace-nowrap ${overdue(t) ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>Due {fmt(t.dueDate)}</span>
              <span className={`w-24 shrink-0 px-2 py-0.5 rounded text-xs font-medium text-center ${meta.color}`}>{meta.label}</span>
            </button>
            {open && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Progress notes</label>
                  <textarea
                    value={t.notes}
                    onChange={(e) => onUpdate({ ...t, notes: e.target.value })}
                    placeholder="e.g. Medical booked 8 July, biometrics done, awaiting stamping…"
                    rows="2"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1.5">Documents (input & results)</div>
                  <DocumentChecklist
                    docTypes={EMPLOYEE_DOCUMENT_TYPES.filter((dt) => ['passport', 'photo', 'visa', 'emiratesId', 'other'].includes(dt.key)).map((dt) => ({ ...dt, requiredWhen: null }))}
                    documents={t.documents}
                    onChange={(docs) => onUpdate({ ...t, documents: docs })}
                  />
                </div>
                {meta.next && (
                  <button
                    onClick={() => onUpdate({ ...t, status: meta.next, ...(meta.next === 'done' ? { doneDate: todayISO() } : {}) })}
                    className="text-xs font-medium text-white bg-brand px-3 py-1.5 rounded-md hover:bg-brand-dark"
                  >
                    {meta.nextLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}

      {doneTasks.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed</div>
          <div className="divide-y divide-gray-100">
            {doneTasks.map((t) => (
              <div key={t.id} className="px-4 py-2.5 flex justify-between items-center text-sm">
                <span className="text-gray-700">{t.taskType} — {t.employeeName}</span>
                <span className="text-xs text-gray-400">{t.documents.length > 0 ? `${t.documents.length} document${t.documents.length > 1 ? 's' : ''} attached` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNew && <NewTaskModal employees={employees} onClose={() => setShowNew(false)} onCreate={onCreate} />}
    </div>
  )
}
