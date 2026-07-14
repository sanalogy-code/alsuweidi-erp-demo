# Backlog

The agreed to-do list. We work this in **batches** — pick a set, build, deploy, review — instead of
one-off small changes. Add items here as they come up; strike them when they ship.
`/erp` reads this at session start; `/update-erp` keeps it in sync after a session.

**Last updated:** 2026-07-14.

## Under consideration — task-based timesheets (Sana, 14 Jul 2026)

- [ ] **Task-based timesheet approval.** The company is considering evaluating timesheets
  by TASK rather than only by line manager: a person's tasks can sit under different
  supervisors, and the direct supervisor often doesn't know enough about a given task to
  judge the hours. Whoever supervises the task should approve that timesheet line. This is
  a known pattern (matrix / per-task approval — SAP CATS, Oracle Projects etc. do it).
  Implication: approval moves from one manager-per-week to per-line (or per-task-group)
  routing — each timesheet line routes to its task's supervisor (task `createdBy` / phase
  lead already exist as hooks, and task-hours→timesheet already links lines to tasks); the
  week is fully approved when all lines are. Needs a decision on the model first: who is a
  task's "supervisor" (assigner? phase lead?), what happens to lines with no task link
  (overhead codes → line manager?), and whether line-manager approval remains as a
  second/overall step.
- [ ] **Resource allocation per project TASK, not just per project.** The resource planner
  currently allocates person × project × week; the company may want allocations at the
  task level (person × task × week), so planned hours tie to specific pieces of work —
  which would also feed the task-based approval above and make plan-vs-actual comparable
  per task. Needs a decision on granularity (every task vs only major/phase-level tasks)
  before building.

## Next batch — from Sana's IA review (13 Jul 2026)

- [x] ~~HR: separate "my HR" from the HRMS properly~~ — **Shipped Batch 24 (14 Jul), grouping
  decided with Sana same day:** four sidebar sections — **Me** (My HR, My timesheet,
  My appraisal, Training, My requests, + new-hire profile/onboarding), **My team**
  (manager-only, unchanged views: team timesheets/leave/appraisals), **Company** (People,
  Careers — org-wide, visible to everyone), and the existing **HR Workspace** groups. No view
  keys changed, so Guide deep-links still land. Verified: manager login (Osama) sees all four
  sections with badges; plain employee (Priya/sales) sees only Me + Company.

Earlier: 2026-07-11 — **Batch 20 shipped: everything non-Phase-2 on this list.** The
entire code-quality consolidation section, all four good-to-have ideas, the PRO dashboard
default, and an individuals-as-clients default (needs sign-off) — see the struck sections
below. What remains open: decision items awaiting Sana/management (Campaigns scope, grades,
PRO tenant question, Financials/GL scoping, individuals sign-off, appraisal model), Phase 2
backend work, TBD-scope prioritization, and the standing non-code actions. Earlier: 2026-07-07 night — **THE EVERYTHING LIST below is BUILT.** Batches 16d +
18a–g shipped as one parallel sweep: punch drill-down; search/status/date-range on ~24 more
registers; the notifications center (bell + badge everywhere); global search (Ctrl+K); My Week
strip + management Company-KPI home with board-pack print; delegation-of-authority matrix +
visibility rules; and the full persona sweep — accountant (receipts/credit notes/per-expense
VAT/petty cash/payables + payment runs/retention/month-end close/audit trail), HR talent
(appraisals/training→accomplishments/disciplinary/exit interviews/headcount & attrition/
grades & bands), Marketing + BD (campaigns/content approval records/pack usage/events/awards;
bid-decision gate/tender checklists/bid cost/competitor register/debriefs), Office + IT
(meeting rooms/supplies/courier/vehicles + Salik/doc numbering; SLA timers/installed software/
maintenance/access requests/status board), PM-site (transmittals/RFIs/gate coordination/4.21
photo reports/safety log/quick daily entry). **Still genuinely open:** the "Needs a decision"
section below (default shapes are now on screen to react to), Phase 2 backend items, standing
non-code actions, and the code-quality consolidation batch. Earlier: Batches 17a–b — Sana's PM
visibility pass; **PM parked per Sana**. Earlier: Batch 8 shipped — Admin Center module: users, roles & permissions
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

## THE EVERYTHING LIST — persona sweep (7 Jul 2026, Sana's closing goal)

Sana's directive: *"become every employee of this company — everyone goes there to log, create,
report, notify… THINK OF EVERYTHING. Add what you can, log the rest."* Built same night: the 8
review-finding fixes, the accountant's working controls (create invoice + VAT + attachment,
record partial payments, log expenses with receipt photos, dedicated `finance` role), and the
global **Feedback button** (report a bug / request a feature from any page → Admin Center
"System feedback" queue). Everything below is the logged remainder, by persona:

**Accountant / Finance** — receipts register (payment date/reference/bank per receipt, allocate
one receipt across invoices); credit notes; per-expense VAT + non-recoverable categories;
petty-cash log with reconciliation; bank statement import + matching; supplier/payables ledger
(subconsultant invoices IN, approval → payment run); retention invoicing; chart of accounts +
journal entries (Phase 2 GL); month-end close checklist; audit trail on every financial edit.

**HR** — evaluations/appraisals (cycle, self → manager → HR, rating model — spec pending since
Batch 1); training & development (catalogue, enrollment, completion ↔ accomplishments); grades/
salary bands on the employee record (management answer still open); employment-type-driven
entitlements (probation/leave/EOS per type — partially exists in policy defaults); disciplinary/
warning letters register; exit-interview analytics; org-wide headcount & attrition dashboard.

**Marketing** — campaigns (still needs scoping); content approval chain with notifications;
asset usage tracking (which portfolio PDF went to which client); event/exhibition tracker;
award submissions register.

**BD / Bidding (sales)** — bid/no-bid workflow with sign-off (go/win scores exist, no approval
step); tender document checklist per RFP; bid cost tracking (hours via allocations + expenses);
competitor register (who we lose to, at what fee level); client feedback/debrief log per lost
RFP; pipeline staffing requests → HR Staff planning (already in Batch 16).

**Admin staff / Office (ODC)** — correspondence register (incoming/outgoing letters with ref
numbers — consultancies live by letter refs); meeting-room booking; office supplies requests;
courier/dispatch log; company vehicle bookings + Salik/fines; document numbering standards.

**IT** — incident SLA timers on the request queue; software deployment per asset (what's
installed where); preventive-maintenance schedule for site equipment; access-request workflow
tied to Admin roles (join/leave/move triggers); backup/system-status board.

**PMs / Engineers** — construction feedback register + full task management + task-hours→
timesheet (all Batch 16); drawing transmittal generation; RFI register (contractor questions,
distinct from WIRs); coordination checklists per discipline gate; photo-report builder for 4.21.

**Site / RE** — mobile-first daily report entry; offline capture (Phase 2); safety observation
log feeding HSE stats in 4.21 reports; manpower/plant count quick-entry.

**Management** — company-wide KPI home (utilization, win rate, receivables, project health in
one screen — pieces exist, no single view); delegation-of-authority matrix (who signs what, up
to what AED); board-pack export (PDF of the month's dashboards).

**Every employee** — notifications center (the single biggest cross-cutting gap: approvals,
mentions, deadlines — Phase 2 backend, but the in-app inbox UI could be Phase 1); global search;
personal dashboard ("my week": tasks + approvals + timesheet state across all modules — My Work
covers projects only); mobile layout audit.

**Platform / access (system admin)** — ~~per-user permission OVERRIDES~~ **shipped 7 Jul morning**
(Admin → Users → shield icon: module + view/full + optional expiry; enforcement = Phase 2 auth);
still open: grade/employment-type-aware visibility rules;
error logging + admin error console; usage analytics per module (mock exists); workflow builder
(generic request→approve→fulfil engine — today each module hand-rolls its own chain).

## Code review findings — 7 Jul 2026 — ✅ ALL 8 FIXED same night (goal sweep)

Fixes shipped: PmOverview fee card now gated to sensitive roles and jumps to a real phase view;
PM module reads live App timesheet state (PmDashboard, FeesView, resource planner); FeesView
labels hours project-wide against the summed budget; revenue forecast excludes drafts; WIR rev
bumps at resubmission (matching the button); Add-task collects a start date and full task shape;
Licenses state lifted to Admin.jsx; dead ResourcesView.jsx deleted. Remaining cleanup items
(shared todayISO/daysUntil helpers, memoization, shared bar/nav components) still open below.
Original findings, severity order: (1) PmOverview shows fee/invoiced AED to ALL roles
(gating leak — FeesView blocks the same data); (2) Overview "Fee invoiced" card jumps to a
non-existent project-level 'fees' view → blank pane; (3) PM module reads static TIMESHEETS seed,
not App's lifted state → session-submitted hours never reach Management/Fees/planner; (4)
FeesView counts project-wide hours against EACH phase's budget (double-count); (5) Revenue
forecast subtracts draft invoices that earned excludes; (6) WIR resubmit button advertises a rev
bump it doesn't perform; (7) waterfall Add-task omits startDate → invisible on the Gantt; (8)
LicensesView owns its own state → additions lost on tab switch. Cleanup batch: UTC `todayISO`
×8 copies (use a shared local-safe helper), duplicate `daysUntil` (UTC vs local semantics),
delete dead ResourcesView.jsx + allPmEntries, planner fragment key warning, NewProjectModal
missing studyType for Study/Advisory, memoize myWorkFor/dashboard/revenue rollups.

## Shipped — Batches 17a–b (7 Jul 2026, evening): Sana's PM visibility pass — PM parked after this

- [x] ~~Task visibility~~ — **Shipped 17a:** sortable aligned-column task TABLE (default lens on
  every Plan & tasks; assigned-to / assigned-by / due / status / priority columns, rows expand to
  the full card; `createdBy` recorded on new tasks) + project-level **All tasks** view (all phases,
  one table, search + filters).
- [x] ~~Risk report~~ — **Shipped 17a:** portfolio Risk report under Project Management (severity
  = P×I, worst project first, live/high-critical/realized/overdue-review cards) + a summary strip
  on each project's register.
- [x] ~~Meeting discussion notes~~ — **Shipped 17a:** free-text "what was discussed" on log +
  editable afterwards.
- [x] ~~Board is not a board~~ — **Shipped 17b:** real side-by-side To do / In progress / Done
  columns with compact cards (task board + sprint boards).
- [x] ~~Gantt relative dates~~ — **Shipped 17b:** month labels + gridlines; domain focused on the
  working window (achieved-long-ago milestones excluded from the scale).
- [x] ~~Waterfall vs sprints "choose at the beginning"~~ — **Shipped 17b:** methodology picked on
  the New-project form, fixed chip in the workspace, change behind a confirm.
- [x] ~~Management dashboard costs~~ — **Shipped 17b:** Labour-cost stat card + per-project
  Cost (est.) and Invoiced/fee (%) columns, sensitive roles only.
- [x] ~~Default demo login~~ — **Shipped 17b:** Samir Al Mazrouei / Management (sees every module
  + has real employee data; 28-Jun timesheet seeded submitted so no lockout mid-demo).
- Follow-up ideas logged, not agreed: same table treatment for My Work and meeting action items;
  per-person cost rates still Phase 2 (payroll link).

## Batch 16 — remaining (Sana's feedback, 6 Jul 2026 late night — PM parked, these wait)

- [x] ~~Construction feedback register~~ — **Shipped Batch 16b (7 Jul):** "Site feedback"
  section on supervision projects — issue type / issue-in / impact / description / reason /
  proposed improvement / reporter, workflow open → with design section → completed, and
  completed items push into the project's **Lessons** tab (verified end-to-end). Search +
  type filter + sidebar badge. Phase 2: route to a named design owner + notify.
- [x] ~~Full task management~~ — **Shipped Batch 16a (7 Jul):** subtasks (parent/child with own
  assignee/dates/status, nested on the board/sprint/backlog, parent % rolls up), dependencies
  (`dependsOn` → blocked chip, status locked until predecessors done, amber Gantt bars,
  add/remove on the card), milestone editor (add / edit forecast / mark achieved) on both
  waterfall and sprint plans. Demo: P-2688 Design → Plan & tasks.
- [x] ~~Task hours → timesheet~~ — **Shipped Batch 16a (7 Jul):** "Log hours" on any task writes
  into the assignee's weekly timesheet under the project code (draft/new weeks only —
  submitted/approved weeks are locked; external staff get a friendly no-timesheet note), posts
  an automatic progress note, and flows to the PM dashboards/DMR via live timesheet state.
  Verified end-to-end: 4h logged on a P-2688 task appeared in Kubba's HR timesheet.
- [x] ~~Staffing requests from the pipeline → HR Staff planning~~ — **Shipped Batch 16c (7 Jul):**
  "Request staffing" on any live RFP (role × count, needed-by, note — contingent on award) lands
  in an amber **Pipeline intake** queue at the top of HR Staff planning; HR accepts into the
  hiring plan (ref auto-set to "Pipeline: <RFP>", note marked contingent) or declines; handled
  requests collapse into a history. Verified both ends. Per Sana's correction: the resource
  planner remains hired-employees-only. Phase 2: on award, auto-flip contingent plan lines to
  the real project ref + notify the requester.
- [ ] **Attendance punch drill-down** — the Period report hid too much: expandable per-person
  per-day rows with In / Break / Resume / Out / Total (the punch columns from the screenshot),
  summary stays the default lens.
- [ ] **Basics pass: filters + date pickers everywhere** — audit every register/list for search,
  status filters, and date-range pickers (My Work, deliverables, WIRs, tasks, claims, dashboard,
  reviews…). Sana: "many things are missing basics."
- [ ] **Primavera P6 relationship (decided 7 Jul):** P6 stays the scheduling engine (client
  `.xer` mandates + contractor programme audit); the ERP is everything around the schedule. Do
  NOT rebuild CPM. Phase 2 integration: import P6 milestone/progress exports (.xer or Excel) to
  feed the ERP's milestones and S-curves instead of manual entry.

## Shipped — Batch 15 (6 Jul 2026, night): timesheet analytics, revenue reports, licensing

- [x] ~~Timesheet cost dashboard / Employee Efforts Review / revenue reports / licensing tracker~~ —
  **Shipped Batch 15 (6 Jul):** HR Timesheet insights (by project / person / overhead, hours-or-cost
  toggle) + Workload review (single workload index, work-week aware); Finance Revenue reports
  (earned × month from invoices, forecast spread, comparison bars — real forecasting needs
  Phase 2 billing milestones); Admin Registrations & licenses (expiry radar with notified owners,
  CFPE/ADCD 1-Sept gate + expired Dubai registration seeded; no passwords stored by design —
  secrets vault is Phase 2). Carried-forward hour balances and per-person cost rates need the
  Phase 2 backend/payroll link.

## Shipped — Batch 14 (6 Jul 2026, night): four current-ERP screens absorbed

- [x] ~~CMR / attendance report / RFP management / CDM allocation plan~~ — **Shipped Batch 14
  (6 Jul):** Sana shared four more screenshots of the current ERP with the instruction "pick up
  the information, not the design; name and place things sensibly." Result: **Project reviews**
  (Design weekly + Construction monthly lenses — CMR facts live in `phase.cmr`, everything else
  displayed from registers, not re-entered); **HR Attendance Period report** (summary row per
  person vs the 40-column punch grid); **CRM Proposals (RFPs)** register (linked to companies +
  delivery projects, go/win scores, bid workflow, win rate; `data/rfpData.js`); **Resources
  Months toggle** (monthly utilization from the same weekly allocations). Phase 2: punch-level
  drill-down, RFP document attachments + "repeat proposal from", per-person cost rates.

## Shipped — Batch 13 (6 Jul 2026, night): DMR — Design Management Report

- [x] ~~DMR equivalent~~ — **Shipped Batch 13 (6 Jul):** weekly Design Management Report view
  under Project Management, modeled on the company's existing DMR screen (Sana shared a
  screenshot): per-lead project rail with progress + HRS overrun flags, discipline hours vs R0
  estimate with red overrun percentages, financial waterfall (fee/earned/invoiced/received),
  profitability A–G block (salary cost from hours at an illustrative blended rate +
  sub-consultant accruals → P&L and margin), structured notes 1–5 composed live from the
  registers (weekly update / deliverables / permitting / risks+claims / fee stages & invoices).
  Real per-person cost rates (contract salary ÷ 196) need the Phase 2 payroll link.
  Demo: P-2688 runs 161% of estimated hours with margin squeezed to 8%.

## Shipped — Batch 12 (6 Jul 2026, night): resource planning + governance registers

- [x] ~~Resource planning + nice-to-have tier~~ — **Shipped Batch 12 (6 Jul):** person × week
  capacity heatmap (6 weeks forward, editable planned hours vs 40h capacity, over-allocation in
  red, timesheet hours alongside); risk register (P×I, owner, mitigation, realized→claim);
  meetings & actions (open actions feed My Work); IPC register (claimed vs certified, WIR basis);
  FIDIC handover chain (snags gate TOC → DLP → Performance Cert → retention). Remaining from
  PM_RESEARCH.md: cash-flow forecast, RACI matrix (both parked — build on request).

## Shipped — Batch 11 (6 Jul 2026, night): "proper project management" pass

- [x] ~~Proper PM system~~ — **Shipped Batch 11 (6 Jul):** Sana's second review round ("how is this
  anywhere near a full project management system?"): Projects split into **Project Management**
  (My Work / Management dashboard / Resources) and **Database** (Portfolio / Record stats);
  per-project **waterfall vs sprints** methodology — Gantt timeline (late-in-red bars, % fill,
  milestone diamonds, today line) vs sprint boards (goals, columns, backlog, start/close sprint);
  tasks carry start/due/effort-hours/% complete, all inline-editable; **management dashboard**
  with RAG health, progress, late tasks, next milestone + slip, SPI, hours-vs-budget; resources
  show real timesheet hours. Seeds: P-2688 runs design sprints, others waterfall.

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
- [x] ~~PRO dashboard & visibility~~ — **Default shipped Batch 20 (11 Jul):** PRO login now gets
  a dashboard above its queue — open/overdue/completed/avg-queue-age cards, created-vs-completed
  weekly velocity (6 wks), by-task-type breakdown; done tasks now stamp `doneDate`. Labelled
  on-screen as the role-within-ALSUWEIDI default — the separate-tenant question stays open.
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

## New good-to-have ideas — ✅ ALL SHIPPED (Batch 20, 11 Jul 2026)

- [x] ~~Auto-draft invoices from project events~~ — **Shipped Batch 20 (11 Jul):** creating a
  project (won deal or direct award) auto-creates a DRAFT mobilization invoice (10% of fee,
  5% VAT) in Financials; the accountant reviews/sends — nothing goes out automatically.
- [x] ~~Invoiced % on the project record~~ — **Shipped Batch 20 (11 Jul):** "Billing progress"
  block on the record's Financials tab (sensitive roles): fees invoiced (net, non-draft), % of
  contract value, progress bar — reads the LIVE lifted finance state.
- [x] ~~Receivables aging report~~ — shipped 7 Jul (Accountant view); Batch 20 added per-invoice
  credit-note netting to it.
- [x] ~~Payroll total feeds the P&L~~ — **Shipped Batch 20 (11 Jul):** P&L payroll line now
  computed from HR employee records (standing monthly gross = basic + allowances for active
  staff); per-month pro-rating stays in the HR payroll run, noted on screen.

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

- [ ] **Financials & Accounting scope** (4 Jul; narrowed 7 Jul) — receivables aging, client
  statements, and the VAT working paper **shipped 7 Jul** ("Accountant" view) after Sana's
  "doesn't work for an accountant" feedback — run these past the actual accountant. Still to
  decide/scope: chart of accounts + GL, receipts register (payment dates/references),
  per-expense VAT + non-recoverable categories, billing-milestone model, WPS/payroll → P&L,
  FTA filing calendar, and **who owns the module** (dedicated `finance` role?).
- [ ] **Individuals as CRM clients** (3 Jul) — **default built Batch 20 (11 Jul), needs
  sign-off:** company records can be flagged `kind: 'individual'` (toggle on the New-Client form,
  teal "Individual" chip in list/detail, website/size hidden; seed: Khalid Al Marzooqi, private
  villa). Same pipeline/contacts/deals. Confirm this is the wanted shape or adjust.

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

## Code quality — ✅ ALL SHIPPED (Batch 20, 11 Jul 2026)

- [x] ~~Shared `SidebarNav` component~~ — **Shipped Batch 20:** `components/SidebarNav.jsx`
  (groups, badges, footer note, width variant); CRM/HR/Projects/Finance/Marketing/IT/Admin/Office
  all use it. ProjectWorkspace keeps its structurally different phase-grouped sidebar.
- [x] ~~Shared date/currency helpers~~ — **Shipped Batch 20:** all ~60 inline
  `new Date().toISOString().slice(0,10)` sites swapped for `todayISO()`; `fmtShortDate` added to
  `utils/date.js` (the finance `fmtDate` ×5 copies now alias it); `daysUntil` is one local-safe
  copy in `utils/date.js` re-exported by pmData/crmData; GovernanceView/EventsView/RfpView use
  `fmtAED`.
- [x] ~~`nextId()` helper~~ — **Shipped Batch 20:** `utils/id.js`, ~36 hand-rolled max+1 sites
  swapped (both spellings).
- [x] ~~Shared `<RegisterFilterBar>` / `useRegisterFilter`~~ — **Shipped Batch 20:**
  `components/RegisterFilter.jsx` (text fields or extractor fns, date field, custom status
  predicate); SiteView + GovernanceViews' 4 copies + DeliverablesView (IIFE hoisted) refactored;
  `countBy` in HeadcountDashboard; `bidRecommendation` computed once per RfpView row.
- [x] ~~Finance state module-local~~ — **Shipped Batch 20:** `state/financeState.js` hook lifted
  to App — Home KPIs, PmDashboard, DMR/CMR, project workspace fees/overview and the record's new
  Billing progress all read the live session invoices/expenses.
- [x] ~~Per-invoice credit-note netting~~ — **Shipped Batch 20:** `invoiceOutstandingNet` +
  `creditNotesAgainst` in financeData; aging buckets and statement balances net linked CNs
  per invoice (unallocated CNs net the statement total); refunds against paid invoices = Phase 2 GL.
- [x] ~~One audit-log mechanism~~ — **Shipped Batch 20:** `state/auditLog.js` — canonical Admin
  shape `{ts, user, module, kind, detail}`; Finance actions record into it, Finance → Activity is
  the module filter, Admin → Activity log shows everything.
- [x] ~~Denied leave `approvedDate`~~ — **Shipped Batch 20:** decisions stamp `decidedDate`;
  `approvedBy/approvedDate` only set on approval, nulled on denial.

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
