import { useState } from 'react'
import { Check, Truck, PlayCircle, CheckCircle2 } from 'lucide-react'
import { PROJECTS } from '../../data/projectsData'
import { parseLocalDate } from '../../utils/date'
import { fmtAED, SUPPLIER_INVOICE_STATUSES, supplierInvoiceStatusMeta } from '../../data/financeData'

const fmtDate = (iso) => (iso ? parseLocalDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—')

// Supplier / payables ledger — subconsultant & supplier invoices IN.
// Workflow: pending_approval → approved → scheduled (payment run) → paid.
export default function PayablesView({ supplierInvoices, onUpdate }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const projectOf = (id) => PROJECTS.find((p) => p.id === id)

  const totalOf = (s) => s.amount + (s.vatAmount ?? 0)
  const approve = (s) => onUpdate({ ...s, status: 'approved' })
  const markPaid = (s) => onUpdate({ ...s, status: 'paid', paidDate: new Date().toISOString().slice(0, 10) })

  const approved = supplierInvoices.filter((s) => s.status === 'approved')
  const scheduled = supplierInvoices.filter((s) => s.status === 'scheduled')
  const runTotal = scheduled.reduce((sum, s) => sum + totalOf(s), 0)

  // "Payment run" — pull everything approved into a scheduled batch.
  const startRun = () => approved.forEach((s) => onUpdate({ ...s, status: 'scheduled' }))

  const shown = supplierInvoices
    .filter((s) => statusFilter === 'all' || s.status === statusFilter)
    .filter((s) => {
      const q = search.trim().toLowerCase()
      return !q || s.supplier.toLowerCase().includes(q) || (s.ref || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)
    })
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))

  const openTotal = supplierInvoices.filter((s) => s.status !== 'paid').reduce((sum, s) => sum + totalOf(s), 0)
  const pendingCount = supplierInvoices.filter((s) => s.status === 'pending_approval').length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Supplier invoices (payables)</h2>
          <p className="text-sm text-gray-500">Subconsultant and supplier invoices in: approve, group into a payment run, mark paid. Demo data.</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search supplier, ref…" className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white w-48" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
            <option value="all">All statuses</option>
            {SUPPLIER_INVOICE_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Open payables (incl. VAT)</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{fmtAED(openTotal, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Awaiting approval</div>
          <div className="text-lg font-bold text-amber-700 tabular-nums">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">In current payment run</div>
          <div className="text-lg font-bold text-purple-700 tabular-nums">{fmtAED(runTotal, { compact: true })}</div>
        </div>
      </div>

      {/* Payment run panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap items-center gap-3 text-sm">
        <PlayCircle size={16} className="text-purple-600 shrink-0" />
        {scheduled.length > 0 ? (
          <>
            <span className="text-gray-700">
              Payment run: <span className="font-semibold">{scheduled.length} invoice{scheduled.length > 1 ? 's' : ''}</span> scheduled,
              total <span className="font-semibold tabular-nums">{fmtAED(runTotal)}</span>
            </span>
            <button
              onClick={() => scheduled.forEach(markPaid)}
              className="ml-auto flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition"
            >
              <CheckCircle2 size={13} /> Mark run paid
            </button>
          </>
        ) : (
          <>
            <span className="text-gray-500">No payment run open.{approved.length > 0 ? ` ${approved.length} approved invoice${approved.length > 1 ? 's' : ''} (${fmtAED(approved.reduce((s, x) => s + totalOf(x), 0), { compact: true })}) ready to schedule.` : ' Nothing approved and unscheduled.'}</span>
            {approved.length > 0 && (
              <button onClick={startRun} className="ml-auto flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
                <PlayCircle size={13} /> Start payment run
              </button>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">Supplier / ref</th>
                <th className="px-4 py-2.5 font-medium">Description / project</th>
                <th className="px-4 py-2.5 font-medium text-right">Net</th>
                <th className="px-4 py-2.5 font-medium text-right">VAT</th>
                <th className="px-4 py-2.5 font-medium text-right">Due</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shown.map((s) => {
                const meta = supplierInvoiceStatusMeta(s.status)
                const proj = projectOf(s.projectId)
                const overdue = s.status !== 'paid' && s.dueDate && s.dueDate < '2026-07-07'
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <div className="text-gray-800">{s.supplier}</div>
                      <div className="font-mono text-[11px] text-gray-400">{s.ref}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-gray-700 max-w-[240px]">{s.description}</div>
                      {proj && <div className="text-[11px] text-brand mt-0.5">{proj.projectNo} · {proj.name}</div>}
                    </td>
                    <td className="px-4 py-3 align-top text-right tabular-nums text-gray-900 whitespace-nowrap">{fmtAED(s.amount)}</td>
                    <td className="px-4 py-3 align-top text-right tabular-nums text-gray-500 whitespace-nowrap">{fmtAED(s.vatAmount ?? 0)}</td>
                    <td className={`px-4 py-3 align-top text-right tabular-nums whitespace-nowrap ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {fmtDate(s.dueDate)}
                      {s.status === 'paid' && s.paidDate && <div className="text-[11px] text-green-600">paid {fmtDate(s.paidDate)}</div>}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.chip}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                      {s.status === 'pending_approval' && (
                        <button onClick={() => approve(s)} className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline">
                          <Check size={12} /> Approve
                        </button>
                      )}
                      {s.status === 'scheduled' && (
                        <button onClick={() => markPaid(s)} className="inline-flex items-center gap-1 text-xs text-brand font-medium hover:underline">
                          <CheckCircle2 size={12} /> Mark paid
                        </button>
                      )}
                      {(s.status === 'approved' || s.status === 'paid') && <span className="text-[11px] text-gray-300">—</span>}
                    </td>
                  </tr>
                )
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <Truck size={20} className="mx-auto mb-2 opacity-40" />
                    No supplier invoices match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Demo scope: approvals and the payment run mutate in-memory state only. Capturing supplier invoices from email/scan,
        approval routing by delegation limits, and bank-file (WPS-style) payment export are Phase 2.
      </p>
    </div>
  )
}
