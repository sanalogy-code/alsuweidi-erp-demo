# Project Management Module — Research Report

**Date:** 2026-07-05 · **For:** the full Projects/PM module (management OK received)
**Method:** two deep-research passes (209 agents total), each claim adversarially verified by 3 independent
reviewers (2/3 refutes kill a claim). Confidence levels below reflect that verification. Sections marked
**⚠ unverified** rest on general industry knowledge, not surviving verified claims — treat as
draft-until-confirmed.

**Build target:** Phase 1 client-side UI demo (like Financials/Admin), seed data, validating workflows
before the Phase 2 backend. This report is the "what mature tools do" baseline before we customize.

---

## 1. The three verified pillars

The research converged on three pillars — and explicitly **refuted** the idea that CPM scheduling is
the foundation everything else hangs off (1-2 vote against). Scheduling is one pillar among peers;
document control and cost control stand independently.

### Pillar A — Document-centric review workflows (Aconex/CDE model) — HIGH confidence
The essential backbone for a consultancy:
- **Document/deliverable register** — every document has a unique number + revision, searchable metadata
  (project, package, area, discipline, type).
- **Configurable review workflows** — sequential and/or parallel steps; markup consolidation from
  parallel reviews; reusable permission-gated **workflow templates** (who approves, in what order,
  what happens after approval).
- **Distinct roles** — workflow initiator, workflow administrator, step-assigned reviewers.
- **The same machinery serves both directions**: outgoing design deliverables *and* incoming
  contractor/supplier documents (shop drawings, material data, samples), with real-time
  cross-organization status tracking.
- Version control, audit trails, transmittals.

### Pillar B — Field & cost controls (Procore model) — HIGH/MEDIUM confidence
- RFIs, submittals, drawings, **daily logs**, mobile-first field capture.
- **NCR register** (verified in depth): reference no., date, receiving company, priority, location,
  status, predefined reason list, photos, non-conformance description, corrective action with
  acceptance dates; workflow option requiring **formal approval of corrective actions before closure**.
- Real-time budget tracking, change-order management, cost forecasting.
- **Progress tracking**: baseline-vs-actual comparison with delay flagging; EVM metrics —
  SPI = EV/PV (1.0 on schedule, <1.0 behind) per PMI/AACE; S-curves; schedule baselines.
- P6 remains the CPM scheduling reference (Gantt across projects/programs, dependency types,
  resource planning) but is weak on cost — mature setups pair P6-class scheduling with
  Procore-class cost/field tools. For our module: Gantt + baselines + planned/actual is enough;
  full CPM engine is not the anchor.

### Pillar C — FIDIC contract administration (the UAE-critical pillar) — HIGH confidence
This is what generic PM tools miss and what a UAE consultancy lives by:

**Claims/EOT register with deadline tracking (FIDIC 1999 Sub-Clause 20.1):**
- **28-day notice** from when the contractor became (or should have become) aware of the event —
  a **condition precedent**: miss it and the claim is extinguished (upheld by DIFC CA in
  *Panther v Modern Executive Systems* 2022 and the Privy Council in 2026).
- Fully particularised claim within **42 days**; Engineer response within **42 days**.
- **Monthly interim updates** for continuing events; final claim within 28 days of the end of effects.
- **Contemporary records** are mandatory (the Engineer may instruct they be extended) — the
  documentation trail is a contractual requirement, not good practice.
- **FIDIC 2017 changes** (medium confidence): fully detailed claim period extends to **84 days**;
  Employer claims run through the same unified Clause 20.2 procedure with the same time bars;
  a fully detailed claim has four defined elements — event description, contractual/legal basis,
  contemporary records relied on, quantified particulars → these are the claim-register fields.
  UAE practice still commonly uses 1999 forms, so **support both cadences**.
- **UAE civil-law nuance** (medium confidence): Civil Code doctrines — good faith (Art. 246),
  abuse of rights (Art. 106), unjust enrichment (Arts. 318-319), plus evolving Art. 816(3)
  commentary — can soften strict time bars where the employer was aware informally. Design
  implication: **log informal notices, correspondence, and awareness evidence**, not only formal
  submissions. (Practitioner commentary, not settled precedent.)

**Monthly progress reports (Sub-Clause 4.21, 1999; 4.20 in 2017):**
- Required contents: progress charts/descriptions per design & construction stage, photographs,
  manufacturing details, personnel and equipment counts, QA documents/test results, **lists of both
  parties' claims**, safety/environment statistics, planned-vs-actual comparisons.
- Covers each calendar month, submitted **within 7 days of month end**.
- Teeth: non-submission can entitle the Engineer to decline a Payment Certificate and blocks the
  contractor's suspension/termination rights → **report-compliance tracking matters**.

---

## 2. Design-consultancy workflows — HIGH confidence

- **Stage-gated design reviews**: milestone reviews commonly at **30-60-90% + final**, with
  cross-discipline coordination meetings at each gate (clash meetings around 60%). Maps to
  schematic design → design development → near-final coordination.
- **Per-discipline QA checklists** at each phase (AIA pattern): phase objectives, task checklists,
  deliverables, subdivided by discipline (management, program/costs, structural, MEP/FP, civil).
- Internal QA cycle **before** client submission; deliverable register tracks each document through
  internal review → client submission → comments → revision → resubmission (same Pillar A machinery).

## 3. Site-supervision field workflows

### WIR / MIR (verified in depth, MEDIUM confidence)
- **WIR lifecycle**: contractor initiates → contractor QA/QC review → document control logs/transmits →
  **resident engineer** review → consultant trade-engineer technical review → outcome one of
  **Approved / Approved as Noted / Resubmit**. Rejected items return to the contractor and are
  **resubmitted under the same WIR with history preserved** (rev A, B, C…).
- **WIR form**: checklist template aligned to project specifications, per-item spec references,
  inspection status, remarks; header carries location, drawing reference, requested inspection
  date/time.
- **MIR** (material inspection request): delivery/storage details, manufacturer info, verification
  checklist against delivered materials.
- **Payment link**: approved WIRs are the verification basis for work in monthly **interim payment
  certificates (IPCs)** against the BoQ; MIRs support materials-on-site certification.
  → **tie the WIR/MIR registers to IPC line items.**

### ⚠ Unverified but standard (no surviving claims — flag for validation with the supervision team)
- **Site instructions / Engineer's instructions register** — numbered instructions with cost/time
  impact flags feeding the variations register.
- **Material approval requests (MAR)** and **method statements** — same review machinery as submittals.
- **FIDIC handover chain**: substantial completion → snagging/punch list → **Taking-Over Certificate**
  → **Defects Liability Period** tracking (defect notifications, rectification) → **Performance
  Certificate** → release of retention.
- Daily/weekly site reports (manpower, plant, weather, work done, delays, visitors, HSE).

## 4. Consultancy fee & cost tracking (Deltek Vantagepoint = best-documented exemplar) — HIGH confidence

The professional-services model (distinct from construction cost control):
- **Dual rate views**: budgets at **cost rates, billing rates, or both**; project review shows budget,
  compensation, and job-to-date actuals valued at either rate. (Staff cost rate vs billing rate.)
- **Fee breakdown by phase/stage (WBS)**: total contract fee = sum of billing-phase amounts.
- **Progress**: manual **% complete per WBS element** (overall/labor/expense), **EAC/ETC** on the
  budget worksheet → budget-at-completion vs spent hours.
- **Fee/billing types**: fixed amount, **percentage-of-construction-cost**, unit price;
  percent-complete billing at project or phase level; **scheduled billing** auto-generating invoices
  from dates + % or amounts.
- **Pipeline** (BQE pattern, medium confidence): timesheet → WIP (approved time/expenses only, with
  write-up/write-down) → invoice → GL, no re-entry.
- **Our hooks already exist**: HR timesheets (project codes, approvals) → manhour actuals;
  Financials invoices → billing; project record fee fields → budgets. This pillar is mostly wiring.

## 5. Resource allocation, capacity & roles — ⚠ ENTIRELY UNVERIFIED
No claims survived verification in either pass. Standard practice (to validate against how ALSUWEIDI
actually staffs projects — arguably better sourced from Sana/management than the web):
- Cross-project workload/utilization views (heatmap: person × week, allocated vs capacity).
- Utilization & billability targets per role; discipline-based assignment (structural/arch/MEP leads).
- Typical role structure: Project Director → Design PM (DPM) / Construction PM (CPM) →
  discipline leads → engineers; supervision side: Resident Engineer → inspectors.
  (Matches our existing DPM/CPM fields.)
- RACI per deliverable/workflow step.

## 6. UAE authority approvals

### 6a. Abu Dhabi — PRIMARY jurisdiction (dedicated research pass, 2026-07-05, mostly HIGH confidence)

**Permitting hub: DMT/ADM.** Portals in transition — model the portal as a per-workflow text field:
- **Binaa** (launched June 2025): new AI/BIM-enabled submission platform integrating 15+ government
  entities; phased rollout, Phase 1 = private villas (~20,000 apps/yr). **MEPS** (meps.dmt.gov.ae)
  and **TAMM** remain the operative channels for other permit types. Which types flow through which
  portal will keep changing — keep it data, not code.

**ADCD fire & life safety — a distinct two-stage track** (medium confidence on package details):
1. **Design stage**: consultant of record submits fire/life-safety drawing package (architectural
   plans with fire ratings & travel distances; fire alarm, emergency lighting, exit signage, voice
   evac, firefighting, fire pump/tank riser diagrams; smoke control / LPG / facade packages *as
   applicable*) plus a declaration/undertaking letter. **Format gate**: non-conforming packages are
   rejected before technical review.
2. **Construction stage**: contractor shop-drawing approval.
3. **Completion**: ADCD inspection → **Certificate of Conformity with Preventive Safety Requirements**.
   Basis: NFPA-aligned UAE Fire Code + ADCD local amendments; digital channel is **HEMAYA**.
- **Hard licensing gate from 1 Sept 2026** (high confidence): ADCD will not accept preliminary
  fire-design submissions unless the consultancy is classified in Fire Protection & Life Safety
  Engineering and its registered engineer holds a valid **CFPE certification** →
  **directly relevant to ALSUWEIDI's licensing — flag as a standing action item.**

**Utility/ROW NOCs — four-step sequential ladder per authority** (high confidence):
**Notice of Intent → Preliminary Design NOC → Final Design NOC → Construction NOC** (only after
Final Design NOC). Crucially, **utility NOCs are prerequisite inputs to the construction permit,
not post-permit formalities** — the municipality issues the permit only after the consultant
collects them. Authority list (SAUP): TRANSCO, ADDC/AADC, ADSSC, GASCO/ADNOC, Etisalat, du,
Civil Defence, Abu Dhabi Police, EAD, Tabreed, Armed Forces Signal Corps, CICPA — triggered when
works affect reserved corridors. (NOI is now automated in the Common e-NOC platform; legacy
authority names map to DMT/ITC/ADM successors.)

**Estidama / Pearl Rating (PBRS) — gates the permit lifecycle at two points** (high confidence):
- **Pearl Design Rating** — awarded at end of construction documentation, linked to the building
  permit, valid only until construction completes.
- **Pearl Construction Rating** — verifies design commitments, linked to the completion certificate.
- Process: register development with Estidama (unique ID) → appoint a **Pearl Qualified
  Professional** (exam-certified, QA's and routes all submissions) → EIDP workshops → credit
  submissions → Pearl Assessor review (clarification requests, possible site verification).
- Floor: **1 Pearl** = all mandatory 'R' credits (private minimum); **2 Pearl minimum for
  government buildings**; 2/3/4/5 Pearl = +60/85/115/140 points.

**Special zones (KEZAD)** (high confidence): permits still route through DMT via MEPS accessed
through the **ATLP single window** with AD Ports Group — six stages: submission (appointment
letters from client & consultant, DPA, prerequisite external approvals) → early soil-test/prep
approvals → main review → decision → fee payment → permit issued with QR-coded certified drawings.

**Consultant classification (MeCS)** (high confidence): DMT's Classification & Occupation Division
administers firm classification via MeCS/MEPS (increasingly via TAMM); DED license data sets the
classification ceiling; review is a two-tier loop (First Reviewer: one return; Final Reviewer:
multiple returns; unlimited resubmissions); classification requires documented project experience
(contracts, BOQs, completion certificates) except entry categories.

**Not covered by verified claims** (model generically): ADGM's own building-regulation path,
Aldar/master-developer community approvals, EAD environmental permit specifics, demolition/
modification permit variants, and the ADM completion-certificate process itself.

### 6b. Dubai — secondary (MEDIUM confidence)

- **Dubai Municipality building permit**: registered **consultant of record** submits via the online
  **Building Permit System (BPS)**; DM/DDA design review issues comments; consultant revises and
  resubmits through the same portal → model an explicit **submit → comments → revise → resubmit loop
  per submission**, with revision history.
- **Building Completion Certificate (BCC)** is a **separate process** from the permit — issued after
  site inspections + final BPS submission. In DDA/Trakhees free zones the zone authority issues it
  instead of DM. → separate workflow stage.
- **Parallel NOCs** alongside the permit: **Dubai Civil Defence** (fire safety — required before
  permit *and again* before completion), **DEWA** (building/electrical NOC via DBPS), **RTA**
  (right-of-way via e-NOC portal). → parallel tracked workflows per authority.
- **Refuted — do not put in the spec**: specific review-cycle durations/SLAs, fixed prerequisite NOC
  chains, mandated milestone-inspection lists, "AI drawing validation" claims. Keep timelines as
  user-entered fields, not hardcoded rules.
- **Not covered by verified claims**: Abu Dhabi (DMT via TAMM, ADCD), Trakhees/DDA step-by-step, DCD
  process detail. Dubai's portal names may change under the Dubai BUILD consolidation.

## 7. Risk, meetings, communication — ⚠ largely unverified
Risk registers (probability × impact, owner, mitigation, review dates), meeting minutes with action
tracking (owner + due date + status, actions feeding the task list), stakeholder/communication logs.
Standard PMBOK/ISO 21500 practice; no tool-specific claims survived.

---

## 8. Feature map for our module — essential vs nice-to-have

### Essential (Phase 1 demo should show these)
| Area | Feature |
|---|---|
| Deliverables | Drawing/deliverable register: doc no., rev, discipline, status; review workflow (internal QA → client submission → comments → resubmit); transmittal log |
| Design stages | Stage gates (concept/schematic/DD/CD or 30-60-90) with per-discipline checklists and gate reviews |
| Supervision | WIR register (checklist form, RE → trade review, Approved/Approved-as-Noted/Resubmit, rev history); MIR register; NCR register (corrective action approved before closure); site instructions register; daily/weekly report log |
| Schedule | Milestones + Gantt-style plan, baseline vs actual, delay flags; planned-vs-actual S-curve; simple SPI |
| Tasks | Assignments, deadlines, dependencies-lite, overdue escalation (reuse house task patterns) |
| Cost/fees | Fee breakdown by stage; manhour budget vs timesheet actuals (hook to HR timesheets); % complete per stage; EAC; invoiced-vs-fee (hook to Financials); variations register |
| FIDIC/claims | Claims/EOT register with **notice-deadline countdown from event-awareness date** (28d), detailed-claim due (42/84d, both editions), monthly interim update reminders, status chain, contemporary-records/correspondence log incl. informal notices |
| Reporting | Monthly progress report checklist per FIDIC 4.21 contents + 7-day deadline tracker |
| Authorities | Per-project authority tracker, **Abu Dhabi-first**: building permit (DMT via Binaa/MEPS/TAMM — portal as data), ADCD fire track (design approval → shop drawings → Certificate of Conformity), per-authority NOC ladders (NOI → Prelim → Final → Construction NOC; permit blocked until NOCs collected), Estidama Design + Construction Ratings gating permit and completion, completion certificate — each a parallel workflow with submit→comments→resubmit cycle history. Dubai (BPS/DCD/DEWA/RTA/BCC) as the secondary emirate profile |
| People | Project team panel: PD, DPM/CPM, RE, discipline leads, inspectors (extends existing DPM/CPM links) |

### Nice-to-have (Phase 1 if cheap, else Phase 2)
Risk register; meeting minutes + action tracking; resource utilization heatmap across projects;
RACI matrix per project; payment-certificate (IPC) register with WIR linkage; snagging/handover
tracker (TOC → DLP → Performance Certificate); cash-flow forecast.

### Phase 2 (needs backend/real data)
Real CDE file storage & versioned uploads; cross-org portals (contractor submitting WIRs directly);
notifications on deadline countdowns (claims bar dates especially); EVM from real timesheet costs;
authority portal integrations; full CPM engine.

---

## 9. Validation decisions (Sana, 5 Jul 2026)
1. **Resource allocation** — wanted. Build the standard pattern (per-person workload across projects,
   utilization view, discipline leads); Sana corrects against real staffing practice once on screen.
2. **Abu Dhabi is the main focus** — most projects are there. Dedicated research pass done (§6a);
   Abu Dhabi is the primary authority profile, Dubai secondary.
3. **FIDIC handover chain & site-instruction registers** — use the standard pattern
   (TOC → DLP → Performance Certificate; numbered instruction register), refine later.
4. **FIDIC edition** — standard for now: per-project setting defaulting to **1999**.
5. **Authority timelines** — user-entered fields, never hardcoded (all such claims refuted anyway).

**Standing action item surfaced by research:** ADCD's CFPE mandate (1 Sept 2026) — verify ALSUWEIDI's
fire-safety classification and whether a registered engineer holds/needs CFPE certification.

## Key sources
Oracle Aconex official docs (workflows, supplier documents, NCR) · Procore product docs · Deltek
Vantagepoint official docs (budgets, EAC/ETC, fee billing) · BQE Core docs · FIDIC 1999/2017 texts via
Fenwick Elliott, Gowling WLG, Charles Russell Speechlys, FIDIC papers · CMCS (UAE PMWeb partner — NCR,
WIR/MIR, 4.21 reports) · NCHRP 20-68A (design milestone reviews) · AIA DD quality guide · Dubai
Municipality / Dubai BPS / DEWA official portals · PlanRadar, Quollnet (WIR corroboration).
