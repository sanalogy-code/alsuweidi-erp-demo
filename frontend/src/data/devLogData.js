// Work log — "the log for show". A presentable, management-friendly snapshot of where
// the ERP build stands, surfaced at the bottom of the Developer Dashboard. Sana presents
// from this; she and Claude keep working from the simple summary files (STATUS/BACKLOG/SPEC).
//
// Update the log by editing THIS file — not the dashboard JSX. Each category is a group of
// rows: { title, detail, meta (right-aligned date/owner), status (chip label) }.
//
// Categories:
//   done         — shipped, with dates
//   todo         — agreed, not yet built
//   decision     — blocked on Sana / management
//   goodtohave   — fresh ideas noticed while reviewing (not yet agreed)
//   phase2       — needs the real backend
//
// Last reviewed: 2026-07-08 (Batch 19 — in-app Guide + the Everything-list persona sweep).

export const DEV_LOG_UPDATED = '2026-07-08'

export const DEV_LOG = [
  {
    key: 'done',
    label: 'Done',
    accent: 'emerald',
    blurb: 'Shipped and live on the demo. Built in fast batches on real management feedback.',
    items: [
      { title: 'Batch 19 — In-app Guide (help system)', detail: 'A “?” in every top bar opens one help hub, contextual to the module you’re on: a per-role orientation, ~50 “How do I…” task recipes (a few steps each + a “Take me there” jump), and a module map. Role-gated; one maintained content file.', meta: '8 Jul 2026', status: 'shipped' },
      { title: 'Batch 18 — “Think of everything”: the full persona sweep', detail: 'The whole cross-company backlog, in one pass. Every employee: a notifications centre (bell + unread badge, live feed of approvals/deadlines/queues), global search (Ctrl+K), a “My week” strip, and a management Company-KPI home with board-pack print. Accountant: receipts, credit notes, per-expense VAT + working paper, petty cash, supplier payables + payment runs, retention, month-end close, audit trail. HR: appraisals, training, disciplinary register, exit interviews, headcount & attrition, grades/bands. Marketing/BD: campaigns, content approvals, events, awards, bid/no-bid gate, tender checklists, competitor register, lost-bid debriefs. Office/IT: room booking, supplies, courier log, vehicles + Salik, document numbering; SLA timers, installed-software map, maintenance schedule, access requests, status board. Site: drawing transmittals, RFI register, gate coordination, 4.21 photo reports, HSE safety log, mobile quick daily entry. Plus the attendance punch drill-down and search/filter “basics” across ~24 registers.', meta: '7–8 Jul 2026', status: 'shipped' },
      { title: 'Batch 17 — Project visibility pass', detail: 'Tasks as a clear sortable table (kanban board one click away) + an “All tasks” view across a project; a portfolio-level risk report; a real time-scale on the Gantt; and cost columns on the management dashboard.', meta: '7 Jul 2026', status: 'shipped' },
      { title: 'Batches 13–16 — Nine legacy ERP screens absorbed + full task management', detail: 'Modelled on the company’s current ERP screens (information kept, design rethought): the DMR/CMR became composed “Project reviews”, the RFP form a CRM Proposals register, the punch grid an Attendance period report, plus timesheet-cost insights, revenue reports and a licence-expiry radar. Then real task management — subtasks, dependencies, editable milestones, and “log hours on a task → your timesheet” — a construction feedback register, and staffing requests from a bid flowing into HR’s hiring plan.', meta: '6–7 Jul 2026', status: 'shipped' },
      { title: 'Batches 10–12 — “Proper project management” pass', detail: 'Phase-split workspaces (design / supervision / study run separately), a “My Work” daily driver, waterfall Gantt vs sprint boards per project, a management dashboard with RAG health and hours-vs-budget, a person × week resource capacity planner, and governance registers: risks, meeting actions, interim payment certificates, and the FIDIC handover chain.', meta: '6 Jul 2026', status: 'shipped' },
      { title: 'Batch 9 — Project Management module', detail: 'Per-project controls workspace: deliverables register with revision-tracked review workflows, design stage gates, WIR/MIR/NCR/site registers, schedule S-curve + SPI, fee-by-stage tracking wired to timesheets and invoices, FIDIC claims/EOT with notice-deadline countdowns, 4.21 report checklists, Abu Dhabi-first authority tracking, team panels. Built from a verified research pass.', meta: '6 Jul 2026', status: 'shipped' },
      { title: 'Batch 8 — Admin Center', detail: 'Users (add / edit role / disable / delete, mock invitation flow), role × module permissions matrix mirroring the real app gating (the Phase 2 RBAC spec, visualized), filterable audit-trail mock, usage dashboards. Delegation-of-authority limits added in Batch 18.', meta: '4 Jul 2026', status: 'shipped' },
      { title: 'Batch 7 — Financials & Accounting (first pass)', detail: 'New gated module: overview (cash, receivables, revenue by project type), invoices linked to projects, expenses with approvals, P&L summary. Grew into the full accountant suite in Batch 18.', meta: '4 Jul 2026', status: 'shipped' },
      { title: 'Batch 6 — 19 items across CRM / Marketing / HR / IT', detail: 'CRM company tags + subconsultant history + lessons/notes; Marketing proposal-builder removal, 4-step photo workflow, content calendar rework, branding overhaul; HR faster timesheets, overhead codes, reminder/lockout gate, business cards, document review, payroll offboarding + mid-month-hire catch-up, two-step leave approval; new IT + Admin-staff roles.', meta: '3 Jul 2026', status: 'shipped' },
      { title: 'Batches 3–5 — Marketing, Timesheets, hardening', detail: 'Cross-module marketing inbox with a hard project-completion gate; weekly project-coded timesheets with an approval queue and payroll hold; confidentiality gate on stage advance, scannable queues, line-manager approval, per-employee work weeks.', meta: '3 Jul 2026', status: 'shipped' },
      { title: 'Batches 1 & 2 — HR suite + IT & Assets', detail: 'Seven HR features (joiner wizard, referral gifts, offboarding, PRO queue, typed documents, staff planning), project create/edit/advance, and the whole IT & Assets module.', meta: '3 Jul 2026', status: 'shipped' },
      { title: 'First demo — CRM, HR base, Projects', detail: 'CRM (pipeline, companies, contacts, reports), base HR, Projects portfolio — first management review.', meta: '2 Jul 2026', status: 'shipped' },
    ],
  },
  {
    key: 'todo',
    label: 'To do',
    accent: 'sky',
    blurb: 'Agreed and scoped — waiting for a build slot, not a decision.',
    items: [
      { title: 'PRO dashboard & visibility', detail: 'Task velocity (open/done per week), overdue tasks, client/project breakdowns so the PRO company can run itself. (Shape depends on the tenant-vs-role decision below.)', meta: 'agreed', status: 'to build' },
      { title: 'Mandatory onboarding gate', detail: 'Force onboarding before anything else after first login. The UI half is doable client-side now; the invite-email half is Phase 2.', meta: 'agreed', status: 'to build' },
      { title: 'Shared SidebarNav component', detail: 'CRM / HR / Projects / IT / Marketing / Finance / Office each hand-roll a near-identical sidebar that has started to drift.', meta: 'code quality', status: 'to build' },
      { title: 'Shared filter bar + helpers', detail: 'The search + status + date-range filter row is hand-rolled ~10× across the register sweep; a shared component/hook (plus a shared nextId and the remaining date/AED formatters) would consolidate it. A local-safe todayISO() already landed.', meta: 'code quality', status: 'to build' },
      { title: 'Per-field help tooltips', detail: 'Deferred from the Batch 19 Guide on purpose — add inline field-level hints only once screens stabilise and real testers show specific confusion points.', meta: 'deferred', status: 'to build' },
    ],
  },
  {
    key: 'decision',
    label: 'Needs a decision',
    accent: 'amber',
    blurb: 'Blocked on a call from Sana or management before they can be built out.',
    items: [
      { title: 'Financials / GL scope', detail: 'The accountant suite is demo-grade. Needs scoping with Finance: real chart of accounts + journals, bank-feed matching, FTA VAT filing calendar, billing-milestone model, and WPS payroll → P&L.', meta: 'open', status: 'discuss' },
      { title: 'Appraisal model sign-off', detail: 'A default cycle is built (self → manager → HR, 1–5 on five competencies) to react to — confirm the competencies, rating scale and sign-off flow.', meta: 'default built', status: 'discuss' },
      { title: 'Grades / pay bands scheme', detail: 'An optional G1–G7 grade + bands table is built and shown in the Compensation tab — confirm whether the company uses grades before wiring visibility rules to them.', meta: 'default built', status: 'discuss' },
      { title: 'Campaigns shape (Marketing)', detail: 'A lightweight first version (name/goal/date range, content grouped under it) is built — confirm the scope before extending.', meta: 'default built', status: 'discuss' },
      { title: 'PRO — tenant or role?', detail: 'Is the PRO company a separate tenant/org, or just a role within ALSUWEIDI? Gates the PRO dashboard design.', meta: 'open', status: 'discuss' },
      { title: 'Individuals as CRM clients', detail: 'Allow an individual client as a company record flagged kind: individual, or handle another way?', meta: 'open', status: 'discuss' },
    ],
  },
  {
    key: 'goodtohave',
    label: 'Good to have',
    accent: 'violet',
    blurb: 'Fresh ideas noticed while building — not yet agreed, worth a look.',
    items: [
      { title: 'Auto-draft invoices from project events', detail: 'When a project hits a billing milestone (or a deal is won), auto-create a draft invoice in Financials — mirrors the existing won-deal → project → marketing-task wiring.', meta: 'idea', status: 'nice-to-have' },
      { title: 'Invoiced % on the project record', detail: 'Surface fees invoiced vs contract value on each project, so PMs see billing progress next to delivery progress.', meta: 'idea', status: 'nice-to-have' },
      { title: 'Payroll total feeds the P&L', detail: 'Pull the monthly WPS run total from HR straight into the P&L payroll line instead of a mock figure.', meta: 'idea', status: 'nice-to-have' },
      { title: 'Printable “How to use the ERP” one-pager', detail: 'A PDF/handout version of the in-app Guide for the management demo and new testers.', meta: 'idea', status: 'nice-to-have' },
      { title: 'Lift Financials into shared state', detail: 'The Home KPI panel and global search read the seed invoice register, so same-session finance edits don’t reach them (labelled on-screen). Lift finance state to the app when it next matters.', meta: 'idea', status: 'nice-to-have' },
    ],
  },
  {
    key: 'phase2',
    label: 'Phase 2',
    accent: 'fuchsia',
    blurb: 'Needs the real backend — cannot be done in a frontend-only demo.',
    items: [
      { title: 'Real backend + persistence', detail: 'Postgres + API on an on-prem VM (Docker). Everything currently resets on refresh.', meta: 'Q4 2026', status: 'backend' },
      { title: 'RBAC enforced server-side', detail: "Today's role-gated UI + the permissions matrix and delegation-of-authority limits are the written spec; real enforcement is auth + API-level filtering.", meta: 'Q4 2026', status: 'backend' },
      { title: 'Notification & email delivery', detail: 'The in-app notifications centre is built; actually delivering approvals, reminders, invite links and welcome emails needs a serverless function + provider.', meta: 'Q4 2026', status: 'backend' },
      { title: 'Document & media storage', detail: 'Uploads are file-name-only today (documents, project images, portfolio PDFs, brand assets, site photos).', meta: 'Q4 2026', status: 'backend' },
      { title: 'Real accounting integration', detail: 'Ledger + journals, VAT returns, bank feed, WPS→P&L, reconciliation behind the accountant UI.', meta: 'Q4 2026', status: 'backend' },
      { title: 'Attendance device feed', detail: 'Fingerprint / card-reader integration + timesheet validation and real payroll blocking (the punch drill-down is mock until then).', meta: 'Q4 2026', status: 'backend' },
      { title: 'Primavera P6 integration', detail: 'P6 stays the scheduling engine; import its milestone/progress exports to feed the ERP’s milestones and S-curves instead of manual entry.', meta: 'Q4 2026', status: 'backend' },
      { title: 'PM registers persistence & alerts', detail: 'The project registers reset per session; FIDIC notice-deadline alerts, contractor portals for WIR submission, IPC linkage and real CDE file storage need the backend.', meta: 'Q4 2026', status: 'backend' },
    ],
  },
]
