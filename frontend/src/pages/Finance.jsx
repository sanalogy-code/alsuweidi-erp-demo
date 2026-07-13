import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ReceiptText, TrendingUp, Lock, Banknote, CalendarCheck,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SidebarNav from '../components/SidebarNav'
import SubViewTabs from '../components/SubViewTabs'
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
  // Set when an Overview action card jumps to a register — tells the target view
  // to open its add-form immediately. Cleared on any manual navigation.
  const [addIntent, setAddIntent] = useState(false)
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
    if (location.state?.view) { setView(location.state.view); setAddIntent(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const outstandingCount = invoices.filter(
    (i) => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'overdue'
  ).length
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').length
  const pendingPayables = supplierInvoices.filter((s) => s.status === 'pending_approval').length

  // IA restructure (Jul 2026): the sidebar groups by intent instead of listing all
  // 12 registers flat. Each group owns its old view keys as tabs, so HelpHub
  // deep-links (location.state.view = 'receipts' etc.) still land exactly right.
  const GROUPS = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard, views: [{ key: 'overview' }] },
    {
      key: 'moneyin', label: 'Money in', icon: Banknote, badge: outstandingCount,
      views: [
        { key: 'invoices', label: 'Invoices', badge: outstandingCount },
        { key: 'receipts', label: 'Receipts' },
        { key: 'retention', label: 'Retention' },
      ],
    },
    {
      key: 'moneyout', label: 'Money out', icon: ReceiptText, badge: pendingExpenses + pendingPayables,
      views: [
        { key: 'expenses', label: 'Expenses', badge: pendingExpenses },
        { key: 'payables', label: 'Payables', badge: pendingPayables },
        { key: 'petty', label: 'Petty cash' },
      ],
    },
    {
      key: 'reports', label: 'Reports', icon: TrendingUp,
      views: [
        { key: 'pl', label: 'P&L summary' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'accountant', label: 'Accountant' },
      ],
    },
    {
      key: 'close', label: 'Close & activity', icon: CalendarCheck,
      views: [
        { key: 'monthend', label: 'Month-end close' },
        { key: 'activity', label: 'Activity' },
      ],
    },
  ]
  const activeGroup = GROUPS.find((g) => g.views.some((v) => v.key === view)) || GROUPS[0]
  const goTo = (v, { add = false } = {}) => { setView(v); setAddIntent(add) }

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
          groups={[{ items: GROUPS.map(({ key, label, icon, badge }) => ({ key, label, icon, badge })) }]}
          active={activeGroup.key}
          onSelect={(key) => goTo(GROUPS.find((g) => g.key === key).views[0].key)}
          footer={(
            <div className="hidden sm:block mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
              Demo data — illustrative figures. Real accounting integration is Phase 2.
            </div>
          )}
        />

        <main className="flex-1 min-w-0 w-full">
          <SubViewTabs views={activeGroup.views} active={view} onSelect={goTo} />

          {view === 'overview' && (
            <FinanceOverview invoices={invoices} expenses={expenses} onJump={goTo} />
          )}
          {view === 'invoices' && (
            <InvoicesView
              initialAdd={addIntent}
              invoices={invoices}
              onUpdate={(inv) => updateInvoice(inv, inv.status === 'sent' ? `Invoice ${inv.invoiceNo} sent — ${inv.clientName}` : null)}
              onAdd={addInvoice}
              creditNotes={creditNotes}
              onAddCreditNote={addCreditNote}
              onPayment={recordPaymentOnInvoice}
            />
          )}
          {view === 'receipts' && (
            <ReceiptsView receipts={receipts} invoices={invoices} onAddReceipt={addReceipt} initialAdd={addIntent} />
          )}
          {view === 'expenses' && (
            <ExpensesView
              initialAdd={addIntent}
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
              initialAdd={addIntent}
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
