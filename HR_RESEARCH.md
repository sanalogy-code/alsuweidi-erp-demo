# HR / HRMS Feature Landscape — Research & Gap Analysis

*Research date: 2026-07-06. Purpose: survey the full breadth of HR-module functionality found in market HRMS/HCM platforms (global + UAE/GCC), then map it against what the ALSUWEIDI ERP HR module already ships, so we can see what's missing and what might be worth building.*

---

## 1. How the market organizes HR functionality

Modern HRMS/HCM suites cluster features into four layers (Darwinbox, hrmsworld):

1. **Core HR** — the system of record: employee database, org structure, documents, self-service, leave, attendance, payroll.
2. **Strategic / Talent** — recruitment (ATS), onboarding, performance, learning, succession, compensation planning, workforce planning.
3. **Intelligence** — reporting, dashboards, analytics, predictive workforce insights.
4. **Experience** — self-service portals, engagement surveys, mobile, case/helpdesk, communications.

Our module today is very strong in **Core HR** and has good slices of **Talent** (ATS-lite Careers, onboarding) and **Experience** (self-service). The biggest white space is **Strategic (performance / learning / comp planning)** and **Intelligence (analytics)**.

---

## 2. Full market feature checklist vs. what we already have

Legend: ✅ shipped · 🟡 partial / mock · ❌ missing

### Core HR
| Feature | Status | Notes |
|---|---|---|
| Employee master data / records | ✅ | `EMPLOYEE` model, detail modal, dependents, passport/visa/EID |
| Org chart / reporting lines | ✅ | `OrgChart.jsx`, self-referential `managerId` |
| Employee self-service portal | ✅ | "My HR", My requests |
| Document management + expiry | ✅ | `DocumentChecklist`, typed docs, per-doc verify, Renewals report |
| Leave management + approvals | ✅ | Two-step manager→HR chain |
| Public holidays | ✅ | `HolidaysTab`, moon-sighting pending state |
| Time & attendance | 🟡 | Mock snapshot; **no real biometric/fingerprint feed, no geofenced check-in** |
| Timesheets | ✅ | Grid, copy-week, manager approval, lockout gate |
| Payroll processing | 🟡 | Illustrative; pro-rating + EOSB computed client-side |
| Certificates / HR letters | ✅ | 6 UAE letter types, bilingual, print-to-PDF |
| Offboarding | ✅ | Checklist, exit interview |
| Complaints / grievances | ✅ | Anonymous option, HR-only |

### Talent / Strategic
| Feature | Status | Notes |
|---|---|---|
| Recruitment / ATS | 🟡 | Careers tab: open roles, referrals, simple pipeline. **Missing: job requisition approval, candidate DB/CV parsing, interview scheduling, offer letters, careers site** |
| Onboarding workflow | 🟡 | New-joiner wizard + doc enforcement. **Missing: task/checklist orchestration across IT/Admin/manager, pre-boarding, 30/60/90 plans** |
| **Performance management** | ❌ | **No goals/OKRs, no appraisal cycles, no 360/peer review, no ratings, no continuous feedback / 1:1s, no PIPs** |
| **Learning & development (LMS)** | ❌ | **No courses, training records, certifications-with-renewal, compliance training, skills matrix** |
| **Succession & career pathing** | ❌ | No 9-box, talent pools, successor mapping |
| **Compensation planning** | ❌ | Probation increments exist, but no merit/bonus cycles, salary bands, pay-equity review |
| **Workforce planning / headcount** | ❌ | No budgeted vs actual headcount, position management, requisition-to-hire link |

### Intelligence
| Feature | Status | Notes |
|---|---|---|
| HR dashboards / analytics | 🟡 | Some stat cards. **Missing: headcount trends, turnover/attrition, time-to-hire, absence analytics, diversity, cost-per-head** |
| Custom reports / export | 🟡 | Renewals report exists; no general report builder / CSV-XLSX export layer |
| Predictive / AI insights | ❌ | Flight-risk, attrition prediction, sentiment — none |

### Experience
| Feature | Status | Notes |
|---|---|---|
| Requests / self-service | ✅ | Leave, certs, business cards, IT requests |
| **Notifications / approvals inbox** | ❌ | Approval chains exist but **nothing notifies anyone** (called out in SPEC as Phase 2) |
| **Employee engagement / pulse surveys** | ❌ | No eNPS, no survey tool |
| **HR helpdesk / case management** | 🟡 | Complaints only; no general ticketed HR case queue with SLAs |
| **Benefits administration** | ❌ | Dependent insurance is tracked as a document, but **no benefits enrollment, plan selection, provider mgmt** |
| **Expense / reimbursement claims** | ❌ | No expense claims, per-diem, mileage, approval + payroll feed |
| **Shift scheduling / rostering** | ❌ | Relevant for site-based staff; no shift planner, coverage, swap requests |
| Mobile app | ❌ | Web only |
| **Company policy / handbook / acknowledgements** | ❌ | No policy repository with read-and-sign tracking |
| **Asset ↔ HR link** | 🟡 | IT assets exist but not auto-linked to onboarding/offboarding |
| Announcements / comms / org news | ❌ | No internal comms feed |

---

## 3. UAE / GCC compliance-specific features (important for this client)

These are the localized capabilities that specialized UAE HRMS (Bayzat, ZenHR, gulfHR, Paylite, HR Chronicle, Darwinbox ME) treat as first-class, not add-ons:

| Feature | Status | Notes |
|---|---|---|
| End-of-service gratuity (EOSB) calculator | 🟡 | Computed client-side; not a rules-driven engine with contract-type + audit trail |
| **WPS file generation (SIF/EIF)** | ❌ | Wage Protection System bank file output — **core UAE payroll requirement, currently absent** |
| **GPSSA / ADPF pension contributions** | ❌ | UAE-national pension (post-2023 rates: 11% employee, 15% employer, AED 20k cap, Emiratisation-linked employer subsidy). Not modeled |
| **Emiratisation / Nafis tracking** | ❌ | No quota %, MoHRE target tracking, Emirati headcount ratio dashboard |
| MoHRE labour-contract / work-permit lifecycle | 🟡 | PRO tasks queue covers work permits/visas/EID manually; not tied to MoHRE contract data |
| Visa / EID / passport expiry tracking | ✅ | Renewals report (strong) |
| GCC multi-country payroll rules | ❌ | UAE-only assumptions today |
| Medical insurance mandate compliance | 🟡 | Insurance stored per dependent; no plan/renewal admin or DHA/DoH compliance view |

---

## 4. Prioritized gaps — what's most worth building next

**Tier 1 — high value, expected in any HRMS, natural fit for this client:**
1. **Performance management** (goal/OKR setting, annual appraisal cycle, manager review, ratings) — the single biggest missing pillar.
2. **Notifications / approvals** — makes the existing leave/timesheet/PRO chains actually work; small plumbing, large UX payoff.
3. **WPS + GPSSA + Emiratisation** — the UAE compliance trio that differentiates a "real" UAE HRMS from a generic one. High relevance to ALSUWEIDI.
4. **Expense / reimbursement claims** — common, self-contained, feeds payroll; fits the existing request/inbox pattern.

**Tier 2 — strong additions:**
5. **HR analytics dashboard** (headcount, turnover, absence, time-to-hire, expiries).
6. **Learning & training records** + certification renewals (engineering firm → PE/professional licenses already tracked as accomplishments; extend to CPD/training).
7. **Onboarding orchestration** (cross-department task checklist auto-assigning IT/Admin/manager).
8. **Company policies + read-and-sign** acknowledgements.

**Tier 3 — nice to have / scale-dependent:**
9. Engagement / pulse surveys (eNPS).
10. Shift scheduling for site-based staff.
11. Benefits administration (insurance enrollment).
12. Succession / 9-box, compensation-cycle planning.
13. Mobile app; general report builder/export.

---

## 5. Quick take

The module is already **broader than most SME HRMS in Core HR** and unusually strong on UAE document/visa lifecycle and PRO workflows. The two things that would most make it read as a *complete* HRMS to an evaluator are:

- **A Performance/Talent layer** (goals → review → rating → development), which is entirely absent, and
- **UAE payroll compliance depth** (WPS output, GPSSA pension, Emiratisation tracking), which is the local table-stakes that generic suites lack and that this client would specifically expect.

Everything else (notifications, expenses, analytics, LMS) is incremental and can layer onto the patterns already in place.

---

## Sources
- [Top HRMS Modules in 2026 — Darwinbox](https://darwinbox.com/blog/top-hr-modules)
- [The 16 most common HRMS modules & features — HRMS World](https://www.hrmsworld.com/16-most-common-hrms-modules.html)
- [9 Must-Have Modules in HRMS 2026 — Nitso](https://www.nitsotech.com/blog/9-must-have-modules-in-hrms-solution-2026/)
- [Top 15 HR Software in UAE (2026) — Tuscan](https://www.tuscan-me.com/blog/hr-software-uae-gcc.html)
- [HR Management Software UAE 2026: WPS & Emiratisation — UserHR](https://userhr.com/blog/hr-management-software-uae/)
- [Payroll Software UAE: WPS-Compliant Picks — Bolto](https://www.bolto.com/blog/payroll-software-uae-wps-compliant-guide)
- [GPSSA UAE Guide 2026 — Fastlane](https://www.fastlanecareer.com/blog/gpssa-uae-guide)
- [GPSSA & ADPF Pension — Zoho Payroll](https://www.zoho.com/en-ae/payroll/academy/compliance/gpssa-and-adpf-pension.html)
- [Best 360 Feedback / Performance tools 2026 — Betterworks](https://www.betterworks.com/magazine/best-360-degree-feedback-tools)
- [HR OKR Examples — Quantive](https://quantive.com/resources/articles/human-resources-okrs)
