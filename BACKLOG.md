# Backlog

The agreed to-do list. We work this in **batches** — pick a set, build, deploy, review — instead of
one-off small changes. Add items here as they come up; strike them when they ship.
`/erp` reads this at session start; `/update-erp` keeps it in sync after a session.

**Last updated:** 2026-07-03 (Batch 5 shipped: confidential-flag hardening, scannable queue
layouts, marketing portfolio search, line-manager timesheet approval, per-employee work-week
patterns. Earlier same day: Batches 3 & 4 — Marketing module + Timesheets. Since then: Sana's
review of Marketing added a large batch of new requirements (proposal builder removed in favor
of richer project fields + a real photo workflow, content calendar rework, CRM portfolio
downloads, branding overhaul, HR business card request, CRM Needs Follow-Up fix) and resolved
six of the seven open decisions below.)

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
- [ ] **Company details fields** (3 Jul, refined 3 Jul — decision made) — CRM companies get:
  website, head office location, size (employee band), and **relationship tags — multi-select,
  not a single type** (a company can be Client AND Supplier at once, e.g.). Add relationship
  tag(s) as a filter, plus filters based on the company's experience/main service (disciplines
  for subconsultants, or main business line generally). This closes the "Companies naming"
  decision below — name stays "Companies", the tag does the work a rename would have.
- [ ] **Subconsultant tracking** (3 Jul) — track subconsultants: what they do (disciplines),
  contacts/people, last worked with (per project), notes. = CRM company with a 'Subconsultant'
  relationship tag (see above, now multi-select) + a per-project link (which project, what
  scope, how did it go) rather than a separate module.
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

- [ ] **Remove Proposal Builder; move its fields onto the project record** (3 Jul — Sana's
  review) — "Portfolio + CV search is enough — the proposal builder doesn't work because this
  information needs to live in the actual documents, not a separate assembly tool." Remove the
  Proposal Builder tile/page entirely. Instead expand the **project record** with the richer
  fields Marketing actually needs: client, size, project value, location, year started, year
  completed, scope, description, and **images** (no image field exists today — file-name-only
  is fine, matching the Phase 2 storage placeholder pattern used elsewhere), plus a free-form
  **"special features" list** for anything project-specific and notable (number of students,
  number of beds, uptime %, or whatever else applies) — not a fixed schema, since this varies
  wildly by project type.
- [ ] **Project photo task becomes a real multi-step workflow, not one click** (3 Jul) — Today
  Marketing's inbox has a single "Approve photos" button. Replace with a small state machine:
  (1) arrange a photographer or an in-house Marketing person, (2) coordinate with the
  **Supervision team** so the shoot happens *before* the project is released/handed over,
  (3) photos taken, (4) photos reviewed, approved, and uploaded — only then is the task done.
  Ties into the completion gate already in place (SPEC.md §Marketing).
- [ ] **Content calendar: fixed channel set + copy/media as the primary fields** (3 Jul) —
  Channels are only **Website, LinkedIn, Email** (drop Instagram/Print/Event from
  `CONTENT_CHANNELS` in `marketingData.js`). Title becomes optional ("for reference" only) —
  the real content is the **copy** (text) and **media** (any attached image/asset); make those
  the fields that matter, not the title.
- [ ] **Content list view: structured columns, like the Batch 5 inbox rework** (3 Jul) — Sana
  liked the fixed-column alignment from Batch 5 (type chip / description / age / actions, status
  clearly stacked, quick actions aligned across rows). Apply that same treatment to the Content
  calendar's list view — and treat it as the **house style for any listed page going forward**
  (projects, inboxes, whatever), not a one-off.
- [ ] **Content calendar: custom date range view** (3 Jul) — add a From/To custom range option
  alongside the month view, matching the date-range selector already built for CRM
  Pipeline/Reports.
- [ ] **Campaigns** (3 Jul, tentative — needs scoping before building) — Sana: "perhaps we can
  plan and start a campaign too?" A lightweight grouping of coordinated content pieces under a
  campaign name/goal. Discuss shape with Sana before building blind.
- [ ] **CRM: downloadable portfolio PDFs by category** (3 Jul) — let CRM users download
  portfolio PDFs that Marketing has prepared and uploaded (not auto-generated). Organize by
  portfolio type — e.g. Education, Data Center, Mixed Use, Communities, Industrial — **and the
  type list must be extensible** (add a new category without a code change).
- [ ] **Branding: logo & font library overhaul** (3 Jul) — remove the Arabic logo asset.
  Logo variants needed: **Symbol, Primary, Vertical**, each in two-plus color versions. Add font
  assets: the Arabic font and the English font. Add a **quick-guidelines section** (candidate to
  become Branding's default/main view) covering when to use which logo variant, which font, and
  which colors. Add two new brand documents: **Brand Guidelines** and a **Platform + Narrative
  Guide**.
- [ ] **HR: add "Request business card" to self-service** (3 Jul) — new request type alongside
  leave/certificate/concern, same request→inbox→fulfil shape.
- [ ] **CRM: make the name clickable in "Needs Follow-Up"** (3 Jul) — today the contact's name in
  the Needs Follow-Up dashboard widget isn't a link, so there's no way to get their phone number
  from it. Make the name clickable, surfacing phone, email, company, and current project (if
  any) — presumably by opening the existing contact detail modal.
- [ ] **HR: documents get a real review status (edit + reject)** (3 Jul — decision resolved) —
  `DocumentChecklist` today is upload/remove only. Add a status per document (pending / verified
  / rejected) with a rejection reason that prompts re-upload, and let HR edit the record around
  it — same shape as the existing certificate/leave rejection flow.
- [ ] **Payroll cutoff on last working day** (3 Jul — decision resolved) — when an employee's
  last working day is set (offboarding), stop payroll after that date; calculate end-of-service
  settlement and anything else owed and fold it into **that month's** payroll run.
- [ ] **Mid-month hire "late pay" catch-up** (3 Jul — decision resolved) — auto-calculate the
  pro-rated salary percentage for the partial days worked in the joining month, and add that
  catch-up amount to the **next** month's payroll run (not the joining month itself).
- [ ] **Leave approval: manager first, then HR** (3 Jul — decision resolved) — two-step chain,
  same pattern as the line-manager timesheet approval from Batch 5 (`managerId`-derived team
  view). Supersedes the HR-only interim in `LeaveDashboard`/`HRInbox`.

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
