# Backlog

The agreed to-do list. We work this in **batches** — pick a set, build, deploy, review — instead of
one-off small changes. Add items here as they come up; strike them when they ship.
`/erp` reads this at session start; `/update-erp` keeps it in sync after a session.

**Last updated:** 2026-07-03 (evening — added questions from management review, PRO dashboard, project mgmt scope)

## Next batch (UI demo work, ready to build)

- [ ] **HR "Add employee" direct entry** — People view button for HR to register someone without
  self-service: same form as the new-joiner review, but with the employee-side fields editable by
  HR too. Required-documents rule still applies. (Gap found 3 Jul — currently the *only* way in is
  the new-hire wizard → HR Inbox.)
- [ ] **Projects: create / edit / advance** — a "New project" button inside the Projects module
  (direct award / tender, not only via won CRM deal), edit fields on the record, and a way to move
  a project through the 9-stage pipeline and update supervision %.
- [ ] **Employees see their own visa/passport/dependents** — add an `isSelf` exception to the
  sensitive-tab gating so self-service covers "when does my visa expire?". Compensation stays
  HR/management-only.
- [ ] **PRO dashboard & visibility** — right now PRO sees only its task queue. Add a dashboard
  showing task velocity (open/done per week), overdue tasks, and maybe client/project breakdowns
  so the PRO company can run itself. (Depends on decision: is PRO a separate tenant / org or just
  a role within ALSUWEIDI?)
- [ ] **Grade field decision** — the old form's Grade was dropped from the redesigned employee form
  (seniority covers the demo). If the company genuinely uses pay grades, add it back as an
  HR-side field. **Ask management which.**

## Needs a decision from Sana / management before building

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
- [ ] IT conversation for the Phase 2 VM (4c/16GB/100GB, firewall, backups, SSH for Sana)
