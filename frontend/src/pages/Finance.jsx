import { useState } from 'react'
import {
  LayoutDashboard, FileText, ReceiptText, TrendingUp, Lock, CalendarRange, Calculator,
  Banknote, Wallet, Truck, ShieldCheck, CalendarCheck, History,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import FinanceOverview from '../components/finance/FinanceOverview'
import InvoicesView from '../components/finance/InvoicesView'
import ExpensesView from '../components/finance/ExpensesView'
import ProfitLossView from '../components/finance/ProfitLossView'
import RevenueReportsView from '../components/finance/RevenueReportsView'
import AccountantView from '../components/finance/AccountantView'
import ReceiptsView from '../components/finance/ReceiptsView'
import PettyCashView from '../components/finance/PettyCashView'
import PayablesView from '../components/finance/PayablesView'
import RetentionView from '../components/finance/RetentionView'
import MonthEndView from '../components/finance/MonthEndView'
import ActivityView from '../components/finance/ActivityView'
import {
  INVOICES, EXPENSES, RECEIPTS, CREDIT_NOTES, PETTY_CASH_ENTRIES,
  PETTY_CASH_RECONCILIATIONS, SUPPLIER_INVOICES, MONTH_END_CHECKLISTS,
  invoiceTotal, fmtAED, CASH_ACCOUNTS,
} from '../data/financeData'
import { FINANCE_VIEW_ROLES } from '../data/dashboardData'

// Financials & Accounting — first-pass UI proof-of-concept (demo-grade, Phase 2 for
// real accounting integration). The whole module is sensitive, so it's gated to
// FINANCE_VIEW_ROLES (management + admin). Data ties into the existing Projects /
// CRM seeds: invoices bill against project consultancy fees, expenses job-cost to
// projects. See data/financeData.js.
//
// Accountant persona pass (Batch 17): receipts register (source of truth for paid
// status), credit notes, per-expense VAT, petty cash, supplier payables, retention,
// month-end close checklist, and a session activity log (audit-trail shape).

const nextId = (list) => Math.max(0, ...list.map((x) => x.id)) + 1
const nextRef = (list, field, prefix) =>
  `${prefix}-${String(Math.max(0, ...list.map((x) => Number((x[field] || '').split('-')[2]) || 0)) + 1).padStart(3, '0')}`

export default function Finance({ user, onLogout }) {
  const canView = FINANCE_VIEW_ROLES.includes(user?.role)
  const [view, setView] = useState('overview')
  const [invoices, setInvoices] = useState(INVOICES)
  const [expenses, setExpenses] = useState(EXPENSES)
  const [receipts, setReceipts] = useState(RECEIPTS)
  const [creditNotes, setCreditNotes] = useState(CREDIT_NOTES)
  const [pettyCash, setPettyCash] = useState(PETTY_CASH_ENTRIES)
  const [pettyRecs, setPettyRecs] = useState(PETTY_CASH_RECONCILIATIONS)
  const [supplierInvoices, setSupplierInvoices] = useState(SUPPLIER_INVOICES)
  const [checklists, setChecklists] = useState(MONTH_END_CHECKLISTS)
  const [activity, setActivity] = useState([])

  const who = user?.username || 'Finance'

  // Lightweight audit trail (demo scope) — every wired Finance action appends
  // {when, who, what}; shown on the Activity view. Session-only.
  const log = (what) =>
    setActivity((prev) => [{ id: nextId(prev), when: new Date().toISOString(), who, what }, ...prev])

  // --- Invoices ------------------------------------------------------------
  const updateInvoice = (inv, note) => {
    setInvoices((prev) => prev.map((x) => (x.id === inv.id ? inv : x)))
    if (note) log(note)
  }
  const addInvoice = (inv) => {
    setInvoices((prev) => [{ ...inv, id: nextId(prev) }, ...prev])
    log(`Invoice ${inv.invoiceNo} created (draft, ${fmtAED(inv.amount + (inv.vatAmount ?? 0))}) — ${inv.clientName}`)
  }

  // Record-payment (from Invoices view) creates a simple receipt behind the scenes,
  // so the Receipts register stays the source of truth for paid status.
  const applyAllocations = (allocations) => {
    setInvoices((prev) => prev.map((inv) => {
      const alloc = allocations.find((a) => a.invoiceId === inv.id)
      if (!alloc) return inv
      const newPaid = Math.min((inv.amountPaid ?? 0) + alloc.amount, invoiceTotal(inv))
      return { ...inv, amountPaid: newPaid, status: newPaid >= invoiceTotal(inv) ? 'paid' : 'partially_paid' }
    }))
  }
  const addReceipt = (receipt) => {
    // Keep the updater pure — no values smuggled out of it (StrictMode runs it twice).
    setReceipts((prev) => [{ ...receipt, id: nextId(prev), receiptNo: nextRef(prev, 'receiptNo', 'RCT-2026') }, ...prev])
    applyAllocations(receipt.allocations)
    log(`Receipt recorded — ${fmtAED(receipt.amount)} from ${receipt.clientName} (${receipt.allocations.length} invoice${receipt.allocations.length > 1 ? 's' : ''})`)
  }
  const recordPaymentOnInvoice = (inv, amount) => {
    if (!amount || amount <= 0) return
    addReceipt({
      date: new Date().toISOString().slice(0, 10), reference: null,
      bankAccount: CASH_ACCOUNTS[0]?.name || 'Operating account', clientName: inv.clientName,
      amount, allocations: [{ invoiceId: inv.id, amount }],
      note: 'Quick payment entry from Invoices view.',
    })
  }

  const addCreditNote = (cn) => {
    setCreditNotes((prev) => [
      { ...cn, id: nextId(prev), creditNoteNo: nextRef(prev, 'creditNoteNo', 'CN-2026') },
      ...prev,
    ])
    log(`Credit note issued — ${fmtAED(cn.amount)} against invoice #${cn.invoiceId} (${cn.clientName}): ${cn.reason}`)
  }

  // --- Expenses --------------------------------------------------------------
  const updateExpense = (e) => {
    const before = expenses.find((x) => x.id === e.id)
    setExpenses((prev) => prev.map((x) => (x.id === e.id ? e : x)))
    if (before && before.status !== e.status) log(`Expense ${e.status} — ${e.vendor}, ${fmtAED(e.amount)}`)
  }
  const addExpense = (e) => {
    setExpenses((prev) => [{ ...e, id: nextId(prev) }, ...prev])
    log(`Expense logged — ${e.vendor}, ${fmtAED(e.amount)} (VAT ${fmtAED(e.vatAmount ?? 0)}${e.vatNonRecoverable ? ', non-recoverable' : ''})`)
  }

  // --- Petty cash --------------------------------------------------------------
  const addPettyEntry = (entry) => {
    setPettyCash((prev) => [...prev, { ...entry, id: nextId(prev) }])
    log(`Petty cash ${entry.direction === 'in' ? 'top-up' : 'spend'} — ${fmtAED(entry.amount)}: ${entry.description}`)
  }
  const addPettyReconciliation = (rec) => {
    setPettyRecs((prev) => [...prev, { ...rec, id: nextId(prev) }])
    log(`Petty cash reconciled for ${rec.month} — counted ${fmtAED(rec.counted)} vs book ${fmtAED(rec.book)}`)
  }

  // --- Payables ------------------------------------------------------------------
  const updateSupplierInvoice = (s) => {
    setSupplierInvoices((prev) => prev.map((x) => (x.id === s.id ? s : x)))
    const label = { approved: 'approved', scheduled: 'added to payment run', paid: 'marked paid' }[s.status]
    if (label) log(`Supplier invoice ${s.ref} (${s.supplier}) ${label} — ${fmtAED(s.amount + (s.vatAmount ?? 0))}`)
  }

  // --- Month-end -------------------------------------------------------------------
  const toggleCloseItem = (month, key) => {
    setChecklists((prev) => prev.map((c) => {
      if (c.month !== month) return c
      const cur = c.items[key] || { done: false }
      const next = cur.done
        ? { done: false, who: null, when: null }
        : { done: true, who, when: new Date().toISOString().slice(0, 10) }
      return { ...c, items: { ...c.items, [key]: next } }
    }))
    log(`Month-end ${month}: "${key}" toggled`)
  }

  const outstandingCount = invoices.filter(
    (i) => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'overdue'
  ).length
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').length
  const pendingPayables = supplierInvoices.filter((s) => s.status === 'pending_approval').length

  const NAV = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'invoices', label: 'Invoices', icon: FileText, badge: outstandingCount },
    { key: 'receipts', label: 'Receipts', icon: Banknote },
    { key: 'expenses', label: 'Expenses', icon: ReceiptText, badge: pendingExpenses },
    { key: 'payables', label: 'Payables', icon: Truck, badge: pendingPayables },
    { key: 'petty', label: 'Petty cash', icon: Wallet },
    { key: 'retention', label: 'Retention', icon: ShieldCheck },
    { key: 'pl', label: 'P&L summary', icon: TrendingUp },
    { key: 'revenue', label: 'Revenue reports', icon: CalendarRange },
    { key: 'accountant', label: 'Accountant', icon: Calculator },
    { key: 'monthend', label: 'Month-end close', icon: CalendarCheck },
    { key: 'activity', label: 'Activity', icon: History },
  ]

  const navButton = (item) => {
    const Icon = item.icon
    const active = view === item.key
    return (
      <button
        key={item.key}
        onClick={() => setView(item.key)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition text-left ${active ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
      >
        <Icon size={15} className="shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shrink-0">
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} title="Financials" showBack />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
            <Lock size={22} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Restricted module</h2>
          <p className="text-sm text-gray-500 mt-2">
            Financials & Accounting is limited to management and admin. Your role
            doesn&apos;t have access. (RBAC is client-side in this demo — Phase 2 enforces it server-side.)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="Financials & Accounting" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <aside className="w-full sm:w-44 shrink-0 sm:sticky sm:top-6">
          <div className="flex sm:flex-col flex-wrap gap-1">
            {NAV.map(navButton)}
          </div>
          <div className="hidden sm:block mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
            Demo data — illustrative figures. Real accounting integration is Phase 2.
          </div>
        </aside>

        <main className="flex-1 min-w-0 w-full">
          {view === 'overview' && (
            <FinanceOverview invoices={invoices} expenses={expenses} onJump={setView} />
          )}
          {view === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              onUpdate={(inv) => updateInvoice(inv, inv.status === 'sent' ? `Invoice ${inv.invoiceNo} sent — ${inv.clientName}` : null)}
              onAdd={addInvoice}
              creditNotes={creditNotes}
              onAddCreditNote={addCreditNote}
              onPayment={recordPaymentOnInvoice}
            />
          )}
          {view === 'receipts' && (
            <ReceiptsView receipts={receipts} invoices={invoices} onAddReceipt={addReceipt} />
          )}
          {view === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              onUpdate={updateExpense}
              onAdd={addExpense}
              currentUserName={user?.username}
            />
          )}
          {view === 'payables' && (
            <PayablesView supplierInvoices={supplierInvoices} onUpdate={updateSupplierInvoice} />
          )}
          {view === 'petty' && (
            <PettyCashView
              entries={pettyCash}
              reconciliations={pettyRecs}
              onAddEntry={addPettyEntry}
              onReconcile={addPettyReconciliation}
              currentUserName={user?.username}
            />
          )}
          {view === 'retention' && <RetentionView />}
          {view === 'pl' && (
            <ProfitLossView invoices={invoices} expenses={expenses} />
          )}
          {view === 'revenue' && (
            <RevenueReportsView invoices={invoices} />
          )}
          {view === 'accountant' && (
            <AccountantView invoices={invoices} expenses={expenses} creditNotes={creditNotes} />
          )}
          {view === 'monthend' && (
            <MonthEndView checklists={checklists} onToggle={toggleCloseItem} />
          )}
          {view === 'activity' && <ActivityView log={activity} />}
        </main>
      </div>
    </div>
  )
}
