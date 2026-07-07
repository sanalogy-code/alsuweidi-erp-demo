import { useState } from 'react'
import { Landmark, EyeOff, Plus } from 'lucide-react'

// Authority & access (Management items from THE EVERYTHING LIST):
// 1. Delegation-of-authority matrix — who signs what, up to what AED. The demo
//    matrix is the conversation piece to agree the real thresholds with
//    management; Phase 2 wires these limits into the actual approval flows.
// 2. Visibility rules — the "access-override depth" follow-on to per-user
//    special access: rules that scope module visibility by grade or employment
//    type. Display-only until Phase 2 auth enforces anything.

const AED = (n) => `AED ${n.toLocaleString('en-AE')}`

const INITIAL_DOA = [
  { id: 1, action: 'Approve expense', staff: 5000, dept: 25000, mgmt: 250000, board: null, note: 'Above management limit goes to the owner/board.' },
  { id: 2, action: 'Sign proposal / bid submission', staff: null, dept: 500000, mgmt: 5000000, board: null, note: 'Fee value of the proposal.' },
  { id: 3, action: 'Issue client invoice', staff: null, dept: null, mgmt: Infinity, board: null, note: 'Accountant drafts; management releases.' },
  { id: 4, action: 'Approve leave', staff: null, dept: Infinity, mgmt: Infinity, board: null, note: 'Line manager then HR (already wired in the demo).' },
  { id: 5, action: 'Sign subconsultant agreement', staff: null, dept: 100000, mgmt: 1000000, board: null, note: '' },
  { id: 6, action: 'Approve payment run', staff: null, dept: null, mgmt: Infinity, board: null, note: 'Supplier/payables run.' },
  { id: 7, action: 'Commit to variation / VO', staff: null, dept: 50000, mgmt: 500000, board: null, note: 'Contract-admin follows FIDIC anyway.' },
]

const LIMIT_LABEL = (v) => (v == null ? '—' : v === Infinity ? 'No limit' : AED(v))

const INITIAL_VIS_RULES = [
  { id: 1, module: 'Financials', rule: 'Grade ≥ G5 OR role in Management/Finance', level: 'view' },
  { id: 2, module: 'HR — Compensation tab', rule: 'HR staff and Management only (never line managers)', level: 'full' },
  { id: 3, module: 'Projects — Fees & cost', rule: 'Employment type ≠ External site staff', level: 'view' },
]

export default function GovernanceView() {
  const [doa, setDoa] = useState(INITIAL_DOA)
  const [rules, setRules] = useState(INITIAL_VIS_RULES)
  const [showAddRule, setShowAddRule] = useState(false)
  const [ruleForm, setRuleForm] = useState({ module: '', rule: '', level: 'view' })
  const [editing, setEditing] = useState(null) // {id, col}

  const setLimit = (id, col, raw) => {
    const v = raw === '' ? null : raw.toLowerCase() === 'no limit' ? Infinity : Number(raw.replace(/[^0-9]/g, '')) || null
    setDoa((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: v } : r)))
    setEditing(null)
  }

  const addRule = () => {
    if (!ruleForm.module.trim() || !ruleForm.rule.trim()) return
    setRules((prev) => [...prev, { ...ruleForm, id: Math.max(0, ...prev.map((r) => r.id)) + 1 }])
    setRuleForm({ module: '', rule: '', level: 'view' })
    setShowAddRule(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Landmark size={15} className="text-brand" /> Delegation of authority</h2>
          <p className="text-xs text-gray-500 mt-1">Who signs what, up to what AED. Click a limit to adjust — this matrix is the spec to agree with management; Phase 2 wires the limits into the approval flows themselves.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 text-[11px] text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2">Action</th>
                <th className="text-right px-4 py-2">Staff</th>
                <th className="text-right px-4 py-2">Dept. head</th>
                <th className="text-right px-4 py-2">Management</th>
                <th className="text-left px-4 py-2">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doa.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{r.action}</td>
                  {['staff', 'dept', 'mgmt'].map((col) => (
                    <td key={col} className="px-4 py-2.5 text-right">
                      {editing?.id === r.id && editing?.col === col ? (
                        <input
                          autoFocus defaultValue={r[col] === Infinity ? 'No limit' : r[col] ?? ''}
                          onBlur={(e) => setLimit(r.id, col, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && setLimit(r.id, col, e.target.value)}
                          className="w-24 text-right text-xs border border-gray-300 rounded px-1.5 py-1"
                          placeholder="AED or blank"
                        />
                      ) : (
                        <button onClick={() => setEditing({ id: r.id, col })} className={`tabular-nums hover:underline ${r[col] == null ? 'text-gray-300' : 'text-gray-700'}`}>
                          {LIMIT_LABEL(r[col])}
                        </button>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-xs text-gray-500">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><EyeOff size={15} className="text-brand" /> Visibility rules</h2>
            <p className="text-xs text-gray-500 mt-1">Grade- and employment-type-aware access rules, on top of the role matrix and per-user special access. Display-only until Phase 2 auth enforces them.</p>
          </div>
          <button onClick={() => setShowAddRule((v) => !v)} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition shrink-0">
            <Plus size={13} /> Add rule
          </button>
        </div>
        {showAddRule && (
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 grid sm:grid-cols-4 gap-2 text-xs">
            <input value={ruleForm.module} onChange={(e) => setRuleForm({ ...ruleForm, module: e.target.value })} placeholder="Module or screen" className="border rounded-md px-2 py-1.5" />
            <input value={ruleForm.rule} onChange={(e) => setRuleForm({ ...ruleForm, rule: e.target.value })} placeholder="Rule (e.g. Grade ≥ G4, type = Full-time)" className="border rounded-md px-2 py-1.5 sm:col-span-2" />
            <div className="flex gap-2">
              <select value={ruleForm.level} onChange={(e) => setRuleForm({ ...ruleForm, level: e.target.value })} className="border rounded-md px-2 py-1.5 bg-white flex-1">
                <option value="view">View</option>
                <option value="full">Full</option>
              </select>
              <button onClick={addRule} className="px-3 py-1.5 rounded-md bg-brand text-white font-medium">Add</button>
            </div>
          </div>
        )}
        <div className="divide-y divide-gray-100">
          {rules.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-center gap-3 text-sm">
              <span className="font-medium text-gray-800 w-56 shrink-0 truncate">{r.module}</span>
              <span className="text-xs text-gray-600 flex-1">{r.rule}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.level === 'full' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{r.level === 'full' ? 'Full' : 'View'}</span>
              <button onClick={() => setRules((prev) => prev.filter((x) => x.id !== r.id))} className="text-xs text-gray-400 hover:text-red-600">Remove</button>
            </div>
          ))}
          {rules.length === 0 && <div className="px-5 py-6 text-center text-xs text-gray-400">No visibility rules yet.</div>}
        </div>
        <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500">
          Depends on the grades decision (grades are optional on the employee record until management confirms the scheme).
        </div>
      </div>
    </div>
  )
}
