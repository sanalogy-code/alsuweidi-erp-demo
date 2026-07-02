# Build Stats

The "how long did this actually take" log — numbers pulled from git history, for sharing with management. Refreshed on each docs sync.

**As of:** 2 July 2026, end of day

## The headline

| | |
|---|---|
| **First commit** | 1 July 2026, 07:41 |
| **Feature-complete demo** | 2 July 2026, 22:07 |
| **Elapsed time** | ~38 hours, across **2 working days** |
| **Commits** | 86 (30 on day one, 56 on day two) |
| **Deploys to the live site** | every push auto-deploys — ~86 |
| **App code** | ~6,500 lines across 32 components + 5 pages |
| **Infrastructure cost** | AED 0/month (Cloudflare Pages free tier, no servers, no licenses) |

## What got built in those 2 days

- **CRM module** — pipeline kanban with drag & drop, companies, contacts with two-tier taxonomy, tasks, interaction logging, filtered Excel/CSV export, date-filtered reports with download
- **HR module** — employee directory with full profiles (visa/passport/Emirates ID, dependents, compensation), org chart, leave with overlap calendar and balances, certificate requests with auto-generated English/Arabic letters, complaints (incl. anonymous), referrals & internal jobs, payroll with WPS workflow and payslips, attendance dashboard, public holidays feeding the home dashboard, renewals radar (visa/passport/contract/insurance expiries), onboarding checklist, employee self-service
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
