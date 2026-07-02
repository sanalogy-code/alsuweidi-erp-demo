# Status

Quick-read companion to [SPEC.md](SPEC.md) — same facts, faster to skim. SPEC.md is the detailed technical reference; this is "what's true right now."

**Last updated:** 2026-07-02

**Live**: https://alsuweidi-erp-demo.pages.dev — login with any name + a role from the dropdown (no password, nothing sent anywhere, purely local/dummy).

**Phase 1 Sprint**: 2-week sprint to finish CRM + HR before showing to management. See [SPRINT_PLAN.md](SPRINT_PLAN.md) for day-by-day breakdown (Days 1–14, starting 2026-07-02).

---

## The pivot (read this first if you're new here)

The original plan (FastAPI + React + Supabase, backend on Railway) hit repeated deployment failures — Supabase client crashes, Railway CMD/Dockerfile issues, Cloudflare cache problems. Scratched the backend entirely and built a **frontend-only UI proof-of-concept** first, to get management sign-off on look-and-feel before investing more engineering time in real infrastructure.

- No API calls, no database. All data lives in React state, seeded from `frontend/src/data/*.js`.
- Backend/database work isn't cancelled — it's deferred until the UI is validated. Eventual target is still self-hosting on the company's own server (not Supabase/Railway).
- This is deliberate, fast-iteration requirements gathering: building working UI and reacting to real feedback surfaces what a CRM/HR system actually needs faster than upfront spec-writing would. The one real risk flagged so far: no RBAC/permissions enforcement exists yet, and access control usually needs to be designed in rather than bolted on last — see SPEC.md §5.

## Documentation & source of truth

Everything about this project lives in **this GitHub repo** — no Google Drive dependency, no per-device sync setup needed. Clone it, open Claude Code there, and you have everything: code, SPEC.md, STATUS.md, and the `/erp` and `/update-erp` skills (in `.claude/skills/`).

The one thing that can't live in the repo: **WN (the ALSUWEIDI Knowledge Base Obsidian vault)**. That's a local desktop app tied to a specific work computer — reachable only when a session runs on that machine with Obsidian open and the vault active. Both skills try it and skip gracefully if it's not reachable.

## Current status

### ✅ CRM module
Tabs: **Overview → Pipeline → Companies → Contacts → Tasks**

- **Overview** — dashboard: stat cards + widgets (Needs Follow-Up, Reminders, Closing Soon, Top Clients, Pipeline by Stage)
- **Pipeline** — Kanban board by deal stage, drag-and-drop or dropdown to change stage
- **Companies** — list + detail drill-down (Contacts/Deals/Activity tabs), Activity tab shows real logged interactions
- **Contacts** — searchable directory; click a name for a full profile (`ContactDetailModal`): info, inline edit, linked deals, complete interaction history, quick actions. "Export" button opens a filtered export panel.
- **Tasks** — reconnect reminders tied to a contact, grouped Overdue/Due This Week/Later/Done
- **Contact Export** — dropdown filters (Company, Relationship, Sub-Type [cascades off Relationship], Seniority, Employment Type, Last Contacted) → live match count/preview → download as Excel or CSV, entirely client-side
- **Interaction logging** — "Log Interaction" opens a real form (type/note/date), feeds both the company Activity tab and each contact's full history

Two-tier contact taxonomy: `relationship` (Client, Prospect, Vendor/Supplier, Partner, Government/Regulator, Employee) + `subType` scoped per relationship, plus flat `seniority` (Entry→C-Suite) and `employmentType` enums. Full table in SPEC.md §2.

### ✅ HR module
Tabs: **Overview → Onboarding**

- **Overview** — basic stat cards, quick links (not yet functional), a call-out into onboarding
- **Onboarding** — 7 sections (reading/policy/how-to/video types), each with a completion checkbox, progress bar, and a final acknowledgement gate

### 📋 Not yet built (known gaps, roughly in priority order)
- **No RBAC/permissions enforcement** (role picker is cosmetic) — the one real architectural risk of the UI-first approach, see SPEC.md §5
- Won deals → actual Projects (explicitly deprioritized — "a little big" for now)
- Edit/delete on companies and deals (Contacts have edit; those don't yet)
- Email sending (needs a small backend + provider — structurally can't be done client-side)
- Global search, charts beyond Overview's simple bars, role-based filtered views

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
