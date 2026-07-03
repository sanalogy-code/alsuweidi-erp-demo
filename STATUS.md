# Status

Quick-read companion to [SPEC.md](SPEC.md) — same facts, faster to skim. SPEC.md is the detailed technical reference; this is "what's true right now."

**Last updated:** 2026-07-03 (Batch 6 shipped — 19 backlog items across CRM, Marketing, HR/timesheets, and roles)

**Live**: https://alsuweidi-erp-demo.pages.dev — login with any name + a role from the dropdown (no password, nothing sent anywhere, purely local/dummy). The role and the "I'm a new hire" checkbox change what you see — try `HR`, `Management`, `IT`, and a plain `Sales` login to compare. The homepage shows a build number card so you can tell at a glance whether a deploy landed.

**Phase 1 Status:** Five modules live — CRM, full HR suite (incl. timesheets with manager approvals and a submission lockout), Projects (dashboard + portfolio + record), IT & Assets, and Marketing. Ready to show management. Real backend work starts after Phase 1 validation. For the "how long did this take" numbers to share with management, see [STATS.md](STATS.md).

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

### ✅ Projects module — LIVE (dashboard + portfolio + record)

**New in Batch 2:** "New project" button for direct awards/tenders (LOA attachment still required — same rule as the won-deal path), an Edit modal on the record (financial fields visible only to sensitive roles), stage back/advance controls under the pipeline strip, and inline supervision approved/actual % updates.

**New in Batch 3:** Marketing sign-off panel on every record (description + photos status), and the completion gate — Completed is blocked until Marketing signs off, with the missing tasks auto-queued.

**New in Batch 6:** richer portfolio fields on the record — years started/completed (derived from design/supervision, overridable), images (file-name-only), special features — plus a **Lessons** tab (lessons-learned notes) and the photo workflow state.

Modeled on the structure of the company's existing ERP export (140 projects × 40 unreadable flat columns) but normalized — a project is one core record plus optional design and supervision sub-records, so the N/A noise is structurally gone. All 12 seed projects are invented.

- **Portfolio** — seven-column list (no, name + client, type, scope, stage, DPM/CPM, status) with type/scope/status/location filters and a "My projects" toggle
- **Project record** — 9-stage delivery pipeline as a visual strip; Design tab (discipline chips, CAD/BIM) and Supervision tab (approved vs actual % with behind-plan flag, late completion highlighted) only render where the project has that scope
- **Financials** — contract value, construction cost, design-fee disputes, payment statuses — **HR/Admin/Management only**, mirroring how the real export strips those columns
- **Cross-module links** — DPM/CPM open the HR profile; employers matching CRM companies are tagged "CRM client"

### 📋 Not yet built (known gaps, roughly in priority order)
- **RBAC is prototyped, not enforced** — the UI genuinely gates by role now (sensitive tabs, HR workspace), which doubles as the Phase 2 access-control spec, but it's client-side against a password-less login. Real enforcement (auth + API filtering) is the first backend job — see SPEC.md §5.
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
