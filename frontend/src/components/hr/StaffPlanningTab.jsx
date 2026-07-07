import { useState } from 'react'
import { CalendarClock, Plus, AlertTriangle, X, Inbox } from 'lucide-react'
import { DESIGNATIONS, STAFF_PLAN_STATUS } from '../../data/hrData'
import { staffingStatusMeta } from '../../data/rfpData'
import { parseLocalDate, todayLocal } from '../../utils/date'

// Staff planning: hires needed for upcoming/known projects — role, headcount,
// and needed-by date — so recruitment starts before the project does, not after.

const fmt = (d) => (d ? parseLocalDate(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

const inputCls = 'border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand'

export default function StaffPlanningTab({ plans, projects = [], onAdd, onUpdate, onRemove, staffingRequests = [], onUpdateStaffingRequests }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ projectRef: '', role: DESIGNATIONS[0].title, count: 1, neededBy: '', notes: '' })

  const daysTo = (d) => Math.ceil((parseLocalDate(d) - todayLocal()) / (1000 * 60 * 60 * 24))
  const urgent = (p) => p.status !== 'hired' && daysTo(p.neededBy) <= 45

  const unfilled = plans.filter((p) => p.status !== 'hired')
  const totalHeads = unfilled.reduce((s, p) => s + Number(p.count), 0)
  const urgentCount = unfilled.filter(urgent).length

  // Suggest live + pipeline references so plans can be tied to real project records.
  const projectOptions = [
    ...projects.map((p) => `${p.projectNo} — ${p.name}`),
    'Pipeline: (deal name) — add manually',
  ]

  const byProject = [...new Set(plans.map((p) => p.projectRef))]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><CalendarClock size={15} className="text-brand" /> Staff planning</h2>
          <p className="text-xs text-gray-500">Hires needed for upcoming work — plan the role and the date, then open the position in Careers.</p>
        </div>
        <button onClick={() => setAdding(true)} className="text-xs font-medium text-white bg-brand px-3 py-1.5 rounded-md hover:bg-brand-dark shrink-0 flex items-center gap-1">
          <Plus size={13} /> Plan a hire
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Planned heads (unfilled)</div>
          <div className="text-xl font-bold text-gray-800">{totalHeads}</div>
        </div>
        <div className={`bg-white rounded-lg border shadow-sm p-4 ${urgentCount ? 'border-red-200' : 'border-gray-200'}`}>
          <div className="text-xs text-gray-500">Needed within 45 days</div>
          <div className={`text-xl font-bold ${urgentCount ? 'text-red-600' : 'text-gray-800'}`}>{urgentCount}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Projects covered</div>
          <div className="text-xl font-bold text-gray-800">{byProject.length}</div>
        </div>
      </div>

      {/* Pipeline intake (Batch 16c): staffing needs PMs raised on RFPs in CRM.
          Accepting converts the request into a plan line, marked contingent. */}
      {staffingRequests.filter((r) => r.status === 'requested').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <Inbox size={13} /> Pipeline intake — staffing requested on proposals ({staffingRequests.filter((r) => r.status === 'requested').length})
          </div>
          {staffingRequests.filter((r) => r.status === 'requested').map((r) => (
            <div key={r.id} className="bg-white rounded-md border border-amber-100 px-3 py-2 flex items-center gap-3 flex-wrap text-xs">
              <span className="font-medium text-gray-800">{r.count}× {r.role}</span>
              <span className="text-gray-500">for <span className="text-gray-700">{r.rfpName}</span> (pipeline) · by {fmt(r.neededBy)}</span>
              {r.note && <span className="text-gray-400 flex-1 min-w-[120px] truncate" title={r.note}>{r.note}</span>}
              <span className="text-gray-400">{r.requestedBy} · {r.date}</span>
              <span className="flex gap-1.5 ml-auto">
                <button
                  onClick={() => {
                    onAdd({ projectRef: `Pipeline: ${r.rfpName}`, role: r.role, count: r.count, neededBy: r.neededBy, notes: `Contingent on award. ${r.note || ''}`.trim(), status: 'planned' })
                    onUpdateStaffingRequests(staffingRequests.map((x) => (x.id === r.id ? { ...x, status: 'accepted' } : x)))
                  }}
                  className="px-2 py-1 rounded-md border border-green-300 text-green-700 hover:bg-green-50 font-medium">
                  Accept into plan
                </button>
                <button
                  onClick={() => onUpdateStaffingRequests(staffingRequests.map((x) => (x.id === r.id ? { ...x, status: 'declined' } : x)))}
                  className="px-2 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50">
                  Decline
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
      {staffingRequests.some((r) => r.status !== 'requested') && (
        <details className="text-xs text-gray-400">
          <summary className="cursor-pointer">Handled pipeline requests ({staffingRequests.filter((r) => r.status !== 'requested').length})</summary>
          <div className="mt-1.5 space-y-1">
            {staffingRequests.filter((r) => r.status !== 'requested').map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <span>{r.count}× {r.role} — {r.rfpName}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${staffingStatusMeta(r.status).chip}`}>{staffingStatusMeta(r.status).label}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {adding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Project / pipeline deal *</label>
              <input list="plan-projects" value={form.projectRef} onChange={(e) => setForm({ ...form, projectRef: e.target.value })} placeholder="Pick a project or type a pipeline deal" className={`${inputCls} w-full`} />
              <datalist id="plan-projects">{projectOptions.map((o) => <option key={o} value={o} />)}</datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`${inputCls} w-full`}>
                {DESIGNATIONS.map((d) => <option key={d.title}>{d.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Headcount *</label>
                <input type="number" min="1" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} className={`${inputCls} w-full`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Needed by *</label>
                <input type="date" value={form.neededBy} onChange={(e) => setForm({ ...form, neededBy: e.target.value })} className={`${inputCls} w-full`} />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} w-full`} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!form.projectRef.trim() || !form.neededBy) { alert('Project and needed-by date are required'); return }
                onAdd({ ...form, count: Number(form.count) || 1, status: 'planned' })
                setForm({ projectRef: '', role: DESIGNATIONS[0].title, count: 1, neededBy: '', notes: '' })
                setAdding(false)
              }}
              className="text-xs font-medium text-white bg-brand px-3 py-1.5 rounded-md hover:bg-brand-dark"
            >
              Add to plan
            </button>
            <button onClick={() => setAdding(false)} className="text-xs font-medium text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {plans.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No planned hires yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2">Project</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-center px-4 py-2">Heads</th>
                <th className="text-left px-4 py-2">Needed by</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...plans].sort((a, b) => a.neededBy.localeCompare(b.neededBy)).map((p) => {
                const meta = STAFF_PLAN_STATUS[p.status]
                const d = daysTo(p.neededBy)
                return (
                  <tr key={p.id} className={urgent(p) ? 'bg-red-50/40' : ''}>
                    <td className="px-4 py-2.5">
                      <div className="text-gray-800">{p.projectRef}</div>
                      {p.notes && <div className="text-xs text-gray-500">{p.notes}</div>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{p.role}</td>
                    <td className="px-4 py-2.5 text-center font-semibold text-gray-800">{p.count}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={urgent(p) ? 'text-red-600 font-medium' : 'text-gray-700'}>{fmt(p.neededBy)}</span>
                      {p.status !== 'hired' && (
                        <span className={`block text-[10px] ${d < 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                          {d < 0 ? <><AlertTriangle size={9} className="inline mr-0.5" />{-d} days overdue</> : `in ${d} days`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={p.status}
                        onChange={(e) => onUpdate({ ...p, status: e.target.value })}
                        className={`text-xs font-medium rounded px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-brand ${meta.color}`}
                      >
                        {Object.entries(STAFF_PLAN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2.5">
                      <button onClick={() => onRemove(p.id)} className="text-gray-300 hover:text-red-500"><X size={13} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
