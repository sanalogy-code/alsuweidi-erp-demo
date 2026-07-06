import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { TEAM_ROLES } from '../../../data/pmData'

// Project team panel: PD → DPM/CPM → discipline leads → inspectors (extends the
// existing DPM/CPM links). Members matching an HR employee open the HR profile;
// name-only entries cover site/external staff not in the HR seeds.

export default function TeamView({ pm, onUpdate, employees, onViewEmployee }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ role: TEAM_ROLES[0], employeeId: '', name: '' })

  const add = () => {
    const emp = employees.find((e) => e.id === Number(form.employeeId))
    const name = emp ? emp.name : form.name.trim()
    if (!name) return
    onUpdate({
      ...pm,
      team: [...pm.team, { id: Math.max(0, ...pm.team.map((t) => t.id)) + 1, role: form.role, employeeId: emp ? emp.id : null, name }],
    })
    setForm({ role: TEAM_ROLES[0], employeeId: '', name: '' }); setShowAdd(false)
  }
  const remove = (id) => onUpdate({ ...pm, team: pm.team.filter((t) => t.id !== id) })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Project team</h2>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={13} /> Add member</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap gap-2 text-xs">
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border rounded-md px-2 py-1.5">
            {TEAM_ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value, name: '' })} className="border rounded-md px-2 py-1.5">
            <option value="">External / site staff…</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          {!form.employeeId && <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name (external)" className="border rounded-md px-2 py-1.5" />}
          <button onClick={add} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Add</button>
        </div>
      )}

      {pm.team.length === 0 && !showAdd && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No team assigned yet.</div>
      )}

      <div className="grid sm:grid-cols-2 gap-2">
        {pm.team.map((m) => {
          const emp = m.employeeId ? employees.find((e) => e.id === m.employeeId) : null
          return (
            <div key={m.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400">{m.role}</div>
                {emp ? (
                  <button onClick={() => onViewEmployee(emp)} className="text-sm font-medium text-brand hover:underline truncate">{m.name}</button>
                ) : (
                  <div className="text-sm font-medium text-gray-800 truncate">{m.name} <span className="text-[10px] text-gray-400 font-normal">external</span></div>
                )}
              </div>
              <button onClick={() => remove(m.id)} title="Remove" className="text-gray-300 hover:text-red-500"><X size={14} /></button>
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-gray-400">Names linked in blue open the HR profile. RACI per deliverable is a Phase 2 refinement.</p>
    </div>
  )
}
