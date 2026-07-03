# Backlog

The agreed to-do list. We work this in **batches** — pick a set, build, deploy, review — instead of
one-off small changes. Add items here as they come up; strike them when they ship.
`/erp` reads this at session start; `/update-erp` keeps it in sync after a session.

**Last updated:** 2026-07-03 (late night — Batch 3 shipped: Marketing module. New items captured
from Sana's review: confidential hardening, inbox layout, portfolio search, company fields,
subconsultants, lessons learned, timesheets. Note: "IT should add assets" — already exists,
IT workspace → Assets → Add asset.)

## Next batch (UI demo work, ready to build)

- [ ] **Confidential flag hardening** (3 Jul) — too easy to toggle from Marketing portfolio today.
  New workflow: the PM decides confidentiality when the project starts (required field on
  create/at first stage advance — **cannot advance without deciding**). Marketing sees the flag
  but changing it after that should be deliberate (confirm dialog at minimum).
- [ ] **Task/inbox row layout polish, all modules** (3 Jul) — HR inbox, Marketing inbox, IT queue,
  PRO tasks: nice design but hard to quickly scan type / age / action / description. Align into
  clearer columns (fixed-width type chip + description, right-aligned age + action) so the eye
  can run down each column.
- [ ] **Marketing portfolio search** (3 Jul) — filter/search by project TYPE / industry
  (mainFunction), size (built-up area bands), completion status, and scope — not just the current
  type/status dropdowns.
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
