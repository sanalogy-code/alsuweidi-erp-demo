import { useState } from 'react'
import { Check, X, ReceiptText } from 'lucide-react'
import { PROJECTS } from '../../data/projectsData'
import { parseLocalDate } from '../../utils/date'
import {
  EXPENSE_CATEGORIES, EXPENSE_STATUSES, expenseStatusMeta, fmtAED,
} from '../../data/financeData'

const fmtDate = (iso) => (iso ? parseLocalDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—')

export default function ExpensesView({ expenses, onUpdate }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const projectOf = (id) => PROJECTS.find((p) => p.id === id)

  const shown = expenses
    .filter((e) => statusFilter === 'all' || e.status === statusFilter)
    .filter((e) => categoryFilter === 'all' || e.category === categoryFilter)
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
                    </td>
                    <td className="px-4 py-3 align-top text-right tabular-nums text-gray-900 whitespace-nowrap">{fmtAED(e.amount)}</td>
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
