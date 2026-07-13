import { useState } from 'react'
import { Plus, Banknote } from 'lucide-react'
import { parseLocalDate, todayISO, fmtShortDate as fmtDate } from '../../utils/date'
import {
  fmtAED, invoiceOutstanding, invoiceTotal, CASH_ACCOUNTS,
} from '../../data/financeData'

// Receipts register — every payment received, with its allocation across invoice(s).
// This register is the source of truth for "Paid" on invoices: recording a receipt
// here (or via the quick Record-payment button on the Invoices view, which creates
// a simple receipt behind the scenes) drives the invoice paid / partially-paid status.
export default function ReceiptsView({ receipts, invoices, onAddReceipt, initialAdd = false }) {
  const [search, setSearch] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [showAdd, setShowAdd] = useState(initialAdd)
  const [form, setForm] = useState({
    date: todayISO(), reference: '',
    bankAccount: CASH_ACCOUNTS[0]?.name || '', clientName: '',
  })
  const [allocs, setAllocs] = useState([]) // [{ invoiceId, amount }]

  const invoiceOf = (id) => invoices.find((i) => i.id === id)
  const clients = [...new Set(invoices.filter((i) => i.status !== 'draft').map((i) => i.clientName))].sort()
  const openInvoices = invoices.filter(
    (i) => i.clientName === form.clientName && i.status !== 'draft' && invoiceOutstanding(i) > 0
  )

  const setAlloc = (invoiceId, amount) => {
    setAllocs((prev) => {
      const rest = prev.filter((a) => a.invoiceId !== invoiceId)
      const n = Number(amount)
      return n > 0 ? [...rest, { invoiceId, amount: n }] : rest
    })
  }
  const allocOf = (invoiceId) => allocs.find((a) => a.invoiceId === invoiceId)?.amount ?? ''
  const allocTotal = allocs.reduce((s, a) => s + a.amount, 0)

  const saveReceipt = () => {
    if (!form.clientName || allocTotal <= 0) return
    // Clamp each allocation to the invoice's outstanding so statuses stay honest.
    const clamped = allocs
      .map((a) => {
        const inv = invoiceOf(a.invoiceId)
        return inv ? { invoiceId: a.invoiceId, amount: Math.min(a.amount, invoiceOutstanding(inv)) } : null
      })
      .filter((a) => a && a.amount > 0)
    if (clamped.length === 0) return
    onAddReceipt({
      date: form.date, reference: form.reference.trim() || null,
      bankAccount: form.bankAccount, clientName: form.clientName,
      amount: clamped.reduce((s, a) => s + a.amount, 0), allocations: clamped,
    })
    setForm({ date: todayISO(), reference: '', bankAccount: CASH_ACCOUNTS[0]?.name || '', clientName: '' })
    setAllocs([]); setShowAdd(false)
  }

  const shown = receipts
    .filter((r) => (!range.from || r.date >= range.from) && (!range.to || r.date <= range.to))
    .filter((r) => {
      const q = search.trim().toLowerCase()
      return !q || (r.receiptNo || '').toLowerCase().includes(q) || (r.clientName || '').toLowerCase().includes(q) || (r.reference || '').toLowerCase().includes(q)
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const totalReceived = receipts.reduce((s, r) => s + r.amount, 0)
  const thisMonth = receipts.filter((r) => (r.date || '').slice(0, 7) === '2026-07').reduce((s, r) => s + r.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Receipts register</h2>
          <p className="text-sm text-gray-500">Every payment received, allocated to invoices — the source of truth for what&apos;s been paid. Demo data.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
            <Plus size={13} /> Record receipt
          </button>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search no, client, reference…" className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white w-52" />
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} title="From" className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white" />
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} title="To" className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white" />
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3 text-xs">
          <div className="grid sm:grid-cols-4 gap-2">
            <label className="text-gray-500">Date
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border rounded-md px-2 py-1.5 mt-0.5" />
            </label>
            <label className="text-gray-500">Reference (bank / cheque no)
              <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. TT-FAB-12044" className="w-full border rounded-md px-2 py-1.5 mt-0.5" />
            </label>
            <label className="text-gray-500">Bank account
              <select value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} className="w-full border rounded-md px-2 py-1.5 mt-0.5">
                {CASH_ACCOUNTS.map((a) => <option key={a.id}>{a.name}</option>)}
              </select>
            </label>
            <label className="text-gray-500">Client
              <select value={form.clientName} onChange={(e) => { setForm({ ...form, clientName: e.target.value }); setAllocs([]) }} className="w-full border rounded-md px-2 py-1.5 mt-0.5">
                <option value="">Select client…</option>
                {clients.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>

          {form.clientName && (
            openInvoices.length > 0 ? (
              <div className="border border-gray-100 rounded-md divide-y divide-gray-50">
                <div className="px-3 py-1.5 text-[11px] text-gray-400 uppercase tracking-wide">Allocate across open invoices</div>
                {openInvoices.map((inv) => (
                  <div key={inv.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                    <span className="font-mono text-gray-600 w-28">{inv.invoiceNo}</span>
                    <span className="flex-1 text-gray-500 truncate">{inv.description}</span>
                    <span className="text-amber-600 tabular-nums">{fmtAED(invoiceOutstanding(inv))} due</span>
                    <input
                      type="number" min="0" max={invoiceOutstanding(inv)} value={allocOf(inv.id)}
                      onChange={(e) => setAlloc(inv.id, e.target.value)}
                      placeholder="0" className="w-28 border rounded-md px-2 py-1 text-right"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No open invoices for this client — nothing to allocate.</p>
            )
          )}

          <div className="flex items-center justify-end gap-2">
            <span className="text-gray-500 mr-auto">Receipt total: <span className="font-semibold text-gray-800 tabular-nums">{fmtAED(allocTotal)}</span></span>
            <button onClick={() => { setShowAdd(false); setAllocs([]) }} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={saveReceipt} disabled={allocTotal <= 0} className="px-3 py-1.5 rounded-md bg-brand text-white disabled:opacity-40">Record receipt</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Total received (all time)</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{fmtAED(totalReceived, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Received in July 2026</div>
          <div className="text-lg font-bold text-green-700 tabular-nums">{fmtAED(thisMonth, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Receipts</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{shown.length}<span className="text-xs font-normal text-gray-400"> of {receipts.length}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">Receipt</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Bank / reference</th>
                <th className="px-4 py-2.5 font-medium">Allocated to</th>
                <th className="px-4 py-2.5 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shown.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 align-top">
                    <div className="font-mono text-xs text-gray-700">{r.receiptNo}</div>
                    <div className="text-[11px] text-gray-400">{fmtDate(r.date)}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-gray-800">{r.clientName}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-gray-600 text-xs">{r.bankAccount}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{r.reference || '—'}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {(r.allocations || []).map((a) => {
                      const inv = invoiceOf(a.invoiceId)
                      return (
                        <div key={a.invoiceId} className="text-xs text-gray-600">
                          <span className="font-mono">{inv?.invoiceNo || `#${a.invoiceId}`}</span>
                          <span className="text-gray-400"> · {fmtAED(a.amount)}</span>
                          {inv && a.amount < invoiceTotal(inv) && invoiceOutstanding(inv) > 0 && (
                            <span className="text-amber-600"> (part)</span>
                          )}
                        </div>
                      )
                    })}
                    {r.note && <div className="text-[11px] text-gray-400 mt-0.5">{r.note}</div>}
                  </td>
                  <td className="px-4 py-3 align-top text-right tabular-nums text-gray-900 whitespace-nowrap">{fmtAED(r.amount)}</td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <Banknote size={20} className="mx-auto mb-2 opacity-40" />
                    No receipts match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Recording a receipt updates the linked invoices&apos; paid / partially-paid status in this session.
        Bank-feed matching and unallocated-receipt handling come with the Phase 2 accounting integration.
      </p>
    </div>
  )
}
