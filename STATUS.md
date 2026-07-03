# Status

Quick-read companion to [SPEC.md](SPEC.md) — same facts, faster to skim. SPEC.md is the detailed technical reference; this is "what's true right now."

**Last updated:** 2026-07-02 (late evening — Projects module live: portfolio + full project record)

**Live**: https://alsuweidi-erp-demo.pages.dev — login with any name + a role from the dropdown (no password, nothing sent anywhere, purely local/dummy). The role and the "I'm a new hire" checkbox change what you see — try `HR`, `Management`, and a plain `Sales` login to compare. The homepage shows a build number card so you can tell at a glance whether a deploy landed.

**Phase 1 Status:** Three modules live — CRM, full HR suite, and Projects (portfolio + record; dashboard next). Ready to show management. Real backend work starts after Phase 1 validation. For the "how long did this take" numbers to share with management, see [STATS.md](STATS.md) — headline: **2 working days, 90 commits, AED 0 infrastructure**.

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

Grouped sidebar matching HR's (replaced the six horizontal tabs): **Overview** top-level, **Sales** (Pipeline, Companies, Contacts), **My Work** (Tasks, with a badge counting open tasks due today or overdue), **Insights** (Reports).

- **Overview** — dashboard: stat cards + widgets (Needs Follow-Up, Reminders, Closing Soon, Top Clients, Pipeline by Stage)
- **Pipeline** — Kanban board by deal stage, drag-and-drop or dropdown to change stage. **Unified date range selector** (preset: All Time/This Year/This Quarter/This Month, or custom From/To date picker). Filters respond in real-time. Handles ISO dates, quarter format (2026-Q3), year format (2026). Edit/Delete buttons on each deal card.
- **Companies** — list + detail drill-down (Contacts/Deals/Activity tabs). Edit/Delete buttons with modals.
- **Contacts** — searchable directory; full profile modal (info, inline edit, linked deals, complete interaction history, quick actions). "Export" button opens filtered export panel.
- **Tasks** — reminders tied to a contact, grouped Overdue/Due This Week/Later/Done
- **Contact Export** — dropdown filters (Company, Relationship, Sub-Type [cascades], Seniority, Employment Type, Last Contacted) → live match count/preview → Excel or CSV export, entirely client-side
- **Interaction logging** — "Log Interaction" form (type/note/date), feeds company Activity tab + contact history
- **Reports** — **Redesigned:** Unified date range selector (same as Pipeline). Two simultaneous views: Monthly Breakdown (aggregated metrics) + All Deals list (individual rows). Company/Stage filters inline. One-click Excel download includes both views. Date filtering handles all formats (ISO, quarter, year).

Two-tier contact taxonomy: `relationship` + `subType` scoped per relationship, `seniority` (Entry→C-Suite), `employmentType` enums.

### ✅ HR module — COMPLETE (full suite, sidebar navigation)

Redesigned from 11 flat tabs into a **grouped sidebar with two lenses** — employees see self-service; HR staff get an "HR Workspace" group; management gets the workspace minus complaint handling.

**Everyone:**
- **My HR** — personal hub: leave balance, request-certificate / raise-a-concern cards, next approved public holiday, pending-request count. HR/management also see org stats and callout cards (inbox count, renewals due).
- **People** — directory with three views: searchable **List**, clickable **Org Chart** (built from manager links), **Accomplishments** search ("who has a PE license?"). Profile modal: Info + Accomplishments for everyone; **Visa & Dependents, Compensation, and Documents only for HR/Admin/Management**. Full passport/visa/Emirates ID per person and per dependent, dependent insurance, add-dependent form. Employees can add their own certificates/courses — flagged "Pending HR verification" until HR verifies.
- **My requests** — the employee's own leave + certificates + concerns in one filterable, status-chipped list.
- **Careers** — open positions with referral bonuses; refer a candidate or apply internally.
- **Onboarding** — only for logins that check "I'm a new hire". 7 sections + acknowledgement gate.

**HR Workspace (role-gated):**
- **Inbox** — one queue of everything waiting on HR (pending leave, certificate requests, open concerns, new candidates), oldest first, actioned inline. Recently issued letters below.
- **Leave planner** — month calendar of who's off with **same-team overlap warnings**, holiday/weekend shading, annual balances (30-day entitlement); plus full request history with approve/deny.
- **Renewals** — visas, passports, contracts, and dependent insurance expiring within 90 days or overdue — employees *and* dependents.
- **Attendance** — today's snapshot dashboard (office/site/leave/absent, check-ins, weekly hours). Fingerprint feed is Phase 2; layout is for sign-off.
- **Payroll** — monthly WPS run (basic + allowances + overtime − deductions), Draft → Generate SIF → Submitted → Paid workflow, payslip modal with estimated end-of-service gratuity.
- **Holidays** — HR approves/edits/adds public holidays (Islamic dates pending until moon sighting); approved ones appear automatically on every employee's home dashboard.

**Certificate letters:** six UAE letter types (salary, employment, salary transfer, NOC, embassy, experience) auto-drafted from the employee record in English/Arabic/bilingual — HR edits, prints to PDF on letterhead, letter saved on the request. Zoho Sign step is mocked pending Phase 2.

### ✅ Projects module — LIVE (portfolio + record; dashboard next)

Modeled on the structure of the company's existing ERP export (140 projects × 40 unreadable flat columns) but normalized — a project is one core record plus optional design and supervision sub-records, so the N/A noise is structurally gone. All 12 seed projects are invented.

- **Portfolio** — seven-column list (no, name + client, type, scope, stage, DPM/CPM, status) with type/scope/status/location filters and a "My projects" toggle
- **Project record** — 9-stage delivery pipeline as a visual strip; Design tab (discipline chips, CAD/BIM) and Supervision tab (approved vs actual % with behind-plan flag, late completion highlighted) only render where the project has that scope
- **Financials** — contract value, construction cost, design-fee disputes, payment statuses — **HR/Admin/Management only**, mirroring how the real export strips those columns
- **Cross-module links** — DPM/CPM open the HR profile; employers matching CRM companies are tagged "CRM client"

### 📋 Not yet built (known gaps, roughly in priority order)
- **RBAC is prototyped, not enforced** — the UI genuinely gates by role now (sensitive tabs, HR workspace), which doubles as the Phase 2 access-control spec, but it's client-side against a password-less login. Real enforcement (auth + API filtering) is the first backend job — see SPEC.md §5.
- **Leave approval is single-step** — approve/deny + overlap warnings exist; manager-first chains, notifications, and hard conflict blocking are Phase 2.
- **Attendance device feed + project timesheets** — dashboard is mocked; fingerprint/biometric integration and the weekly project-linked timesheet module (modeled on the current external system) need the backend.
- **Zoho Sign integration** (mocked), **document/CV storage** (placeholders), **appraisals** (awaiting spec — cycle, reviewers, rating model).
- Won deals → actual Projects (module now exists; the CRM handoff link is next on the list, after the projects dashboard)
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

## Standing security item (not yet resolved)

A Supabase **service_role secret key** was committed to `backend/populate_db.py` before the pivot, pushed to the public GitHub repo. Deleted from the working tree but still recoverable from git history (commit `6985c30`). **Needs rotating in the Supabase dashboard** regardless of whether Supabase gets used again — the key still grants live access to the real Supabase project, which holds real ALSUWEIDI client data. Not confirmed done as of this update.

---

## Tech stack

Frontend only — React + Vite + Tailwind + React Router + `lucide-react` + `xlsx` (SheetJS, lazy-loaded, installed from SheetJS's own CDN build rather than the flagged npm package). No backend, no database, no fetch calls anywhere.

**Hosting:** GitHub → Cloudflare Pages, auto-deploys on push to `master`.

**Local dev:** clone this repo to local disk on whatever machine you're working from. Don't work from a cloud-sync folder (Google Drive, OneDrive, etc.) if avoidable — virtual filesystems make `npm install`/`vite dev` unusably slow and can't be bridged to local disk via symlink/junction.

**Verifying changes:** `npm run build` locally → commit + push → compare the built JS bundle hash against the live URL to confirm Cloudflare's deploy landed.
