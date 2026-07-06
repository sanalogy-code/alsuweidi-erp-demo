import { useState } from 'react'
import { LayoutDashboard, FileText, ReceiptText, TrendingUp, Lock, CalendarRange } from 'lucide-react'
import Navbar from '../components/Navbar'
import FinanceOverview from '../components/finance/FinanceOverview'
import InvoicesView from '../components/finance/InvoicesView'
import ExpensesView from '../components/finance/ExpensesView'
import ProfitLossView from '../components/finance/ProfitLossView'
import RevenueReportsView from '../components/finance/RevenueReportsView'
import { INVOICES, EXPENSES } from '../data/financeData'
import { FINANCE_VIEW_ROLES } from '../data/dashboardData'

// Financials & Accounting — first-pass UI proof-of-concept (demo-grade, Phase 2 for
// real accounting integration). The whole module is sensitive, so it's gated to
// FINANCE_VIEW_ROLES (management + admin). Data ties into the existing Projects /
// CRM seeds: invoices bill against project consultancy fees, expenses job-cost to
// projects. See data/financeData.js.

export default function Finance({ user, onLogout }) {
  const canView = FINANCE_VIEW_ROLES.includes(user?.role)
  const [view, setView] = useState('overview')
  const [invoices, setInvoices] = useState(INVOICES)
  const [expenses, setExpenses] = useState(EXPENSES)

  const outstandingCount = invoices.filter(
    (i) => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'overdue'
  ).length
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').length

  const NAV = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'invoices', label: 'Invoices', icon: FileText, badge: outstandingCount },
    { key: 'expenses', label: 'Expenses', icon: ReceiptText, badge: pendingExpenses },
    { key: 'pl', label: 'P&L summary', icon: TrendingUp },
    { key: 'revenue', label: 'Revenue reports', icon: CalendarRange },
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
              onUpdate={(inv) => setInvoices(invoices.map((x) => (x.id === inv.id ? inv : x)))}
            />
          )}
          {view === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              onUpdate={(e) => setExpenses(expenses.map((x) => (x.id === e.id ? e : x)))}
            />
          )}
          {view === 'pl' && (
            <ProfitLossView invoices={invoices} expenses={expenses} />
          )}
          {view === 'revenue' && (
            <RevenueReportsView invoices={invoices} />
          )}
        </main>
      </div>
    </div>
  )
}
