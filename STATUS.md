# Status

Quick-read companion to [SPEC.md](SPEC.md) — same facts, faster to skim. SPEC.md is the detailed technical reference; this is "what's true right now."

**Last updated:** 2026-07-02 (end of session)

**Live**: https://alsuweidi-erp-demo.pages.dev — login with any name + a role from the dropdown (no password, nothing sent anywhere, purely local/dummy).

**Phase 1 Status:** Feature-complete (CRM + HR). Ready to show management. Real backend work starts after Phase 1 validation.

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

### ✅ CRM module — COMPLETE
Tabs: **Overview → Pipeline → Companies → Contacts → Tasks → Reports**

- **Overview** — dashboard: stat cards + widgets (Needs Follow-Up, Reminders, Closing Soon, Top Clients, Pipeline by Stage)
- **Pipeline** — Kanban board by deal stage, drag-and-drop or dropdown to change stage. **NEW:** Time filters (This Month / This Quarter / This Year / All Time) update pipeline value + expected value dynamically. Edit/Delete buttons on each deal card (modal with inline editing).
- **Companies** — list + detail drill-down (Contacts/Deals/Activity tabs). **NEW:** Edit button (inline modal) to change name/industry/location/status; Delete button with confirmation.
- **Contacts** — searchable directory; full profile modal (info, inline edit, linked deals, complete interaction history, quick actions). "Export" button opens filtered export panel.
- **Tasks** — reconnect reminders tied to a contact, grouped Overdue/Due This Week/Later/Done
- **Contact Export** — dropdown filters (Company, Relationship, Sub-Type [cascades], Seniority, Employment Type, Last Contacted) → live match count/preview → Excel or CSV export, entirely client-side
- **Interaction logging** — "Log Interaction" form (type/note/date), feeds company Activity tab + contact history
- **Reports** — **NEW:** Monthly pipeline breakdown table (Pipeline Value, Expected/Weighted, Won Value, Deal Count). Summary cards: Total Pipeline, Total Expected, Total Won. For forecasting: "How much closes this month?" or "What's our Q3 pipeline?"

Two-tier contact taxonomy: `relationship` + `subType` scoped per relationship, `seniority` (Entry→C-Suite), `employmentType` enums.

### ✅ HR module — COMPLETE
Tabs: **Overview → Directory → Accomplishments → Leave → Onboarding**

- **Overview** — stat cards (total employees, departments, new hires), call-out to onboarding
- **Directory** — searchable employee list (name, title, dept, email, phone). **NEW:** Click name → full profile modal with tabs:
  - **Info tab:** employment details (title, dept, location, employment type, start date, tenure)
  - **Visa & Dependents tab:** visa status + expiry + sponsor + passport #; dependents list (name, relationship, DOB)
  - **Accomplishments tab:** searchable certifications (PE, BIM, Safety, etc.) with issuer, date issued, expiry
  - **Documents tab:** placeholder for Phase 2 (CV, certificates, passport uploads)
- **Accomplishments** — **NEW:** Global search across all employees. Filter by type (PE License, BIM Cert, Safety Induction, etc.). Shows "Who has a PE license?" or "Who's BIM certified?"
- **Leave** — Leave Requests form + list view (pending/approved/denied status). **NOTE:** Approval workflow deferred to Phase 2 (needs manager/HR dashboard).
- **Onboarding** — 7 sections (reading/policy/how-to/video), per-section checkbox + progress bar + final acknowledgement gate

### 📋 Not yet built (known gaps, roughly in priority order)
- **No RBAC/permissions enforcement** (role picker is cosmetic) — the one real architectural risk of the UI-first approach, see SPEC.md §5. Recommend filtering at API level in Phase 2 (Option 2: everyone sees limited info, HR/Admin see full details).
- **Leave approval workflow** (form is there, but no approval engine, manager dashboard, or conflict checking — too complex for Phase 1 without backend)
- **Attendance tracking** (fingerprint/card readers + timesheet — needs backend integration, skipped for Phase 1 demo)
- Won deals → actual Projects (explicitly deprioritized — "a little big" for now)
- Email sending (structurally can't be done client-side; needs serverless function + provider)
- Global search, role-based filtered views

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
