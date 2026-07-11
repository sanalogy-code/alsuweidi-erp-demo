# Build Stats

The "how long did this actually take" log — numbers pulled from git history, for sharing with management. Refreshed on each docs sync.

**As of:** 11 July 2026

## The headline

| | |
|---|---|
| **First commit** | 1 July 2026, 07:41 |
| **Latest (11 Jul: Batch 20 — the whole non-Phase-2 backlog cleared in one pass — plus the home page redesign)** | 11 July 2026 |
| **Elapsed time** | ~9 working days |
| **Commits** | 165 |
| **Deploys to the live site** | every push auto-deploys — ~158 |
| **App code** | ~30,400 lines across 140 components + 12 pages |
| **Infrastructure cost** | AED 0/month (Cloudflare Pages free tier, no servers, no licenses) |

## What got built in those 4 days

- **CRM module** — pipeline kanban with drag & drop, companies, contacts with two-tier taxonomy, tasks, interaction logging, filtered Excel/CSV export, date-filtered reports with download
- **HR module** (expanded day 3) — employee directory with full profiles (visa/passport/Emirates ID, dependents, compensation), org chart, leave with overlap calendar and balances, certificate requests with auto-generated English/Arabic letters, complaints (incl. anonymous), referrals & internal jobs, payroll with WPS workflow and payslips, attendance dashboard, public holidays feeding the home dashboard, renewals radar (visa/passport/contract/insurance expiries), onboarding checklist, employee self-service; **PLUS 7 new features shipped day 3**: 
  - new-employee self-service wizard (4 steps: personal, qualifications, documents, bank/family) + HR review modal with auto-fill policy defaults (designation → dept/seniority/work-permit title; employment type → probation/notice/severance policy)
  - AED 500 referral gift auto-awarded when referred candidate hired, queued on payroll run
  - guaranteed post-probation salary increment (set at hire, applied after probation ends, surfaced on My HR 60-day warning card)
  - offboarding workflow with 8-item leaver checklist, exit interview notes, in-progress/completed states
  - PRO company role (government-services task queue isolation: visa/work-permit/EID tasks, no employee data access)
  - typed documents with required-document enforcement (new-joiner wizard, project LOA, custom upload types)
  - staff planning view (hires per project with needed-by dates, 45-day urgency flags, status tracking)
- **Projects module** — the design & supervision portfolio, restructured from the old ERP's 40-column export into a dashboard + filterable list + full project record with stage pipeline, discipline scope, approved-vs-actual progress, role-gated financials, typed documents (LOA required for project creation); day-3 Batch 2 added direct project creation, record editing, stage advancement, and supervision % updates
- **IT & Assets module** (day 3, Batch 2) — employee hardware/software requests with an approve→procure→fulfil queue, tagged asset registry with assignment and book values, software license radar with 60-day renewal flags
- **HR Batch 2 additions** (day 3) — direct "Add employee" entry for HR (shared form with the new-joiner review), and a self-service carve-out so every employee sees their own visa/passport/dependents and documents
- **Marketing module** (day 3, Batch 3) — cross-module task inbox (project descriptions, photo approvals, new-joiner headshots and welcome emails), content calendar with an approval workflow, portfolio-readiness view, proposal builder that auto-excludes confidential projects, CV search shared with HR, analytics with live win rate from CRM; plus a hard completion gate — projects can't close without Marketing's description + approved photography
- **Timesheets** (day 3, Batches 4–6) — weekly project-coded timesheet grid with draft/submit, copy-last-week fast entry, overhead codes, line-manager approval ("Team timesheets"), per-employee work-week patterns (Mon–Fri / Sun–Thu / Mon–Sat), a last-working-day reminder banner and a full-screen ERP lockout when last week is unsubmitted
- **Batch 5 polish** (day 3) — required confidentiality decision on project creation (blocks stage advance until decided), scannable fixed-column queue layouts across all inboxes, marketing portfolio search
- **Batch 6** (day 3 evening, 19 backlog items from Sana's Marketing review + resolved management decisions) — CRM company relationship tags/website/size/services with filters, subconsultant project history, "Keep in Mind" notes + project lessons, downloadable category portfolio PDFs (Marketing-managed, CRM-consumed); Proposal Builder removed in favour of richer project records (years, images, special features) ; 4-step photo workflow; content calendar rework (Website/LinkedIn/Email, copy+media primary); branding overhaul; business card requests; per-document review statuses with re-upload; payroll offboarding cutoff + end-of-service settlement and mid-month-hire catch-up; two-step leave approval (manager → HR); new IT + Admin-staff roles and an add-license form
- **Financials & Accounting** (day 4, Batch 7) — first-pass gated module: cash/receivables overview, invoices linked to projects and won deals, expenses with approvals, H1 P&L summary; deliberately demo-grade to start the scoping conversation with Finance
- **Admin Center** (day 4, Batch 8) — user accounts with add/edit/disable/delete and mock invitation flow, a role × module permissions matrix mirroring the app's real gating (the written Phase 2 RBAC spec, now visualized), a filterable audit-trail mock, and usage dashboards; the last "Coming Soon" tile is gone
- **Project Management module** (day 6, Batches 9–12 — built from a 209-agent verified research pass, then restructured twice the same evening on Sana's live review) — phase-split workspaces (design/supervision/study as separate engagements), My Work daily-driver home + approvals inbox, waterfall Gantt vs sprint boards per project, real task management (assignment/priority/checklists/% complete), weekly progress updates, management dashboard with RAG health and hours-vs-budget, person × week resource capacity planner, deliverables register with revision-tracked review workflows, design gates, WIR/MIR/NCR/site registers, FIDIC claims/EOT with 28-day-notice countdowns, 4.21 report checklists, Abu Dhabi-first authority tracking, risk register, meeting actions, IPC register, and the TOC → DLP → Performance Certificate handover chain
- **Nine current-ERP screens absorbed in one evening** (day 6, Batches 13–15, from Sana's screenshots — information kept, design rethought, data linked): the DMR and CMR became composed *Project reviews* (discipline hours vs R0 with profitability P&L, construction facts + deployment + composed notes); the RFP form became a CRM *Proposals* register linked to companies and delivery projects; the CDM allocation plan became a Months rollup of the same weekly allocations; the attendance punch grid became a summarized *Period report*; the timesheet cost dashboard and Employee Efforts Review became *Timesheet insights* + a single workload index; the revenue report pages became one *Revenue reports* view; and the licensing tracker became an expiry radar that shipped already flagging the ADCD/CFPE 1-Sept-2026 hard gate
- **THE EVERYTHING LIST cleared in one night** (day 7 night, Batches 16d + 18a–g — the whole persona-sweep backlog built in parallel): attendance punch drill-down; search/status/date filters across ~24 registers; a cross-module **notifications center** (bell + unread badge in every navbar, composed live from approvals/deadlines/timesheets/queues); **global search** (Ctrl+K over people, live projects, companies, contacts, RFPs, screens); a **My Week** strip and a management **Company KPI panel** (utilization, win rate, receivables, project RAG) with board-pack print on the home page; delegation-of-authority matrix + visibility rules in Admin; the **accountant's working month** (receipts allocated across invoices, credit notes, per-expense VAT with a real VAT working paper, petty cash with reconciliation, supplier/payables ledger with payment runs, retention view, month-end close checklist, session audit trail); **HR talent suite** (appraisals with a default 3-step model, training catalogue → enrollment → auto-accomplishment, disciplinary register with letterhead print, exit interviews + analytics, headcount & attrition dashboard, optional grades/bands); **Marketing + BD** (campaigns, content approval records, pack usage log, events, award submissions; bid/no-bid gate with recorded rationale, tender checklists, bid cost tracking, competitor register, lost-RFP debriefs); **Office/ODC + IT** (meeting rooms with clash detection, supplies, courier log, vehicles + Salik, document-numbering reference; SLA timers, installed software with seat-overrun flags, preventive maintenance, access requests, system status board); and **PM/site field tools** (drawing transmittals, RFI register, per-gate coordination checklists, 4.21 photo-report builder, HSE safety log, mobile-first quick daily entry)
- **In-app Guide** (day 8, Batch 19) — a contextual `?` in every top bar opens one help hub: per-role orientation, ~50 "How do I…" task recipes that deep-link straight to the right screen, and a module map — role-gated, maintained from a single content file
- **Backlog cleared + home redesign** (day 9, Batches 20–21) — every non-Phase-2 backlog item shipped in one pass: the code-quality consolidation (shared sidebar/filter/id/date infrastructure, finance state lifted app-wide, one audit log, per-invoice credit-note netting), auto-drafted mobilization invoices, billing progress on project records, payroll-fed P&L, a PRO dashboard, individuals-as-clients; then the home page was redesigned as a search-first launcher — live status lines on every module tile, a single attention line, photo news cards, holidays card — chosen from three mocked-up directions and verified on mobile
- **Role-based views** — employees, HR, management, marketing, IT, admin staff, and PRO company each see different navigation and data
- **Home dashboard** — module launcher, announcements, holidays tile, build-number card; day 3 added probation-ending-soon card

## The honest footnotes

- Day one included a full detour: a real backend (FastAPI + Supabase + Railway) was built, hit repeated deployment failures, and was deliberately scrapped just after midnight in favour of the frontend-only proof-of-concept. The 4-day figure *includes* that dead end.
- Days 2–3 were management requirements gathering. Day 2 shipped CRM + base HR + Projects (portfolio) for initial review. Day 3 shipped 7 HR features (self-service registration, referral gifts, offboarding, PRO company access, typed documents, staff planning) based on requirements provided by management; management then reviewed Phase 1 and surfaced additional questions (document review workflows, offboarding payroll linkage, mid-month hire / late-pay handling, PRO dashboard scope, project-management module scope) — these are now in BACKLOG.md pending decisions.
- This is a UI demo on dummy data — no database, no persistence, cosmetic login. Phase 2 (real backend, RBAC, WPS integration, document storage) is the actual engineering project. The point of the 3 days: we now know exactly *what* to build and have gathered requirements by iterating on working screens, not by writing spec documents.
- Built by one person pair-programming with an AI assistant (Claude). The speed is the point — the ~86 hours invested proved the concept and surfaced enough detail to scope the backend project accurately.

## How to refresh these numbers

```
git rev-list --count HEAD                          # commits
git log --reverse --format=%ad --date=short | head -1   # first commit
git log --format=%ad --date=short | sort -u       # working days
find frontend/src -name "*.jsx" -o -name "*.js" | xargs wc -l   # LOC
```
