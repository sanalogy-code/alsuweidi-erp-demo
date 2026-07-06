# Backlog

The agreed to-do list. We work this in **batches** — pick a set, build, deploy, review — instead of
one-off small changes. Add items here as they come up; strike them when they ship.
`/erp` reads this at session start; `/update-erp` keeps it in sync after a session.

**Last updated:** 2026-07-05 (Batch 8 shipped — Admin Center module: users, roles & permissions
matrix, activity log. See "Shipped — Batch 8" below. Earlier: Batch 7 shipped — Financials &
Accounting module first pass +
Developer Dashboard work log. See "Shipped — Batch 7" below. Earlier: Batch 6 shipped — 19 items, nearly the whole "Next batch": CRM
company tags/details + subconsultant tracking + lessons & notes + clickable Needs Follow-Up +
portfolio PDF downloads; Marketing proposal-builder removal + richer project record + 4-step
photo workflow + content calendar rework + branding overhaul; HR/timesheets faster entry +
overhead codes + reminder/ERP lockout, business card requests, document review statuses,
payroll offboarding cutoff + mid-month-hire catch-up, two-step leave approval; new IT +
Admin-staff roles and IT add-license. Remaining in Next batch: PRO dashboard (needs decision),
Grade field (ask management), Campaigns (needs scoping). Earlier: Batch 5 shipped: confidential-flag hardening, scannable queue
layouts, marketing portfolio search, line-manager timesheet approval, per-employee work-week
patterns. Earlier same day: Batches 3 & 4 — Marketing module + Timesheets. Since then: Sana's
review of Marketing added a large batch of new requirements (proposal builder removed in favor
of richer project fields + a real photo workflow, content calendar rework, CRM portfolio
downloads, branding overhaul, HR business card request, CRM Needs Follow-Up fix) and resolved
six of the seven open decisions below.)

## Shipped — Batch 10 (6 Jul 2026, late evening): PM restructure from Sana's review

- [x] ~~PM module restructure~~ — **Shipped Batch 10 (6 Jul):** Sana's review comments on Batch 9,
  same evening: (1) **phase split** — design/supervision/study are separate engagements inside a
  project, each with own team/tasks/schedule/fees/weekly updates; (2) **My Work** default landing
  (my tasks + approvals waiting on me + deadlines, cross-project); (3) **real task management**
  (assignment, priority, checklists, progress notes, status columns); (4) **weekly progress
  updates** per phase; (5) **Study/Advisory scope** for TIS/surveying/feasibility (seed: P-2725);
  (6) click-through: project row → workspace, record card behind a "Details" button; PM state
  lifted to App.jsx.

## Shipped — Batch 9 (6 Jul 2026): Project Management module

- [x] ~~Full project management / project controls module~~ — **Shipped Batch 9 (6 Jul):** the whole
  essential feature map from [PM_RESEARCH.md](PM_RESEARCH.md) — per-project workspace at
  `/projects/:id` ("Project workspace" button on the record, scope-aware sidebar): deliverables
  register (rev history, internal QA → issue → comments → resubmit), 30-60-90 design gates,
  WIR/MIR/NCR/site-instructions/daily-reports registers (NCR closure gated on approved corrective
  action; WIR resubmits under the same ref), schedule S-curve + SPI + milestone slip flags, tasks,
  fees by stage (% complete, EAC, manhours vs timesheet actuals, invoiced-vs-fee from Financials,
  variations), FIDIC claims/EOT register (28-day-notice countdown from awareness, 42/84-day detailed
  claim per 1999/2017, contemporary-records log incl. informal notices), FIDIC 4.21 monthly report
  checklists, Abu Dhabi-first authority workflows (DMT permit, ADCD fire track, NOC ladders,
  Estidama; Dubai profile secondary), team panel, and a portfolio-level Resources allocation view.
  Data in `data/pmData.js`; seeds on projects 1, 2, 5, 8. Nice-to-haves deferred: risk register,
  meeting minutes, IPC/payment-certificate register (WIR-linked), snagging/handover (TOC → DLP →
  Performance Certificate), cash-flow forecast.
  **Standing action still open:** verify ALSUWEIDI's fire-safety classification and CFPE
  certification status (ADCD hard gate takes effect 1 Sept 2026).

## Next batch (UI demo work, ready to build — post-Batch 9)

- [x] ~~Confidential flag hardening~~ — **Shipped Batch 5 (3 Jul):** required Confidentiality
  decision on both create paths (direct + won-deal), stage advance blocked while undecided
  (decide-and-advance panel on the record; two seeds left undecided to demo it), overview shows
  the decision state, Marketing toggle now confirm-dialog-guarded.
- [x] ~~Task/inbox row layout polish, all modules~~ — **Shipped Batch 5 (3 Jul):** HR inbox,
  Marketing inbox, IT queue (mine + workspace), and PRO tasks all use fixed-width columns
  (type chip / description / right-aligned age / right-aligned actions); shared `daysAgo`
  helper added to `utils/date.js`.
- [x] ~~Marketing portfolio search~~ — **Shipped Batch 5 (3 Jul):** free-text search (name,
  client, description) + industry (mainFunction), built-up-area bands, scope, status, and
  readiness filters with a live "N of M" counter; scope now derives via shared `scopeOf()`
  in projectsData (seeds have no scope field).
- [x] ~~Company details fields~~ — **Shipped Batch 6 (3 Jul):** companies carry website, size
  (employee band), multi-select relationship tags (Client/Prospect/Subconsultant/Supplier/
  Partner/Government — Gulf Steel Fabrication seeds as Client + Supplier) and main services/
  disciplines; tag + service filters in the Companies list; edit modal covers all new fields.
  Name stays "Companies" — the tags do the work a rename would have.
- [x] ~~Subconsultant tracking~~ — **Shipped Batch 6 (3 Jul):** Subconsultant-tagged companies
  get a "Project History" tab (which project, scope/discipline, how it went, when) with an
  inline add form. Seeds: Apex Geotechnical Services and Lumina Lighting Studio.
- [x] ~~Lessons learned & notes~~ — **Shipped Batch 6 (3 Jul):** shared `NotesList` component
  (text + date + author, inline add) used for a Lessons tab on the project record and
  "Keep in Mind" notes on company detail and contact detail.
- [x] ~~Timesheets~~ — **Shipped Batch 4 (3 Jul night):** My timesheet in HR (Sun–Sat week grid,
  hours per project code per day, draft/submit, resubmit after rejection), Timesheet approvals in
  HR workspace (queue with per-day breakdown, approve/reject with reason, missing-last-week list),
  payroll banner flags unsubmitted employees ("blocks WPS" per policy — real enforcement Phase 2).
  Home quick actions now deep-link (Fill Timesheet, Request Leave/Certificate, Hardware Request).
  PM/manager approval chain still a pending decision — HR approves for now.
- [x] ~~Timesheets: faster entry~~ — **Shipped Batch 6 (3 Jul):** "Copy last week" button
  pre-fills rows + hours from the previous week, and a blank week defaults to your usual
  project rows (last week's codes, hours empty) so filling is one pass of numbers.
- [x] ~~Timesheets: line-manager approval~~ — **Shipped Batch 5 (3 Jul):** anyone with direct
  reports gets a "Team timesheets" view (badge = team's submitted weeks) and approves their own
  team; HR's Timesheets view is now company-wide oversight showing who each week is awaiting
  ("awaiting <manager>", or "HR (no line manager)") and can still step in.
- [x] ~~Timesheets: overhead codes & clearer labels~~ — **Shipped Batch 6 (3 Jul):**
  `OVERHEAD_CODES` (Admin, IT, Marketing, General, Leave, Training) replace the old three
  buckets; the column is now "Project / overhead" with an inline hint, matched in the
  approval breakdown.
- [x] ~~Timesheets: reminder + ERP lockout~~ — **Shipped Batch 6 (3 Jul):** app-level
  `TimesheetGate` — reminder banner on the employee's own last working day (work-week
  pattern aware) when this week isn't submitted; full-screen lockout modal on any page when
  *last* week is unsubmitted, with a "Fill timesheet now" deep link and a small "demo:
  dismiss" escape hatch. Applies only to logins mapping to an employee with timesheet
  history — demo the lockout with "Fatima Al Mansouri" (her last week is a stuck draft);
  the Friday reminder shows for e.g. "Osama Hussain".
- [x] ~~New roles: IT and Admin staff~~ — **Shipped Batch 6 (3 Jul):** `it` and `adminstaff`
  roles added; new `IT_VIEW_ROLES` (it/admin/management) owns the IT workspace — HR staff no
  longer piggyback; Admin staff kept to employee-level access (no HR-sensitive data); role →
  workspace matrix documented in `dashboardData.js`.
- [x] ~~IT: add license~~ — **Shipped Batch 6 (3 Jul):** "Add license" button + form on the
  license registry (name, vendor/owner, seats, yearly cost, renewal date), same pattern as
  Add asset; new licenses get the same 60-day renewal radar automatically.
- [x] ~~Work-week patterns on timesheets~~ — **Shipped Batch 5 (3 Jul):** `WORK_WEEK_PATTERNS`
  on the employee record (Mon–Fri company default, Sun–Thu Jordan office, Mon–Sat site 6-day),
  auto-defaulted from employment type on the employment form (location rule ready for when the
  form gets a location field). Timesheet grid, approval breakdown, and leave-calendar rows all
  shade the employee's own weekend. Seeds: Naseeb moved to Amman office (Sun–Thu), Samir on the
  site week; seed timesheet hours shifted to match.
- [ ] **PRO dashboard & visibility** — right now PRO sees only its task queue. Add a dashboard
  showing task velocity (open/done per week), overdue tasks, and maybe client/project breakdowns
  so the PRO company can run itself. (Depends on decision: is PRO a separate tenant / org or just
  a role within ALSUWEIDI?)
- [ ] **Grade field decision** — the old form's Grade was dropped from the redesigned employee form
  (seniority covers the demo). If the company genuinely uses pay grades, add it back as an
  HR-side field. **Ask management which.**

- [x] ~~Remove Proposal Builder; move its fields onto the project record~~ — **Shipped Batch 6
  (3 Jul):** ProposalBuilder deleted (tile + page). Project record gains year started/completed
  (derived from sub-records, overridable), images (file-name-only, Phase 2 storage pattern) and
  a free-form special-features list — visible on the record, editable in the Edit modal, and
  surfaced per portfolio-ready project in Marketing's Portfolio view.
- [x] ~~Project photo task becomes a real multi-step workflow~~ — **Shipped Batch 6 (3 Jul):**
  4-step state machine on the inbox task (arrange photographer [external/in-house modal] →
  coordinate with Supervision before handover → photos taken → reviewed/approved/uploaded);
  progress stored on the project (`photoWorkflow`); only the final step sets `photosApproved`
  and satisfies the completion gate. Seed: project 6 mid-flow.
- [x] ~~Content calendar: fixed channel set + copy/media as primary fields~~ — **Shipped
  Batch 6 (3 Jul):** channels are Website/LinkedIn/Email only; copy (textarea) + media
  (file-name) are the primary fields; title optional, "for reference".
- [x] ~~Content list view: structured columns~~ — **Shipped Batch 6 (3 Jul):** Batch 5 house
  style applied (type + status chips / description / right-aligned age / right-aligned actions).
  House-style rule for future listed pages stands.
- [x] ~~Content calendar: custom date range view~~ — **Shipped Batch 6 (3 Jul):** Month vs
  custom From/To range selector, following the CRM Pipeline/Reports pattern.
- [ ] **Campaigns** (3 Jul, tentative — needs scoping before building) — Sana: "perhaps we can
  plan and start a campaign too?" A lightweight grouping of coordinated content pieces under a
  campaign name/goal. Discuss shape with Sana before building blind.
- [x] ~~CRM: downloadable portfolio PDFs by category~~ — **Shipped Batch 6 (3 Jul):** Marketing
  manages "Portfolio packs" (category + file + date) in the Portfolio view; CRM gets a
  "Portfolio PDFs" entry under Insights, grouped by category (seeded: Education, Data Center,
  Mixed Use, Communities, Industrial; new categories typable — no code change). Downloads are
  demo stubs pending Phase 2 storage.
- [x] ~~Branding: logo & font library overhaul~~ — **Shipped Batch 6 (3 Jul):** Arabic logo
  removed; Symbol/Primary/Vertical logos in full-colour + reversed; Arabic + English font
  assets; "Quick guidelines" is now Branding's default view (logo/font/colour usage rules);
  Brand Guidelines + Platform & Narrative Guide documents added.
- [x] ~~HR: add "Request business card" to self-service~~ — **Shipped Batch 6 (3 Jul):** form
  (name/title as on card, mobile, notes) from My HR / My requests, tracked with status chips,
  HR inbox queue item with a "Mark printed & delivered" fulfil action. Seed: Naseeb Shaheen
  has one pending.
- [x] ~~CRM: make the name clickable in "Needs Follow-Up"~~ — **Shipped Batch 6 (3 Jul):** the
  name now opens the existing contact detail modal (phone, email, company, deals, history).
- [x] ~~HR: documents get a real review status (edit + reject)~~ — **Shipped Batch 6 (3 Jul):**
  per-document pending / verified / rejected chips in `DocumentChecklist`; HR (same gating as
  other HR edit rights) verifies or rejects with a reason; employees can re-upload rejected
  docs from their own profile. Seed: Priya Nair's degree certificate is rejected (illegible
  attestation) — demo as "Layla Al Mazrouei" (HR review) or "Priya Nair" (re-upload).
- [x] ~~Payroll cutoff on last working day~~ — **Shipped Batch 6 (3 Jul):** the final month is
  pro-rated to the last working day and the end-of-service settlement (gratuity estimate as of
  that day) folds into the same run with a "Final settlement" flag on row + payslip; after
  that month the employee drops off the run. Demo: August 2026 run, Ahmed El Haddad (LWD 14 Aug).
- [x] ~~Mid-month hire "late pay" catch-up~~ — **Shipped Batch 6 (3 Jul):** the joining month
  pays nothing (banner explains the deferral) and the pro-rated partial-month pay lands on the
  **next** run as a "Late pay catch-up (joining month)" line. Seed: Priya Nair now joins
  15 Jun 2026 — June run shows the deferral, July run the catch-up.
- [x] ~~Leave approval: manager first, then HR~~ — **Shipped Batch 6 (3 Jul):** two-step chain
  (`pending_manager` → `pending_hr` → approved) mirroring Batch 5 timesheet approvals; managers
  get a "Team leave" view + badge ("Approve → HR"), HR inbox shows only manager-approved or
  no-manager requests, and My requests shows "Awaiting manager (1/2)" / "Awaiting HR (2/2)".
  Demo: "Osama Hussain" (manager step for Hassan) then "Layla Al Mazrouei" (HR final).

## Shipped — Batch 8 (4 Jul 2026, evening)

- [x] ~~Admin Center module~~ — **Shipped Batch 8 (4 Jul):** new gated module (`/admin`, tile +
  `ADMIN_VIEW_ROLES = admin/management` in `data/adminData.js`) with sidebar nav: **Overview**
  (account stats, active users by role, mock 30-day module usage, needs-attention list, recent
  activity), **Users** (accounts seeded from the HR employees + Sana + PRO company + a pending
  invite — add user with mock invitation email, edit role, password reset, disable/enable,
  delete with "disable instead" advice), **Roles & permissions** (role × module matrix mirroring
  the app's real client-side gates — click-to-cycle — / View / Full, reset button; doubles as
  the Phase 2 RBAC spec), **Activity log** (filterable mock audit trail incl. access-denied).
  On-screen caveat: login stays password-less, so accounts are display-only until Phase 2 auth.
  Removed the now-unused ComingSoon page — every home tile is live.

## Shipped — Batch 7 (4 Jul 2026)

- [x] ~~Financials & Accounting module — first UI pass~~ — **Shipped Batch 7 (4 Jul):** new
  gated module (`/finance`, tile + `FINANCE_VIEW_ROLES = management/admin`) with sidebar nav:
  **Overview** (cash position, receivables/payables, overdue, revenue by project type, recent
  invoices), **Invoices** (client invoices linked to projects/deals — draft→sent→partially
  paid→paid→overdue, seed data, send/mark-paid actions), **Expenses** (categories, approval
  status, approve/reject), **P&L summary** (H1 2026 monthly breakdown + income statement +
  net trend). Seed data in `data/financeData.js`, tied to the Projects/CRM seeds (invoices bill
  against project consultancy fees; a couple trace to won deals). **Demo-grade — a conversation
  starter. Needs proper scoping with Sana/Finance (see Needs a decision below).**
- [x] ~~Developer Dashboard "log for show"~~ — **Shipped Batch 7 (4 Jul):** presentable,
  data-driven work log at the bottom of `/dev` — category tabs (Done / To do / Needs a decision /
  Good to have / Phase 2) with fixed-column rows, status chips and right-aligned dates. Data in
  `data/devLogData.js` (edit the data, not the JSX). For Sana to present from; she and Claude keep
  working from STATUS.md / BACKLOG.md.
- Code review (medium) over Batches 6–7 diff: **no confirmed correctness bugs** — batch is
  defensively coded (empty-array-safe `Math.max(0, …)`, `?? 0`, `|| []`, functional setState;
  ProposalBuilder deletion clean; all renamed exports consistently wired). Low-confidence
  candidates (stale-tab in CompaniesView, legacy `pending` leave bypass) were refuted against the
  actual code/seeds.

## New good-to-have ideas (noticed while building Financials — not yet agreed)

- [ ] **Auto-draft invoices from project events** — when a project hits a billing milestone (or a
  deal is won), auto-create a draft invoice in Financials, mirroring the won-deal → project →
  marketing-task wiring already in place.
- [ ] **Invoiced % on the project record** — surface fees invoiced vs contract value on each
  project so PMs see billing progress next to delivery progress.
- [ ] **Receivables aging report** — 30/60/90-day buckets on outstanding invoices (what Finance
  actually chases).
- [ ] **Payroll total feeds the P&L** — pull the monthly WPS run total from HR into the P&L
  payroll line instead of a mock figure.

## Shipped — Batch 2 (3 Jul 2026, night)

- [x] ~~HR "Add employee" direct entry~~ — People view button (HR staff only), same employment
  form as the new-joiner review (shared `EmploymentRecordFields`), personal side editable by HR,
  required documents enforced before the record can be created.
- [x] ~~Projects: create / edit / advance~~ — "New project" button (LOA still required), Edit modal
  on the record (financial fields only for sensitive roles), back/advance stage controls under the
  pipeline strip, and supervision approved/actual % updates inline.
- [x] ~~Employees see their own visa/passport/dependents~~ — `isSelf` carve-out on the Visa &
  Dependents and Documents tabs. Compensation stays HR/management-only. Verified: another
  employee's profile still shows only Info + Accomplishments.
- [x] ~~IT hardware/software requests~~ — new IT & Assets module (home tile + `/it`): everyone can
  raise requests; HR/admin/management get the workspace — request queue (approve → procure →
  fulfil / reject with reason), asset registry (tags, serials, values, assignment), and license
  radar (seats, yearly cost, 60-day renewal flags).

## Needs a decision from Sana / management before building

Six of the seven open questions were resolved 3 Jul — decisions captured here, the resulting
build work moved into **Next batch** (or **Phase 2** where the decision itself depends on the
real backend). Individuals-as-clients (`kind: individual` company records) is the one piece of
the naming question still open — folded into it below.

- [ ] **Financials & Accounting scope** (4 Jul, new) — the Batch 7 module is a **first-pass UI
  proof-of-concept / conversation starter only**. Needs proper scoping with Sana/Finance before
  building further: chart of accounts, VAT-return handling, billing-milestone model, WPS/payroll
  integration into the P&L, receivables/aging, and **who owns it** (add a dedicated `finance`
  role, or keep it management/admin?). Decide the real requirements before investing more.
- [ ] **Individuals as CRM clients** (3 Jul, split off from "Companies" naming) — the naming
  half is resolved (see Next batch: relationship tags, multi-select). Still open: should an
  individual client be allowed as a company record flagged `kind: individual`, or handled some
  other way? Decide before building.

### Resolved 3 Jul

- [x] ~~"Companies" naming~~ — **Decided:** keep the name "Companies". Add a **multi-select**
  relationship tag (a company can be Client *and* Supplier at once) plus filters on relationship
  tag and on experience/main service. See Next batch: Company details fields.
- [x] ~~HR document review~~ — **Decided: yes, HR can edit and reject** documents uploaded by
  employees. Today `DocumentChecklist` has no review status at all (upload/remove only) — build
  work: add a review status + rejection reason, matching the pattern already used for leave/cert
  rejections elsewhere in HR. → add to Next batch.
- [x] ~~Offboarding & payroll~~ — **Decided:** when a last working day is set, payroll cuts off
  after that date; end-of-service settlement and anything else owed gets calculated and folded
  into **that month's** payroll run (no separate off-cycle run, for now). → add to Next batch.
- [x] ~~Mid-month hires and "late pay"~~ — **Decided:** automatically calculate the pro-rated
  percentage of salary for the partial days worked in the starting month, and add that "late
  pay" catch-up amount onto the **next** payroll cycle (not the first partial month itself —
  deferred one cycle). → add to Next batch.
- [x] ~~Login ↔ employee identity~~ — **Decided:** when an employee record is created, send an
  automated email with a link to set a password — that becomes their login. From then,
  onboarding should be **mandatory before anything else** in the system. Note: the email-sending
  half needs the Phase 2 backend (already tracked under Phase 2 → Email/notifications); the
  "mandatory onboarding gate" UI could be attempted sooner as a client-side-only piece.
- [x] ~~Manager role in leave approval~~ — **Decided: yes** — manager approves first, then HR
  (two-step chain), mirroring the line-manager timesheet approval shipped in Batch 5. → add to
  Next batch.
- [x] ~~CRM vs Bidding separation~~ — **Decided: keep together for now.** No action.

## Future / TBD Scope (awaiting spec or prioritization)

- [ ] **Training & Development module** — employee learning paths, course catalog, training enrollment,
  completion tracking, certifications. Unclear how this integrates with accomplishments (CE credits?
  professional development). (Spec pending.)
- [ ] **Bonus pay** — one-time or recurring performance/referral/project bonuses. Unclear whether this
  lives in Payroll (monthly adjustment) or separate module (Compensation → Bonuses tab). (Spec pending.)
- [ ] **Evaluation system** — performance reviews, feedback cycles, review workflows (self → manager →
  HR review), rating models, competency mapping. Overlaps with Appraisals module. (Spec pending.)
- [ ] **Content calendar** — *stale — the content calendar itself shipped in Batch 3; the
  still-open pieces (campaigns, custom date range, channel/field rework) are now tracked
  individually in Next batch.* Leaving this line as a reminder of the original broader
  ambition (asset ownership, tying into project timelines / a news feed) in case it resurfaces.
- [ ] **Marketing metrics & analytics** — campaign performance, portfolio engagement (views/downloads),
  proposal win/loss rates, content ROI tracking.

## Phase 2 (needs the real backend — don't attempt client-side)

- [x] ~~Project Management module~~ — **superseded: the UI demo shipped in Batch 9 (6 Jul)**; what
  remains Phase 2 is persistence for the registers, deadline notifications (FIDIC notice windows
  especially), cross-org portals (contractor submitting WIRs directly), IPC linkage, real CDE
  file storage, and EVM from real timesheet costs.
- [ ] **Marketing module** — branding materials library (downloadable), portfolio management (projects
  with last-updated dates), project picker for proposals (auto-selected + manually curated),
  confidentiality flagging (mark projects as confidential → hide from portfolio or redact details),
  staff/org-chart export (CVs + headshots + possibly downloadable as slides). Media storage (photos,
  perspectives, variations) flagged as "uncertain scope" — can grow large quickly; decision pending.
- [ ] **Project photo workflows** — projects cannot be marked complete/closed without marketing
  approval and GOOD project photography (not site-engineer mobile snaps). Links to project closure
  state machine.
- [ ] RBAC enforced server-side (the UI gating is the spec)
- [ ] Real document storage (uploads are file-name-only today); photo/media storage for projects + marketing
- [ ] Attendance device feed + project-linked weekly timesheets
- [ ] Email/notifications, Zoho Sign integration, global search
- [ ] Appraisals module (awaiting spec: cycle, reviewers, rating model)

## Code quality (fold into any batch when touching those files)

- [ ] Shared `SidebarNav` component — CRM/HR/Projects each carry a near-identical copy that has
  already drifted
- [ ] Shared date/currency helpers — `fmtShortDate`, holiday-range formatting, AED formatting exist
  in 3–6 copies; `todayISO()` is UTC-based (pre-4am dates stamp yesterday) and re-derived per module
- [ ] `nextId()` helper — max+1 id generation is hand-rolled at ~10 call sites in two variants
- [ ] Denied leave requests get an `approvedDate` stamped — harmless today (nothing displays it),
  rename/split the field before anything does

## Standing items (not code)

- [x] ~~Rotate the leaked Supabase service_role key~~ — **RESOLVED 3 Jul 2026: Sana deleted the
  entire Supabase project.** The key still visible in git history (commit `6985c30`) is now inert —
  it points at a project that no longer exists.
- [ ] Show Phase 1 to management; collect feedback per module
- [x] ~~Clarify scope: was hardware procurement meant as Phase 1 gap or Phase 2 feature?~~ —
  **Answered 3 Jul: not intentional, should be there.** Moved to Next batch.
- [ ] IT conversation for the Phase 2 VM (4c/16GB/100GB, firewall, backups, SSH for Sana)
- [ ] Prioritize TBD scope items (Training & Development, Bonus pay, Evaluation system, Content
  calendar) — which are MVP for Phase 2, which are post-MVP?
