// Project Management / project controls — dummy data for the Phase 1 UI demo.
// Built from PM_RESEARCH.md (5 Jul 2026): document-centric review workflows (Aconex
// model), field & cost controls (Procore model), and FIDIC contract administration —
// the UAE-critical pillar generic PM tools miss. All registers are per-project,
// keyed by projectsData PROJECTS id. Everything is invented seed data.
//
// Validation decisions baked in (PM_RESEARCH.md §9):
//   - FIDIC edition is a per-project setting defaulting to 1999
//   - Abu Dhabi is the primary authority profile, Dubai secondary
//   - authority timelines are user-entered fields, never hardcoded rules
//   - resource allocation uses the standard pattern, to be corrected on screen

import { parseLocalDate, todayLocal } from '../utils/date'

// --- FIDIC editions -------------------------------------------------------------
// 1999: notice 28d from awareness (condition precedent), fully particularised claim
// 42d. 2017: detailed claim extends to 84d; Employer claims share Clause 20.2.
export const FIDIC_EDITIONS = [
  { key: '1999', label: 'FIDIC 1999 Red Book', noticeDays: 28, detailedClaimDays: 42 },
  { key: '2017', label: 'FIDIC 2017 Red Book', noticeDays: 28, detailedClaimDays: 84 },
]
export const fidicOf = (key) => FIDIC_EDITIONS.find((e) => e.key === key) || FIDIC_EDITIONS[0]

// --- Shared status vocabularies --------------------------------------------------
export const DELIVERABLE_STATUSES = [
  { key: 'draft', label: 'Draft', chip: 'bg-gray-100 text-gray-600' },
  { key: 'internal_review', label: 'Internal QA', chip: 'bg-purple-100 text-purple-700' },
  { key: 'issued', label: 'Issued to client', chip: 'bg-blue-100 text-blue-700' },
  { key: 'comments', label: 'Client comments', chip: 'bg-amber-100 text-amber-700' },
  { key: 'revising', label: 'Revising', chip: 'bg-orange-100 text-orange-700' },
  { key: 'approved', label: 'Approved', chip: 'bg-green-100 text-green-700' },
  { key: 'approved_as_noted', label: 'Approved as noted', chip: 'bg-teal-100 text-teal-700' },
]
export const deliverableStatusMeta = (k) => DELIVERABLE_STATUSES.find((s) => s.key === k) || DELIVERABLE_STATUSES[0]

// Internal QA → client submission → comments → revise → resubmit. The register
// preserves revision history (rev A, B, C…) — same machinery both directions.
export const DELIVERABLE_NEXT = {
  draft: ['internal_review'],
  internal_review: ['issued', 'draft'],
  issued: ['comments', 'approved', 'approved_as_noted'],
  comments: ['revising'],
  revising: ['issued'], // resubmission bumps the rev
  approved: [],
  approved_as_noted: [],
}

// WIR lifecycle: contractor initiates → RE review → trade-engineer review →
// Approved / Approved as Noted / Resubmit. Rejected items resubmit under the
// SAME WIR with history preserved.
export const WIR_STATUSES = [
  { key: 'pending_re', label: 'With Resident Engineer', chip: 'bg-blue-100 text-blue-700' },
  { key: 'pending_trade', label: 'Trade engineer review', chip: 'bg-purple-100 text-purple-700' },
  { key: 'approved', label: 'Approved', chip: 'bg-green-100 text-green-700' },
  { key: 'approved_as_noted', label: 'Approved as noted', chip: 'bg-teal-100 text-teal-700' },
  { key: 'resubmit', label: 'Resubmit', chip: 'bg-red-100 text-red-700' },
]
export const wirStatusMeta = (k) => WIR_STATUSES.find((s) => s.key === k) || WIR_STATUSES[0]

export const NCR_PRIORITIES = ['Low', 'Medium', 'High']
export const NCR_STATUSES = [
  { key: 'open', label: 'Open', chip: 'bg-red-100 text-red-700' },
  { key: 'ca_proposed', label: 'Corrective action proposed', chip: 'bg-amber-100 text-amber-700' },
  { key: 'ca_approved', label: 'Corrective action approved', chip: 'bg-blue-100 text-blue-700' },
  { key: 'closed', label: 'Closed', chip: 'bg-green-100 text-green-700' },
]
export const ncrStatusMeta = (k) => NCR_STATUSES.find((s) => s.key === k) || NCR_STATUSES[0]

export const CLAIM_STATUSES = [
  { key: 'event_logged', label: 'Event logged', chip: 'bg-gray-100 text-gray-600' },
  { key: 'notice_served', label: 'Notice served', chip: 'bg-blue-100 text-blue-700' },
  { key: 'detailed_submitted', label: 'Detailed claim submitted', chip: 'bg-purple-100 text-purple-700' },
  { key: 'engineer_response', label: 'Engineer responded', chip: 'bg-amber-100 text-amber-700' },
  { key: 'determined', label: 'Determined', chip: 'bg-green-100 text-green-700' },
  { key: 'time_barred', label: 'Time-barred', chip: 'bg-red-100 text-red-700' },
]
export const claimStatusMeta = (k) => CLAIM_STATUSES.find((s) => s.key === k) || CLAIM_STATUSES[0]

// FIDIC 4.21 monthly progress report — required contents become the checklist.
export const REPORT_CHECKLIST_ITEMS = [
  { key: 'progress', label: 'Progress charts & stage descriptions' },
  { key: 'photos', label: 'Photographs of works' },
  { key: 'personnel', label: 'Personnel & equipment on site' },
  { key: 'qa', label: 'QA documents & test results' },
  { key: 'claims', label: 'Both parties’ claims listed' },
  { key: 'safety', label: 'Safety & environment statistics' },
  { key: 'planned_actual', label: 'Planned vs actual comparison' },
]

// --- Authority workflows ----------------------------------------------------------
// Abu Dhabi-first (research pass 6a). Portal is DATA, not code — Binaa/MEPS/TAMM keep
// shifting. NOC ladders are the verified 4-step sequence; permit is blocked until the
// utility NOCs are collected. Timelines are user-entered, never hardcoded.
export const AUTHORITY_STAGE_STATUSES = [
  { key: 'not_started', label: 'Not started', chip: 'bg-gray-100 text-gray-500' },
  { key: 'submitted', label: 'Submitted', chip: 'bg-blue-100 text-blue-700' },
  { key: 'comments', label: 'Comments received', chip: 'bg-amber-100 text-amber-700' },
  { key: 'resubmitted', label: 'Resubmitted', chip: 'bg-purple-100 text-purple-700' },
  { key: 'approved', label: 'Approved', chip: 'bg-green-100 text-green-700' },
]
export const authorityStageMeta = (k) => AUTHORITY_STAGE_STATUSES.find((s) => s.key === k) || AUTHORITY_STAGE_STATUSES[0]

export const NOC_LADDER = ['Notice of Intent', 'Preliminary Design NOC', 'Final Design NOC', 'Construction NOC']

// Templates for adding a workflow to a project (emirate profiles).
export const AUTHORITY_TEMPLATES = {
  'Abu Dhabi': [
    { authority: 'DMT / ADM', type: 'Building permit', portal: 'Binaa / MEPS / TAMM', stages: ['Design submission', 'Review comments', 'Resubmission', 'Permit issued'] },
    { authority: 'ADCD (Civil Defence)', type: 'Fire & life safety', portal: 'HEMAYA', stages: ['Design-stage package', 'Shop drawing approval', 'Completion inspection', 'Certificate of Conformity'] },
    { authority: 'ADDC', type: 'Utility NOC', portal: 'Common e-NOC', stages: NOC_LADDER },
    { authority: 'ADSSC', type: 'Utility NOC', portal: 'Common e-NOC', stages: NOC_LADDER },
    { authority: 'TRANSCO', type: 'Utility NOC', portal: 'Common e-NOC', stages: NOC_LADDER },
    { authority: 'Etisalat / du', type: 'Utility NOC', portal: 'Common e-NOC', stages: NOC_LADDER },
    { authority: 'Estidama (DMT)', type: 'Pearl rating', portal: 'Estidama portal', stages: ['Registration + PQP appointed', 'EIDP workshops', 'Design Rating credits', 'Pearl Design Rating', 'Construction Rating'] },
    { authority: 'DMT / ADM', type: 'Completion certificate', portal: 'MEPS / TAMM', stages: ['Inspection request', 'Site inspection', 'Certificate issued'] },
  ],
  Dubai: [
    { authority: 'Dubai Municipality', type: 'Building permit', portal: 'BPS', stages: ['Design submission', 'DM comments', 'Resubmission', 'Permit issued'] },
    { authority: 'Dubai Civil Defence', type: 'Fire & life safety', portal: 'DCD portal', stages: ['Design approval', 'Completion approval'] },
    { authority: 'DEWA', type: 'Utility NOC', portal: 'DBPS', stages: ['Building NOC', 'Electrical NOC'] },
    { authority: 'RTA', type: 'Right-of-way NOC', portal: 'e-NOC', stages: NOC_LADDER },
    { authority: 'Dubai Municipality', type: 'Completion certificate (BCC)', portal: 'BPS', stages: ['Final inspection', 'BCC issued'] },
  ],
}

// --- Claim deadline helpers -------------------------------------------------------
export const addDaysISO = (iso, days) => {
  const d = parseLocalDate(iso)
  if (!d) return null
  d.setDate(d.getDate() + days)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Days from today until an ISO date — negative = overdue.
export const daysUntil = (iso) => {
  const d = parseLocalDate(iso)
  if (!d) return null
  return Math.round((d - todayLocal()) / (1000 * 60 * 60 * 24))
}

// 28-day notice runs from event AWARENESS (condition precedent — miss it and the
// claim is extinguished); the detailed claim runs from the notice, 42d (1999) or
// 84d (2017).
export const claimDeadlines = (claim, fidicKey) => {
  const ed = fidicOf(fidicKey)
  const noticeDue = addDaysISO(claim.awarenessDate, ed.noticeDays)
  const detailedDue = claim.noticeDate ? addDaysISO(claim.noticeDate, ed.detailedClaimDays) : null
  return { noticeDue, detailedDue }
}

// Simple SPI from the progress curve: EV/PV at the latest month with an actual.
export const spiOf = (curve = []) => {
  const withActual = curve.filter((c) => c.actual != null)
  if (!withActual.length) return null
  const last = withActual[withActual.length - 1]
  return last.planned > 0 ? last.actual / last.planned : null
}

export const TASK_STATUSES = [
  { key: 'open', label: 'Open', chip: 'bg-blue-100 text-blue-700' },
  { key: 'done', label: 'Done', chip: 'bg-green-100 text-green-700' },
]

export const TEAM_ROLES = [
  'Project Director', 'Design PM (DPM)', 'Construction PM (CPM)', 'Resident Engineer',
  'Structural Lead', 'Architecture Lead', 'MEP Lead', 'Civil Lead', 'Inspector', 'Document Controller',
]

// --- Per-project PM records ---------------------------------------------------------
// Keyed by projectsData PROJECTS id. Demo "today" ≈ 2026-07-06. Projects without a
// seed get an empty skeleton via getPmRecord(). employeeId references hrData EMPLOYEES;
// name-only entries are external/site staff not in the HR seeds.
export const PM_RECORDS = {
  // Harbour Point Medical Centre — full D+S in Construction: the richest record.
  1: {
    projectId: 1, fidicEdition: '1999',
    team: [
      { id: 1, role: 'Project Director', employeeId: 1, name: 'Osama Hussain' },
      { id: 2, role: 'Design PM (DPM)', employeeId: 7, name: 'Fatima Al Mansouri' },
      { id: 3, role: 'Construction PM (CPM)', employeeId: 10, name: 'Samir Al Mazrouei' },
      { id: 4, role: 'Resident Engineer', employeeId: null, name: 'George Matta (site)' },
      { id: 5, role: 'MEP Lead', employeeId: 3, name: 'Mohammad Kubba' },
      { id: 6, role: 'Inspector', employeeId: null, name: 'Ramesh Pillai (site)' },
    ],
    deliverables: [
      { id: 1, docNo: 'HPM-ARC-DWG-001', title: 'Ground floor plan', discipline: 'Architecture', rev: 'C', status: 'approved', dueDate: '2025-06-30', history: [
        { rev: 'A', date: '2025-05-12', event: 'Issued to client' },
        { rev: 'B', date: '2025-06-02', event: 'Resubmitted after comments (clinic layout)' },
        { rev: 'C', date: '2025-06-25', event: 'Approved' },
      ] },
      { id: 2, docNo: 'HPM-STR-CAL-014', title: 'Transfer slab design calculations', discipline: 'Structural Engineering', rev: 'B', status: 'approved_as_noted', dueDate: '2025-05-15', history: [
        { rev: 'A', date: '2025-04-20', event: 'Issued to client' },
        { rev: 'B', date: '2025-05-10', event: 'Approved as noted — confirm pile capacities on site' },
      ] },
      { id: 3, docNo: 'HPM-MEP-DWG-032', title: 'Rooftop plant room layout', discipline: 'Mechanical Engineering', rev: 'B', status: 'comments', dueDate: '2026-07-10', history: [
        { rev: 'A', date: '2026-06-05', event: 'Issued to client' },
        { rev: 'B', date: '2026-06-28', event: 'Client comments — chiller access clearances' },
      ] },
      { id: 4, docNo: 'HPM-SUS-RPT-002', title: 'Estidama credit submission — energy model', discipline: 'Sustainability Engineering', rev: 'A', status: 'internal_review', dueDate: '2026-07-20', history: [
        { rev: 'A', date: '2026-07-01', event: 'Drafted, in internal QA' },
      ] },
    ],
    designStages: [
      { key: '30', label: '30% — Schematic', status: 'passed', gateDate: '2024-05-20', notes: 'Clash meeting held; clinic module agreed.' },
      { key: '60', label: '60% — Design development', status: 'passed', gateDate: '2024-09-15', notes: 'Cross-discipline coordination signed off.' },
      { key: '90', label: '90% — Pre-final', status: 'passed', gateDate: '2025-01-10', notes: 'QS cost check within budget.' },
      { key: '100', label: 'Final / IFC', status: 'passed', gateDate: '2025-03-28', notes: 'IFC issued; design fees closed.' },
    ],
    wirs: [
      { id: 1, ref: 'WIR-0142', title: 'Level 3 slab reinforcement — Zone B', location: 'L3 Zone B', drawingRef: 'HPM-STR-DWG-118', requestedFor: '2026-07-05', rev: 'A', status: 'pending_trade', remarks: 'RE walked the pour; with structures for sign-off.', history: [{ rev: 'A', date: '2026-07-03', event: 'Submitted by contractor' }] },
      { id: 2, ref: 'WIR-0139', title: 'Block walls — L2 east wing', location: 'L2 east', drawingRef: 'HPM-ARC-DWG-061', requestedFor: '2026-06-30', rev: 'B', status: 'approved', remarks: '', history: [
        { rev: 'A', date: '2026-06-24', event: 'Resubmit — DPC missing at sill level' },
        { rev: 'B', date: '2026-06-29', event: 'Approved' },
      ] },
      { id: 3, ref: 'WIR-0143', title: 'Waterproofing — rooftop plant area', location: 'Roof', drawingRef: 'HPM-ARC-DWG-090', requestedFor: '2026-07-08', rev: 'A', status: 'pending_re', remarks: '', history: [{ rev: 'A', date: '2026-07-05', event: 'Submitted by contractor' }] },
    ],
    mirs: [
      { id: 1, ref: 'MIR-0057', title: 'Chilled water pipe — Class B insulation', supplier: 'Gulf Insulation Co', deliveryDate: '2026-06-20', status: 'approved', remarks: 'Batch certs verified against spec 23-07.' },
      { id: 2, ref: 'MIR-0058', title: 'Facade aluminium extrusions — batch 4', supplier: 'Skyline Facades', deliveryDate: '2026-07-02', status: 'pending_re', remarks: 'Mill certificates awaited.' },
    ],
    ncrs: [
      { id: 1, ref: 'NCR-011', date: '2026-06-18', priority: 'High', location: 'L1 corridor', description: 'Fire-rated shaft wall built with non-rated board.', correctiveAction: 'Demolish and rebuild with certified 2-hr system; submit material certs.', status: 'ca_approved', raisedBy: 'George Matta' },
      { id: 2, ref: 'NCR-012', date: '2026-07-01', priority: 'Medium', location: 'L3 Zone A', description: 'Concrete cover below spec on two columns (18mm vs 30mm).', correctiveAction: null, status: 'open', raisedBy: 'Ramesh Pillai' },
    ],
    siteInstructions: [
      { id: 1, ref: 'SI-034', date: '2026-06-22', subject: 'Relocate FHC cabinet clear of clinic door swing (L2)', costImpact: true, timeImpact: false, status: 'actioned' },
      { id: 2, ref: 'SI-035', date: '2026-07-02', subject: 'Protect completed terrazzo before scaffold strike', costImpact: false, timeImpact: false, status: 'issued' },
    ],
    dailyReports: [
      { id: 1, date: '2026-07-05', manpower: 182, plant: 'Tower crane, 2 concrete pumps, 3 hoists', weather: '41°C, clear', workDone: 'L3 Zone B rebar; block walls L2 west; rooftop waterproofing prep.', delays: 'None', hse: 'Toolbox talk — heat stress; no incidents.' },
      { id: 2, date: '2026-07-04', manpower: 175, plant: 'Tower crane, 2 concrete pumps', weather: '40°C, clear', workDone: 'L3 Zone A pour completed 210m³.', delays: 'Pump breakdown 1.5h', hse: 'No incidents.' },
    ],
    milestones: [
      { id: 1, label: 'Structure topped out', baseline: '2026-05-31', forecast: '2026-06-14', actual: '2026-06-14' },
      { id: 2, label: 'Envelope watertight', baseline: '2026-09-30', forecast: '2026-10-20', actual: null },
      { id: 3, label: 'MEP first fix complete', baseline: '2026-11-15', forecast: '2026-12-05', actual: null },
      { id: 4, label: 'Substantial completion', baseline: '2027-03-31', forecast: '2027-05-15', actual: null },
    ],
    progressCurve: [
      { month: '2026-01', planned: 30, actual: 28 },
      { month: '2026-02', planned: 36, actual: 33 },
      { month: '2026-03', planned: 42, actual: 39 },
      { month: '2026-04', planned: 49, actual: 45 },
      { month: '2026-05', planned: 57, actual: 51 },
      { month: '2026-06', planned: 65, actual: 58 },
      { month: '2026-07', planned: 72, actual: null },
      { month: '2026-08', planned: 79, actual: null },
    ],
    tasks: [
      { id: 1, title: 'Close out NCR-012 corrective action', assignee: 'George Matta (site)', due: '2026-07-12', status: 'open' },
      { id: 2, title: 'Respond to chiller access comments (HPM-MEP-DWG-032)', assignee: 'Mohammad Kubba', due: '2026-07-09', status: 'open' },
      { id: 3, title: 'June progress report photos', assignee: 'Ramesh Pillai (site)', due: '2026-07-04', status: 'done' },
    ],
    fees: {
      manhourBudget: 14200, // total budgeted hours across stages
      stages: [
        { id: 1, stage: 'Design (all stages)', fee: 2400000, pctComplete: 100 },
        { id: 2, stage: 'Tender support', fee: 300000, pctComplete: 100 },
        { id: 3, stage: 'Construction supervision', fee: 1500000, pctComplete: 58 },
      ],
      variations: [
        { id: 1, ref: 'VO-01', description: 'Day-surgery unit expanded from 3 to 4 theatres', amount: 180000, status: 'approved', date: '2024-11-05' },
        { id: 2, ref: 'VO-02', description: 'Additional supervision — client-requested phased handover', amount: 95000, status: 'pending', date: '2026-06-20' },
      ],
    },
    claims: [
      { id: 1, ref: 'CLM-01', title: 'EOT — late free issue of medical equipment vendor drawings', party: 'Contractor', eventDate: '2026-05-28', awarenessDate: '2026-06-02', noticeDate: '2026-06-18', status: 'notice_served', timeImpactDays: 21, costImpact: 450000,
        records: [
          { id: 1, date: '2026-05-30', type: 'informal', note: 'Contractor flagged the delay verbally in weekly meeting #58 (minuted).' },
          { id: 2, date: '2026-06-18', type: 'formal', note: 'Notice under SC 20.1 received, ref EBC/HPM/L-204.' },
          { id: 3, date: '2026-07-01', type: 'correspondence', note: 'Monthly interim update #1 — records of standing time attached.' },
        ] },
    ],
    reports: [
      { id: 1, month: '2026-05', dueDate: '2026-06-07', submittedDate: '2026-06-05', checklist: { progress: true, photos: true, personnel: true, qa: true, claims: true, safety: true, planned_actual: true } },
      { id: 2, month: '2026-06', dueDate: '2026-07-07', submittedDate: null, checklist: { progress: true, photos: true, personnel: true, qa: false, claims: true, safety: false, planned_actual: true } },
    ],
    authorities: [
      { id: 1, authority: 'DMT / ADM', type: 'Building permit', portal: 'MEPS', notes: '', stages: [
        { key: 'Design submission', status: 'approved', date: '2025-02-10' },
        { key: 'Review comments', status: 'approved', date: '2025-03-01' },
        { key: 'Resubmission', status: 'approved', date: '2025-03-20' },
        { key: 'Permit issued', status: 'approved', date: '2025-04-08' },
      ], cycles: [
        { id: 1, date: '2025-03-01', event: 'DMT comments — parking ratio clarification' },
        { id: 2, date: '2025-03-20', event: 'Resubmitted with revised parking schedule' },
      ] },
      { id: 2, authority: 'ADCD (Civil Defence)', type: 'Fire & life safety', portal: 'HEMAYA', notes: 'Certificate of Conformity needed before completion cert.', stages: [
        { key: 'Design-stage package', status: 'approved', date: '2025-03-15' },
        { key: 'Shop drawing approval', status: 'comments', date: '2026-06-20' },
        { key: 'Completion inspection', status: 'not_started', date: null },
        { key: 'Certificate of Conformity', status: 'not_started', date: null },
      ], cycles: [
        { id: 1, date: '2026-06-20', event: 'ADCD comments on smoke-control shop drawings — fan duty clarification' },
      ] },
      { id: 3, authority: 'ADDC', type: 'Utility NOC', portal: 'Common e-NOC', notes: '', stages: [
        { key: 'Notice of Intent', status: 'approved', date: '2024-11-02' },
        { key: 'Preliminary Design NOC', status: 'approved', date: '2025-01-15' },
        { key: 'Final Design NOC', status: 'approved', date: '2025-03-05' },
        { key: 'Construction NOC', status: 'approved', date: '2025-04-01' },
      ], cycles: [] },
      { id: 4, authority: 'Estidama (DMT)', type: 'Pearl rating', portal: 'Estidama portal', notes: '2 Pearl target (LEED Gold equivalence for client).', stages: [
        { key: 'Registration + PQP appointed', status: 'approved', date: '2024-08-20' },
        { key: 'EIDP workshops', status: 'approved', date: '2024-10-11' },
        { key: 'Design Rating credits', status: 'approved', date: '2025-03-10' },
        { key: 'Pearl Design Rating', status: 'approved', date: '2025-04-02' },
        { key: 'Construction Rating', status: 'submitted', date: '2026-06-15' },
      ], cycles: [
        { id: 1, date: '2026-06-15', event: 'Construction-stage credit evidence submitted; assessor clarifications expected.' },
      ] },
    ],
  },

  // Pump Station Upgrade — supervision-only, behind plan, with an URGENT claim
  // (notice deadline days away) to demo the countdown.
  8: {
    projectId: 8, fidicEdition: '1999',
    team: [
      { id: 1, role: 'Project Director', employeeId: 1, name: 'Osama Hussain' },
      { id: 2, role: 'Construction PM (CPM)', employeeId: 10, name: 'Samir Al Mazrouei' },
      { id: 3, role: 'Resident Engineer', employeeId: null, name: 'Tariq Aziz (site)' },
      { id: 4, role: 'Inspector', employeeId: null, name: 'Noel Fernandes (site)' },
    ],
    deliverables: [],
    designStages: [],
    wirs: [
      { id: 1, ref: 'WIR-0067', title: 'Pump plinth anchor bolts — bay 2', location: 'Bay 2', drawingRef: 'PSU-CIV-DWG-021', requestedFor: '2026-07-04', rev: 'B', status: 'resubmit', remarks: 'Bolt projection out of tolerance; survey re-check required.', history: [
        { rev: 'A', date: '2026-06-30', event: 'Resubmit — anchor template misaligned' },
        { rev: 'B', date: '2026-07-03', event: 'Resubmit — projection still out of tolerance' },
      ] },
      { id: 2, ref: 'WIR-0068', title: 'Cable tray routing — MCC room', location: 'MCC room', drawingRef: 'PSU-ELE-DWG-009', requestedFor: '2026-07-07', rev: 'A', status: 'pending_re', remarks: '', history: [{ rev: 'A', date: '2026-07-05', event: 'Submitted by contractor' }] },
    ],
    mirs: [
      { id: 1, ref: 'MIR-0023', title: 'HDPE pipe 630mm — batch 2', supplier: 'Gulf Polymer Industries', deliveryDate: '2026-06-25', status: 'approved', remarks: '' },
    ],
    ncrs: [
      { id: 1, ref: 'NCR-004', date: '2026-06-12', priority: 'High', location: 'Bay 1', description: 'Grout beneath pump skid not to specified strength (22 vs 60 MPa).', correctiveAction: 'Remove and re-grout with approved material; cube tests witnessed.', status: 'closed', raisedBy: 'Tariq Aziz', closedDate: '2026-06-28' },
    ],
    siteInstructions: [
      { id: 1, ref: 'SI-009', date: '2026-06-29', subject: 'Suspend bay 2 mechanical installation until anchor bolts accepted', costImpact: false, timeImpact: true, status: 'issued' },
    ],
    dailyReports: [
      { id: 1, date: '2026-07-05', manpower: 46, plant: '50T mobile crane, welding sets', weather: '43°C, dusty', workDone: 'MCC room cable trays; bay 2 anchor bolt re-survey.', delays: 'Bay 2 mechanical suspended (SI-009)', hse: 'No incidents.' },
    ],
    milestones: [
      { id: 1, label: 'Pumps delivered to site', baseline: '2026-04-15', forecast: '2026-06-02', actual: '2026-06-02' },
      { id: 2, label: 'Mechanical completion', baseline: '2026-09-15', forecast: '2026-11-10', actual: null },
      { id: 3, label: 'Commissioning complete', baseline: '2026-11-30', forecast: '2027-01-20', actual: null },
    ],
    progressCurve: [
      { month: '2026-02', planned: 12, actual: 10 },
      { month: '2026-03', planned: 20, actual: 15 },
      { month: '2026-04', planned: 28, actual: 21 },
      { month: '2026-05', planned: 36, actual: 28 },
      { month: '2026-06', planned: 45, actual: 38 },
      { month: '2026-07', planned: 54, actual: null },
    ],
    tasks: [
      { id: 1, title: 'Serve SC 20.1 notice — pump delivery delay (CLM-02)', assignee: 'Samir Al Mazrouei', due: '2026-07-10', status: 'open' },
      { id: 2, title: 'Review contractor recovery programme rev 2', assignee: 'Tariq Aziz (site)', due: '2026-07-14', status: 'open' },
    ],
    fees: {
      manhourBudget: 5200,
      stages: [
        { id: 1, stage: 'Supervision — mobilisation', fee: 337500, pctComplete: 100 },
        { id: 2, stage: 'Supervision — construction', fee: 877500, pctComplete: 34 },
        { id: 3, stage: 'Commissioning & handover', fee: 135000, pctComplete: 0 },
      ],
      variations: [],
    },
    claims: [
      // Awareness 2026-06-15 → 28d notice due 2026-07-13: ~1 week away at demo-today.
      { id: 1, ref: 'CLM-02', title: 'EOT + prolongation — employer-supplied pumps delivered 7 weeks late', party: 'Contractor', eventDate: '2026-04-15', awarenessDate: '2026-06-15', noticeDate: null, status: 'event_logged', timeImpactDays: 49, costImpact: 1200000,
        records: [
          { id: 1, date: '2026-06-15', type: 'informal', note: 'Contractor raised standing plant costs in progress meeting #14 — first quantified awareness of a claim intention.' },
          { id: 2, date: '2026-06-22', type: 'correspondence', note: 'Employer PMO email acknowledging late delivery (keep — UAE Civil Code good-faith/awareness evidence can soften the time bar).' },
        ] },
      { id: 2, ref: 'CLM-01', title: 'Employer claim — defective grout rework delay (NCR-004)', party: 'Employer', eventDate: '2026-06-12', awarenessDate: '2026-06-12', noticeDate: '2026-06-20', status: 'engineer_response', timeImpactDays: 0, costImpact: 85000,
        records: [
          { id: 1, date: '2026-06-20', type: 'formal', note: 'Employer notice of claim for supervision costs during rework.' },
          { id: 2, date: '2026-07-02', type: 'formal', note: 'Engineer response — costs to contractor account under SC 7.6.' },
        ] },
    ],
    reports: [
      { id: 1, month: '2026-06', dueDate: '2026-07-07', submittedDate: null, checklist: { progress: true, photos: false, personnel: true, qa: true, claims: false, safety: true, planned_actual: false } },
    ],
    authorities: [
      { id: 1, authority: 'ADNOC HSE', type: 'Work permits', portal: 'ADNOC e-portal', notes: 'Ongoing permit-to-work regime inside the Ruwais complex — logged here for visibility only.', stages: [
        { key: 'Site mobilisation approval', status: 'approved', date: '2025-10-01' },
        { key: 'Hot work permits (rolling)', status: 'approved', date: '2026-01-15' },
      ], cycles: [] },
    ],
  },

  // Saadiyat Villas — D+S in construction; variations + snags flavour.
  5: {
    projectId: 5, fidicEdition: '1999',
    team: [
      { id: 1, role: 'Project Director', employeeId: 1, name: 'Osama Hussain' },
      { id: 2, role: 'Design PM (DPM)', employeeId: 7, name: 'Fatima Al Mansouri' },
      { id: 3, role: 'Construction PM (CPM)', employeeId: 10, name: 'Samir Al Mazrouei' },
      { id: 4, role: 'Resident Engineer', employeeId: null, name: 'Hani Boulos (site)' },
    ],
    deliverables: [
      { id: 1, docNo: 'SDV-LSC-DWG-201', title: 'Community landscape package — rev after tender', discipline: 'Softscape Design', rev: 'B', status: 'issued', dueDate: '2026-07-15', history: [
        { rev: 'A', date: '2026-06-10', event: 'Issued to client' },
        { rev: 'B', date: '2026-07-01', event: 'Reissued — plant palette per municipality list' },
      ] },
    ],
    designStages: [
      { key: '30', label: '30% — Schematic', status: 'passed', gateDate: '2023-06-15', notes: '' },
      { key: '60', label: '60% — Design development', status: 'passed', gateDate: '2023-10-20', notes: 'Prototype villa mockup review — saved weeks of rework.' },
      { key: '90', label: '90% — Pre-final', status: 'passed', gateDate: '2024-02-12', notes: '' },
      { key: '100', label: 'Final / IFC', status: 'passed', gateDate: '2024-05-30', notes: '' },
    ],
    wirs: [
      { id: 1, ref: 'WIR-0311', title: 'Villa P2-07 roof screed to falls', location: 'Cluster 4, P2-07', drawingRef: 'SDV-ARC-DWG-144', requestedFor: '2026-07-06', rev: 'A', status: 'pending_re', remarks: '', history: [{ rev: 'A', date: '2026-07-04', event: 'Submitted by contractor' }] },
    ],
    mirs: [],
    ncrs: [],
    siteInstructions: [
      { id: 1, ref: 'SI-072', date: '2026-06-25', subject: 'Adjust entry pavilion stone coursing per architect sketch SK-118', costImpact: true, timeImpact: false, status: 'actioned' },
    ],
    dailyReports: [
      { id: 1, date: '2026-07-05', manpower: 260, plant: '3 mobile cranes, block plant', weather: '41°C, humid', workDone: 'Prototype A villas: blockwork L1 (12 units); pavilion stonework.', delays: 'None', hse: 'One first-aid case (hand laceration).' },
    ],
    milestones: [
      { id: 1, label: 'Prototype villa complete (P1-01)', baseline: '2026-03-31', forecast: '2026-04-10', actual: '2026-04-10' },
      { id: 2, label: '50% villas structurally complete', baseline: '2026-08-31', forecast: '2026-08-25', actual: null },
      { id: 3, label: 'Substantial completion', baseline: '2026-12-15', forecast: '2026-12-10', actual: null },
    ],
    progressCurve: [
      { month: '2026-03', planned: 12, actual: 13 },
      { month: '2026-04', planned: 18, actual: 19 },
      { month: '2026-05', planned: 24, actual: 25 },
      { month: '2026-06', planned: 30, actual: 31 },
      { month: '2026-07', planned: 37, actual: null },
    ],
    tasks: [
      { id: 1, title: 'Landscape package rev B — chase client approval', assignee: 'Fatima Al Mansouri', due: '2026-07-16', status: 'open' },
    ],
    fees: {
      manhourBudget: 18600,
      stages: [
        { id: 1, stage: 'Design (all stages)', fee: 3000000, pctComplete: 100 },
        { id: 2, stage: 'Construction supervision', fee: 2100000, pctComplete: 31 },
      ],
      variations: [
        { id: 1, ref: 'VO-01', description: 'Entry pavilion stone upgrade (client request)', amount: 60000, status: 'approved', date: '2026-05-14' },
      ],
    },
    claims: [],
    reports: [
      { id: 1, month: '2026-06', dueDate: '2026-07-07', submittedDate: '2026-07-03', checklist: { progress: true, photos: true, personnel: true, qa: true, claims: true, safety: true, planned_actual: true } },
    ],
    authorities: [
      { id: 1, authority: 'DMT / ADM', type: 'Building permit', portal: 'MEPS', notes: 'Issued 2025 — pre-Binaa.', stages: [
        { key: 'Design submission', status: 'approved', date: '2024-09-05' },
        { key: 'Review comments', status: 'approved', date: '2024-10-02' },
        { key: 'Resubmission', status: 'approved', date: '2024-10-25' },
        { key: 'Permit issued', status: 'approved', date: '2024-11-30' },
      ], cycles: [] },
      { id: 2, authority: 'Estidama (DMT)', type: 'Pearl rating', portal: 'Estidama portal', notes: '1 Pearl (private minimum).', stages: [
        { key: 'Registration + PQP appointed', status: 'approved', date: '2023-09-01' },
        { key: 'EIDP workshops', status: 'approved', date: '2023-11-14' },
        { key: 'Design Rating credits', status: 'approved', date: '2024-08-20' },
        { key: 'Pearl Design Rating', status: 'approved', date: '2024-10-05' },
        { key: 'Construction Rating', status: 'not_started', date: null },
      ], cycles: [] },
    ],
  },

  // Crew Training Facility — design-only at Detailed stage: design gates + deliverables
  // mid-flight, authority ladder in progress, no site registers.
  2: {
    projectId: 2, fidicEdition: '2017',
    team: [
      { id: 1, role: 'Project Director', employeeId: 1, name: 'Osama Hussain' },
      { id: 2, role: 'Design PM (DPM)', employeeId: 3, name: 'Mohammad Kubba' },
      { id: 3, role: 'Structural Lead', employeeId: 2, name: 'Naseeb Shaheen' },
    ],
    deliverables: [
      { id: 1, docNo: 'CTF-ARC-DWG-010', title: 'Simulator hall — plans & sections', discipline: 'Architecture', rev: 'B', status: 'revising', dueDate: '2026-07-18', history: [
        { rev: 'A', date: '2026-05-28', event: 'Issued to client' },
        { rev: 'B', date: '2026-06-20', event: 'Client comments — simulator vendor pit dimensions' },
      ] },
      { id: 2, docNo: 'CTF-STR-DWG-004', title: 'Parking deck GA & details', discipline: 'Structural Engineering', rev: 'A', status: 'issued', dueDate: '2026-07-08', history: [
        { rev: 'A', date: '2026-06-30', event: 'Issued to client' },
      ] },
      { id: 3, docNo: 'CTF-ACO-RPT-001', title: 'Simulator hall acoustic report', discipline: 'Acoustic Engineering', rev: 'A', status: 'internal_review', dueDate: '2026-07-12', history: [
        { rev: 'A', date: '2026-07-03', event: 'Drafted, in internal QA' },
      ] },
    ],
    designStages: [
      { key: '30', label: '30% — Schematic', status: 'passed', gateDate: '2026-03-10', notes: '' },
      { key: '60', label: '60% — Design development', status: 'passed', gateDate: '2026-05-22', notes: 'Clash meeting — simulator MEP routing resolved.' },
      { key: '90', label: '90% — Pre-final', status: 'in_progress', gateDate: '2026-08-15', notes: 'Gate review booked; acoustic report is the long pole.' },
      { key: '100', label: 'Final / IFC', status: 'not_started', gateDate: '2026-10-01', notes: '' },
    ],
    wirs: [], mirs: [], ncrs: [], siteInstructions: [], dailyReports: [],
    milestones: [
      { id: 1, label: '60% design gate', baseline: '2026-05-15', forecast: '2026-05-22', actual: '2026-05-22' },
      { id: 2, label: '90% design gate', baseline: '2026-08-01', forecast: '2026-08-15', actual: null },
      { id: 3, label: 'IFC issue', baseline: '2026-09-15', forecast: '2026-10-01', actual: null },
    ],
    progressCurve: [
      { month: '2026-03', planned: 25, actual: 24 },
      { month: '2026-04', planned: 38, actual: 36 },
      { month: '2026-05', planned: 52, actual: 50 },
      { month: '2026-06', planned: 66, actual: 61 },
      { month: '2026-07', planned: 78, actual: null },
    ],
    tasks: [
      { id: 1, title: 'Revise simulator hall drawings per vendor pit dims', assignee: 'Mohammad Kubba', due: '2026-07-15', status: 'open' },
      { id: 2, title: 'Acoustic report internal QA', assignee: 'Naseeb Shaheen', due: '2026-07-10', status: 'open' },
    ],
    fees: {
      manhourBudget: 6400,
      stages: [
        { id: 1, stage: 'Concept + Schematic', fee: 460000, pctComplete: 100 },
        { id: 2, stage: 'Detailed design', fee: 925000, pctComplete: 60 },
        { id: 3, stage: 'Tender documentation', fee: 465000, pctComplete: 0 },
      ],
      variations: [],
    },
    claims: [],
    reports: [],
    authorities: [
      { id: 1, authority: 'DMT / ADM', type: 'Building permit', portal: 'Binaa', notes: 'First project through the new Binaa portal.', stages: [
        { key: 'Design submission', status: 'submitted', date: '2026-06-18' },
        { key: 'Review comments', status: 'not_started', date: null },
        { key: 'Resubmission', status: 'not_started', date: null },
        { key: 'Permit issued', status: 'not_started', date: null },
      ], cycles: [
        { id: 1, date: '2026-06-18', event: 'Detailed design package submitted via Binaa' },
      ] },
      { id: 2, authority: 'ADCD (Civil Defence)', type: 'Fire & life safety', portal: 'HEMAYA', notes: 'CFPE gate applies from 1 Sept 2026 — confirm classification before the next submission.', stages: [
        { key: 'Design-stage package', status: 'comments', date: '2026-06-25' },
        { key: 'Shop drawing approval', status: 'not_started', date: null },
        { key: 'Completion inspection', status: 'not_started', date: null },
        { key: 'Certificate of Conformity', status: 'not_started', date: null },
      ], cycles: [
        { id: 1, date: '2026-06-25', event: 'Format-gate rejection — declaration letter missing; resubmission being prepared' },
      ] },
      { id: 3, authority: 'ADDC', type: 'Utility NOC', portal: 'Common e-NOC', notes: 'Permit blocked until Construction NOC collected.', stages: [
        { key: 'Notice of Intent', status: 'approved', date: '2026-04-10' },
        { key: 'Preliminary Design NOC', status: 'approved', date: '2026-05-20' },
        { key: 'Final Design NOC', status: 'submitted', date: '2026-06-28' },
        { key: 'Construction NOC', status: 'not_started', date: null },
      ], cycles: [] },
    ],
  },
}

// Empty skeleton so every project — including ones created in-session — opens a
// workspace without special-casing.
export const emptyPmRecord = (projectId) => ({
  projectId, fidicEdition: '1999',
  team: [], deliverables: [], designStages: [], wirs: [], mirs: [], ncrs: [],
  siteInstructions: [], dailyReports: [], milestones: [], progressCurve: [],
  tasks: [], fees: { manhourBudget: 0, stages: [], variations: [] },
  claims: [], reports: [], authorities: [],
})

export const getPmRecord = (projectId) => PM_RECORDS[projectId] || emptyPmRecord(projectId)
