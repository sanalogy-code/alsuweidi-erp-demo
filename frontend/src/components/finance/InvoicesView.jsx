import { useState } from 'react'
import { Send, CheckCircle2, FileText } from 'lucide-react'
import { PROJECTS } from '../../data/projectsData'
import { parseLocalDate } from '../../utils/date'
import {
  INVOICE_STATUSES, invoiceStatusMeta, invoiceTotal, invoiceOutstanding, fmtAED,
} from '../../data/financeData'

const fmtDate = (iso) => (iso ? parseLocalDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—')

export default function InvoicesView({ invoices, onUpdate }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const projectOf = (id) => PROJECTS.find((p) => p.id === id)

  const shown = invoices
    .filter((i) => statusFilter === 'all' || i.status === statusFilter)
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))

  const totalBilled = invoices.reduce((s, i) => s + invoiceTotal(i), 0)
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'draft')
    .reduce((s, i) => s + invoiceOutstanding(i), 0)

  const send = (inv) => onUpdate({ ...inv, status: 'sent' })
  const markPaid = (inv) => onUpdate({ ...inv, status: 'paid', amountPaid: invoiceTotal(inv) })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Client invoices</h2>
          <p className="text-sm text-gray-500">Billed against project consultancy fees (design / supervision). Demo data.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Total billed (incl. VAT)</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{fmtAED(totalBilled, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Outstanding</div>
          <div className="text-lg font-bold text-amber-700 tabular-nums">{fmtAED(totalOutstanding, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Invoices</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{shown.length}<span className="text-xs font-normal text-gray-400"> of {invoices.length}</span></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">Invoice</th>
                <th className="px-4 py-2.5 font-medium">Client / project</th>
                <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                <th className="px-4 py-2.5 font-medium text-right">Due</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shown.map((inv) => {
                const meta = invoiceStatusMeta(inv.status)
                const proj = projectOf(inv.projectId)
                const outstanding = invoiceOutstanding(inv)
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <div className="font-mono text-xs text-gray-700">{inv.invoiceNo}</div>
                      <div className="text-[11px] text-gray-400">{fmtDate(inv.issueDate)}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-gray-800">{inv.clientName}</div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[220px]">
                        {proj ? `${proj.projectNo} · ${proj.name}` : inv.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="tabular-nums text-gray-900">{fmtAED(invoiceTotal(inv))}</div>
                      {outstanding > 0 && inv.status !== 'draft' && (
                        <div className="text-[11px] text-amber-600 tabular-nums">{fmtAED(outstanding)} due</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right text-gray-600 tabular-nums whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 align-top">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.chip}`}>{meta.label}</span>
                      {inv.note && <div className="text-[11px] text-gray-400 mt-1 max-w-[200px]">{inv.note}</div>}
                    </td>
                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                      {inv.status === 'draft' && (
                        <button onClick={() => send(inv)} className="inline-flex items-center gap-1 text-xs text-brand font-medium hover:underline">
                          <Send size={12} /> Send
                        </button>
                      )}
                      {(inv.status === 'sent' || inv.status === 'partially_paid' || inv.status === 'overdue') && (
                        <button onClick={() => markPaid(inv)} className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline">
                          <CheckCircle2 size={12} /> Mark paid
                        </button>
                      )}
                      {inv.status === 'paid' && <span className="text-[11px] text-gray-300">—</span>}
                    </td>
                  </tr>
                )
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <FileText size={20} className="mx-auto mb-2 opacity-40" />
                    No invoices match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Actions (Send / Mark paid) mutate in-memory demo state only. Partial payments, credit notes, VAT returns and reconciliation are Phase 2.
      </p>
    </div>
  )
}
