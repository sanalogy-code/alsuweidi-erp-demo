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

export const EXPENSES = [
  { id: 1, date: '2026-06-01', category: 'Software & Licenses', vendor: 'Autodesk', description: 'AEC Collection — annual renewal (12 seats)', amount: 88000, status: 'approved', submittedBy: 'IT — Faisal Al Nuaimi', projectId: null },
  { id: 2, date: '2026-06-20', category: 'Travel & Site Visits', vendor: 'Self — mileage & per diem', description: 'Ruwais site visit — Pump Station supervision', amount: 3200, status: 'reimbursed', submittedBy: 'Yousef Al Kaabi', projectId: 8 },
  { id: 3, date: '2026-07-01', category: 'Office Rent', vendor: 'Abu Dhabi Commercial Properties', description: 'HQ office rent — July 2026', amount: 45000, status: 'approved', submittedBy: 'Admin — Mariam Saleh', projectId: null },
  { id: 4, date: '2026-06-28', category: 'Utilities', vendor: 'DEWA / ADDC', description: 'Office electricity & cooling — June', amount: 6800, status: 'pending', submittedBy: 'Admin — Mariam Saleh', projectId: null },
  { id: 5, date: '2026-05-25', category: 'Subconsultant Fees', vendor: 'Apex Geotechnical Services', description: 'Geotechnical investigation — Harbour Point', amount: 145000, status: 'approved', submittedBy: 'DPM — Layla Hassan', projectId: 1 },
  { id: 6, date: '2026-06-08', category: 'Subconsultant Fees', vendor: 'Lumina Lighting Studio', description: 'External & landscape lighting design — Saadiyat C4', amount: 92000, status: 'approved', submittedBy: 'DPM — Layla Hassan', projectId: 5 },
  { id: 7, date: '2026-07-02', category: 'Marketing', vendor: 'LensCraft Studios', description: 'Project photography — Substation works', amount: 7500, status: 'pending', submittedBy: 'Marketing', projectId: 6 },
  { id: 8, date: '2026-06-18', category: 'Printing & Reproduction', vendor: 'Blueprint Repro LLC', description: 'Tender document printing — Al Dhafra Roads', amount: 4200, status: 'reimbursed', submittedBy: 'DPM — Khalid Mansour', projectId: 3 },
  { id: 9, date: '2026-06-05', category: 'Professional Fees', vendor: 'Oman Insurance', description: 'Professional indemnity insurance — annual', amount: 62000, status: 'approved', submittedBy: 'Finance', projectId: null },
  { id: 10, date: '2026-06-12', category: 'Equipment', vendor: 'Emirates Computers', description: 'Workstation laptop — new hire (Priya Nair)', amount: 9800, status: 'approved', submittedBy: 'IT — Faisal Al Nuaimi', projectId: null },
  { id: 11, date: '2026-06-30', category: 'General & Admin', vendor: 'Al Safadi Restaurant', description: 'Team lunch — project milestone', amount: 1800, status: 'rejected', submittedBy: 'Admin — Mariam Saleh', projectId: null, note: 'Over the per-head hospitality policy limit.' },
  { id: 12, date: '2026-06-10', category: 'Government Fees', vendor: 'Department of Economic Development', description: 'Trade licence renewal', amount: 15400, status: 'approved', submittedBy: 'Admin — Mariam Saleh', projectId: null },
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
