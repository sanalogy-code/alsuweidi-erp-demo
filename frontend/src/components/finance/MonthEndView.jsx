import { useState } from 'react'
import { CheckSquare, Square, CalendarCheck } from 'lucide-react'
import { parseLocalDate } from '../../utils/date'
import { CLOSE_ITEMS } from '../../data/financeData'

const fmtDate = (iso) => (iso ? parseLocalDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '')

// Month-end close checklist — the routine the accountant walks each month.
// Per-item done toggle stamps who/when. Demo-grade: state is in-memory only.
export default function MonthEndView({ checklists, onToggle }) {
  const months = [...checklists].sort((a, b) => (b.month || '').localeCompare(a.month || ''))
  const [selected, setSelected] = useState(months[0]?.month || '')
  const list = checklists.find((c) => c.month === selected)

  const doneCount = (c) => CLOSE_ITEMS.filter((it) => c.items[it.key]?.done).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Month-end close</h2>
          <p className="text-sm text-gray-500">The closing checklist per month — tick items off as they&apos;re done. Demo data.</p>
        </div>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
          {months.map((c) => <option key={c.month} value={c.month}>{c.month} — {doneCount(c)}/{CLOSE_ITEMS.length} done</option>)}
        </select>
      </div>

      {list ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
            <CalendarCheck size={16} className={doneCount(list) === CLOSE_ITEMS.length ? 'text-green-600' : 'text-amber-600'} />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{list.month} close — {doneCount(list)} of {CLOSE_ITEMS.length} items done</div>
              <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${doneCount(list) === CLOSE_ITEMS.length ? 'bg-green-500' : 'bg-brand'}`} style={{ width: `${(doneCount(list) / CLOSE_ITEMS.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-50">
            {CLOSE_ITEMS.map((it) => {
              const state = list.items[it.key] || { done: false }
              return (
                <button
                  key={it.key}
                  onClick={() => onToggle(list.month, it.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                >
                  {state.done
                    ? <CheckSquare size={16} className="text-green-600 shrink-0" />
                    : <Square size={16} className="text-gray-300 shrink-0" />}
                  <span className={`flex-1 text-sm ${state.done ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-800'}`}>{it.label}</span>
                  {state.done && (
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">{state.who}{state.when ? ` · ${fmtDate(state.when)}` : ''}</span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">No checklist for this month.</p>
      )}

      <p className="text-[11px] text-gray-400">
        Toggling stamps who/when in this session. Phase 2 auto-checks items from the ledger
        (e.g. &quot;receipts allocated&quot; goes green when no unallocated receipts remain) and adds sign-off locking.
      </p>
    </div>
  )
}
