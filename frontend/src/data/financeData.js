// Financials & Accounting — dummy data for the proof-of-concept UI. No backend, no
// persistence. This is a DEMO-GRADE first pass built to start the requirements
// conversation with Sana/Finance — the numbers are plausible but invented, and the
// P&L / cash figures are illustrative, not reconciled accounting.
//
// Ties into the existing seeds:
//   - INVOICES reference projects (projectsData PROJECTS) by projectId and CRM
//     companies (crmData INITIAL_COMPANIES) by companyId. Invoice amounts bill against
//     a project's consultancy fee (project.contractValue), the way a design/supervision
//     firm invoices milestones — NOT the construction cost.
//   - A couple of invoices trace back to CRM won-deals (deal 101 → project 8).
//   - EXPENSES optionally reference a project (projectId) for job-costing.
//
// Currency is AED throughout. UAE VAT is 5%. Everything is Phase 2 for real accounting
// integration (WPS payroll already lives in HR; this module would consume it).

// AED formatting — kept local to the Finance module for now. (There are several
// ad-hoc AED formatters across the app; a shared currency helper is a tracked
// code-quality item in BACKLOG.md.)
export const fmtAED = (n, { compact = false } = {}) => {
  if (n == null || Number.isNaN(n)) return '—'
  if (compact && Math.abs(n) >= 1000) {
    if (Math.abs(n) >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
    return `AED ${(n / 1000).toFixed(0)}k`
  }
  return `AED ${Math.round(n).toLocaleString('en-AE')}`
}

export const VAT_RATE = 0.05

// --- Invoice status vocabulary -------------------------------------------------
// draft → sent → (partially_paid) → paid, with overdue as a flag layered on a sent /
// partially_paid invoice whose due date has passed. Seeds store the status directly for
// demo clarity; `deriveInvoiceStatus` shows how it would be computed from due date + paid.
export const INVOICE_STATUSES = [
  { key: 'draft', label: 'Draft', chip: 'bg-gray-100 text-gray-600' },
  { key: 'sent', label: 'Sent', chip: 'bg-blue-100 text-blue-700' },
  { key: 'partially_paid', label: 'Partially paid', chip: 'bg-amber-100 text-amber-700' },
  { key: 'paid', label: 'Paid', chip: 'bg-green-100 text-green-700' },
  { key: 'overdue', label: 'Overdue', chip: 'bg-red-100 text-red-700' },
]

export const invoiceStatusMeta = (key) =>
  INVOICE_STATUSES.find((s) => s.key === key) || INVOICE_STATUSES[0]

// Outstanding = total (incl. VAT) minus what's been received.
export const invoiceTotal = (inv) => inv.amount + (inv.vatAmount ?? 0)
export const invoiceOutstanding = (inv) => Math.max(0, invoiceTotal(inv) - (inv.amountPaid ?? 0))

// Illustrative of the Phase 2 rule: an unpaid/partly-paid invoice past its due date is
// overdue. Demo seeds set status explicitly; this exists so the logic is documented.
export const deriveInvoiceStatus = (inv, todayISO) => {
  if (inv.status === 'draft' || inv.status === 'paid') return inv.status
  if (inv.dueDate && inv.dueDate < todayISO && invoiceOutstanding(inv) > 0) return 'overdue'
  return inv.status
}

// --- Invoices ------------------------------------------------------------------
// amount = net fee line (ex-VAT); vatAmount = 5%; amountPaid counts against the
// VAT-inclusive total. Today in the demo world is 2026-07-04.
export const INVOICES = [
  {
    id: 1, invoiceNo: 'INV-2026-001', projectId: 12, companyId: 4, clientName: 'Emaar Properties',
    description: 'Facade retrofit design — final fee (20%)', issueDate: '2026-01-15', dueDate: '2026-02-14',
    amount: 102000, vatAmount: 5100, amountPaid: 107100, status: 'paid', dealId: null,
  },
  {
    id: 2, invoiceNo: 'INV-2026-002', projectId: 1, companyId: null, clientName: 'Al Reem Development Co',
    description: 'Harbour Point — design fee milestone (IFC issue)', issueDate: '2026-02-01', dueDate: '2026-03-03',
    amount: 840000, vatAmount: 42000, amountPaid: 882000, status: 'paid', dealId: null,
  },
  {
    id: 3, invoiceNo: 'INV-2026-003', projectId: 1, companyId: null, clientName: 'Al Reem Development Co',
    description: 'Harbour Point — supervision fee, Q1 2026', issueDate: '2026-03-31', dueDate: '2026-04-30',
    amount: 315000, vatAmount: 15750, amountPaid: 330750, status: 'paid', dealId: null,
  },
  {
    id: 4, invoiceNo: 'INV-2026-004', projectId: 5, companyId: 4, clientName: 'Emaar Properties',
    description: 'Saadiyat Villas C4 — supervision fee, Q1 2026', issueDate: '2026-03-31', dueDate: '2026-04-30',
    amount: 382500, vatAmount: 19125, amountPaid: 200000, status: 'partially_paid', dealId: null,
  },
  {
    id: 5, invoiceNo: 'INV-2026-005', projectId: 3, companyId: null, clientName: 'Abu Dhabi Municipality',
    description: 'Al Dhafra Roads Pkg 3 — design fee (40%, Tender Docs)', issueDate: '2026-06-15', dueDate: '2026-08-14',
    amount: 2720000, vatAmount: 136000, amountPaid: 0, status: 'sent', dealId: null,
  },
  {
    id: 6, invoiceNo: 'INV-2026-006', projectId: 8, companyId: 1, clientName: 'ADNOC',
    description: 'Pump Station Upgrade — supervision mobilisation (25%)', issueDate: '2026-04-01', dueDate: '2026-05-01',
    amount: 337500, vatAmount: 16875, amountPaid: 354375, status: 'paid', dealId: 101,
  },
  {
    id: 7, invoiceNo: 'INV-2026-007', projectId: 8, companyId: 1, clientName: 'ADNOC',
    description: 'Pump Station Upgrade — supervision fee, Q2 2026', issueDate: '2026-06-30', dueDate: '2026-07-30',
    amount: 202500, vatAmount: 10125, amountPaid: 0, status: 'sent', dealId: 101,
  },
  {
    id: 8, invoiceNo: 'INV-2025-041', projectId: 4, companyId: 6, clientName: 'Gulf Steel Fabrication',
    description: 'Fabrication Plant Extension — design fee, disputed balance', issueDate: '2025-11-20', dueDate: '2025-12-20',
    amount: 294000, vatAmount: 14700, amountPaid: 0, status: 'overdue', dealId: null,
    note: 'In dispute — handed to Finance/Contracts (see project financial status).',
  },
  {
    id: 9, invoiceNo: 'INV-2026-009', projectId: 2, companyId: 2, clientName: 'Etihad Airways',
    description: 'Crew Training Facility — design fee (30%, Detailed)', issueDate: '2026-06-10', dueDate: '2026-07-10',
    amount: 555000, vatAmount: 27750, amountPaid: 0, status: 'sent', dealId: null,
  },
  {
    id: 10, invoiceNo: 'INV-2026-010', projectId: 11, companyId: null, clientName: 'Al Dhafra Retail Holdings',
    description: 'Madinat Zayed Retail Strip — design fee (50%, IFC)', issueDate: '2026-05-20', dueDate: '2026-06-19',
    amount: 560000, vatAmount: 28000, amountPaid: 300000, status: 'partially_paid', dealId: null,
  },
  {
    id: 11, invoiceNo: 'INV-2026-011', projectId: 6, companyId: 3, clientName: 'DEWA',
    description: 'Substation Access & Landscaping — supervision fee, Q2 2026', issueDate: '2026-06-30', dueDate: '2026-07-30',
    amount: 180000, vatAmount: 9000, amountPaid: 0, status: 'sent', dealId: null,
  },
  {
    id: 12, invoiceNo: 'INV-2026-012', projectId: 9, companyId: 1, clientName: 'ADNOC',
    description: 'Site Engineering Secondment — June 2026', issueDate: '2026-06-30', dueDate: '2026-07-15',
    amount: 71667, vatAmount: 3583, amountPaid: 75250, status: 'paid', dealId: null,
  },
  {
    id: 13, invoiceNo: 'INV-2026-013', projectId: 10, companyId: null, clientName: 'Private Client — Al Ain',
    description: 'Al Ain Mosque — design fee (20%, Concept)', issueDate: '2026-03-01', dueDate: '2026-03-31',
    amount: 128000, vatAmount: 6400, amountPaid: 0, status: 'overdue', dealId: null,
    note: 'Project on hold — client cash-flow; chase before releasing further design.',
  },
  {
    id: 14, invoiceNo: 'INV-2026-014', projectId: 5, companyId: 4, clientName: 'Emaar Properties',
    description: 'Saadiyat Villas C4 — supervision fee, Q2 2026', issueDate: '2026-06-30', dueDate: '2026-07-30',
    amount: 382500, vatAmount: 19125, amountPaid: 0, status: 'draft', dealId: null,
  },
]

// --- Receipts register -----------------------------------------------------------
// Every payment received: date, bank reference, account, client, and how the money
// was allocated across invoice(s). The register is the source of truth for "Paid"
// on invoices — the quick Record-payment button on the Invoices view creates a
// simple receipt behind the scenes. Seeds reconcile with the amountPaid figures on
// the invoice seeds above.
export const RECEIPTS = [
  {
    id: 1, receiptNo: 'RCT-2026-001', date: '2026-02-10', reference: 'TT-ENBD-88412', bankAccount: 'Operating account — ADCB',
    clientName: 'Emaar Properties', amount: 107100, allocations: [{ invoiceId: 1, amount: 107100 }],
  },
  {
    id: 2, receiptNo: 'RCT-2026-002', date: '2026-03-18', reference: 'TT-FAB-10277', bankAccount: 'Operating account — ADCB',
    clientName: 'Al Reem Development Co', amount: 882000, allocations: [{ invoiceId: 2, amount: 882000 }],
  },
  {
    id: 3, receiptNo: 'RCT-2026-003', date: '2026-04-28', reference: 'TT-FAB-11930', bankAccount: 'Operating account — ADCB',
    clientName: 'Al Reem Development Co', amount: 330750, allocations: [{ invoiceId: 3, amount: 330750 }],
  },
  {
    id: 4, receiptNo: 'RCT-2026-004', date: '2026-05-12', reference: 'CHQ-006214', bankAccount: 'Operating account — ADCB',
    clientName: 'Emaar Properties', amount: 200000, allocations: [{ invoiceId: 4, amount: 200000 }],
    note: 'Part payment — client withheld balance pending variation sign-off.',
  },
  {
    id: 5, receiptNo: 'RCT-2026-005', date: '2026-05-05', reference: 'TT-ADNOC-55201', bankAccount: 'Operating account — ADCB',
    clientName: 'ADNOC', amount: 354375, allocations: [{ invoiceId: 6, amount: 354375 }],
  },
  {
    id: 6, receiptNo: 'RCT-2026-006', date: '2026-07-03', reference: 'TT-ADNOC-56618', bankAccount: 'Operating account — ADCB',
    clientName: 'ADNOC', amount: 75250, allocations: [{ invoiceId: 12, amount: 75250 }],
  },
  {
    id: 7, receiptNo: 'RCT-2026-007', date: '2026-06-08', reference: 'CHQ-001127', bankAccount: 'Operating account — ADCB',
    clientName: 'Al Dhafra Retail Holdings', amount: 300000, allocations: [{ invoiceId: 10, amount: 300000 }],
  },
]

// --- Credit notes ----------------------------------------------------------------
// Issued against a sent/paid invoice to reduce what the client owes (or refund).
// Demo-grade: credit notes show on the client statement; posting them through a
// real GL (and against the VAT return) is Phase 2.
export const CREDIT_NOTES = [
  {
    id: 1, creditNoteNo: 'CN-2026-001', invoiceId: 4, clientName: 'Emaar Properties', date: '2026-06-20',
    amount: 26250, reason: 'Agreed reduction — two supervision site visits descoped in May (variation VO-05).',
  },
]

// --- Petty cash log ----------------------------------------------------------------
// Float top-ups (in) and small cash spends (out); running balance derived in the view.
// Monthly reconciliation: counted vs book, variance flagged. The petty cash float in
// CASH_ACCOUNTS is the same box of cash.
export const PETTY_CASH_ENTRIES = [
  { id: 1, date: '2026-06-01', description: 'Float top-up from bank (cheque encashment)', direction: 'in', amount: 10000, who: 'Admin — Mariam Saleh' },
  { id: 2, date: '2026-06-03', description: 'Courier — tender documents to ADM', direction: 'out', amount: 180, who: 'Admin — Mariam Saleh' },
  { id: 3, date: '2026-06-09', description: 'Site refreshments — client walkthrough, Saadiyat C4', direction: 'out', amount: 420, who: 'Yousef Al Kaabi' },
  { id: 4, date: '2026-06-12', description: 'Parking & Salik — municipality submissions run', direction: 'out', amount: 95, who: 'Driver — Ramesh' },
  { id: 5, date: '2026-06-17', description: 'Printer cartridges (urgent, over-the-counter)', direction: 'out', amount: 610, who: 'IT — Faisal Al Nuaimi' },
  { id: 6, date: '2026-06-24', description: 'Typing centre — visa application fees', direction: 'out', amount: 740, who: 'Admin — Mariam Saleh' },
  { id: 7, date: '2026-07-01', description: 'Float top-up from bank', direction: 'in', amount: 5000, who: 'Admin — Mariam Saleh' },
  { id: 8, date: '2026-07-03', description: 'Site water & ice — Ruwais pump station (heat plan)', direction: 'out', amount: 260, who: 'Yousef Al Kaabi' },
]

// openingBalance so the running balance in the view reconciles with the AED 18,500
// petty cash line in CASH_ACCOUNTS (Phase 2 keeps these in one ledger).
export const PETTY_CASH_OPENING = { asOf: '2026-06-01', amount: 5805 }

export const PETTY_CASH_RECONCILIATIONS = [
  {
    id: 1, month: '2026-06', date: '2026-06-30', countedBy: 'Admin — Mariam Saleh', reviewedBy: 'Finance — Omar Haddad',
    counted: 13740, book: 13760, note: 'AED 20 short — unvouchered parking, written off.',
  },
]

// --- Supplier / payables ledger -----------------------------------------------------
// Subconsultant & supplier invoices IN. Workflow: pending_approval → approved →
// scheduled (in a payment run) → paid.
export const SUPPLIER_INVOICE_STATUSES = [
  { key: 'pending_approval', label: 'Pending approval', chip: 'bg-amber-100 text-amber-700' },
  { key: 'approved', label: 'Approved', chip: 'bg-blue-100 text-blue-700' },
  { key: 'scheduled', label: 'In payment run', chip: 'bg-purple-100 text-purple-700' },
  { key: 'paid', label: 'Paid', chip: 'bg-green-100 text-green-700' },
]

export const supplierInvoiceStatusMeta = (key) =>
  SUPPLIER_INVOICE_STATUSES.find((s) => s.key === key) || SUPPLIER_INVOICE_STATUSES[0]

export const SUPPLIER_INVOICES = [
  { id: 1, supplier: 'Apex Geotechnical Services', ref: 'AGS-INV-2214', projectId: 1, description: 'Geotechnical investigation — final invoice', amount: 145000, vatAmount: 7250, dueDate: '2026-07-10', status: 'approved' },
  { id: 2, supplier: 'Lumina Lighting Studio', ref: 'LLS-0087', projectId: 5, description: 'Lighting design — stage 2 of 3', amount: 46000, vatAmount: 2300, dueDate: '2026-07-20', status: 'pending_approval' },
  { id: 3, supplier: 'Blueprint Repro LLC', ref: 'BR-26-1190', projectId: 3, description: 'Tender document printing — 12 sets', amount: 4200, vatAmount: 210, dueDate: '2026-07-05', status: 'approved' },
  { id: 4, supplier: 'GeoSurvey Partners', ref: 'GSP-3321', projectId: 3, description: 'Topographic survey — Package 3 corridor', amount: 68000, vatAmount: 3400, dueDate: '2026-06-28', status: 'scheduled' },
  { id: 5, supplier: 'Apex Geotechnical Services', ref: 'AGS-INV-2101', projectId: 5, description: 'Plate load tests — villa clusters', amount: 38500, vatAmount: 1925, dueDate: '2026-06-05', status: 'paid', paidDate: '2026-06-04' },
  { id: 6, supplier: 'Falcon Fire & Safety Consultants', ref: 'FFS-0455', projectId: 2, description: 'Fire & life-safety peer review', amount: 24000, vatAmount: 1200, dueDate: '2026-07-25', status: 'pending_approval' },
]

// --- Retention held on supervision fees ---------------------------------------------
// Clients commonly hold 5% retention on supervision fees, released at Taking-Over
// Certificate (usually half) and end of Defects Liability Period. Demo-grade table —
// automated release triggers off project milestones are Phase 2.
export const RETENTIONS = [
  { id: 1, projectId: 1, retentionPct: 5, feesInvoicedToDate: 315000, held: 15750, releaseTerms: '50% at TOC, 50% at end of DLP (12 months)', expectedTOC: '2027-03-31', status: 'held' },
  { id: 2, projectId: 5, retentionPct: 5, feesInvoicedToDate: 765000, held: 38250, releaseTerms: '100% at end of DLP (24 months, villas)', expectedTOC: '2026-12-15', status: 'held' },
  { id: 3, projectId: 8, retentionPct: 5, feesInvoicedToDate: 540000, held: 27000, releaseTerms: '50% at TOC, 50% at end of DLP (12 months)', expectedTOC: '2026-10-30', status: 'held' },
]

// --- Month-end close checklist -------------------------------------------------------
// The routine the accountant runs each month. Per-item done toggle with who/when stamp.
export const CLOSE_ITEMS = [
  { key: 'bank_rec', label: 'Bank reconciliation done (ADCB operating + call)' },
  { key: 'receipts', label: 'All receipts allocated to invoices' },
  { key: 'expenses', label: 'Expenses approved / rejected — none left pending' },
  { key: 'vat', label: 'VAT working paper reviewed' },
  { key: 'payroll', label: 'Payroll (WPS) posted from HR' },
  { key: 'wip', label: 'WIP / accruals reviewed with management' },
  { key: 'petty', label: 'Petty cash counted & reconciled' },
]

export const MONTH_END_CHECKLISTS = [
  {
    id: 1, month: '2026-06',
    items: {
      bank_rec: { done: true, who: 'Omar Haddad', when: '2026-07-02' },
      receipts: { done: true, who: 'Omar Haddad', when: '2026-07-02' },
      expenses: { done: true, who: 'Sana Diab', when: '2026-07-03' },
      vat: { done: true, who: 'Omar Haddad', when: '2026-07-03' },
      payroll: { done: true, who: 'HR — Amal Rashid', when: '2026-06-28' },
      wip: { done: false, who: null, when: null },
      petty: { done: true, who: 'Mariam Saleh', when: '2026-06-30' },
    },
  },
  {
    id: 2, month: '2026-07',
    items: {
      bank_rec: { done: false, who: null, when: null },
      receipts: { done: false, who: null, when: null },
      expenses: { done: false, who: null, when: null },
      vat: { done: false, who: null, when: null },
      payroll: { done: false, who: null, when: null },
      wip: { done: false, who: null, when: null },
      petty: { done: false, who: null, when: null },
    },
  },
]

// --- Expenses ------------------------------------------------------------------
export const EXPENSE_CATEGORIES = [
  'Software & Licenses', 'Subconsultant Fees', 'Office Rent', 'Utilities',
  'Travel & Site Visits', 'Professional Fees', 'Marketing', 'Equipment',
  'Printing & Reproduction', 'Government Fees', 'General & Admin',
]

export const EXPENSE_STATUSES = [
  { key: 'pending', label: 'Pending approval', chip: 'bg-amber-100 text-amber-700' },
  { key: 'approved', label: 'Approved', chip: 'bg-blue-100 text-blue-700' },
  { key: 'reimbursed', label: 'Paid / reimbursed', chip: 'bg-green-100 text-green-700' },
  { key: 'rejected', label: 'Rejected', chip: 'bg-red-100 text-red-700' },
]

export const expenseStatusMeta = (key) =>
  EXPENSE_STATUSES.find((s) => s.key === key) || EXPENSE_STATUSES[0]

// vatAmount = input VAT actually shown on the supplier's tax invoice (editable in the
// Add-expense form; defaults to 5% of net). vatNonRecoverable flags VAT the FTA blocks
// (e.g. entertainment) — it's excluded from the VAT return's recoverable input VAT.
// Rows WITHOUT a vatAmount are legacy seeds: the VAT working paper falls back to a
// 5% estimate for those and says so on-screen.
export const EXPENSES = [
  { id: 1, date: '2026-06-01', category: 'Software & Licenses', vendor: 'Autodesk', description: 'AEC Collection — annual renewal (12 seats)', amount: 88000, vatAmount: 4400, status: 'approved', submittedBy: 'IT — Faisal Al Nuaimi', projectId: null },
  { id: 2, date: '2026-06-20', category: 'Travel & Site Visits', vendor: 'Self — mileage & per diem', description: 'Ruwais site visit — Pump Station supervision', amount: 3200, status: 'reimbursed', submittedBy: 'Yousef Al Kaabi', projectId: 8 },
  { id: 3, date: '2026-07-01', category: 'Office Rent', vendor: 'Abu Dhabi Commercial Properties', description: 'HQ office rent — July 2026', amount: 45000, vatAmount: 2250, status: 'approved', submittedBy: 'Admin — Mariam Saleh', projectId: null },
  { id: 4, date: '2026-06-28', category: 'Utilities', vendor: 'DEWA / ADDC', description: 'Office electricity & cooling — June', amount: 6800, vatAmount: 340, status: 'pending', submittedBy: 'Admin — Mariam Saleh', projectId: null },
  { id: 5, date: '2026-05-25', category: 'Subconsultant Fees', vendor: 'Apex Geotechnical Services', description: 'Geotechnical investigation — Harbour Point', amount: 145000, status: 'approved', submittedBy: 'DPM — Layla Hassan', projectId: 1 },
  { id: 6, date: '2026-06-08', category: 'Subconsultant Fees', vendor: 'Lumina Lighting Studio', description: 'External & landscape lighting design — Saadiyat C4', amount: 92000, vatAmount: 4600, status: 'approved', submittedBy: 'DPM — Layla Hassan', projectId: 5 },
  { id: 7, date: '2026-07-02', category: 'Marketing', vendor: 'LensCraft Studios', description: 'Project photography — Substation works', amount: 7500, vatAmount: 375, status: 'pending', submittedBy: 'Marketing', projectId: 6 },
  { id: 8, date: '2026-06-18', category: 'Printing & Reproduction', vendor: 'Blueprint Repro LLC', description: 'Tender document printing — Al Dhafra Roads', amount: 4200, status: 'reimbursed', submittedBy: 'DPM — Khalid Mansour', projectId: 3 },
  { id: 9, date: '2026-06-05', category: 'Professional Fees', vendor: 'Oman Insurance', description: 'Professional indemnity insurance — annual', amount: 62000, status: 'approved', submittedBy: 'Finance', projectId: null },
  { id: 10, date: '2026-06-12', category: 'Equipment', vendor: 'Emirates Computers', description: 'Workstation laptop — new hire (Priya Nair)', amount: 9800, vatAmount: 490, status: 'approved', submittedBy: 'IT — Faisal Al Nuaimi', projectId: null },
  { id: 11, date: '2026-06-30', category: 'General & Admin', vendor: 'Al Safadi Restaurant', description: 'Team lunch — project milestone', amount: 1800, vatAmount: 90, vatNonRecoverable: true, status: 'rejected', submittedBy: 'Admin — Mariam Saleh', projectId: null, note: 'Over the per-head hospitality policy limit.' },
  { id: 12, date: '2026-06-10', category: 'Government Fees', vendor: 'Department of Economic Development', description: 'Trade licence renewal', amount: 15400, vatAmount: 0, status: 'approved', submittedBy: 'Admin — Mariam Saleh', projectId: null },
]

// --- Cash position (illustrative) ---------------------------------------------
// Bank + petty cash snapshot. Mock — a real feed would come from the bank/accounting
// system in Phase 2.
export const CASH_ACCOUNTS = [
  { id: 1, name: 'Operating account — ADCB', type: 'Current', balance: 2840000 },
  { id: 2, name: 'Call / reserve account — ADCB', type: 'Call deposit', balance: 1500000 },
  { id: 3, name: 'Petty cash', type: 'Cash', balance: 18500 },
]

// --- Monthly P&L (illustrative) -----------------------------------------------
// H1 2026, AED. Revenue = fees earned; directCosts = subconsultants + reimbursables;
// payroll = staff cost (the real figure would come from the HR/WPS payroll run);
// overhead = rent, software, admin, G&A. net is derived in the view. Clearly mock —
// Phase 2 would generate this from the ledger.
export const MONTHLY_PL = [
  { month: '2026-01', revenue: 620000, directCosts: 95000, payroll: 410000, overhead: 120000 },
  { month: '2026-02', revenue: 910000, directCosts: 140000, payroll: 410000, overhead: 118000 },
  { month: '2026-03', revenue: 1180000, directCosts: 205000, payroll: 425000, overhead: 132000 },
  { month: '2026-04', revenue: 780000, directCosts: 110000, payroll: 425000, overhead: 121000 },
  { month: '2026-05', revenue: 690000, directCosts: 160000, payroll: 438000, overhead: 128000 },
  { month: '2026-06', revenue: 1040000, directCosts: 175000, payroll: 452000, overhead: 139000 },
]
