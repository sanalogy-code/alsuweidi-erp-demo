# Backend Plan — ALSUWEIDI ERP Production Migration

**Last updated:** 2026-07-02

This document outlines the roadmap from frontend-only proof-of-concept to a production system with real company data on-premises.

---

## Overview

**Current state:** Frontend-only demo (React + Cloudflare Pages, no backend, dummy data in JS files).

**Goal:** Real, secure, maintainable ERP on ALSUWEIDI's infrastructure with CRM → HR → Financials capabilities.

**Strategy:** Staged migration over 9+ months, with production data protected at every step. Same public-facing infrastructure model as the current ERP; different (modern, maintainable) stack.

---

## Phase 1: UI Validation (Current — July 2026)

**What:** Frontend-only proof-of-concept, gather feedback, validate workflows.

**Status:** Live at https://alsuweidi-erp-demo.pages.dev

**Stack:** React + Cloudflare Pages (no backend, no database).

**Data:** Dummy seed data in `frontend/src/data/*.js` (in-memory, reset on refresh).

**Audience:** Management, team leads, test users — "Is this the right UI before we build the real thing?"

**Duration:** Current phase, no hard end date.

**IT ask:** None yet.

---

## Phase 2: Real Backend (Q4 2026 — estimated 3–4 months from approval)

**What:** Production-ready system with real database, real auth, real RBAC, real data.

### Infrastructure

- **VM on ALSUWEIDI's existing virtualization** (VMware/Hyper-V/Proxmox — TBD with IT)
  - 4 cores, 16 GB RAM, 100 GB disk (scalable later)
  - Isolated from legacy PHP ERP, same public-facing model
  - Owned entirely by the new ERP (not shared)

- **Stack:**
  - **Database:** PostgreSQL (industry standard, well-supported)
  - **API:** Node.js or Python (TBD based on IT preference + team skills)
  - **Frontend:** Same React code, deployed to Cloudflare Pages (no change)
  - **Deployment:** Docker Compose (single `docker-compose.yml` file, reproducible, portable)

- **Hosting:** On-premises VM, public-facing (ports 80/443), same firewall rules as current ERP
- **Backups:** Encrypted, nightly, stored on NAS or secondary drive on-site

### Features

- **CRM:** All current features (Overview, Pipeline, Companies, Contacts, Tasks, Export) with real persistence
- **HR:** Onboarding checklist with real completion tracking
- **Auth:** Real login system (username/password, hashed+salted), role-based access control (RBAC) enforced server-side
- **Audit:** All changes logged (who, what, when) — required for compliance once financials are added

### Testing & Validation

**Staging environment:** Local machine or a cheap VPS you control (e.g., Hetzner $5/mo) — not IT's infrastructure.

Before any production data:

1. **Local dev** — `docker-compose.yml` on your machine, dummy data, fast iteration
2. **Staging** — Same docker-compose, same migrations, test data that mirrors production schema (fictional companies, contacts, deals, realistic volumes)
3. **Feature validation** — All workflows tested end-to-end (add/edit/delete, export, audit logs)
4. **Load testing** — Verify performance with realistic volumes (~10k contacts, ~5k deals)
5. **Security validation** — RBAC tested, audit logs verified, password hashing tested

### Deployment to Production

Once staging is validated, **you deploy yourself** via SSH:

```bash
# Simple one-liner deploy script
ssh prodvm "cd /app && git pull && docker-compose down && docker-compose up -d"
```

Or manually:
```bash
ssh prodvm
cd /app
git pull origin master
docker-compose down
docker-compose up -d
```

**Data migration (first time only):**
1. Export current ERP data (if porting existing contacts/companies)
2. Clean and normalize in a SQL script
3. Test import in your staging environment first
4. Run the same import script on production (via SSH)
5. Verify completeness before switching traffic

### IT Asks (Minimal, One-Time)

**Immediate (before Phase 2 starts):**
- Provision a VM: 4c / 16GB / 100GB (1–2 hours IT time, one-off cost)
- Give SSH key-based access to that VM (Sana will deploy herself)
- Open firewall ports 80/443 to the VM; no other ports public
- Set up nightly encrypted backups to on-site storage (NAS or secondary drive)

**That's it.** No "ask IT to deploy" workflow. No "IT manages updates." You own deployments via SSH.

**Optional (recommended but not required):**
- Monitoring: alerts if the app or database goes down (Sana can check SSH; IT can too if needed)

**Cost:** Minimal — VM is already their infrastructure, backups use existing storage, no new licenses.

### Security Model

#### What the AI (Claude) can do:
- Write and review API code against test/dummy data
- Design database schema and migration scripts
- Help debug issues (review error logs, not actual data)
- Validate architecture and workflows

#### What the AI cannot do:
- Access production database directly
- SSH into the production server
- See, read, or modify actual company/financial data
- Run migrations or schema changes live

#### How changes reach production:
1. **AI writes code** against dummy data (tested locally or in staging)
2. **Code review** of the logic and schema migrations
3. **Sana deploys** via SSH (`git pull && docker-compose up -d`)
4. **Audit log** in the app records all data changes (who changed what, when)

**Benefit:** Speed of development + full human control of deployments + no IT bottleneck.

#### Data protection specifics:
- All API endpoints enforce RBAC server-side (not hidden in the UI)
- Passwords hashed with bcrypt/argon2
- No credentials in code or git history (env vars only)
- Encrypted backups, encrypted in transit (HTTPS)
- Audit trail of every change to sensitive data (GDPR/compliance ready)

---

## Phase 3: Full Feature Set (2027+)

**What:** Projects, expanded HR, Financials (invoices, budgets, payroll), deeper integrations.

**Decision point:** After Phase 2 is stable and proven.

**Examples:**
- Won deals automatically become Projects with timeline, team, budget
- HR module: payroll, benefits, attendance tracking
- Financials: invoicing, expense tracking, budget vs. actual, dashboards

**IT ask:** Likely just "monitor and back up" — same infrastructure as Phase 2.

---

## Timeline & Go/No-Go Criteria

| Phase | Start | Duration | Go/No-Go Criteria |
|-------|-------|----------|-------------------|
| Phase 1 (current) | July 2026 | Ongoing | Management sign-off on UI; data model validated by real feedback |
| Phase 2 approval | TBD | 1–2 weeks | IT buy-in; budget approval for VM (if new hardware); PM assigned |
| Phase 2 development | TBD | 3–4 months | Staging validation passed; migration tested; security audit passed |
| Phase 2 go-live | TBD (Q4 2026 target) | 1–2 weeks | Production ready; backups verified; IT on-call; parallel run with old ERP optional |
| Phase 3 | 2027+ | TBD | Phase 2 stable; new features scoped and prioritized |

---

## What Does Success Look Like?

**Phase 2 success:**
- ✅ New ERP handling all CRM workflows (no data loss)
- ✅ Real login required (no cosmetic role dropdown)
- ✅ RBAC enforced (different users see different data)
- ✅ Audit log shows all changes
- ✅ Nightly encrypted backups verified (tested recovery at least once)
- ✅ Old ERP decommissioned or kept as read-only archive

**Phase 3 success:**
- ✅ Projects created automatically from Won deals
- ✅ HR workflows (onboarding, attendance) working end-to-end
- ✅ Financial data (invoices, budgets) tracked with full audit trail

---

## Key Decisions Already Made

- **On-premises, not cloud:** ALSUWEIDI's own infrastructure, no Supabase/Railway/etc. Same model as current ERP.
- **One modern stack, not legacy:** Docker Compose + Postgres + Node.js/Python, not bolted-on changes to the old PHP system.
- **AI helps, humans control data:** Claude Code accelerates development; humans apply changes and own the audit trail.
- **Staging before production:** All features validated against test data in a parallel environment; production data protected until go-live.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| IT buy-in delayed | Phase 2 pushes to 2027 | Start conversations now; show this plan; emphasize "same model as current ERP" |
| Data migration incomplete/lossy | New ERP has missing/corrupted data | Test migration in staging first; compare row counts; spot-check data; parallel run old + new for 2 weeks |
| RBAC not enforced server-side | Users see/access data they shouldn't | Design RBAC *before* Phase 2, test thoroughly in staging, code review before production |
| Backups fail | Data loss on hardware failure | Test backup/restore monthly; keep encrypted copies on separate physical media; document procedure |
| Forgotten credential still exposed | Old Supabase key grants access to old project | Rotate the key in Supabase dashboard (if project still exists); add to IT to-do immediately |

---

## Related Documents

- [SPEC.md](SPEC.md) — Technical spec for current UI
- [STATUS.md](STATUS.md) — Quick status of features built/pending
- [README.md](README.md) — How to run and deploy the frontend

---

## Questions for IT (to ask soon)

1. Can you provision a 4c/16GB/100GB VM for this project? (~1 hour, one-time)
2. Can I get SSH key-based access to that VM so I can deploy code myself?
3. Can you open firewall ports 80/443 to it? (No other ports need to be public.)
4. Can you set up nightly encrypted backups to on-site storage (NAS or secondary drive)? We'll handle everything else.
5. Optional: do you have monitoring set up for down servers/databases? (Not required, but nice to know if the app goes down.)
