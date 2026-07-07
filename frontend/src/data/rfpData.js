// RFP / proposal register — the information from the current ERP's RFP
// management form (Batch 14), redesigned: a linked register instead of a
// standalone 30-field form. RFPs reference CRM companies (companyId), and an
// awarded RFP points at the delivery project (projectId) — the links the old
// system doesn't have. Dates are the tender-cycle facts the team actually
// tracks; go/win scores are the bid/no-bid gate.

export const RFP_STATUSES = [
  { key: 'invited', label: 'Invited', chip: 'bg-gray-100 text-gray-600' },
  { key: 'preparing', label: 'Preparing', chip: 'bg-blue-100 text-blue-700' },
  { key: 'submitted', label: 'Submitted', chip: 'bg-purple-100 text-purple-700' },
  { key: 'awarded', label: 'Awarded', chip: 'bg-green-100 text-green-700' },
  { key: 'lost', label: 'Lost', chip: 'bg-red-100 text-red-700' },
  { key: 'declined', label: 'Declined (no-bid)', chip: 'bg-slate-100 text-slate-500' },
]
export const rfpStatusMeta = (k) => RFP_STATUSES.find((s) => s.key === k) || RFP_STATUSES[0]

export const RFP_ENGAGEMENTS = ['Design + Supervision', 'Design only', 'Supervision only', 'Study / Advisory', 'Secondment']

// --- Pipeline staffing requests (Batch 16c, Sana 7 Jul) --------------------------
// "When we have a project in the pipeline and expect we need x employees, PMs and
// managers should be able to request that — it feeds HR's Staff planning tab."
// Contingent on award; HR accepts a request into the hiring plan or declines it.
export const STAFFING_REQUEST_STATUSES = [
  { key: 'requested', label: 'Requested', chip: 'bg-amber-100 text-amber-700' },
  { key: 'accepted', label: 'In hiring plan', chip: 'bg-green-100 text-green-700' },
  { key: 'declined', label: 'Declined', chip: 'bg-gray-100 text-gray-500' },
]
export const staffingStatusMeta = (k) => STAFFING_REQUEST_STATUSES.find((s) => s.key === k) || STAFFING_REQUEST_STATUSES[0]

export const INITIAL_STAFFING_REQUESTS = [
  { id: 1, rfpId: 1, rfpName: 'Jubail Research Facility', role: 'Resident Engineer', count: 1, neededBy: '2026-10-01', note: 'Full-time on site from mobilisation if we win.', requestedBy: 'Osama Hussain', date: '2026-07-01', status: 'requested' },
  { id: 2, rfpId: 1, rfpName: 'Jubail Research Facility', role: 'Structural Engineer', count: 2, neededBy: '2026-09-15', note: 'Marine/coastal experience preferred.', requestedBy: 'Osama Hussain', date: '2026-07-01', status: 'requested' },
]

// --- Bid/no-bid decision gate (BD backlog) ----------------------------------
// The go/win scores were always the inputs; `bidDecision` is the explicit
// sign-off record: { decision: 'bid'|'no-bid', by, date, rationale }.
// The recommendation is derived from the scores; the human can overrule it.
export const bidRecommendation = (goScore, winScore) => {
  if (goScore == null && winScore == null) return null
  const g = goScore ?? 0, w = winScore ?? 0
  if (g >= 70 && w >= 50) return 'bid'
  if (g < 50 || w < 30) return 'no-bid'
  return 'borderline'
}

// --- Tender document checklist template --------------------------------------
// Auto-attached (as `checklist`) to every new RFP; each item is
// { key, label, done, owner }. Progress % shows on the register row.
export const TENDER_CHECKLIST_TEMPLATE = [
  { key: 'technical', label: 'Technical proposal' },
  { key: 'methodology', label: 'Methodology & work plan' },
  { key: 'cvs', label: 'Key staff CVs' },
  { key: 'profile', label: 'Company profile & references' },
  { key: 'licence', label: 'Trade licence & registrations' },
  { key: 'financial', label: 'Financial proposal' },
  { key: 'bond', label: 'Bid bond' },
]
export const newChecklist = () => TENDER_CHECKLIST_TEMPLATE.map((t) => ({ ...t, done: false, owner: '' }))
export const checklistProgress = (list) => (list?.length ? Math.round((list.filter((i) => i.done).length / list.length) * 100) : null)

// --- Bid cost tracking --------------------------------------------------------
// Per RFP: `prepHours` [{ id, person, hours, date }] and `expenses`
// [{ id, description, amount }]. Hours are manual quick-adds for now —
// Phase 2 pulls them from timesheet bid codes.
export const BID_HOURLY_RATE = 250 // AED — blended rate for the demo cost line

// --- Competitor register + lost-RFP debriefs ----------------------------------
// Lost RFPs get `lostTo` (competitor id, nullable), `feeLevel`, and a
// `debrief` { reason, clientFeedback, lessons, by, date }.
export const FEE_LEVELS = ['higher', 'similar', 'lower', 'unknown']
export const DEBRIEF_REASONS = ['price', 'experience', 'relationship', 'compliance', 'other']

export const INITIAL_COMPETITORS = [
  { id: 1, name: 'KEO International', sectors: 'Buildings, Infrastructure, Supervision', notes: 'Large multidisciplinary — usually competitive on fee via scale.' },
  { id: 2, name: 'Dar Al-Handasah', sectors: 'Buildings, Transportation, Masterplanning', notes: 'Strong government relationships; heavyweight on mega-projects.' },
  { id: 3, name: 'National Engineering Bureau', sectors: 'Residential, Commercial', notes: 'Aggressive fees on private developer work.' },
]

// companyId → crmData INITIAL_COMPANIES (nullable); projectId → projectsData
// PROJECTS when awarded; dealId → CRM deals when one was raised.
export const INITIAL_RFPS = [
  {
    id: 1, refNo: 'RFP-2026-018', name: 'Design & supervision of coastal research facility, Jubail Island', shortName: 'Jubail Research Facility',
    employer: 'Department of Municipalities and Transport', companyId: null, ownerType: 'Government', ownerName: 'DMT',
    engagement: 'Design + Supervision', projectType: 'Buildings', mainFunction: 'Educational', location: 'Abu Dhabi',
    contractType: 'Conventional', rfpManager: 'Osama Hussain',
    invitationDate: '2026-06-10', queriesDeadline: '2026-06-28', techSubmittal: '2026-07-15', commSubmittal: '2026-07-15',
    siteVisit: 'Done 2026-06-22', goScore: 78, winScore: 55, status: 'preparing',
    remarks: 'Strong fit — education portfolio + Estidama track record. Fee pressure expected from two larger competitors.',
    dealId: null, projectId: null,
    bidDecision: { decision: 'bid', by: 'Khalid Al Suweidi', date: '2026-06-24', rationale: 'Education track record is the differentiator; fee pressure acceptable at this size.' },
    checklist: [
      { key: 'technical', label: 'Technical proposal', done: true, owner: 'Osama Hussain' },
      { key: 'methodology', label: 'Methodology & work plan', done: true, owner: 'Osama Hussain' },
      { key: 'cvs', label: 'Key staff CVs', done: false, owner: 'HR' },
      { key: 'profile', label: 'Company profile & references', done: true, owner: 'Marketing' },
      { key: 'licence', label: 'Trade licence & registrations', done: true, owner: 'Admin' },
      { key: 'financial', label: 'Financial proposal', done: false, owner: 'Finance' },
      { key: 'bond', label: 'Bid bond', done: false, owner: 'Finance' },
    ],
    prepHours: [
      { id: 1, person: 'Osama Hussain', hours: 12, date: '2026-06-26' },
      { id: 2, person: 'Fatima Al Mansouri', hours: 8, date: '2026-06-30' },
    ],
    expenses: [{ id: 1, description: 'Site visit transport', amount: 450 }],
    lostTo: null, feeLevel: null, debrief: null,
  },
  {
    id: 2, refNo: 'RFP-2026-014', name: 'TIS and access design for Al Shamkha mixed-use plots', shortName: 'Al Shamkha TIS',
    employer: 'Aldar Properties', companyId: null, ownerType: 'Private', ownerName: 'Aldar',
    engagement: 'Study / Advisory', projectType: 'Transportation', mainFunction: 'Non-Building', location: 'Abu Dhabi',
    contractType: 'Call-off / Framework Agreement', rfpManager: 'Naseeb Shaheen',
    invitationDate: '2026-05-20', queriesDeadline: '2026-06-01', techSubmittal: '2026-06-08', commSubmittal: '2026-06-08',
    siteVisit: 'Not required', goScore: 85, winScore: 70, status: 'submitted',
    remarks: 'Submitted on framework rates. Award expected mid-July.',
    dealId: null, projectId: null,
    bidDecision: { decision: 'bid', by: 'Naseeb Shaheen', date: '2026-05-24', rationale: 'Framework rates already agreed — near-zero prep cost.' },
    checklist: [
      { key: 'technical', label: 'Technical proposal', done: true, owner: 'Naseeb Shaheen' },
      { key: 'methodology', label: 'Methodology & work plan', done: true, owner: 'Naseeb Shaheen' },
      { key: 'cvs', label: 'Key staff CVs', done: true, owner: 'HR' },
      { key: 'profile', label: 'Company profile & references', done: true, owner: 'Marketing' },
      { key: 'licence', label: 'Trade licence & registrations', done: true, owner: 'Admin' },
      { key: 'financial', label: 'Financial proposal', done: true, owner: 'Finance' },
      { key: 'bond', label: 'Bid bond', done: true, owner: 'Finance' },
    ],
    prepHours: [{ id: 1, person: 'Naseeb Shaheen', hours: 6, date: '2026-06-03' }],
    expenses: [],
    lostTo: null, feeLevel: null, debrief: null,
  },
  {
    id: 3, refNo: 'RFP-2026-009', name: 'Supervision of pump station upgrade — Ruwais', shortName: 'Ruwais Pump Station',
    employer: 'ADNOC', companyId: 1, ownerType: 'Private', ownerName: 'ADNOC',
    engagement: 'Supervision only', projectType: 'Buildings', mainFunction: 'Industrial', location: 'Western Region',
    contractType: 'Conventional', rfpManager: 'Osama Hussain',
    invitationDate: '2025-07-05', queriesDeadline: '2025-07-20', techSubmittal: '2025-08-10', commSubmittal: '2025-08-10',
    siteVisit: 'Done 2025-07-18', goScore: 90, winScore: 75, status: 'awarded',
    remarks: 'Won on supervision track record inside ADNOC facilities. Delivered as P-2650.',
    dealId: 101, projectId: 8,
    bidDecision: { decision: 'bid', by: 'Khalid Al Suweidi', date: '2025-07-10', rationale: 'Incumbent-adjacent — supervision track record inside ADNOC facilities.' },
    checklist: null, prepHours: [], expenses: [],
    lostTo: null, feeLevel: null, debrief: null,
  },
  {
    id: 4, refNo: 'RFP-2026-021', name: 'Design of luxury beach club, Hudayriyat', shortName: 'Hudayriyat Beach Club',
    employer: 'Modon Properties', companyId: null, ownerType: 'Private', ownerName: 'Modon',
    engagement: 'Design only', projectType: 'Buildings', mainFunction: 'Commercial and Retail', location: 'Abu Dhabi',
    contractType: 'Design & Build', rfpManager: 'Fatima Al Mansouri',
    invitationDate: '2026-06-25', queriesDeadline: '2026-07-08', techSubmittal: '2026-07-22', commSubmittal: '2026-07-29',
    siteVisit: 'Scheduled 2026-07-09', goScore: 62, winScore: 40, status: 'invited',
    remarks: 'Hospitality-adjacent — thin portfolio in beach clubs. Go/no-go on 8 Jul after the queries round.',
    dealId: null, projectId: null,
    bidDecision: null,
    checklist: newChecklist(),
    prepHours: [], expenses: [],
    lostTo: null, feeLevel: null, debrief: null,
  },
  {
    id: 5, refNo: 'RFP-2026-011', name: 'Design & supervision of warehouse cluster, KEZAD', shortName: 'KEZAD Warehouses',
    employer: 'KEZAD Group', companyId: null, ownerType: 'Government', ownerName: 'AD Ports',
    engagement: 'Design + Supervision', projectType: 'Buildings', mainFunction: 'Industrial', location: 'Abu Dhabi',
    contractType: 'Conventional', rfpManager: 'Osama Hussain',
    invitationDate: '2026-04-15', queriesDeadline: '2026-04-30', techSubmittal: '2026-05-18', commSubmittal: '2026-05-18',
    siteVisit: 'Done 2026-04-28', goScore: 74, winScore: 58, status: 'lost',
    remarks: 'Lost on fee — winner ~18% below. Keep relationship warm; debrief noted higher weighting on local industrial references.',
    dealId: null, projectId: null,
    bidDecision: { decision: 'bid', by: 'Khalid Al Suweidi', date: '2026-04-20', rationale: 'Industrial pipeline strategic for KEZAD framework positioning.' },
    checklist: null,
    prepHours: [
      { id: 1, person: 'Osama Hussain', hours: 20, date: '2026-05-10' },
      { id: 2, person: 'Design team', hours: 34, date: '2026-05-15' },
    ],
    expenses: [{ id: 1, description: 'Bid bond arrangement fee', amount: 3500 }, { id: 2, description: 'Printing & binding', amount: 800 }],
    lostTo: 1, feeLevel: 'lower',
    debrief: { reason: 'price', clientFeedback: 'Winner ~18% below on fee; technical scores close.', lessons: 'Local industrial references weighted higher than expected — build the KEZAD reference sheet before the next framework round.', by: 'Osama Hussain', date: '2026-06-02' },
  },
]
