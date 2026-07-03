import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, Plus, X, Send, Save } from 'lucide-react'
import {
  DAY_LABELS, GENERAL_CODES,
  weekStartOf, addDays, toLocalISO, fmtWeekRange, timesheetTotal,
} from '../../data/timesheetData'
import { workWeekOf } from '../../data/hrData'

const STATUS_CHIP = {
  draft: { label: 'Draft', chip: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Submitted', chip: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', chip: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', chip: 'bg-red-100 text-red-700' },
}

// My weekly timesheet — hours per project code per day on a Sun–Sat grid,
// with weekend shading following the employee's own work-week pattern.
// Submit by the end of the week; unsubmitted weeks block payroll.
export default function MyTimesheet({ employee, projects = [], timesheets = [], onSave }) {
  const [weekStart, setWeekStart] = useState(() => toLocalISO(weekStartOf(new Date())))
  // Draft rows being edited for the selected week (null = not editing yet)
  const [rows, setRows] = useState(null)

  if (!employee) {
    return (
      <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-6 text-sm text-gray-600">
        <div className="font-semibold text-gray-800 mb-1">No employee record matched</div>
        Timesheets hang off your employee record — log in with your exact employee name
        (e.g. "Osama Hussain") to fill yours. Login ↔ identity matching is a Phase 2 decision.
      </div>
    )
  }

  const mine = timesheets.filter((t) => t.employeeId === employee.id)
  const current = mine.find((t) => t.weekStart === weekStart)
  const editable = !current || current.status === 'draft' || current.status === 'rejected'
  const workWeek = workWeekOf(employee)
  const weekendDays = workWeek.weekend

  const codeLabel = (code) => {
    if (typeof code === 'number') {
      const p = projects.find((x) => x.id === code)
      return p ? `${p.projectNo} — ${p.name}` : `Project #${code}`
    }
    return GENERAL_CODES.find((g) => g.code === code)?.label || code
  }

  // Start editing: copy the stored entries (or one empty row)
  const startRows = () => current?.entries.map((e) => ({ code: e.code, hours: [...e.hours] })) || [{ code: '', hours: [0, 0, 0, 0, 0, 0, 0] }]
  const editRows = rows ?? (editable ? startRows() : null)
  const ensureEditing = () => { if (!rows) setRows(startRows()) }

  const setCell = (ri, di, value) => {
    ensureEditing()
    setRows((prev) => (prev ?? startRows()).map((r, i) => (i === ri ? { ...r, hours: r.hours.map((h, j) => (j === di ? Math.min(24, Math.max(0, Number(value) || 0)) : h)) } : r)))
  }
  const setCode = (ri, value) => {
    ensureEditing()
    const code = ['general', 'leave', 'training'].includes(value) ? value : Number(value)
    setRows((prev) => (prev ?? startRows()).map((r, i) => (i === ri ? { ...r, code: value === '' ? '' : code } : r)))
  }
  const addRow = () => { ensureEditing(); setRows((prev) => [...(prev ?? startRows()), { code: '', hours: [0, 0, 0, 0, 0, 0, 0] }]) }
  const removeRow = (ri) => { ensureEditing(); setRows((prev) => (prev ?? startRows()).filter((_, i) => i !== ri)) }

  const cleanEntries = (rs) => rs.filter((r) => r.code !== '' && r.hours.some((h) => h > 0))

  const save = (submit) => {
    const entries = cleanEntries(editRows)
    if (entries.length === 0) return
    onSave({
      ...(current || { employeeId: employee.id, employeeName: employee.name, weekStart, approvedBy: null, approvedDate: null }),
      entries,
      status: submit ? 'submitted' : 'draft',
      submittedDate: submit ? toLocalISO(new Date()) : current?.submittedDate || null,
      rejectReason: null,
    })
    setRows(null)
  }

  const moveWeek = (delta) => {
    const [y, m, d] = weekStart.split('-').map(Number)
    setWeekStart(toLocalISO(addDays(new Date(y, m - 1, d), delta * 7)))
    setRows(null)
  }

  const displayRows = editable ? editRows : current.entries
  const dayTotals = DAY_LABELS.map((_, di) => displayRows.reduce((s, r) => s + (Number(r.hours[di]) || 0), 0))
  const grandTotal = dayTotals.reduce((a, b) => a + b, 0)
  const status = current ? STATUS_CHIP[current.status] : null
  const isCurrentWeek = weekStart === toLocalISO(weekStartOf(new Date()))

  const usedProjects = new Set(displayRows.map((r) => r.code))

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={15} className="text-brand" /> My timesheet
              {status && <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${status.chip}`}>{status.label}</span>}
            </h2>
            <p className="text-xs text-gray-500">
              Log hours against project codes. Submit by the end of your last working day — unsubmitted weeks block payroll.
              Your work week: <span className="font-medium text-gray-600">{workWeek.label}</span>.
            </p>
            {current?.status === 'rejected' && current.rejectReason && (
              <p className="text-xs text-red-600 mt-1">Rejected: {current.rejectReason} — fix and resubmit.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => moveWeek(-1)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium text-gray-700 w-36 text-center">
              {fmtWeekRange(weekStart)}{isCurrentWeek && <span className="text-[10px] text-brand block">this week</span>}
            </span>
            <button onClick={() => moveWeek(1)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-700 min-w-[220px]">Project / code</th>
                {DAY_LABELS.map((d, i) => (
                  <th key={d} className={`px-2 py-2 font-semibold text-center w-16 ${weekendDays.includes(i) ? 'text-gray-400 bg-gray-50' : 'text-gray-700'}`}>{d}</th>
                ))}
                <th className="text-right px-4 py-2 font-semibold text-gray-700 w-16">Total</th>
                {editable && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r, ri) => (
                <tr key={ri} className="border-b border-gray-100">
                  <td className="px-4 py-2">
                    {editable ? (
                      <select value={String(r.code)} onChange={(e) => setCode(ri, e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand">
                        <option value="">Select project…</option>
                        {projects.filter((p) => p.generalStatus !== 'Completed' || p.id === r.code).map((p) => (
                          <option key={p.id} value={p.id} disabled={usedProjects.has(p.id) && r.code !== p.id}>{p.projectNo} — {p.name}</option>
                        ))}
                        {GENERAL_CODES.map((g) => (
                          <option key={g.code} value={g.code} disabled={usedProjects.has(g.code) && r.code !== g.code}>{g.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-800 text-xs font-medium">{codeLabel(r.code)}</span>
                    )}
                  </td>
                  {r.hours.map((h, di) => (
                    <td key={di} className={`px-1 py-1.5 text-center ${weekendDays.includes(di) ? 'bg-gray-50' : ''}`}>
                      {editable ? (
                        <input
                          type="number" min="0" max="24" step="0.5" value={h || ''}
                          onChange={(e) => setCell(ri, di, e.target.value)}
                          className="w-12 border border-gray-200 rounded px-1 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      ) : (
                        <span className={h > 0 ? 'text-gray-800' : 'text-gray-300'}>{h || '—'}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right font-medium text-gray-800">
                    {r.hours.reduce((a, b) => a + (Number(b) || 0), 0)}
                  </td>
                  {editable && (
                    <td className="pr-2">
                      <button onClick={() => removeRow(ri)} className="text-gray-300 hover:text-red-500"><X size={13} /></button>
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="px-4 py-2 text-xs font-semibold text-gray-500">Daily total</td>
                {dayTotals.map((t, di) => (
                  <td key={di} className={`px-2 py-2 text-center text-xs font-semibold ${t > 10 ? 'text-amber-600' : 'text-gray-700'}`}>{t || '—'}</td>
                ))}
                <td className="px-4 py-2 text-right font-bold text-gray-800">{grandTotal}</td>
                {editable && <td />}
              </tr>
            </tbody>
          </table>
        </div>

        {editable && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
            <button onClick={addRow} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
              <Plus size={13} /> Add project row
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => save(false)}
                disabled={cleanEntries(editRows).length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-40"
              >
                <Save size={13} /> Save draft
              </button>
              <button
                onClick={() => save(true)}
                disabled={cleanEntries(editRows).length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand-dark transition disabled:opacity-40"
              >
                <Send size={13} /> Submit week ({grandTotal}h)
              </button>
            </div>
          </div>
        )}
      </div>

      {mine.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">My recent weeks</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {[...mine].sort((a, b) => b.weekStart.localeCompare(a.weekStart)).slice(0, 8).map((t) => (
              <button key={t.id ?? t.weekStart} onClick={() => { setWeekStart(t.weekStart); setRows(null) }} className="w-full px-4 py-2.5 flex items-center justify-between gap-4 text-sm hover:bg-gray-50 transition text-left">
                <span className="text-gray-700">{fmtWeekRange(t.weekStart)}</span>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-500">{timesheetTotal(t)}h</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_CHIP[t.status].chip}`}>{STATUS_CHIP[t.status].label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
