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
// Last reviewed: 2026-07-05 (Batch 8 — Admin Center).

export const DEV_LOG_UPDATED = '2026-07-05'

export const DEV_LOG = [
  {
    key: 'done',
    label: 'Done',
    accent: 'emerald',
    blurb: 'Shipped and live on the demo. Built in fast batches on real management feedback.',
    items: [
      { title: 'Batch 8 — Admin Center', detail: 'Users (add / edit role / disable / delete, mock invitation flow), role × module permissions matrix mirroring the real app gating (the Phase 2 RBAC spec, visualized), filterable audit-trail mock, usage dashboards. Last "Coming Soon" tile gone.', meta: '4 Jul 2026', status: 'shipped' },
      { title: 'Batch 7 — Financials & Accounting (first pass)', detail: 'New gated module: overview (cash, receivables, revenue by project type), invoices linked to projects, expenses with approvals, P&L summary. Demo-grade conversation starter.', meta: '4 Jul 2026', status: 'shipped' },
      { title: 'Batch 7 — Dashboard work log', detail: 'This presentable log, data-driven from devLogData.js.', meta: '4 Jul 2026', status: 'shipped' },
      { title: 'Batch 6 — 19 items across CRM / Marketing / HR / IT', detail: 'CRM company tags + subconsultant history + lessons/notes; Marketing proposal-builder removal, 4-step photo workflow, content calendar rework, branding overhaul; HR faster timesheets, overhead codes, reminder/lockout gate, business cards, document review, payroll offboarding + mid-month-hire catch-up, two-step leave approval; new IT + Admin-staff roles.', meta: '3 Jul 2026', status: 'shipped' },
      { title: 'Batch 5 — hardening + per-employee work weeks', detail: 'Confidentiality gate on stage advance, scannable queue layouts, line-manager timesheet approval, portfolio search, per-employee work-week patterns.', meta: '3 Jul 2026', status: 'shipped' },
      { title: 'Batches 3 & 4 — Marketing module + Timesheets', detail: 'Cross-module marketing inbox with a hard project-completion gate; weekly project-coded timesheet grid with approval queue and payroll hold flag.', meta: '3 Jul 2026', status: 'shipped' },
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
      { title: 'PRO dashboard & visibility', detail: 'Task velocity (open/done per week), overdue tasks, client/project breakdowns so the PRO company can run itself. (Shape depends on the tenant-vs-role decision.)', meta: 'agreed', status: 'to build' },
      { title: 'Grade field on the employee record', detail: 'Dropped in the redesign; add back as an HR-side field if the company uses pay grades.', meta: 'agreed', status: 'to build' },
      { title: 'Mandatory onboarding gate', detail: 'Force onboarding before anything else after first login. The UI half is doable client-side now; the invite-email half is Phase 2.', meta: 'agreed', status: 'to build' },
      { title: 'Shared SidebarNav component', detail: 'CRM / HR / Projects / IT / Marketing / Finance each hand-roll a near-identical sidebar that has started to drift.', meta: 'code quality', status: 'to build' },
      { title: 'Shared date & currency helpers', detail: 'AED formatters and short-date helpers exist in 6+ copies (now including Finance); consolidate into utils.', meta: 'code quality', status: 'to build' },
    ],
  },
  {
    key: 'decision',
    label: 'Needs a decision',
    accent: 'amber',
    blurb: 'Blocked on a call from Sana or management before they can be built.',
    items: [
      { title: 'Financials module scope', detail: 'This first pass is a conversation starter. Needs proper scoping with Sana/Finance: chart of accounts, VAT returns, billing milestones, WPS payroll integration, and who owns it (a finance role?).', meta: 'new — Batch 7', status: 'discuss' },
      { title: 'Campaigns (Marketing)', detail: 'Lightweight grouping of coordinated content under a campaign name/goal. Discuss shape before building blind.', meta: 'open', status: 'discuss' },
      { title: 'PRO — tenant or role?', detail: 'Is the PRO company a separate tenant/org, or just a role within ALSUWEIDI? Gates the PRO dashboard design.', meta: 'open', status: 'discuss' },
      { title: 'Individuals as CRM clients', detail: 'Allow an individual client as a company record flagged kind: individual, or handle another way?', meta: 'open', status: 'discuss' },
      { title: 'TBD scope priority', detail: 'Training & Development, Bonus pay, Evaluation system — which are Phase 2 MVP, which are post-MVP?', meta: 'open', status: 'discuss' },
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
      { title: 'Receivables aging report', detail: '30 / 60 / 90-day buckets on outstanding invoices — the number Finance actually chases.', meta: 'idea', status: 'nice-to-have' },
      { title: 'Payroll total feeds the P&L', detail: 'Pull the monthly WPS run total from HR straight into the P&L payroll line instead of a mock figure.', meta: 'idea', status: 'nice-to-have' },
      { title: 'Overdue / approval reminders on Home', detail: 'Surface overdue invoices and pending approvals on the home dashboard (once notifications exist).', meta: 'idea', status: 'nice-to-have' },
      { title: 'Global search', detail: 'One search box across projects, companies, contacts, employees.', meta: 'idea', status: 'nice-to-have' },
    ],
  },
  {
    key: 'phase2',
    label: 'Phase 2',
    accent: 'fuchsia',
    blurb: 'Needs the real backend — cannot be done in a frontend-only demo.',
    items: [
      { title: 'Real backend + persistence', detail: 'Postgres + API on an on-prem VM (Docker). Everything currently resets on refresh.', meta: 'Q4 2026', status: 'backend' },
      { title: 'RBAC enforced server-side', detail: "Today's role-gated UI is the written spec; real enforcement is auth + API-level filtering.", meta: 'Q4 2026', status: 'backend' },
      { title: 'Email & notifications', detail: 'Approval chains, reminders, invite links, welcome emails — needs a serverless function + provider.', meta: 'Q4 2026', status: 'backend' },
      { title: 'Document & media storage', detail: 'Uploads are file-name-only today (documents, project images, portfolio PDFs, brand assets).', meta: 'Q4 2026', status: 'backend' },
      { title: 'Real accounting integration', detail: 'Ledger, VAT returns, bank feed, WPS→P&L, reconciliation behind the Financials UI.', meta: 'Q4 2026', status: 'backend' },
      { title: 'Attendance device feed', detail: 'Fingerprint / card-reader integration + timesheet validation and real payroll blocking.', meta: 'Q4 2026', status: 'backend' },
      { title: 'Appraisals & Project Management modules', detail: 'Appraisals await a spec (cycle, reviewers, rating model); PM needs tasks/dates/assignments in the real system.', meta: 'Q4 2026+', status: 'backend' },
    ],
  },
]
