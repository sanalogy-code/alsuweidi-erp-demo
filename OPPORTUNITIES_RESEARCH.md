# Cross-Module Opportunities — "What else could we do?"

*Research date: 2026-07-06. The per-module docs (HR / FINANCE / CRM / IT / MARKETING / PM) cover gaps **inside** each module. This file captures the **platform-wide** capabilities that cut across every module — the things that turn a set of screens into a real ERP, plus higher-ambition ideas specific to a UAE engineering & supervision consultancy.*

---

## 1. The cross-cutting layer every module is waiting on

SPEC.md §5 already flags most of these as "Phase 2" — they recur in every module's gap list because they're shared infrastructure, not module features:

| Capability | Why it matters | Touches |
|---|---|---|
| **Notifications & approvals engine** | Every module has approval chains (leave, timesheets, expenses, invoices, PRO tasks, candidates) but **nothing notifies anyone**. One shared notification/inbox service unblocks all of them | All |
| **Real backend + database + auth** | Auth is cosmetic/client-side today; state is in-memory. A real relational DB (the data model is already shaped for it) + real login is the foundation everything else needs | All |
| **Email/comms capability** | Welcome emails, certificate delivery, invoices to clients, dunning, candidate replies — all designed but can't send | HR, Finance, CRM, Marketing |
| **Document storage** | Files are name-only across the app (docs, marketing assets, PRO uploads, finance attachments). One real storage/versioning layer serves all | All |
| **Global search** | Find any employee/project/company/invoice/asset from one bar | All |
| **Audit log (unified)** | Admin Center logs some activity; a real system-wide immutable audit trail is a compliance need | All |
| **Reporting/export layer** | Every module wants CSV/XLSX/PDF export and a light report builder | All |
| **Mobile / responsive PWA** | Site-based supervision staff, approvals-on-phone, timesheet entry in the field | All |

**Takeaway:** the single highest-leverage investment isn't any one feature — it's the **notifications + backend/auth + email + storage** substrate, because it simultaneously activates dormant functionality already built in six modules.

---

## 2. Cross-module wiring that's currently manual

These are integrations *between* modules that would remove double-entry and manual cross-checks:

- **CRM won-deal → Project → Invoice** (partially wired via `dealId`; make it a first-class handoff).
- **HR timesheets → Finance project costing** (labour is the main cost of a consultancy; today timesheets never cost into project P&L — see FINANCE_RESEARCH §3.5).
- **HR onboarding/offboarding → IT provisioning/deprovisioning** (SPEC flags this as manual; joiner-mover-leaver automation).
- **IT asset assignment ↔ HR employee record ↔ Finance fixed-asset register** (one asset, three views).
- **Project milestones → Finance billing schedule → revenue recognition/WIP.**
- **PRO/visa tasks (HR) → Finance government-fee expenses.**
- **Payroll/WPS (HR) → Finance GL posting.**

A shared event bus / single database makes all of these automatic instead of clerical.

---

## 3. Analytics & intelligence (company-wide)

- **Executive / management dashboard** spanning modules: pipeline → backlog → revenue → cash → utilization → headcount, in one board-ready view.
- **KPI cockpit per function** (already detailed for Finance/HR; extend to CRM win-rate, PM on-time/on-budget, IT SLA).
- **Predictive**: attrition/flight-risk (HR), late-payment risk (Finance AR), project-overrun risk (PM), win-probability (CRM).
- **Benchmarking**: revenue/head, utilization %, overhead ratio, project margin distribution.

## 4. AI opportunities (realistic, high-value)

- **Document intelligence**: parse uploaded passports/visas/EIDs, supplier invoices (AP auto-capture), CVs (recruitment) into structured fields.
- **Drafting**: certificate letters (exists as templates), proposal content (CRM/Marketing), dunning emails, job descriptions.
- **Assistant / natural-language query**: "which projects are over budget?", "who's off next week?", "show overdue invoices > 60 days".
- **Summarization**: project status, client-relationship history, exit-interview themes.
- **Anomaly detection**: expense outliers, duplicate invoices, unusual approvals.

## 5. UAE-specific platform themes

- **Compliance calendar** surfaced org-wide: VAT 201, Corporate Tax, WPS run dates, visa/EID/trade-licence renewals, e-invoicing milestones — pulling due-dates from HR (renewals) and Finance (tax) into one dashboard.
- **e-Invoicing (Peppol PINT-AE)** and **Corporate Tax** readiness (see FINANCE_RESEARCH §4) — architectural, must be planned early.
- **PDPL (UAE data-protection)** governance across the platform (see ADMIN_RESEARCH) — consent, retention, access controls on personal data.
- **Arabic / RTL bilingual UI** — many outputs already bilingual (certificates); a full Arabic UI is a market-credibility feature in the UAE.
- **MoHRE / GPSSA / Nafis** connectors for labour, pension, and Emiratisation reporting.

## 6. Modules/areas not yet in the ERP at all (candidate new modules)

- **Procurement / vendor management** (subconsultants, suppliers) — feeds Finance AP and PM commitments; currently absent as a home.
- **Contracts / legal repository** — client contracts, subconsultant agreements, NDAs, obligations & renewal dates, e-signature.
- **Fleet / facilities** — company vehicles, office space, site accommodation (relevant for site-based supervision).
- **Health, Safety & Environment (HSE)** — incident reporting, site safety, inductions — often expected at an engineering/supervision firm.
- **Quality / document control** — ISO 9001 document control, transmittals, drawing registers (core to AEC delivery).
- **Knowledge base / intranet** — policies, standards, lessons-learned, org news (partly overlaps Admin/HR).
- **Client & subconsultant portals** — external-facing views of projects, invoices, submissions.

---

## 7. Suggested sequencing (platform view)

1. **Substrate first** — backend + auth + database + notifications + email + storage. Unblocks everything.
2. **Wire the money spine** — HR timesheets → project cost → Finance GL/WIP/revenue; CRM→Project→Invoice. This is where the ROI story lives for a consultancy.
3. **Compliance layer** — VAT/CT/e-invoicing (Finance), PDPL (Admin), renewals/WPS/Emiratisation calendar (HR) surfaced centrally.
4. **Intelligence on top** — executive dashboard, KPIs, then AI assistants.
5. **New modules** as the business asks — Procurement, Contracts, HSE, Quality/Doc-control being the most AEC-relevant.

---

## Quick take

The per-module docs answer "what's missing in each room." This one answers "what's missing in the building": a **shared substrate** (notifications, backend, email, storage) that six modules are already waiting on, the **cross-module wiring** that turns display data into a connected system (especially timesheets→project cost→finance), a **compliance calendar** tuned to UAE deadlines, and — as the business matures — **new AEC-native modules** (procurement, contracts, HSE, quality/document control). Build the substrate and the money-spine first; everything else compounds off them.
