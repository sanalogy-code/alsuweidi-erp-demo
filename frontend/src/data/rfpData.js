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
  },
]
