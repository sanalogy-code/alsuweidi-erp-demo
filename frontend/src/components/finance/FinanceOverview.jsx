import {
  Wallet, ArrowDownCircle, ArrowUpCircle, AlertTriangle, ArrowRight,
  FileText, ReceiptText, Banknote, Plus,
} from 'lucide-react'
import { PROJECTS, PROJECT_TYPES } from '../../data/projectsData'
import {
  CASH_ACCOUNTS, fmtAED, invoiceOutstanding, invoiceStatusMeta, expenseStatusMeta,
} from '../../data/financeData'

// Fixed literal class names so Tailwind's scanner picks them up (no runtime concat).
const TYPE_BAR = {
  Buildings: 'bg-brand',
  Infrastructure: 'bg-blue-500',
  Transportation: 'bg-amber-500',
  Secondment: 'bg-violet-500',
}

function StatCard({ icon: Icon, tint, label, value, sub }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={tint} />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className="text-xl font-bold text-gray-900 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function FinanceOverview({ invoices, expenses, onJump }) {
  const projectOf = (id) => PROJECTS.find((p) => p.id === id)

  const cashTotal = CASH_ACCOUNTS.reduce((s, a) => s + a.balance, 0)

  const openInvoices = invoices.filter((i) => i.status !== 'draft' && i.status !== 'paid')
  const receivables = openInvoices.reduce((s, i) => s + invoiceOutstanding(i), 0)
  const overdue = invoices.filter((i) => i.status === 'overdue')
  const overdueAmount = overdue.reduce((s, i) => s + invoiceOutstanding(i), 0)
  const collected = invoices.reduce((s, i) => s + (i.amountPaid ?? 0), 0)

  const payableExpenses = expenses.filter((e) => e.status === 'approved' || e.status === 'pending')
  const payables = payableExpenses.reduce((s, e) => s + e.amount, 0)

  // Revenue by project type — join each invoice to its project (net fee, ex-VAT).
  const byType = PROJECT_TYPES.map((type) => ({
    type,
    total: invoices
      .filter((i) => projectOf(i.projectId)?.type === type)
      .reduce((s, i) => s + i.amount, 0),
  })).filter((r) => r.total > 0)
  const byTypeMax = Math.max(1, ...byType.map((r) => r.total))
  const revenueTotal = byType.reduce((s, r) => s + r.total, 0)

  const recentInvoices = [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate)).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Financial overview</h2>
        <p className="text-sm text-gray-500">Cash, receivables and revenue at a glance — demo figures.</p>
      </div>

      {/* Verb-first action cards — the fastest path to the four everyday tasks.
          Each jumps to its register with the add-form already open. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { view: 'invoices', icon: FileText, label: 'Record an invoice', sub: 'Bill a client / project' },
          { view: 'expenses', icon: ReceiptText, label: 'Log an expense', sub: 'With VAT & job-costing' },
          { view: 'receipts', icon: Banknote, label: 'Record a payment', sub: 'Money received in bank' },
          { view: 'petty', icon: Wallet, label: 'Petty cash entry', sub: 'Cash box in / out' },
        ].map((a) => (
          <button
            key={a.view}
            onClick={() => onJump?.(a.view, { add: true })}
            className="group bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-left hover:border-brand hover:shadow transition"
          >
            <div className="flex items-center justify-between mb-2">
              <a.icon size={18} className="text-brand" />
              <Plus size={14} className="text-gray-300 group-hover:text-brand transition" />
            </div>
            <div className="text-sm font-semibold text-gray-800">{a.label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{a.sub}</div>
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Wallet} tint="text-emerald-600" label="Cash position" value={fmtAED(cashTotal, { compact: true })} sub={`${CASH_ACCOUNTS.length} accounts`} />
        <StatCard icon={ArrowDownCircle} tint="text-blue-600" label="Receivables (outstanding)" value={fmtAED(receivables, { compact: true })} sub={`${openInvoices.length} open invoices`} />
        <StatCard icon={ArrowUpCircle} tint="text-amber-600" label="Payables (expenses)" value={fmtAED(payables, { compact: true })} sub={`${payableExpenses.length} to pay`} />
        <StatCard icon={AlertTriangle} tint="text-red-600" label="Overdue" value={fmtAED(overdueAmount, { compact: true })} sub={`${overdue.length} invoice${overdue.length === 1 ? '' : 's'}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by project type */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-brand rounded" /> Revenue by project type
          </h3>
          <div className="space-y-3">
            {byType.map((r) => (
              <div key={r.type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{r.type}</span>
                  <span className="font-semibold text-gray-800 tabular-nums">{fmtAED(r.total, { compact: true })}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full ${TYPE_BAR[r.type] || 'bg-gray-400'}`} style={{ width: `${(r.total / byTypeMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs">
            <span className="text-gray-500">Invoiced to date (ex-VAT)</span>
            <span className="font-bold text-gray-900 tabular-nums">{fmtAED(revenueTotal)}</span>
          </div>
        </div>

        {/* Cash accounts */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-brand rounded" /> Cash accounts
          </h3>
          <div className="divide-y divide-gray-100">
            {CASH_ACCOUNTS.map((a) => (
              <div key={a.id} className="py-2.5 first:pt-0 flex justify-between items-baseline">
                <div>
                  <div className="text-sm text-gray-800">{a.name}</div>
                  <div className="text-[11px] text-gray-400">{a.type}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900 tabular-nums">{fmtAED(a.balance)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="font-medium text-gray-600">Total available</span>
            <span className="font-bold text-emerald-700 tabular-nums">{fmtAED(cashTotal)}</span>
          </div>
          <div className="mt-3 text-[11px] text-gray-400">Collected against invoices to date: {fmtAED(collected)}. Mock balances — Phase 2 bank feed.</div>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-brand rounded" /> Recent invoices
          </h3>
          <button onClick={() => onJump?.('invoices')} className="text-xs text-brand font-medium hover:underline flex items-center gap-1">
            All invoices <ArrowRight size={13} />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentInvoices.map((inv) => {
            const meta = invoiceStatusMeta(inv.status)
            return (
              <div key={inv.id} className="py-2.5 first:pt-0 flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-gray-400 w-28 shrink-0 truncate">{inv.invoiceNo}</span>
                <span className="flex-1 min-w-0 truncate text-gray-800">{inv.clientName}</span>
                <span className="tabular-nums text-gray-700 w-28 text-right shrink-0">{fmtAED(inv.amount, { compact: true })}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium w-24 text-center shrink-0 ${meta.chip}`}>{meta.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Demo / mock data. Figures illustrate the shape of the module for requirements gathering — they are not reconciled accounting. Real ledger, VAT returns, WPS payroll integration and bank feeds are Phase 2.
      </p>
    </div>
  )
}
