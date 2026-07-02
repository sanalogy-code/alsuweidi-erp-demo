# Build Stats

The "how long did this actually take" log — numbers pulled from git history, for sharing with management. Refreshed on each docs sync.

**As of:** 2 July 2026, end of day

## The headline

| | |
|---|---|
| **First commit** | 1 July 2026, 07:41 |
| **Three modules live (CRM + HR + Projects)** | 2 July 2026, 22:48 |
| **Elapsed time** | ~39 hours, across **2 working days** |
| **Commits** | 90 (30 on day one, 60 on day two) |
| **Deploys to the live site** | every push auto-deploys — ~90 |
| **App code** | ~7,100 lines across 35 components + 6 pages |
| **Infrastructure cost** | AED 0/month (Cloudflare Pages free tier, no servers, no licenses) |

## What got built in those 2 days

- **CRM module** — pipeline kanban with drag & drop, companies, contacts with two-tier taxonomy, tasks, interaction logging, filtered Excel/CSV export, date-filtered reports with download
- **HR module** — employee directory with full profiles (visa/passport/Emirates ID, dependents, compensation), org chart, leave with overlap calendar and balances, certificate requests with auto-generated English/Arabic letters, complaints (incl. anonymous), referrals & internal jobs, payroll with WPS workflow and payslips, attendance dashboard, public holidays feeding the home dashboard, renewals radar (visa/passport/contract/insurance expiries), onboarding checklist, employee self-service
- **Projects module** — the design & supervision portfolio, restructured from the old ERP's 40-column export into a filterable list + full project record with stage pipeline, discipline scope, approved-vs-actual progress, and role-gated financials
- **Role-based views** — employees, HR, and management each see different navigation and data
- **Home dashboard** — module launcher, announcements, holidays tile, build-number card

## The honest footnotes

- Day one included a full detour: a real backend (FastAPI + Supabase + Railway) was built, hit repeated deployment failures, and was deliberately scrapped just after midnight in favour of the frontend-only proof-of-concept. The 2-day figure *includes* that dead end.
- This is a UI demo on dummy data — no database, no persistence, cosmetic login. Phase 2 (real backend, RBAC, WPS integration, document storage) is the actual engineering project; see BACKEND_PLAN.md. The point of the 2 days: we now know exactly *what* to build before paying for it.
- Built by one person pair-programming with an AI assistant (Claude). The speed is the point — requirements were gathered by building working screens and reacting to them, not by writing spec documents.

## How to refresh these numbers

```
git rev-list --count HEAD                          # commits
git log --reverse --format=%ad --date=short | head -1   # first commit
git log --format=%ad --date=short | sort -u       # working days
find frontend/src -name "*.jsx" -o -name "*.js" | xargs wc -l   # LOC
```
