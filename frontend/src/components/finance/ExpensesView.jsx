import { useState } from 'react'
import { Check, X, ReceiptText, Plus, Paperclip } from 'lucide-react'
import { PROJECTS } from '../../data/projectsData'
import { parseLocalDate, todayISO, fmtShortDate as fmtDate } from '../../utils/date'
import {
  EXPENSE_CATEGORIES, EXPENSE_STATUSES, expenseStatusMeta, fmtAED, VAT_RATE,
} from '../../data/financeData'

export default function ExpensesView({ expenses, onUpdate, onAdd, currentUserName }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [showAdd, setShowAdd] = useState(false)
  const emptyForm = { date: todayISO(), category: EXPENSE_CATEGORIES[0], vendor: '', description: '', amount: '', vatAmount: '', vatTouched: false, vatNonRecoverable: false, projectId: '', attachment: '' }
  const [form, setForm] = useState(emptyForm)
  const projectOf = (id) => PROJECTS.find((p) => p.id === id)

  // VAT defaults to 5% of net but is editable (the amount on the supplier's tax
  // invoice wins — zero-rated / exempt items exist).
  const autoVat = (net) => Math.round((Number(net) || 0) * VAT_RATE)
  const effectiveVat = form.vatTouched ? Number(form.vatAmount) || 0 : autoVat(form.amount)

  // Accountant action (7 Jul): log an expense with the receipt/invoice scan attached
  // (file-name only until Phase 2 storage).
  const addExpense = () => {
    if (!form.vendor.trim() || !Number(form.amount)) return
    onAdd({
      date: form.date, category: form.category, vendor: form.vendor.trim(),
      description: form.description.trim() || form.category, amount: Number(form.amount),
      vatAmount: effectiveVat, vatNonRecoverable: form.vatNonRecoverable || undefined,
      status: 'pending', submittedBy: currentUserName || 'Finance',
      projectId: form.projectId ? Number(form.projectId) : null,
      attachment: form.attachment.trim() || null,
    })
    setForm(emptyForm)
    setShowAdd(false)
  }

  const shown = expenses
    .filter((e) => statusFilter === 'all' || e.status === statusFilter)
    .filter((e) => categoryFilter === 'all' || e.category === categoryFilter)
    .filter((e) => (!range.from || e.date >= range.from) && (!range.to || e.date <= range.to))
    .filter((e) => {
      const q = search.trim().toLowerCase()
      return !q || e.vendor.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q) || (e.submittedBy || '').toLowerCase().includes(q)
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  const approvedTotal = expenses.filter((e) => e.status === 'approved' || e.status === 'reimbursed').reduce((s, e) => s + e.amount, 0)
  const pendingTotal = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount, 0)

  const approve = (e) => onUpdate({ ...e, status: 'approved' })
  const reject = (e) => onUpdate({ ...e, status: 'rejected' })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
          <p className="text-sm text-gray-500">Operating costs and project reimbursables, with approval status. Demo data.</p>
        </div>
        <div className="flex items-center gap-2">
          {onAdd && (
            <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
              <Plus size={13} /> Add expense
            </button>
          )}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendor, description…" className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white w-48" />
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} title="From" className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white" />
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} title="To" className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
            <option value="all">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
            <option value="all">All statuses</option>
            {EXPENSE_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-3 gap-2">
            <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor / payee *" className="border rounded-md px-2.5 py-1.5" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded-md px-2 py-1.5">
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="border rounded-md px-2 py-1.5">
              <option value="">Job-cost to project (optional)…</option>
              {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.projectNo} — {p.name}</option>)}
            </select>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="border rounded-md px-2.5 py-1.5 sm:col-span-3" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-gray-500">Net AED <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-28 border rounded-md px-2 py-1 ml-1 text-right" /></label>
            <label className="text-gray-500" title="Defaults to 5% of net — override with the VAT shown on the supplier's tax invoice">
              VAT <input type="number" min="0" value={form.vatTouched ? form.vatAmount : autoVat(form.amount)} onChange={(e) => setForm({ ...form, vatAmount: e.target.value, vatTouched: true })} className="w-20 border rounded-md px-2 py-1 ml-1 text-right" />
              {!form.vatTouched && <span className="text-gray-400 ml-1">(auto 5%)</span>}
            </label>
            <label className="flex items-center gap-1 text-gray-500" title="e.g. entertainment — VAT paid but not recoverable on the FTA return">
              <input type="checkbox" checked={form.vatNonRecoverable} onChange={(e) => setForm({ ...form, vatNonRecoverable: e.target.checked })} /> VAT non-recoverable
            </label>
            <label className="text-gray-500">Date <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <label className="flex items-center gap-1 text-gray-500"><Paperclip size={11} /><input value={form.attachment} onChange={(e) => setForm({ ...form, attachment: e.target.value })} placeholder="Receipt / invoice photo (file name)" className="w-64 border rounded-md px-2 py-1" /></label>
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={addExpense} className="px-3 py-1.5 rounded-md bg-brand text-white">Log expense</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Approved / paid</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{fmtAED(approvedTotal, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Pending approval</div>
          <div className="text-lg font-bold text-amber-700 tabular-nums">{fmtAED(pendingTotal, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Showing</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{shown.length}<span className="text-xs font-normal text-gray-400"> of {expenses.length}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Category / vendor</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
                <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shown.map((e) => {
                const meta = expenseStatusMeta(e.status)
                const proj = projectOf(e.projectId)
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top text-gray-600 tabular-nums whitespace-nowrap">{fmtDate(e.date)}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-gray-800">{e.category}</div>
                      <div className="text-[11px] text-gray-400">{e.vendor}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-gray-700 max-w-[240px]">{e.description}</div>
                      {proj && <div className="text-[11px] text-brand mt-0.5">{proj.projectNo} · {proj.name}</div>}
                      {e.note && <div className="text-[11px] text-gray-400 mt-0.5">{e.note}</div>}
                      {e.attachment && <div className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5"><Paperclip size={9} /> {e.attachment}</div>}
                    </td>
                    <td className="px-4 py-3 align-top text-right tabular-nums text-gray-900 whitespace-nowrap">
                      {fmtAED(e.amount)}
                      <div className="text-[11px] text-gray-400">
                        {e.vatAmount != null ? `VAT ${fmtAED(e.vatAmount)}` : 'VAT est. 5%'}
                        {e.vatNonRecoverable && <span className="text-red-500"> · non-rec.</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.chip}`}>{meta.label}</span>
                      <div className="text-[11px] text-gray-400 mt-1">{e.submittedBy}</div>
                    </td>
                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                      {e.status === 'pending' ? (
                        <div className="inline-flex gap-2">
                          <button onClick={() => approve(e)} className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline">
                            <Check size={12} /> Approve
                          </button>
                          <button onClick={() => reject(e)} className="inline-flex items-center gap-1 text-xs text-red-600 font-medium hover:underline">
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <ReceiptText size={20} className="mx-auto mb-2 opacity-40" />
                    No expenses match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Approve / Reject mutate in-memory demo state only. Approval routing, receipts/attachments, and payment runs are Phase 2.
      </p>
    </div>
  )
}
