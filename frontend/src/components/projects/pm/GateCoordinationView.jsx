import { useState } from 'react'
import { Plus } from 'lucide-react'
import { gateChecklistTemplate } from '../../../data/pmData'

// Coordination checklists per design gate (Batch 17): the cross-discipline
// checks (clash review, MEP coordination, façade interfaces, authority
// pre-check, BIM federation…) that must be closed before a 30/60/90/final
// gate passes. Each gate starts from a standard template; ticking an item
// stamps who/when. Gate status itself lives in the Design gates view.

import { todayISO } from '../../../utils/date'

const GATE_STATUS_CHIP = {
  passed: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  not_started: 'bg-gray-100 text-gray-500',
}

export default function GateCoordinationView({ phase, onUpdate, currentUserName }) {
  const gates = phase.designStages || []
  const checklists = phase.gateChecklists || {}
  const [drafts, setDrafts] = useState({})

  // A gate's checklist: the phase's own copy if it exists, else the template.
  const listFor = (gate) => checklists[gate.key] || gateChecklistTemplate(gate.key)

  const saveList = (gateKey, list) => onUpdate({ ...phase, gateChecklists: { ...checklists, [gateKey]: list } })

  const toggle = (gate, item) => {
    const list = listFor(gate).map((i) => i.id === item.id
      ? (i.done ? { ...i, done: false, by: null, date: null } : { ...i, done: true, by: currentUserName || 'You', date: todayISO() })
      : i)
    saveList(gate.key, list)
  }

  const addItem = (gate) => {
    const text = (drafts[gate.key] || '').trim()
    if (!text) return
    const list = listFor(gate)
    saveList(gate.key, [...list, { id: list.reduce((m, i) => Math.max(m, i.id), 0) + 1, text, done: false, by: null, date: null }])
    setDrafts({ ...drafts, [gate.key]: '' })
  }

  if (!gates.length) {
    return <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No design gates configured for this phase.</div>
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Gate coordination checklists</h2>
      {gates.map((gate) => {
        const list = listFor(gate)
        const done = list.filter((i) => i.done).length
        const pct = list.length ? Math.round((done / list.length) * 100) : 0
        return (
          <div key={gate.key} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-800">{gate.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${GATE_STATUS_CHIP[gate.status] || GATE_STATUS_CHIP.not_started}`}>
                {gate.status === 'passed' ? `Passed ${gate.gateDate || ''}` : gate.status === 'in_progress' ? `Gate ${gate.gateDate || 'TBC'}` : 'Not started'}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-gray-500 tabular-nums">{done}/{list.length}</span>
              </div>
            </div>
            <div className="space-y-1">
              {list.map((item) => (
                <label key={item.id} className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer py-0.5">
                  <input type="checkbox" checked={!!item.done} onChange={() => toggle(gate, item)} className="rounded mt-0.5" />
                  <span className={`flex-1 ${item.done ? 'text-gray-400 line-through' : ''}`}>{item.text}</span>
                  {item.done && <span className="text-[10px] text-gray-400 shrink-0">{item.by} · {item.date}</span>}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={drafts[gate.key] || ''} onChange={(e) => setDrafts({ ...drafts, [gate.key]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addItem(gate)}
                placeholder="Add a coordination check…" className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-xs" />
              <button onClick={() => addItem(gate)} className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600 hover:border-brand hover:text-brand"><Plus size={13} /></button>
            </div>
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">Each gate starts from the standard coordination template — tailor per project. Attaching clash reports / meeting minutes as evidence is Phase 2.</p>
    </div>
  )
}
