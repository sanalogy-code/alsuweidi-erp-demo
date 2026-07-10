import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, ReceiptText, TrendingUp, Lock, CalendarRange, Calculator,
  Banknote, Wallet, Truck, ShieldCheck, CalendarCheck, History,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SidebarNav from '../components/SidebarNav'
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

// Finance state lives in App (state/financeState.js) so Home KPIs, PM dashboards
// and the workspace read the same session data the accountant edits here.
export default function Finance({ user, onLogout, finance, auditEntries = [] }) {
  const canView = FINANCE_VIEW_ROLES.includes(user?.role)
  const location = useLocation()
  const [view, setView] = useState(location.state?.view || 'overview')
  const {
    invoices, expenses, receipts, creditNotes, pettyCash, pettyRecs,
    supplierInvoices, checklists,
    updateInvoice, addInvoice, addReceipt, recordPaymentOnInvoice, addCreditNote,
    updateExpense, addExpense, addPettyEntry, addPettyReconciliation,
    updateSupplierInvoice, toggleCloseItem,
  } = finance
  // The app-wide audit trail, filtered to this module (one mechanism, see state/auditLog.js).
  const activity = auditEntries.filter((e) => e.module === 'Financials')

  useEffect(() => {
    if (location.state?.view) setView(location.state.view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

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
        <SidebarNav
          groups={[{ items: NAV }]} active={view} onSelect={setView}
          footer={(
            <div className="hidden sm:block mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
              Demo data — illustrative figures. Real accounting integration is Phase 2.
            </div>
          )}
        />

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
