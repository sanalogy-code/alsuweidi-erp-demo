import { useState } from 'react'
import {
  INVOICES, EXPENSES, RECEIPTS, CREDIT_NOTES, PETTY_CASH_ENTRIES,
  PETTY_CASH_RECONCILIATIONS, SUPPLIER_INVOICES, MONTH_END_CHECKLISTS,
  invoiceTotal, fmtAED, CASH_ACCOUNTS, VAT_RATE,
} from '../data/financeData'
import { todayISO } from '../utils/date'
import { nextId } from '../utils/id'

const nextRef = (list, field, prefix) =>
  `${prefix}-${String(Math.max(0, ...list.map((x) => Number((x[field] || '').split('-')[2]) || 0)) + 1).padStart(3, '0')}`

// Finance module state, lifted to App (code-quality item from BACKLOG.md) so the
// Home KPIs, PM dashboards and project workspace read the SAME invoices/expenses
// the accountant is editing this session — not the static seeds.
// `auditRecord` is the app-wide audit log (state/auditLog.js) — Finance actions
// land in the same trail the Admin Center shows.
export function useFinanceState(user, auditRecord) {
  const [invoices, setInvoices] = useState(INVOICES)
  const [expenses, setExpenses] = useState(EXPENSES)
  const [receipts, setReceipts] = useState(RECEIPTS)
  const [creditNotes, setCreditNotes] = useState(CREDIT_NOTES)
  const [pettyCash, setPettyCash] = useState(PETTY_CASH_ENTRIES)
  const [pettyRecs, setPettyRecs] = useState(PETTY_CASH_RECONCILIATIONS)
  const [supplierInvoices, setSupplierInvoices] = useState(SUPPLIER_INVOICES)
  const [checklists, setChecklists] = useState(MONTH_END_CHECKLISTS)

  const who = user?.username || 'Finance'

  const log = (what, kind = 'update') =>
    auditRecord?.({ user: who, module: 'Financials', kind, detail: what })

  // --- Invoices ------------------------------------------------------------
  const updateInvoice = (inv, note) => {
    setInvoices((prev) => prev.map((x) => (x.id === inv.id ? inv : x)))
    if (note) log(note)
  }
  const addInvoice = (inv) => {
    setInvoices((prev) => [{ ...inv, id: nextId(prev) }, ...prev])
    log(`Invoice ${inv.invoiceNo} created (draft, ${fmtAED(inv.amount + (inv.vatAmount ?? 0))}) — ${inv.clientName}`, 'create')
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
    log(`Receipt recorded — ${fmtAED(receipt.amount)} from ${receipt.clientName} (${receipt.allocations.length} invoice${receipt.allocations.length > 1 ? 's' : ''})`, 'create')
  }
  const recordPaymentOnInvoice = (inv, amount) => {
    if (!amount || amount <= 0) return
    addReceipt({
      date: todayISO(), reference: null,
      bankAccount: CASH_ACCOUNTS[0]?.name || 'Operating account', clientName: inv.clientName,
      amount, allocations: [{ invoiceId: inv.id, amount }],
      note: 'Quick payment entry from Invoices view.',
    })
  }

  // Good-to-have from BACKLOG.md: a new project (won deal or direct award) auto-
  // creates a DRAFT mobilization invoice (10% of fee) — the accountant reviews,
  // adjusts and sends; nothing goes out automatically.
  const draftInvoiceFromProject = (project) => {
    if (!project?.contractValue) return
    const amount = Math.round(project.contractValue * 0.1)
    setInvoices((prev) => [{
      id: nextId(prev),
      invoiceNo: nextRef(prev, 'invoiceNo', 'INV-2026'),
      projectId: project.id, companyId: null, clientName: project.employer || '',
      description: `${project.projectNo} — mobilization / first stage fee (10%) — auto-drafted at project creation`,
      issueDate: todayISO(), dueDate: null,
      amount, vatAmount: Math.round(amount * VAT_RATE), amountPaid: 0, status: 'draft',
    }, ...prev])
    log(`Draft invoice auto-created for ${project.projectNo} — 10% mobilization (${fmtAED(amount)})`, 'create')
  }

  const addCreditNote = (cn) => {
    setCreditNotes((prev) => [
      { ...cn, id: nextId(prev), creditNoteNo: nextRef(prev, 'creditNoteNo', 'CN-2026') },
      ...prev,
    ])
    log(`Credit note issued — ${fmtAED(cn.amount)} against invoice #${cn.invoiceId} (${cn.clientName}): ${cn.reason}`, 'create')
  }

  // --- Expenses --------------------------------------------------------------
  const updateExpense = (e) => {
    const before = expenses.find((x) => x.id === e.id)
    setExpenses((prev) => prev.map((x) => (x.id === e.id ? e : x)))
    if (before && before.status !== e.status) log(`Expense ${e.status} — ${e.vendor}, ${fmtAED(e.amount)}`, e.status === 'approved' ? 'approve' : e.status === 'rejected' ? 'reject' : 'update')
  }
  const addExpense = (e) => {
    setExpenses((prev) => [{ ...e, id: nextId(prev) }, ...prev])
    log(`Expense logged — ${e.vendor}, ${fmtAED(e.amount)} (VAT ${fmtAED(e.vatAmount ?? 0)}${e.vatNonRecoverable ? ', non-recoverable' : ''})`, 'create')
  }

  // --- Petty cash --------------------------------------------------------------
  const addPettyEntry = (entry) => {
    setPettyCash((prev) => [...prev, { ...entry, id: nextId(prev) }])
    log(`Petty cash ${entry.direction === 'in' ? 'top-up' : 'spend'} — ${fmtAED(entry.amount)}: ${entry.description}`, 'create')
  }
  const addPettyReconciliation = (rec) => {
    setPettyRecs((prev) => [...prev, { ...rec, id: nextId(prev) }])
    log(`Petty cash reconciled for ${rec.month} — counted ${fmtAED(rec.counted)} vs book ${fmtAED(rec.book)}`)
  }

  // --- Payables ------------------------------------------------------------------
  const updateSupplierInvoice = (s) => {
    setSupplierInvoices((prev) => prev.map((x) => (x.id === s.id ? s : x)))
    const label = { approved: 'approved', scheduled: 'added to payment run', paid: 'marked paid' }[s.status]
    if (label) log(`Supplier invoice ${s.ref} (${s.supplier}) ${label} — ${fmtAED(s.amount + (s.vatAmount ?? 0))}`, s.status === 'approved' ? 'approve' : 'update')
  }

  // --- Month-end -------------------------------------------------------------------
  const toggleCloseItem = (month, key) => {
    setChecklists((prev) => prev.map((c) => {
      if (c.month !== month) return c
      const cur = c.items[key] || { done: false }
      const next = cur.done
        ? { done: false, who: null, when: null }
        : { done: true, who, when: todayISO() }
      return { ...c, items: { ...c.items, [key]: next } }
    }))
    log(`Month-end ${month}: "${key}" toggled`)
  }

  return {
    invoices, expenses, receipts, creditNotes, pettyCash, pettyRecs,
    supplierInvoices, checklists,
    updateInvoice, addInvoice, addReceipt, recordPaymentOnInvoice, addCreditNote, draftInvoiceFromProject,
    updateExpense, addExpense, addPettyEntry, addPettyReconciliation,
    updateSupplierInvoice, toggleCloseItem, log,
  }
}
