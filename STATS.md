# Build Stats

The "how long did this actually take" log — numbers pulled from git history, for sharing with management. Refreshed on each docs sync.

**As of:** 4 July 2026, 9:30 PM

## The headline

| | |
|---|---|
| **First commit** | 1 July 2026, 07:41 |
| **Latest (Batch 8: Admin Center — users, roles & permissions, activity log)** | 4 July 2026, 9:28 PM |
| **Elapsed time** | ~86 hours, across **4 working days** |
| **Commits** | 115 |
| **Deploys to the live site** | every push auto-deploys — ~108 |
| **App code** | ~16,200 lines across 70 components + 10 pages |
| **Infrastructure cost** | AED 0/month (Cloudflare Pages free tier, no servers, no licenses) |

## What got built in those 4 days

- **CRM module** — pipeline kanban with drag & drop, companies, contacts with two-tier taxonomy, tasks, interaction logging, filtered Excel/CSV export, date-filtered reports with download
- **HR module** (expanded day 3) — employee directory with full profiles (visa/passport/Emirates ID, dependents, compensation), org chart, leave with overlap calendar and balances, certificate requests with auto-generated English/Arabic letters, complaints (incl. anonymous), referrals & internal jobs, payroll with WPS workflow and payslips, attendance dashboard, public holidays feeding the home dashboard, renewals radar (visa/passport/contract/insurance expiries), onboarding checklist, employee self-service; **PLUS 7 new features shipped day 3**: 
  - new-employee self-service wizard (4 steps: personal, qualifications, documents, bank/family) + HR review modal with auto-fill policy defaults (designation → dept/seniority/work-permit title; employment type → probation/notice/severance policy)
  - AED 500 referral gift auto-awarded when referred candidate hired, queued on payroll run
  - guaranteed post-probation salary increment (set at hire, applied after probation ends, surfaced on My HR 60-day warning card)
  - offboarding workflow with 8-item leaver checklist, exit interview notes, in-progress/completed states
  - PRO company role (government-services task queue isolation: visa/work-permit/EID tasks, no employee data access)
  - typed documents with required-document enforcement (new-joiner wizard, project LOA, custom upload types)
  - staff planning view (hires per project with needed-by dates, 45-day urgency flags, status tracking)
- **Projects module** — the design & supervision portfolio, restructured from the old ERP's 40-column export into a dashboard + filterable list + full project record with stage pipeline, discipline scope, approved-vs-actual progress, role-gated financials, typed documents (LOA required for project creation); day-3 Batch 2 added direct project creation, record editing, stage advancement, and supervision % updates
- **IT & Assets module** (day 3, Batch 2) — employee hardware/software requests with an approve→procure→fulfil queue, tagged asset registry with assignment and book values, software license radar with 60-day renewal flags
- **HR Batch 2 additions** (day 3) — direct "Add employee" entry for HR (shared form with the new-joiner review), and a self-service carve-out so every employee sees their own visa/passport/dependents and documents
- **Marketing module** (day 3, Batch 3) — cross-module task inbox (project descriptions, photo approvals, new-joiner headshots and welcome emails), content calendar with an approval workflow, portfolio-readiness view, proposal builder that auto-excludes confidential projects, CV search shared with HR, analytics with live win rate from CRM; plus a hard completion gate — projects can't close without Marketing's description + approved photography
- **Timesheets** (day 3, Batches 4–6) — weekly project-coded timesheet grid with draft/submit, copy-last-week fast entry, overhead codes, line-manager approval ("Team timesheets"), per-employee work-week patterns (Mon–Fri / Sun–Thu / Mon–Sat), a last-working-day reminder banner and a full-screen ERP lockout when last week is unsubmitted
- **Batch 5 polish** (day 3) — required confidentiality decision on project creation (blocks stage advance until decided), scannable fixed-column queue layouts across all inboxes, marketing portfolio search
- **Batch 6** (day 3 evening, 19 backlog items from Sana's Marketing review + resolved management decisions) — CRM company relationship tags/website/size/services with filters, subconsultant project history, "Keep in Mind" notes + project lessons, downloadable category portfolio PDFs (Marketing-managed, CRM-consumed); Proposal Builder removed in favour of richer project records (years, images, special features) ; 4-step photo workflow; content calendar rework (Website/LinkedIn/Email, copy+media primary); branding overhaul; business card requests; per-document review statuses with re-upload; payroll offboarding cutoff + end-of-service settlement and mid-month-hire catch-up; two-step leave approval (manager → HR); new IT + Admin-staff roles and an add-license form
- **Financials & Accounting** (day 4, Batch 7) — first-pass gated module: cash/receivables overview, invoices linked to projects and won deals, expenses with approvals, H1 P&L summary; deliberately demo-grade to start the scoping conversation with Finance
- **Admin Center** (day 4, Batch 8) — user accounts with add/edit/disable/delete and mock invitation flow, a role × module permissions matrix mirroring the app's real gating (the written Phase 2 RBAC spec, now visualized), a filterable audit-trail mock, and usage dashboards; the last "Coming Soon" tile is gone
- **Role-based views** — employees, HR, management, marketing, IT, admin staff, and PRO company each see different navigation and data
- **Home dashboard** — module launcher, announcements, holidays tile, build-number card; day 3 added probation-ending-soon card

## The honest footnotes

- Day one included a full detour: a real backend (FastAPI + Supabase + Railway) was built, hit repeated deployment failures, and was deliberately scrapped just after midnight in favour of the frontend-only proof-of-concept. The 4-day figure *includes* that dead end.
- Days 2–3 were management requirements gathering. Day 2 shipped CRM + base HR + Projects (portfolio) for initial review. Day 3 shipped 7 HR features (self-service registration, referral gifts, offboarding, PRO company access, typed documents, staff planning) based on requirements provided by management; management then reviewed Phase 1 and surfaced additional questions (document review workflows, offboarding payroll linkage, mid-month hire / late-pay handling, PRO dashboard scope, project-management module scope) — these are now in BACKLOG.md pending decisions.
- This is a UI demo on dummy data — no database, no persistence, cosmetic login. Phase 2 (real backend, RBAC, WPS integration, document storage) is the actual engineering project. The point of the 3 days: we now know exactly *what* to build and have gathered requirements by iterating on working screens, not by writing spec documents.
- Built by one person pair-programming with an AI assistant (Claude). The speed is the point — the ~86 hours invested proved the concept and surfaced enough detail to scope the backend project accurately.

## How to refresh these numbers

```
git rev-list --count HEAD                          # commits
git log --reverse --format=%ad --date=short | head -1   # first commit
git log --format=%ad --date=short | sort -u       # working days
find frontend/src -name "*.jsx" -o -name "*.js" | xargs wc -l   # LOC
```
