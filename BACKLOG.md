# Backlog

The agreed to-do list. We work this in **batches** — pick a set, build, deploy, review — instead of
one-off small changes. Add items here as they come up; strike them when they ship.
`/erp` reads this at session start; `/update-erp` keeps it in sync after a session.

**Last updated:** 2026-07-03 (Batch 5 shipped: confidential-flag hardening, scannable queue
layouts, marketing portfolio search, line-manager timesheet approval, per-employee work-week
patterns. Earlier same day: Batches 3 & 4 — Marketing module + Timesheets.)

## Next batch (UI demo work, ready to build)

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
- [ ] **Company details fields** (3 Jul) — CRM companies get: website, head office location,
  size (employee band), relationship type (Client / Contractor / Developer / Partner /
  Subconsultant / Government…). Relationship type also answers the naming question below.
- [ ] **Subconsultant tracking** (3 Jul) — track subconsultants: what they do (disciplines),
  contacts/people, last worked with (per project), notes. Likely = CRM company with
  relationshipType 'Subconsultant' + a per-project link (which project, what scope, how did it
  go) rather than a separate module.
- [ ] **Lessons learned & notes** (3 Jul) — lessons learned per project (list on the project
  record); "keep in mind" notes on companies/clients/people (CRM + subconsultants). Same
  free-text + date + author shape everywhere.
- [x] ~~Timesheets~~ — **Shipped Batch 4 (3 Jul night):** My timesheet in HR (Sun–Sat week grid,
  hours per project code per day, draft/submit, resubmit after rejection), Timesheet approvals in
  HR workspace (queue with per-day breakdown, approve/reject with reason, missing-last-week list),
  payroll banner flags unsubmitted employees ("blocks WPS" per policy — real enforcement Phase 2).
  Home quick actions now deep-link (Fill Timesheet, Request Leave/Certificate, Hardware Request).
  PM/manager approval chain still a pending decision — HR approves for now.
- [ ] **Timesheets: faster entry** (3 Jul) — filling the week is fully manual today. Add
  faster paths: "copy last week" button, remember my usual projects, and/or a default row set
  per employee. (Sana: "employee to add manually — or if there is a faster way".)
- [x] ~~Timesheets: line-manager approval~~ — **Shipped Batch 5 (3 Jul):** anyone with direct
  reports gets a "Team timesheets" view (badge = team's submitted weeks) and approves their own
  team; HR's Timesheets view is now company-wide oversight showing who each week is awaiting
  ("awaiting <manager>", or "HR (no line manager)") and can still step in.
- [ ] **Timesheets: overhead codes & clearer labels** (3 Jul) — "Code" is unclear. Hours aren't
  always project-linked: expand the non-project buckets to real overhead categories (Admin, IT,
  Marketing, General, Leave, Training…) and label the column so nobody has to ask what a code is.
- [ ] **Timesheets: reminder + ERP lockout** (3 Jul — decision made) — if the week isn't filled,
  the employee gets a reminder on the **last working day of the week**, and their **ERP access is
  blocked** until the timesheet is submitted (demo: a blocking modal on login/navigation; real
  notification needs Phase 2 email/notifications).
- [ ] **New roles: IT and Admin staff** (3 Jul) — add an **IT** role (owns the IT & Assets
  workspace instead of piggybacking on HR/admin/management) and an **Admin staff** role (office
  administration — distinct from the current `admin` system role). Re-map workspace gating
  accordingly (`SENSITIVE_VIEW_ROLES` etc. — worth a small role-matrix pass so each workspace
  has an explicit owner role).
- [ ] **IT: add license** (3 Jul) — the license registry is read-only; assets already have "Add
  asset" but licenses need the same (name, vendor, seats, yearly cost, renewal date) so IT can
  register new subscriptions without a code change.
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

- [ ] **"Companies" naming** (3 Jul) — clients are rarely individuals, and companies aren't always
  clients (partners, subconsultants, contractors…). "Clients" doesn't fit either. Options:
  keep "Companies" + a prominent relationship-type field/filter, or rename to something neutral
  ("Organizations", "Directory"). Individuals-as-clients: allow a company record flagged
  `kind: individual`? Decide before the CRM relabel.

- [ ] **HR document review** — new employees upload documents in the self-service wizard; HR sees
  them in the review modal (read-only). But **can HR edit/delete/request re-upload if a document is
  wrong?** Decide the workflow.
- [ ] **Offboarding & payroll** — when offboarding is marked complete, does it auto-stop the
  employee's payroll deductions / final settlement? Or is that a separate Finance step?
- [ ] **Mid-month hires and "late pay"** — what happens when someone joins mid-month (e.g.,
  15th)? ALSUWEIDI has a concept called "late pay" — clarify: is that a payroll adjustment, a
  flag, or something else? How should the system handle pro-rated salary or holdbacks?
- [ ] **Login ↔ employee identity** — today "who am I" is matched by typing your exact full name at
  login. Works for a demo, but "My projects", leave balances, and self-service all hang off it.
  Decide the model (pick from employee list at login? invite codes?) — this also shapes the
  Phase 2 auth schema, so worth deciding early.
- [ ] **Manager role in leave approval** — currently HR-only, single-step. Original design says
  manager-first chains are Phase 2, but management may notice PMs can't see team leave at all.
  Decide: keep HR-only for the demo, or give managers a read-only team-leave view now?
- [ ] **CRM vs Bidding separation** — watch for this request when management reviews Phase 1.

## Future / TBD Scope (awaiting spec or prioritization)

- [ ] **Training & Development module** — employee learning paths, course catalog, training enrollment,
  completion tracking, certifications. Unclear how this integrates with accomplishments (CE credits?
  professional development). (Spec pending.)
- [ ] **Bonus pay** — one-time or recurring performance/referral/project bonuses. Unclear whether this
  lives in Payroll (monthly adjustment) or separate module (Compensation → Bonuses tab). (Spec pending.)
- [ ] **Evaluation system** — performance reviews, feedback cycles, review workflows (self → manager →
  HR review), rating models, competency mapping. Overlaps with Appraisals module. (Spec pending.)
- [ ] **Content calendar** — marketing/comms planning (posts, campaigns, milestones, publishing schedule,
  asset ownership, approval workflows). May tie to project timelines and news feed.
- [ ] **Marketing metrics & analytics** — campaign performance, portfolio engagement (views/downloads),
  proposal win/loss rates, content ROI tracking.

## Phase 2 (needs the real backend — don't attempt client-side)

- [ ] **Project Management module** — full projects with tasks, dates, assignments, late-flag,
  workflows. Depends on the PM role and project structure in the real system. (Mentioned 3 Jul.)
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
