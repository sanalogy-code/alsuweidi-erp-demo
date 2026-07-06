# Status

Quick-read companion to [SPEC.md](SPEC.md) — same facts, faster to skim. SPEC.md is the detailed technical reference; this is "what's true right now."

**Last updated:** 2026-07-06 (Batches 9–11 all shipped the same day: PM module built, then twice restructured on Sana's live review. Batch 11 = the "proper PM" pass: PM-vs-Database split, waterfall/sprints, Gantt, management dashboard, hours.)

**Live**: https://alsuweidi-erp-demo.pages.dev — login with any name + a role from the dropdown (no password, nothing sent anywhere, purely local/dummy). The role and the "I'm a new hire" checkbox change what you see — try `HR`, `Management`, `IT`, and a plain `Sales` login to compare. The homepage shows a build number card so you can tell at a glance whether a deploy landed. **Financials and the Admin Center are gated to Management/Admin** — log in as `Management` to see them.

**Phase 1 Status:** Eight modules live — CRM, full HR suite (incl. timesheets with manager approvals and a submission lockout), **Projects with a full project-controls workspace (new)**, IT & Assets, Marketing, Financials (first-pass, demo-grade), and Admin Center. Every home tile is live. Ready to show management. Real backend work starts after Phase 1 validation. For the "how long did this take" numbers to share with management, see [STATS.md](STATS.md).

**Latest (Batch 15, 6 Jul 2026 night — five more current-ERP screens absorbed):**
- **HR → Timesheet insights** (management-gated) — hours or cost (blended AED 210/h, per-person rates Phase 2) broken down **by project, by person, and project-vs-overhead**, from the real timesheet data; plus **Workload review**: standard vs registered hours per person with one **workload index** ((registered − standard) ÷ standard, work-week aware) and a status chip — replacing the current system's nine cumulative-hour columns.
- **Financials → Revenue reports** — earned (invoiced) per project per month for 2026, a forecast lens (remaining fee spread to year end — placeholder until billing milestones exist), and a forecast-vs-earned comparison. One view with a toggle, not four report pages.
- **Admin → Registrations & licenses** — office-level registration/classification/certification radar (expired / ≤30 / ≤60 / ≤90 buckets, notified owner per item), same pattern as HR's Renewals. **Seeded with the ADCD CFPE hard gate (1 Sept 2026) and an expired Dubai Municipality registration** so the radar earns its keep on day one. Portal passwords deliberately not stored (the current system keeps them in a form field) — a proper secrets vault comes with Phase 2.

**Earlier (Batch 14, 6 Jul 2026 night — four current-ERP screens absorbed, "information not design"):**
- **Project reviews** (renamed from "DMR (weekly)") — two lenses: **Design review (weekly)** (the Batch 13 DMR) and **Construction review (monthly)** (the CMR equivalent): SPI + actual-vs-planned %, contract values (original / approved incl. VOs / expected at completion — overrun in red), commencement & completion dates, retention, last safety report, **team deployment (man-months, to date vs last month)**, site photos (name-only), and notes 1–5 composed from the registers (progress, open WIRs/NCRs, claims + IPCs, risks, authorities/handover).
- **HR → Attendance → Period report** — the attendance report as one summarized row per person (days worked, leave, on-time %, lates, missed punches, avg hrs/day, est. OT) with date-range + department filters — not the current system's 40-column punch grid; punch drill-down comes with the Phase 2 device feed.
- **CRM → Sales → Proposals (RFPs)** — the RFP register: status workflow (invited → preparing → submitted → awarded/lost, plus no-bid), go/win scores colour-coded, submittal-date tracking, filters, win rate; employers auto-link to CRM companies and **awarded RFPs link to their delivery project** (RFP-2026-009 → P-2650). New-RFP form is compact, not the 30-field page.
- **Resources → Months toggle** — monthly utilization outlook rolled up from the same weekly allocations (the CDM allocation-plan equivalent, but one dataset instead of a disconnected module).

**Earlier (Batch 13, 6 Jul 2026 night — the DMR):**
- **DMR (weekly)** under Project Management — the equivalent of the company's existing Design Management Report screen: pick a design lead, walk their projects — **discipline hours vs R0 estimate** (red overrun %s, HRS flag on the rail), **financial waterfall** (fee → earned → invoiced → received), **profitability A–G** (salary cost from hours × blended rate + sub-consultant accruals from Financials → P&L + margin), and **structured notes 1–5** composed live from the registers (weekly update, deliverables in flight, permitting status, risks + claim deadlines, payment stages & invoices). Demo: P-2688 Crew Training runs **161% of estimated hours, margin 8%** — the real DMR's overrun story. Per-person cost rates need the Phase 2 payroll link.

**Earlier (Batch 12, 6 Jul 2026 night — resource planning + the research nice-to-have tier):**
- **Resource planner** (replaces the flat allocation list): person × week capacity heatmap over the next 6 weeks — planned hours per project vs 40h/week capacity, colour-coded (light/healthy/near-capacity/over-allocated), rows expand to per-project per-week editable inputs, "Allocate" form, logged timesheet hours shown alongside. State lifted to App.
- **Risk register** per project: probability × impact scoring, owner, mitigation, open → mitigating → closed/realized (a realized risk points at its claim). Seeds on Harbour Point + Pump Station.
- **Meetings & actions**: minutes log with action items (owner + due + done) — open actions land in the owner's **My Work** automatically.
- **Payments (IPC)**: interim payment certificate register (claimed vs certified with deduction callouts, draft → submitted → under review → certified → paid); certified amounts reference approved WIRs.
- **Handover** (supervision projects): snag list gating the Taking-Over Certificate → Defects Liability Period → Performance Certificate → retention release chain.
- This closes out essentially the whole PM_RESEARCH.md feature map (essential + nice-to-have) except the cash-flow forecast and RACI matrix.

**Earlier (Batch 11, 6 Jul 2026 night — "this isn't proper project management yet", Sana):**
- **Projects now has two areas:** **Project Management** (My Work, Management dashboard, Resources) and **Database** (Portfolio list, Record stats) — the working tool vs the records.
- **Management dashboard** — one row per active project: RAG health (red = overdue claim deadline / 3+ late tasks / SPI < 0.85), % complete, late-task count, next milestone with slip flag, SPI, **hours used vs manhour budget** (real timesheet actuals), methodology. Click-through to the workspace.
- **Waterfall vs Sprints per project** — the "Plan & tasks" section renders a **Gantt timeline** (task bars with % complete fill, late-in-red, milestone diamonds, today line) for waterfall, or **sprint boards** (iterations with goals/dates, To do / In progress / Done columns, a backlog with "move to sprint", start/close sprint) for sprints. Demo: Crew Training Facility (P-2688) runs design sprints; Harbour Point is waterfall.
- **Tasks are fully editable**: assignee, start/due dates, effort hours, % complete, priority, status, checklist, notes — inline on the card.
- **Resources** show real logged timesheet hours per person per project alongside allocations.

**Earlier (Batch 10, 6 Jul 2026 late evening — from Sana's review of Batch 9):**
- **Phase-split workspaces:** a project is now delivered as one or more *phases* — Design, Supervision, and/or Study/Advisory — each a separate engagement with its own team, tasks, schedule, fees, and weekly updates (a DPM and CPM genuinely run them separately). Contract admin (FIDIC claims/EOT, 4.21 reports, authorities) stays project-level. Workspace sidebar groups by phase.
- **My Work** — the new default Projects landing: everything assigned to or waiting on *you* across all projects — my tasks, approvals awaiting me (WIRs/MIRs/NCR corrective actions/deliverable QA), and contract deadlines. Demo as "Samir Al Mazrouei", "Fatima Al Mansouri", or "Mohammad Kubba".
- **Real task management** per phase: assignment, due dates, priorities, checklists, progress notes, To do / In progress / Done grouping.
- **Weekly progress updates** per phase (% complete + summary + blockers) — the latest one headlines the phase card on the project overview; raw material for the monthly 4.21 report.
- **Study/Advisory scope** (new): TIS / surveying / feasibility projects get deliverables, tasks, schedule, fees — no site registers or design gates. Seed: P-2725 TIS — Khalifa City School Cluster.
- **Discoverability:** clicking a project now opens its workspace directly ("Details" button opens the old record card); dashboard "Needs attention" includes claim/report deadlines; PM state lifted to App so edits survive navigation.

**Earlier (Batch 9, 6 Jul 2026):**
- **Project Management module (new):** every project record now opens a **Project Workspace** (`/projects/:id`, "Project workspace" button on the record) with scope-aware sidebar sections: **Overview** (claim-deadline + report-due alert banners, SPI, register stat cards), **Deliverables** (doc register with rev history + internal QA → issue → comments → resubmit workflow), **Design stages** (30-60-90-final gates), **Site** (WIR/MIR/NCR/site-instruction/daily-report registers — NCR closure requires an approved corrective action; WIR resubmits under the same ref with rev history), **Schedule** (S-curve + SPI, milestone baseline-vs-actual bars), **Tasks**, **Fees & cost** (fee by stage + % complete + EAC, manhours vs live timesheet actuals, invoiced-vs-fee from Financials, variations — sensitive roles only), **Claims & EOT** (FIDIC register with the 28-day-notice countdown from awareness, 42/84-day detailed-claim tracking per 1999/2017 edition, contemporary-records log incl. informal notices), **Progress reports** (FIDIC 4.21 checklist, 7-day deadline), **Authorities** (Abu Dhabi-first: DMT permit, ADCD fire track, utility NOC ladders, Estidama Pearl; Dubai secondary; submit→comments→resubmit cycles), **Team**. Plus a portfolio-level **Resources** view (person × project allocation). Seeds: projects 1, 2, 5, 8 — demo the claims countdown on **P-2650 Pump Station Upgrade** (notice due in days). Data in `data/pmData.js`, built from [PM_RESEARCH.md](PM_RESEARCH.md).
- Also committed: six module gap-analysis research docs (`CRM/HR/FINANCE/IT/MARKETING/ADMIN_RESEARCH.md` + `OPPORTUNITIES_RESEARCH.md`) produced by a parallel research session on 6 Jul.

**Earlier (Batch 8, 4 Jul 2026 evening):**
- **Admin Center (new module):** `/admin`, gated to Management/Admin (`ADMIN_VIEW_ROLES` in `data/adminData.js`), sidebar nav — **Overview** (account stats, active users by role, mock 30-day module usage, needs-attention list, recent activity), **Users** (accounts mirroring the HR seeds — add user with mock invitation email, edit role, password reset, disable/enable, delete with "disable instead" advice), **Roles & permissions** (the role × module access matrix mirroring the app's real client-side gates — click-to-cycle, reset button; doubles as the Phase 2 RBAC spec), **Activity log** (filterable mock audit trail incl. an access-denied event). Honest caveat shown on-screen: login is still password-less, so accounts are display-only until Phase 2 auth. The unused ComingSoon page was deleted.

**Earlier (Batch 7, 4 Jul 2026):**
- **Financials & Accounting (new module):** first UI pass, gated to Management/Admin (`FINANCE_VIEW_ROLES`). `/finance` with sidebar nav — Overview (cash position, receivables/payables, overdue, revenue by project type, recent invoices), Invoices (client invoices linked to projects/deals: draft → sent → partially paid → paid → overdue, with send/mark-paid), Expenses (categories + approval status, approve/reject), and a P&L summary (H1 2026 monthly breakdown + income statement + net trend). Seed data (`data/financeData.js`) ties into the Projects/CRM seeds — invoices bill against project consultancy fees, a couple trace back to won deals. **Demo-grade — a conversation starter; needs proper scoping with Sana/Finance (see BACKLOG.md).**
- **Developer Dashboard work log:** a presentable, data-driven "log for show" at the bottom of `/dev` — category tabs (Done / To do / Needs a decision / Good to have / Phase 2) with fixed-column rows, status chips, right-aligned dates. Data in `data/devLogData.js`.
- **Code review:** medium-effort review over the Batch 6–7 diff found **no confirmed correctness bugs** — the code is defensively written; the few low-confidence candidates were refuted against the actual code and seeds.

**Latest (Batch 6, 3 Jul 2026 — 19 items, driven by Sana's Marketing review + resolved management decisions):**
- **CRM:** companies get website / size / multi-select relationship tags (Client, Prospect, Subconsultant, Supplier, Partner, Government) / services, with tag + service filters; Subconsultant companies get a per-project "Project History" tab; "Keep in Mind" notes on companies + contacts and a Lessons tab on the project record (shared NotesList); Needs Follow-Up names now open the contact modal; new **Portfolio PDFs** view under Insights — category-grouped packs that Marketing manages in its Portfolio view.
- **Marketing:** **Proposal Builder deleted** (Sana's decision — its useful fields moved onto the project record: years started/completed, images, special features; pre-assembled portfolio packs replace pack-building). Photo task is now a real 4-step workflow (arrange photographer → coordinate with Supervision → photos taken → review/approve/upload). Content calendar reworked: channels fixed to Website/LinkedIn/Email, copy + media are the primary fields, Month vs custom From/To range. Branding overhauled: Quick guidelines default view, Symbol/Primary/Vertical logos in two colour versions (Arabic logo removed), EN+AR fonts, Brand Guidelines + Platform & Narrative Guide.
- **HR / Timesheets:** copy-last-week + default rows for faster entry; overhead codes (Admin/IT/Marketing/General/Leave/Training); app-wide **TimesheetGate** — reminder banner on your last working day, full-screen ERP lockout when last week is unsubmitted (demo-dismissable); business card requests (self-service → HR inbox fulfil); per-document review statuses (pending/verified/rejected + re-upload); payroll offboarding cutoff (pro-rated final month + end-of-service settlement in the same run) and mid-month-hire catch-up on the next run; **two-step leave approval** (manager → HR, mirroring Batch 5 timesheet approvals).
- **Roles:** new `it` and `adminstaff` roles; the IT workspace is now owned by IT/admin/management (HR staff removed); Add-license form on the license registry.

**Demo logins for the new flows:** "Fatima Al Mansouri" (timesheet lockout), "Osama Hussain" (Friday reminder + manager approvals for timesheets/leave), "Layla Al Mazrouei" as HR (inbox incl. business cards, document review, payroll runs — Jun deferral banner, Jul Priya catch-up, Aug Ahmed final settlement), "Priya Nair" (rejected document re-upload), role `it` (IT workspace).

**Earlier same day:** Batch 5 (confidentiality gate, scannable queue layouts, portfolio search, line-manager timesheet approval, per-employee work weeks), Batches 3 & 4 (Marketing module + Timesheets), Batch 1 (7 HR features) and Batch 2 (HR direct entry, project create/edit/advance, self-service identity docs, IT & Assets). Still open decisions: PRO dashboard scope, Grade field, individuals as CRM clients, Campaigns scoping.

---

## The pivot (read this first if you're new here)

The original plan (FastAPI + React + Supabase, backend on Railway) hit repeated deployment failures — Supabase client crashes, Railway CMD/Dockerfile issues, Cloudflare cache problems. Scratched the backend entirely and built a **frontend-only UI proof-of-concept** first, to get management sign-off on look-and-feel before investing more engineering time in real infrastructure.

- No API calls, no database. All data lives in React state, seeded from `frontend/src/data/*.js`.
- Backend/database work isn't cancelled — it's deferred until the UI is validated. Eventual target is still self-hosting on the company's own server (not Supabase/Railway).
- This is deliberate, fast-iteration requirements gathering: building working UI and reacting to real feedback surfaces what a CRM/HR system actually needs faster than upfront spec-writing would. The one real risk flagged so far: no RBAC/permissions enforcement exists yet, and access control usually needs to be designed in rather than bolted on last — see SPEC.md §5.

## Documentation & source of truth

Everything about this project lives in **this GitHub repo** — no Google Drive dependency, no per-device sync setup needed. Clone it, open Claude Code there, and you have everything: code, SPEC.md, STATUS.md, STATS.md (build stats for management), **[BACKLOG.md](BACKLOG.md) (the agreed to-do list — we work it in batches, not one-off changes)**, and the `/erp` and `/update-erp` skills (in `.claude/skills/`).

The one thing that can't live in the repo: **WN (the ALSUWEIDI Knowledge Base Obsidian vault)**. That's a local desktop app tied to a specific work computer — reachable only when a session runs on that machine with Obsidian open and the vault active. Both skills try it and skip gracefully if it's not reachable.

## Current status

### ✅ CRM module — COMPLETE (sidebar navigation)

Grouped sidebar matching HR's (replaced the six horizontal tabs): **Overview** top-level, **Sales** (Pipeline, Companies, Contacts), **My Work** (Tasks, with a badge counting open tasks due today or overdue), **Insights** (Reports, Portfolio PDFs).

- **Overview** — dashboard: stat cards + widgets (Needs Follow-Up — names clickable, opens the contact modal — Reminders, Closing Soon, Top Clients, Pipeline by Stage)
- **Pipeline** — Kanban board by deal stage, drag-and-drop or dropdown to change stage. **Unified date range selector** (preset: All Time/This Year/This Quarter/This Month, or custom From/To date picker). Filters respond in real-time. Handles ISO dates, quarter format (2026-Q3), year format (2026). Edit/Delete buttons on each deal card.
- **Companies (expanded Batch 6)** — list with relationship-tag + main-service filters; companies carry website, size (employee band), multi-select tags (a company can be Client *and* Supplier), services. Detail drill-down: Contacts/Deals/Activity tabs, **Project History** for Subconsultants (which project, scope, how it went), **Keep in Mind** notes. Edit/Delete with modals. Name stays "Companies" per decision — the tags do the work.
- **Contacts** — searchable directory; full profile modal (info, inline edit, linked deals, complete interaction history, Keep in Mind notes, quick actions). "Export" button opens filtered export panel.
- **Tasks** — reminders tied to a contact, grouped Overdue/Due This Week/Later/Done
- **Contact Export** — dropdown filters (Company, Relationship, Sub-Type [cascades], Seniority, Employment Type, Last Contacted) → live match count/preview → Excel or CSV export, entirely client-side
- **Interaction logging** — "Log Interaction" form (type/note/date), feeds company Activity tab + contact history
- **Reports** — **Redesigned:** Unified date range selector (same as Pipeline). Two simultaneous views: Monthly Breakdown (aggregated metrics) + All Deals list (individual rows). Company/Stage filters inline. One-click Excel download includes both views. Date filtering handles all formats (ISO, quarter, year).
- **Portfolio PDFs (new in Batch 6)** — downloadable portfolio packs grouped by category (Education, Data Center, Mixed Use, Communities, Industrial — extensible), managed by Marketing, downloaded by sales. Demo stubs until Phase 2 storage.

Two-tier contact taxonomy: `relationship` + `subType` scoped per relationship, `seniority` (Entry→C-Suite), `employmentType` enums.

### ✅ HR module — COMPLETE (full suite, sidebar navigation)

Redesigned from 11 flat tabs into a **grouped sidebar with two lenses** — employees see self-service; HR staff get an "HR Workspace" group; management gets the workspace minus complaint handling.

**Everyone:**
- **My HR** — personal hub: leave balance, request-certificate / raise-a-concern cards, next approved public holiday, pending-request count. HR/management also see org stats and callout cards (inbox count, renewals due).
- **People** — directory (HR staff also get an **Add employee** button — direct entry for walk-ins/transfers, same employment form as the new-joiner review, required documents enforced) with three views: searchable **List**, clickable **Org Chart** (built from manager links), **Accomplishments** search ("who has a PE license?"). Profile modal: Info + Accomplishments for everyone; **Visa & Dependents, Compensation, and Documents only for HR/Admin/Management**. Full passport/visa/Emirates ID per person and per dependent, dependent insurance, add-dependent form. Employees can add their own certificates/courses — flagged "Pending HR verification" until HR verifies.
- **My timesheet (Batch 4, faster in Batch 6)** — weekly grid with your *own* weekend shaded (per-employee work weeks, Batch 5), hours per project code per day + overhead codes (Admin/IT/Marketing/General/Leave/Training), "Copy last week" + default rows, save draft / submit, rejected weeks reopen with the reason. App-wide **TimesheetGate**: reminder banner on your last working day, full-screen lockout when last week is unsubmitted (demo-dismissable).
- **My requests** — the employee's own leave + certificates + concerns + **business cards (new in Batch 6)** in one filterable, status-chipped list; leave shows "Awaiting manager (1/2)" / "Awaiting HR (2/2)".
- **Own identity docs (new in Batch 2)** — everyone sees their *own* Visa & Dependents and Documents tabs on their profile ("when does my visa expire?"). Other people's stay HR/admin/management-only, and Compensation remains fully gated.
- **Careers** — open positions with referral bonuses; refer a candidate or apply internally.
- **Onboarding** — only for logins that check "I'm a new hire". 7 sections + acknowledgement gate.

**HR Workspace (role-gated):**
- **Inbox** — one queue of everything waiting on HR (pending leave, certificate requests, **business card requests**, open concerns, new candidates), oldest first, actioned inline in scannable fixed columns. Recently issued letters below.
- **Leave planner** — month calendar of who's off with **same-team overlap warnings**, holiday/weekend shading (per employee work week), annual balances (30-day entitlement); plus full request history. **Two-step approval (Batch 6):** manager approves first ("Team leave" view for anyone with reports), then HR; HR steps in when there's no manager.
- **Renewals** — visas, passports, contracts, and dependent insurance expiring within 90 days or overdue — employees *and* dependents.
- **Timesheets (Batch 4/5)** — line managers approve their own team ("Team timesheets" view); HR gets company-wide oversight showing who each week is awaiting, and can step in. Per-day breakdown, reject-with-reason, missing-last-week list.
- **Document review (new in Batch 6)** — every uploaded document carries pending/verified/rejected status; HR rejects with a reason, the employee re-uploads from their own profile.
- **Attendance** — today's snapshot dashboard (office/site/leave/absent, check-ins, weekly hours). Fingerprint feed is Phase 2; layout is for sign-off.
- **Payroll** — monthly WPS run (basic + allowances + overtime − deductions), Draft → Generate SIF → Submitted → Paid workflow, payslip modal with estimated end-of-service gratuity. Flags employees with unsubmitted timesheets ("blocks WPS" — display-only for now). **Batch 6:** offboarding cutoff (final month pro-rated to the last working day, end-of-service settlement folded into that run with a "Final settlement" flag) and mid-month hires (joining month deferred with a banner, pro-rated catch-up on the next run).
- **Holidays** — HR approves/edits/adds public holidays (Islamic dates pending until moon sighting); approved ones appear automatically on every employee's home dashboard.

**Certificate letters:** six UAE letter types (salary, employment, salary transfer, NOC, embassy, experience) auto-drafted from the employee record in English/Arabic/bilingual — HR edits, prints to PDF on letterhead, letter saved on the request. Zoho Sign step is mocked pending Phase 2.

### ✅ IT & Assets module — LIVE (Batch 2; own role since Batch 6)

Every employee can raise hardware/software/repair/access requests from "My requests". The IT
workspace is now owned by the new **`it` role** plus admin/management (Batch 6 — HR staff no
longer have access); a new `adminstaff` role covers office administration at employee-level
access only. The workspace gets:

- **Request queue** — approve → procure → fulfil, or reject with a reason; resolution notes on the record
- **Asset registry** — tagged assets (IT-0031…) with type, model, serial, purchase date, book value, status (in use / in stock / repair / retired), and inline assignment to employees. Offboarding's equipment-return checklist item checks this list.
- **Licenses** — software subscriptions with seats used/total, yearly cost, and renewal radar (60-day amber, overdue red — lapsed AutoCAD stops the drawing office). **Add-license form (Batch 6)** — new licenses join the renewal radar automatically.

### ✅ Marketing module — LIVE (new in Batch 3)

Marketing + top management only, except **Branding** (brand asset library — logos, templates, guidelines) which every employee can see. Content lives *inside* Marketing; the separate Content tile is gone.

- **Inbox** — auto-fed task queue: new project → *write marketing description*; project hits final stage or someone tries to complete it → *photo task*; new employee → *headshot* + *welcome email* (Marketing designs it, HR checks and sends). **The photo task is a 4-step workflow (Batch 6):** arrange photographer (external/in-house) → coordinate with Supervision before handover → photos taken → review/approve/upload — only the last step approves photos.
- **Completion gate** — a project **cannot be marked Completed** without a marketing description and approved photos (site-engineer snaps don't count). Blocked attempts auto-queue the missing tasks.
- **Content calendar (reworked Batch 6)** — month grid or custom From/To range + house-style list; **copy + media are the primary fields** (title optional), channels fixed to Website / LinkedIn / Email; idea → draft → pending approval → approved → published.
- **Portfolio** — search + filters (Batch 5), readiness per project (description + photos + not confidential), description editing, per-project years/images/special features (Batch 6), confirm-guarded confidentiality, and **portfolio pack management** (the PDFs CRM downloads).
- ~~**Proposal builder**~~ — **removed in Batch 6, Sana's decision**: instead of assembling packs in-app, the project record carries the fields that mattered (years, images, special features) and Marketing maintains pre-built category portfolio PDFs that CRM downloads.
- **CV search** — shared with HR (People → CV search): keyword / department / accomplishment filters, headshot-on-file flag.
- **Analytics** — proposal win rate live from CRM deals; LinkedIn/website panels are labelled mock feeds.
- **Branding (overhauled Batch 6)** — "Quick guidelines" default view (logo/font/colour rules); Symbol/Primary/Vertical logos in full-colour + reversed (Arabic logo removed), English + Arabic fonts, Brand Guidelines + Platform & Narrative Guide docs. Still visible to every employee.
- Deliberately out of scope: media/photo storage (Sana's call — likely unnecessary).

### ✅ Financials & Accounting module — LIVE (new in Batch 7, first pass — demo-grade)

Management/Admin only (`FINANCE_VIEW_ROLES`; the whole module is sensitive — other roles get a
"Restricted module" screen). Home tile is hidden for non-privileged roles. A deliberately basic
but coherent first pass for requirements gathering — **not real accounting**. `data/financeData.js`.

- **Overview** — cash position (mock bank + petty cash), receivables outstanding, payables
  (approved + pending expenses), overdue total, revenue by project type (invoices joined to
  projects), cash accounts breakdown, recent invoices.
- **Invoices** — client invoices billed against project **consultancy fees** (design/supervision),
  linked to projects (and a couple to won CRM deals). Status flow draft → sent → partially paid →
  paid → overdue, 5% UAE VAT, outstanding tracking, status filter, send / mark-paid actions.
- **Expenses** — categories (software, subconsultants, rent, travel, gov fees…), approval status
  (pending → approved / rejected / reimbursed), category + status filters, approve/reject, optional
  project job-costing link.
- **P&L summary** — H1 2026 monthly breakdown (revenue / direct costs / payroll / overhead / net) +
  income statement + net-profit trend + margin.
- Everything is clearly marked mock/Phase 2: real ledger, VAT returns, bank feed, WPS→P&L
  integration and reconciliation are Phase 2. **Scope needs a proper conversation with Sana/Finance.**

### ✅ Admin Center — LIVE (new in Batch 8 — users, roles, audit)

Management/Admin only (`ADMIN_VIEW_ROLES`; same restricted-screen + hidden-tile pattern as
Financials). Demo-grade user management to agree the workflows before Phase 2 auth. `data/adminData.js`.

- **Overview** — active/invited/disabled counts, access-denied alerts, active users by role,
  mock 30-day module-usage bars, needs-attention list, recent activity.
- **Users** — every login (seeded from the HR employees + Sana + the PRO company + a pending
  invite): add user (mock invitation email per the 3 Jul login decision), edit name/email/role,
  password reset (mock), disable/re-enable, delete behind a confirm that recommends disabling.
- **Roles & permissions** — role × module matrix (— / View / Full) mirroring the app's actual
  client-side gates; click-to-cycle with a reset button. This is the Phase 2 RBAC spec, visualized.
- **Activity log** — filterable mock audit trail (user / module / action kind) across modules.
- On-screen caveat: the login page is still password-less, so none of this gates sign-in yet.

### ✅ Projects module — LIVE (dashboard + portfolio + record + **full PM workspace, Batch 9**)

**Batch 9 (6 Jul):** the full project-controls module from [PM_RESEARCH.md](PM_RESEARCH.md) is live — see "Latest" above for the section-by-section rundown (deliverables register, design gates, WIR/MIR/NCR/SI/daily logs, schedule + SPI, tasks, fees & variations, FIDIC claims/EOT with deadline countdowns, 4.21 progress reports, Abu Dhabi-first authority workflows, team panel, portfolio Resources view). Registers are page-local demo state; 4 of 12 projects seeded. **Standing action from the research:** verify ALSUWEIDI's fire-safety classification and CFPE certification before ADCD's 1 Sept 2026 hard gate.

**New in Batch 2:** "New project" button for direct awards/tenders (LOA attachment still required — same rule as the won-deal path), an Edit modal on the record (financial fields visible only to sensitive roles), stage back/advance controls under the pipeline strip, and inline supervision approved/actual % updates.

**New in Batch 3:** Marketing sign-off panel on every record (description + photos status), and the completion gate — Completed is blocked until Marketing signs off, with the missing tasks auto-queued.

**New in Batch 6:** richer portfolio fields on the record — years started/completed (derived from design/supervision, overridable), images (file-name-only), special features — plus a **Lessons** tab (lessons-learned notes) and the photo workflow state.

Modeled on the structure of the company's existing ERP export (140 projects × 40 unreadable flat columns) but normalized — a project is one core record plus optional design and supervision sub-records, so the N/A noise is structurally gone. All 12 seed projects are invented.

- **Portfolio** — seven-column list (no, name + client, type, scope, stage, DPM/CPM, status) with type/scope/status/location filters and a "My projects" toggle
- **Project record** — 9-stage delivery pipeline as a visual strip; Design tab (discipline chips, CAD/BIM) and Supervision tab (approved vs actual % with behind-plan flag, late completion highlighted) only render where the project has that scope
- **Financials** — contract value, construction cost, design-fee disputes, payment statuses — **HR/Admin/Management only**, mirroring how the real export strips those columns
- **Cross-module links** — DPM/CPM open the HR profile; employers matching CRM companies are tagged "CRM client"

### 📋 Not yet built (known gaps, roughly in priority order)
- **RBAC is prototyped, not enforced** — the UI genuinely gates by role now (sensitive tabs, HR workspace), and the Admin Center renders the full role × module matrix as the Phase 2 access-control spec — but it's client-side against a password-less login, and the Admin Center's user accounts/invites/audit log are display-only mocks. Real enforcement (auth + API filtering) is the first backend job — see SPEC.md §5.
- **No notifications** — leave (manager → HR) and timesheet (line manager) approval chains now exist in the UI, but nobody gets notified of anything, and nothing hard-blocks conflicting leave. Phase 2.
- **Attendance device feed** — dashboard is mocked; fingerprint/biometric integration needs the backend. Timesheets are fully built (grid, overhead codes, manager approvals, per-employee work weeks, reminder + lockout) but the payroll block is display-only and the lockout is demo-dismissable — real enforcement is Phase 2.
- **Zoho Sign integration** (mocked), **document/media storage** (everything is file-name-only — documents, project images, portfolio PDFs, brand assets), **appraisals** (awaiting spec — cycle, reviewers, rating model).
- **PRO dashboard** (needs the tenant-vs-role decision), **Campaigns** (needs scoping), **Grade field** (ask management).
- Email sending / notifications (structurally can't be done client-side; needs serverless function + provider)
- Global search

---

## Next: Backend & Production Migration

See [BACKEND_PLAN.md](BACKEND_PLAN.md) for the roadmap from proof-of-concept to production:
- **Phase 2** (Q4 2026): Real backend on an on-prem VM (Postgres + Node/Python API + Docker), with RBAC, audit logging, and encrypted backups. IT gets asked for: 4c/16GB/100GB VM, firewall rules, backup storage.
- **Phase 3** (2027+): Projects, expanded HR, Financials.
- **Testing strategy:** All features validated in staging (dummy data, same schema) before touching production.
- **Data security:** AI helps write code; humans apply changes and own the audit trail. Production data never seen by the AI.

---

## Standing security item — RESOLVED (3 Jul 2026)

A Supabase **service_role secret key** was committed to `backend/populate_db.py` before the pivot and pushed to the public GitHub repo (still recoverable from git history, commit `6985c30`). **Resolved: Sana deleted the entire Supabase project on 3 Jul 2026** — the leaked key is now inert since the project it granted access to no longer exists.

---

## Tech stack

Frontend only — React + Vite + Tailwind + React Router + `lucide-react` + `xlsx` (SheetJS, lazy-loaded, installed from SheetJS's own CDN build rather than the flagged npm package). No backend, no database, no fetch calls anywhere.

**Hosting:** GitHub → Cloudflare Pages, auto-deploys on push to `master`.

**Local dev:** clone this repo to local disk on whatever machine you're working from. Don't work from a cloud-sync folder (Google Drive, OneDrive, etc.) if avoidable — virtual filesystems make `npm install`/`vite dev` unusably slow and can't be bridged to local disk via symlink/junction.

**Verifying changes:** `npm run build` locally → commit + push → compare the built JS bundle hash against the live URL to confirm Cloudflare's deploy landed.
