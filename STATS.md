# Build Stats

The "how long did this actually take" log — numbers pulled from git history, for sharing with management. Refreshed on each docs sync.

**As of:** 3 July 2026, 11:09 AM

## The headline

| | |
|---|---|
| **First commit** | 1 July 2026, 07:41 |
| **Phase 1 complete (CRM + HR + Projects)** | 3 July 2026, 11:08 |
| **Elapsed time** | ~75 hours, across **3 working days** |
| **Commits** | 98 (30 on day one, 40 on day two, 28 on day three) |
| **Deploys to the live site** | every push auto-deploys — ~98 |
| **App code** | ~8,400 lines across 57 components + 6 pages |
| **Infrastructure cost** | AED 0/month (Cloudflare Pages free tier, no servers, no licenses) |

## What got built in those 3 days

- **CRM module** — pipeline kanban with drag & drop, companies, contacts with two-tier taxonomy, tasks, interaction logging, filtered Excel/CSV export, date-filtered reports with download
- **HR module** (expanded day 3) — employee directory with full profiles (visa/passport/Emirates ID, dependents, compensation), org chart, leave with overlap calendar and balances, certificate requests with auto-generated English/Arabic letters, complaints (incl. anonymous), referrals & internal jobs, payroll with WPS workflow and payslips, attendance dashboard, public holidays feeding the home dashboard, renewals radar (visa/passport/contract/insurance expiries), onboarding checklist, employee self-service; **PLUS 7 new features shipped day 3**: 
  - new-employee self-service wizard (4 steps: personal, qualifications, documents, bank/family) + HR review modal with auto-fill policy defaults (designation → dept/seniority/work-permit title; employment type → probation/notice/severance policy)
  - AED 500 referral gift auto-awarded when referred candidate hired, queued on payroll run
  - guaranteed post-probation salary increment (set at hire, applied after probation ends, surfaced on My HR 60-day warning card)
  - offboarding workflow with 8-item leaver checklist, exit interview notes, in-progress/completed states
  - PRO company role (government-services task queue isolation: visa/work-permit/EID tasks, no employee data access)
  - typed documents with required-document enforcement (new-joiner wizard, project LOA, custom upload types)
  - staff planning view (hires per project with needed-by dates, 45-day urgency flags, status tracking)
- **Projects module** — the design & supervision portfolio, restructured from the old ERP's 40-column export into a filterable list + full project record with stage pipeline, discipline scope, approved-vs-actual progress, role-gated financials, typed documents (LOA required for project creation)
- **Role-based views** — employees, HR, management, and PRO company each see different navigation and data
- **Home dashboard** — module launcher, announcements, holidays tile, build-number card; day 3 added probation-ending-soon card

## The honest footnotes

- Day one included a full detour: a real backend (FastAPI + Supabase + Railway) was built, hit repeated deployment failures, and was deliberately scrapped just after midnight in favour of the frontend-only proof-of-concept. The 3-day figure *includes* that dead end.
- Days 2–3 were management requirements gathering. Day 2 shipped CRM + base HR + Projects (portfolio) for initial review. Day 3 shipped 7 HR features (self-service registration, referral gifts, offboarding, PRO company access, typed documents, staff planning) based on requirements provided by management; management then reviewed Phase 1 and surfaced additional questions (document review workflows, offboarding payroll linkage, mid-month hire / late-pay handling, PRO dashboard scope, project-management module scope) — these are now in BACKLOG.md pending decisions.
- This is a UI demo on dummy data — no database, no persistence, cosmetic login. Phase 2 (real backend, RBAC, WPS integration, document storage) is the actual engineering project. The point of the 3 days: we now know exactly *what* to build and have gathered requirements by iterating on working screens, not by writing spec documents.
- Built by one person pair-programming with an AI assistant (Claude). The speed is the point — the 75 hours invested proved the concept and surfaced enough detail to scope the backend project accurately.

## How to refresh these numbers

```
git rev-list --count HEAD                          # commits
git log --reverse --format=%ad --date=short | head -1   # first commit
git log --format=%ad --date=short | sort -u       # working days
find frontend/src -name "*.jsx" -o -name "*.js" | xargs wc -l   # LOC
```
