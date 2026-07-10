import { useState } from 'react'
import { Plus, Wallet, Scale, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { parseLocalDate, todayISO, fmtShortDate as fmtDate } from '../../utils/date'
import { fmtAED, PETTY_CASH_OPENING } from '../../data/financeData'

// Petty cash log — float top-ups and small cash spends with a running balance,
// plus a monthly count-vs-book reconciliation. Demo-grade; the cash box would
// post into the GL as a cash account in Phase 2.
export default function PettyCashView({ entries, reconciliations, onAddEntry, onReconcile, currentUserName }) {
  const [showAdd, setShowAdd] = useState(false)
  const [showRec, setShowRec] = useState(false)
  const [form, setForm] = useState({ date: todayISO(), description: '', direction: 'out', amount: '' })
  const [recForm, setRecForm] = useState({ month: '2026-07', counted: '', note: '' })

  // Running balance oldest → newest, from the opening float.
  const ordered = [...entries].sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id - b.id)
  let bal = PETTY_CASH_OPENING.amount
  const withBalance = ordered.map((e) => {
    bal += e.direction === 'in' ? e.amount : -e.amount
    return { ...e, balance: bal }
  })
  const bookBalance = bal
  const totalIn = entries.filter((e) => e.direction === 'in').reduce((s, e) => s + e.amount, 0)
  const totalOut = entries.filter((e) => e.direction === 'out').reduce((s, e) => s + e.amount, 0)

  const bookAsOfMonthEnd = (month) => {
    let b = PETTY_CASH_OPENING.amount
    ordered.forEach((e) => {
      if ((e.date || '').slice(0, 7) <= month) b += e.direction === 'in' ? e.amount : -e.amount
    })
    return b
  }

  const addEntry = () => {
    const amt = Number(form.amount)
    if (!form.description.trim() || !amt || amt <= 0) return
    onAddEntry({ date: form.date, description: form.description.trim(), direction: form.direction, amount: amt, who: currentUserName || 'Finance' })
    setForm({ date: todayISO(), description: '', direction: 'out', amount: '' })
    setShowAdd(false)
  }

  const reconcile = () => {
    const counted = Number(recForm.counted)
    if (!recForm.month || Number.isNaN(counted)) return
    onReconcile({
      month: recForm.month, date: todayISO(),
      countedBy: currentUserName || 'Finance', reviewedBy: null,
      counted, book: bookAsOfMonthEnd(recForm.month), note: recForm.note.trim() || null,
    })
    setRecForm({ month: '2026-07', counted: '', note: '' })
    setShowRec(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Petty cash</h2>
          <p className="text-sm text-gray-500">Float top-ups and small cash spends, with a monthly count-vs-book reconciliation. Demo data.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowAdd((v) => !v); setShowRec(false) }} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
            <Plus size={13} /> Add entry
          </button>
          <button onClick={() => { setShowRec((v) => !v); setShowAdd(false) }} className="flex items-center gap-1 text-xs font-medium border border-gray-300 text-gray-700 px-2.5 py-1.5 rounded-md hover:bg-gray-50 transition">
            <Scale size={13} /> Reconcile
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-xs">
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-gray-500">Date <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} className="border rounded-md px-2 py-1.5">
              <option value="out">Cash out (spend)</option>
              <option value="in">Cash in (float top-up)</option>
            </select>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description *" className="flex-1 min-w-[200px] border rounded-md px-2.5 py-1.5" />
            <label className="text-gray-500">AED <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-24 border rounded-md px-2 py-1 ml-1 text-right" /></label>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={addEntry} className="px-3 py-1.5 rounded-md bg-brand text-white">Log entry</button>
          </div>
        </div>
      )}

      {showRec && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-xs space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-gray-500">Month <input type="month" value={recForm.month} onChange={(e) => setRecForm({ ...recForm, month: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <label className="text-gray-500">Cash counted (AED) <input type="number" min="0" value={recForm.counted} onChange={(e) => setRecForm({ ...recForm, counted: e.target.value })} className="w-28 border rounded-md px-2 py-1 ml-1 text-right" /></label>
            <span className="text-gray-400">Book balance to {recForm.month || '—'}: <span className="font-medium text-gray-700 tabular-nums">{fmtAED(bookAsOfMonthEnd(recForm.month))}</span></span>
            <input value={recForm.note} onChange={(e) => setRecForm({ ...recForm, note: e.target.value })} placeholder="Note (variance explanation)" className="flex-1 min-w-[180px] border rounded-md px-2.5 py-1.5" />
            <button onClick={() => setShowRec(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={reconcile} className="px-3 py-1.5 rounded-md bg-brand text-white">Save reconciliation</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Book balance (running)</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{fmtAED(bookBalance)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Top-ups in</div>
          <div className="text-lg font-bold text-green-700 tabular-nums">{fmtAED(totalIn)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Cash out</div>
          <div className="text-lg font-bold text-amber-700 tabular-nums">{fmtAED(totalOut)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
                <th className="px-4 py-2.5 font-medium text-right">In</th>
                <th className="px-4 py-2.5 font-medium text-right">Out</th>
                <th className="px-4 py-2.5 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="bg-gray-50/60">
                <td className="px-4 py-2 text-gray-500 text-xs tabular-nums">{fmtDate(PETTY_CASH_OPENING.asOf)}</td>
                <td className="px-4 py-2 text-gray-500 text-xs italic">Opening float</td>
                <td className="px-4 py-2" /><td className="px-4 py-2" />
                <td className="px-4 py-2 text-right tabular-nums text-gray-600">{fmtAED(PETTY_CASH_OPENING.amount)}</td>
              </tr>
              {[...withBalance].reverse().map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 align-top text-gray-600 tabular-nums whitespace-nowrap">{fmtDate(e.date)}</td>
                  <td className="px-4 py-2.5 align-top">
                    <div className="text-gray-700 flex items-center gap-1.5">
                      {e.direction === 'in'
                        ? <ArrowDownLeft size={12} className="text-green-600 shrink-0" />
                        : <ArrowUpRight size={12} className="text-amber-600 shrink-0" />}
                      {e.description}
                    </div>
                    <div className="text-[11px] text-gray-400 ml-[18px]">{e.who}</div>
                  </td>
                  <td className="px-4 py-2.5 align-top text-right tabular-nums text-green-700">{e.direction === 'in' ? fmtAED(e.amount) : ''}</td>
                  <td className="px-4 py-2.5 align-top text-right tabular-nums text-gray-700">{e.direction === 'out' ? fmtAED(e.amount) : ''}</td>
                  <td className="px-4 py-2.5 align-top text-right tabular-nums font-medium text-gray-900">{fmtAED(e.balance)}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <Wallet size={20} className="mx-auto mb-2 opacity-40" />
                    No petty cash entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliations */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400 font-medium">Monthly reconciliations</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <tbody className="divide-y divide-gray-50">
              {[...reconciliations].sort((a, b) => (b.month || '').localeCompare(a.month || '')).map((r) => {
                const variance = r.counted - r.book
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{r.month}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">Counted {fmtDate(r.date)} by {r.countedBy}{r.reviewedBy ? ` · reviewed by ${r.reviewedBy}` : ''}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">Counted {fmtAED(r.counted)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">Book {fmtAED(r.book)}</td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      {variance === 0 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Balanced</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                          Variance {variance > 0 ? '+' : ''}{fmtAED(variance)}
                        </span>
                      )}
                      {r.note && <div className="text-[11px] text-gray-400 mt-1 max-w-[220px] ml-auto">{r.note}</div>}
                    </td>
                  </tr>
                )
              })}
              {reconciliations.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-gray-400 text-sm">No reconciliations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        In-memory demo state. The book balance here and the petty cash line on the Overview cash position would be one GL account in Phase 2.
      </p>
    </div>
  )
}
