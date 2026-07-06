# Financials & Accounting — Deep Research & Gap Analysis

*Research date: 2026-07-06. This is the flagship document. Purpose: survey the **complete** universe of financial/accounting functionality found in serious ERPs, treasury systems, FP&A tools, project-accounting suites and UAE tax-compliance platforms — then map it against what the ALSUWEIDI ERP Finance module ships today, so we can see, from a hardcore-CFO/controller's point of view, everything a finance function would actually want to see and act on.*

> **Framing.** The current module is an honest, well-labelled **demo-grade first pass**: Invoices (AR-lite), Expenses (AP-lite), a static P&L summary, and a cash-accounts overview — all in-memory, no ledger, no double entry. That's fine as a proof-of-concept. This document is deliberately the *maximal* wishlist: what a finance-obsessed controller/CFO at an AED-denominated engineering & supervision consultancy in the UAE would want the system to eventually be. Read it as "the full map", not "build all of this."

---

## 1. What exists today (baseline)

| Area | Current state |
|---|---|
| Client invoices (AR) | ✅ Billed against project **consultancy fee** (not construction cost); status `draft → sent → partially_paid → paid` + `overdue`; 5% VAT; send / mark-paid in memory |
| Expenses (AP-lite) | 🟡 Category + status (`pending → approved/rejected/reimbursed`), optional `projectId` job-cost link, approve/reject |
| P&L summary | 🟡 Static `MONTHLY_PL` H1 2026 (revenue / direct costs / payroll / overhead / net) + income statement + net-profit trend + margin |
| Cash | 🟡 Mock `CASH_ACCOUNTS` balances on Overview |
| Access | ✅ Gated to management + admin; other roles see "Restricted module" |
| Ledger / double-entry | ❌ None — no chart of accounts, no journals, no trial balance |

Everything below the double line is **not** in the module. That's the gap map.

---

## 2. How serious finance systems are organized

A mature ERP finance stack (Oracle, SAP, Sage X3, NetSuite, IFS, Epicor, Dynamics 365 Finance; and lean-team tools like Xero/QuickBooks + Wafeq/Zoho Books for UAE) layers into:

1. **The Ledger (system of record)** — Chart of Accounts, General Ledger, journals, sub-ledgers (AR, AP, FA, bank), trial balance, period close.
2. **Transaction cycles** — Order-to-Cash (AR), Procure-to-Pay (AP), Record-to-Report (close), Asset lifecycle, Payroll→GL.
3. **Treasury & cash** — bank feeds, reconciliation, cash positioning, forecasting, multi-currency, payments.
4. **Project / cost accounting** — job costing, WIP, revenue recognition, budgets vs actuals, profitability.
5. **Statutory & tax compliance** — VAT returns, Corporate Tax, e-invoicing, statutory financials, audit trail.
6. **FP&A & management accounting** — budgeting, forecasting, scenario/what-if, variance, KPIs, dashboards.
7. **Controls & governance** — segregation of duties, approval matrices, audit trails, internal controls.
8. **Consolidation** — multi-entity, intercompany, eliminations, multi-GAAP.

The current module touches slivers of #2 (AR/AP) and #6 (a static P&L). Layers #1, #3, #4-deep, #5, #7, #8 are essentially open.

---

## 3. Full feature map — ✅ shipped · 🟡 partial/mock · ❌ missing

### 3.1 The Ledger — system of record
| Feature | Status | What a controller wants |
|---|---|---|
| Chart of Accounts (multi-dimensional: account × cost centre × project × department) | ❌ | The backbone. Segment reporting by project/department is impossible without it |
| General Ledger + double-entry journals | ❌ | Every transaction posts a balanced entry; single source of truth |
| Sub-ledgers (AR / AP / Fixed Assets / Bank) reconciling to GL control accounts | 🟡 | AR/AP exist as flat lists but don't roll up to a control account |
| Manual & recurring journal entries, accruals, prepayments | ❌ | Month-end accruals, deferrals, depreciation postings |
| Trial balance | ❌ | The check that debits = credits before statements |
| Period / month-end close (open/close periods, lock posted periods) | ❌ | Controlled close, no back-dating into closed months |
| Year-end close & retained-earnings roll-forward | ❌ | |
| Multi-currency (transaction, functional AED, reporting; FX revaluation & realized/unrealized gain/loss) | ❌ | Consultancies invoice some clients in USD/EUR; FX gain/loss is real P&L |
| Audit trail on every posting (who/when/before-after, immutable) | ❌ | Non-negotiable for audit & FTA |

### 3.2 Accounts Receivable (Order-to-Cash) — *strongest area today*
| Feature | Status | Notes |
|---|---|---|
| Client invoices linked to projects/deals | ✅ | Good foundation |
| VAT on invoice (5%) | ✅ | |
| Invoice status lifecycle + overdue | ✅ | |
| Partial payments / receipts | 🟡 | `amountPaid` tracked; no discrete receipt records or allocation |
| **AR aging report** (30/60/90/120) | ❌ | The #1 report a finance team lives in |
| **Statements of account** per client | ❌ | Send a client their full open-items list |
| **Dunning / collections workflow** (reminder ladder, promise-to-pay) | ❌ | Overdue is flagged but nothing chases it |
| Credit notes / debit notes | ❌ | Corrections, cancellations |
| Retention receivable (% held by client, released on milestones) | ❌ | Standard in supervision contracts — big AR item |
| Progress / milestone billing schedules & applications for payment | 🟡 | Invoices exist but no billing plan per contract |
| Advance payments / down-payment invoices & guarantees | ❌ | Common on award |
| Customer credit limits & credit hold | ❌ | |
| DSO (days sales outstanding) metric | ❌ | Core working-capital KPI |
| Cash application / receipt matching | ❌ | |

### 3.3 Accounts Payable (Procure-to-Pay)
| Feature | Status | Notes |
|---|---|---|
| Expense capture + category + approve/reject | 🟡 | Present but expense-only |
| **Vendor / supplier master** (with TRN, bank details, payment terms) | ❌ | No vendor entity at all |
| **Purchase orders / commitments** | ❌ | Subconsultant POs; commitment accounting |
| **Goods/service receipt** | ❌ | |
| **Three-way match** (PO ↔ receipt ↔ invoice) | ❌ | The AP control gold standard |
| Supplier invoices (distinct from employee expenses) | ❌ | Subconsultant bills, rent, software vendors |
| **AP aging** & payment scheduling / payment runs | ❌ | Who do we owe, when |
| Batch payments / bank payment file | ❌ | |
| Recoverable input VAT tracking on purchases | 🟡 | VAT charged on sales but input VAT not captured |
| Withholding / reverse-charge handling | ❌ | Reverse-charge on imported services (UAE) |
| Retention payable to subconsultants | ❌ | Mirror of retention receivable |
| Employee expense reimbursement → payroll/bank | 🟡 | Status `reimbursed` exists but no payout linkage |
| Corporate card / petty cash reconciliation | ❌ | |
| DPO (days payable outstanding) metric | ❌ | |

### 3.4 Treasury & Cash Management
| Feature | Status | Notes |
|---|---|---|
| Cash accounts / balances view | 🟡 | Static mock |
| **Bank feed / statement import** | ❌ | Live balances |
| **Bank reconciliation** (auto-match, unreconciled items) | ❌ | Foundational internal control |
| **Cash-flow forecast** (13-week / rolling) | ❌ | The single most-requested CFO tool for a project business |
| Cash position across banks (real-time liquidity) | ❌ | |
| Payments / transfers initiation & approval | ❌ | |
| Bank guarantees / LC tracking (tender & performance bonds) | ❌ | Critical for a firm that tenders — bonds tie up facilities |
| Facility / loan / overdraft tracking, interest | ❌ | |
| FX exposure & hedging view | ❌ | |
| Cash conversion cycle (DSO − DPO + DIO) | ❌ | |

### 3.5 Project / Job Accounting — *the heart of an engineering consultancy*
| Feature | Status | Notes |
|---|---|---|
| Expense → project job-cost tag | 🟡 | `projectId` on expenses; no cost rollup view |
| **Project P&L / profitability** (fee vs cost vs margin per project) | ❌ | "Which projects actually make money?" — the question |
| **Time-cost from timesheets → project cost** | ❌ | HR timesheets exist but don't cost into finance (labour is the main cost of a consultancy) |
| Chargeability / utilization → revenue (billable vs non-billable hours) | ❌ | Utilization is the KPI of a professional-services firm |
| **WIP (work-in-progress) — earned-but-unbilled** | ❌ | Contract asset; huge for milestone-billed projects |
| **Revenue recognition (IFRS 15, % completion / cost-to-cost / milestone)** | ❌ | Recognize fee as work is delivered, not when invoiced |
| Over-/under-billing position per project | ❌ | Billings vs revenue earned |
| **Project budget vs actual vs committed (EVM-style)** | ❌ | Cost control; commitments from POs |
| Cost Value Reconciliation (CVR) per project | ❌ | Income, cost, commitments, variations, retention reconciled to budget |
| Variation / change-order financial tracking | 🟡 | Projects module tracks scope; not the money impact |
| Estimate-to-complete / estimate-at-completion (ETC/EAC) | ❌ | Forecasting project outcome |
| Backlog / unbilled contract value / order book | ❌ | Future revenue visibility — investors & banks ask for this |
| Multi-currency projects | ❌ | |

### 3.6 Fixed Assets
| Feature | Status | Notes |
|---|---|---|
| Fixed-asset register | ❌ | IT module tracks *IT* assets operationally but not as depreciable financial assets |
| Depreciation (straight-line/reducing; book vs tax) | ❌ | |
| Acquisition / disposal / revaluation / impairment | ❌ | |
| Asset → GL posting & FA sub-ledger | ❌ | |
| CWIP (capital work in progress) | ❌ | |

### 3.7 UAE Tax & Statutory Compliance — *table stakes here, currently the biggest exposure*
| Feature | Status | Notes |
|---|---|---|
| 5% VAT on invoices | ✅ | Output VAT only |
| **Input VAT capture** on purchases | ❌ | Needed for net VAT |
| **VAT return (FTA VAT 201) generation** — output − input, boxes, filing pack | ❌ | Quarterly filing; currently no support |
| VAT-compliant tax-invoice format (TRN, sequential no., AED, correct fields) | 🟡 | Invoice exists; not validated against FTA tax-invoice rules |
| **Corporate Tax (9%)** — taxable-income computation, provisioning, small-business relief, filing | ❌ | UAE CT now in force; a real gap for a profitable firm |
| **E-invoicing (Peppol PINT-AE, 5-corner, ASP, structured XML)** | ❌ | Pilot 2026; mandatory large biz Jan 2027, all VAT-registered by Jul 2027. **Must be designed for, not bolted on** |
| Reverse-charge / import-of-services VAT | ❌ | |
| Economic substance / UBO / AML registers | ❌ | Compliance calendar items |
| Statutory financial statements (IFRS balance sheet, P&L, cash flow, equity) | 🟡 | Only a management P&L today; no balance sheet or cash-flow statement |
| Audit pack / external-auditor export | ❌ | |
| WPS payroll → GL / P&L integration | 🟡 | WPS lives in HR (per SPEC); payroll cost is static in P&L, not posted from actual runs |

### 3.8 FP&A / Management Accounting — *where a CFO spends their day*
| Feature | Status | Notes |
|---|---|---|
| Income statement / P&L | 🟡 | Static; not ledger-derived |
| **Balance sheet** | ❌ | Half the picture is missing |
| **Cash-flow statement** (direct/indirect) | ❌ | |
| **Budgets** (annual, per department/project) | ❌ | |
| **Budget vs actual variance** analysis | ❌ | The core management report |
| **Rolling forecast** | ❌ | |
| **Scenario / what-if (base / best / downside)** | ❌ | Driver-based modelling |
| Cost-centre / department reporting | ❌ | Needs the CoA dimensions |
| **CFO KPI dashboard** — revenue, net margin, EBITDA, cash runway, DSO/DPO, backlog, utilization, revenue/head, overhead ratio, win-rate→revenue | 🟡 | A few Overview stats; not a real KPI cockpit |
| Profitability by client / project type / service line | 🟡 | Revenue-by-project-type exists; no cost side |
| Drill-down from summary → transaction | ❌ | |
| Trend & ratio analysis (liquidity, gearing, profitability ratios) | ❌ | |
| Board / investor reporting pack | ❌ | |

### 3.9 Controls, Governance & Consolidation
| Feature | Status | Notes |
|---|---|---|
| Approval matrices (thresholds, delegation of authority) | 🟡 | Expense approve/reject only; no value thresholds |
| **Segregation of duties** (maker/checker on payments & journals) | ❌ | Fraud control |
| Immutable audit trail across finance | ❌ | |
| Document attachments on transactions (invoice PDF, contract, receipt) | 🟡 | Doc handling exists elsewhere; not on finance records |
| Multi-entity / multi-company | ❌ | If ALSUWEIDI has related entities/branches |
| Intercompany transactions & eliminations | ❌ | |
| Consolidated group reporting | ❌ | |
| Multi-GAAP (IFRS + tax books) | ❌ | |

---

## 4. UAE-specific deep dive (do-not-skip)

For an AED-denominated consultancy the following are not "nice to have" — they are where a UAE finance manager and the external auditor will look first:

- **E-invoicing readiness.** The FTA mandate uses a **Peppol-based 5-corner PINT-AE structured-XML** model via an **Accredited Service Provider**. Large business (≥AED 50m) ASP appointment by **31 Jul 2026**, mandatory **1 Jan 2027**; all VAT-registered by **1 Jul 2027**. Non-compliance penalties: AED 5,000/month, AED 100/invoice, AED 1,000/day for unreported system failures. *Design implication:* invoices need structured data + sequential integrity now, not a PDF later.
- **VAT 201 return.** Quarterly; output VAT (have it) minus **input VAT (don't capture it)**. Historic 2018-2020 VAT credits expire 31 Dec 2026. Self-invoicing for reverse charge dropped from 1 Jan 2026.
- **Corporate Tax (9%)** on taxable profit above AED 375k, with small-business relief and free-zone nuances. New penalty regime from **14 Apr 2026** (late payment 14%/yr non-compounding; FTA-discovered errors 15%). A profitable firm needs CT provisioning and a filing computation, none of which exists.
- **WPS** salary payment (already in HR) should **post to the GL** as payroll cost and feed the cash forecast.
- **GPSSA/ADPF** employer pension contributions for UAE nationals are a real payroll-driven cost line that should hit the P&L.
- **Retention & bank guarantees** — supervision contracts hold retention; tenders require bid/performance bonds. Both tie up cash/facilities and belong in AR/treasury.

---

## 5. Prioritized roadmap — what a finance enthusiast would build first

**Tier 0 — the spine (nothing sophisticated is trustworthy without it):**
1. **Chart of Accounts + General Ledger + double-entry**, with AR/AP/bank as sub-ledgers. Everything else becomes real once postings exist.
2. **Audit trail + period close** on every posting.

**Tier 1 — highest finance value, high UAE relevance:**
3. **AR aging + statements + dunning** and **retention receivable** (turns the strong AR base into a working-capital tool).
4. **Real AP**: vendor master, supplier invoices, PO/commitments, input-VAT capture, AP aging, payment runs.
5. **VAT 201 return pack** + **e-invoicing architecture** (structured invoice data now).
6. **Project profitability + WIP + revenue recognition (IFRS 15)** driven off HR timesheets — the defining report for this business ("which projects make money, and how much fee is earned-but-unbilled").
7. **Bank reconciliation + 13-week cash-flow forecast.**

**Tier 2 — management cockpit:**
8. **Balance sheet + cash-flow statement** (possible once the GL exists).
9. **Budgets + budget-vs-actual variance + rolling forecast + scenarios.**
10. **CFO KPI dashboard** (margin, EBITDA, DSO/DPO, cash runway, backlog, utilization, revenue/head) with drill-down.
11. **Corporate Tax provisioning & computation.**

**Tier 3 — maturity / scale:**
12. Fixed-asset register & depreciation.
13. Multi-currency + FX revaluation.
14. Segregation of duties / approval matrices / delegation of authority.
15. Multi-entity consolidation & intercompany.
16. Bank-guarantee/bond & facility tracking; treasury.

---

## 6. Quick take

Today's module is a **billing + expense + static-P&L demo** — a legitimate conversation-starter, exactly as it's labelled. To satisfy a serious finance function it needs, in order: a **real ledger** (so numbers reconcile), **AR/AP working-capital tooling** (aging, retention, vendor/PO, payment runs), **UAE tax compliance** (VAT 201, e-invoicing, Corporate Tax), and the thing that makes this *an engineering-consultancy* finance system rather than a generic one — **project profitability + WIP + revenue recognition fed by timesheets**, plus a **cash-flow forecast** and a **CFO KPI cockpit** on top. The single highest-leverage build is the **GL spine + project profitability/WIP**, because it converts every other module (HR timesheets, project fees, expenses) from display data into real, reconciled financial intelligence — and it's the story a CFO, an auditor, and a bank all want to hear.

---

## Sources
- [Best ERP for Finance & Accounting (2026) — ERP Research](https://www.erpresearch.com/erp-modules/financial-management)
- [What Is an ERP finance module? — Oracle](https://www.oracle.com/erp/erp-finance-module/)
- [ERP Finance Module Guide — Priority](https://www.priority-software.com/resources/erp-finance-module/)
- [UAE E-Invoicing Guide 2026 (FTA mandate) — MyTaxman](https://mytaxman.ae/uae-e-invoicing-guide-2026/)
- [UAE Compliance Calendar 2026 (CT, VAT, e-invoicing, UBO/AML) — Kayrouz & Associates](https://www.kayrouzandassociates.com/insights/uae-business-compliance-2026-tax-ubo-aml-and-e-invoicing-deadlines)
- [VAT Invoice Requirements in UAE — Wafeq](https://www.wafeq.com/en-ae/tax-and-reporting/vat-invoice-requirements-in-uae)
- [FTA Risk-Based Audits 2026 — Alvarez & Marsal](https://www.alvarezandmarsal.com/thought-leadership/middle-east-tax-alert-uae-from-vat-to-corporate-tax-how-fta-s-risk-based-audits-will-shape-compliance-in-2026)
- [Percentage of Completion Method — NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/percentage-of-completion-method.shtml)
- [Work in Progress (WIP) — NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/work-in-progress.shtml)
- [Cost Value Reconciliation (CVR) in Construction — Causeway](https://www.causeway.com/blog/cost-value-reconciliation)
- [The Top 40 KPIs for Your CFO Dashboard — NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/cfo-kpis.shtml)
- [Best CFO KPIs & Dashboards — insightsoftware](https://insightsoftware.com/blog/best-cfo-kpis-and-dashboards/)
- [3-Way Matching in Accounts Payable — Precoro](https://precoro.com/blog/why-implementing-3-way-matching-is-important/)
- [Procure-to-Pay software 2026 — Zone & Co](https://www.zoneandco.com/articles/procure-to-pay-software-solutions)
- [Internal Controls for Treasury (checklist) — CPA Australia](https://www.cpaaustralia.com.au/-/media/project/cpa/corporate/documents/tools-and-resources/business-management/internal-controls-for-treasury.pdf)
- [Internal Control Bank Reconciliation — SolveXia](https://www.solvexia.com/blog/internal-control-bank-reconciliation)
