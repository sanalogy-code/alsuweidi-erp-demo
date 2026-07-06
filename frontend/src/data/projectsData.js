// Dummy project data, modeled on the column structure of the company's existing ERP export
// (Projects Report) but with entirely invented projects — no real client data.
//
// The old export flattens three records into 40 columns; here a project is one core record
// plus optional `design` and `supervision` sub-records, so scope-less fields never render N/A.

export const PROJECT_TYPES = ['Buildings', 'Infrastructure', 'Transportation', 'Secondment']

export const MAIN_FUNCTIONS = [
  'Accommodation', 'Commercial and Retail', 'Educational', 'Healthcare', 'Industrial',
  'Offices Building', 'Private Villa', 'Religious', 'Residential Apartments',
  'Residential Communities', 'Non-Building',
]

export const PROJECT_SCOPES = ['Design + Supervision', 'Design only', 'Supervision only', 'Study / Advisory', 'Secondment Services']

// Study/Advisory sub-types (Batch 10, Sana's feedback): TIS, surveying, and other
// study-shaped engagements aren't design or supervision — they get deliverables,
// tasks, schedule, and fees but no site registers or design gates.
export const STUDY_TYPES = ['Traffic Impact Study (TIS)', 'Surveying', 'Feasibility Study', 'Condition Assessment', 'Other Study']

// Seed projects predate the explicit `scope` field — derive it from the
// design/supervision sub-records where absent. New projects store it directly.
export const scopeOf = (p) => {
  if (p.scope) return p.scope
  if (p.type === 'Secondment') return 'Secondment Services'
  if (p.design && p.supervision) return 'Design + Supervision'
  if (p.design) return 'Design only'
  return 'Supervision only'
}

// Marketing needs "year started / year completed" on the record — derive from
// the design/supervision sub-records unless stored explicitly (new projects may
// set yearStarted/yearCompleted directly via the edit form).
export const yearStartedOf = (p) =>
  p.yearStarted ?? p.design?.startYear ?? p.supervision?.startYear ?? null
export const yearCompletedOf = (p) =>
  p.yearCompleted ?? p.supervision?.completionYear ?? p.design?.completionYear ?? null

export const CONTRACT_TYPES = ['Conventional', 'Design & Build', 'Call-off / Framework Agreement']

export const FUND_SOURCES = ['Government', 'Private', 'Bank-ADCB', 'Bank-Other']

export const PROJECT_LOCATIONS = ['Abu Dhabi', 'Al Ain', 'Western Region', 'Dubai', 'Sharjah', 'Northern Emirates', 'Outside UAE']

export const GENERAL_STATUS = ['In Progress', 'On Hold', 'Completed']

// Typed project documents — LOA is required before a project record can be created.
export const PROJECT_DOCUMENT_TYPES = [
  { key: 'loa', label: 'Letter of Award (LOA)', requiredWhen: 'always' },
  { key: 'contract', label: 'Signed contract', requiredWhen: null },
  { key: 'proposal', label: 'Fee proposal', requiredWhen: null },
  { key: 'noc', label: 'Authority NOCs', requiredWhen: null },
  { key: 'drawings', label: 'Drawings / design package', requiredWhen: null },
  { key: 'other', label: 'Other', requiredWhen: null },
]

// The nine-stage delivery pipeline the current ERP stores as a comma-joined string.
// Projects mark which stages their scope covers and where they currently are.
export const PROJECT_STAGES = [
  'Data Collection', 'Concept', 'Schematic', 'Detailed', 'Tender Docs', 'IFC', 'Tendering', 'Construction', 'D&L',
]

// Which pipeline stages each scope covers, and where a fresh project starts.
export const STAGES_BY_SCOPE = {
  'Design + Supervision': PROJECT_STAGES,
  'Design only': ['Data Collection', 'Concept', 'Schematic', 'Detailed', 'Tender Docs', 'IFC'],
  'Supervision only': ['Tendering', 'Construction', 'D&L'],
  'Study / Advisory': ['Data Collection', 'Concept', 'Detailed'],
  'Secondment Services': ['Construction'],
}

export const DESIGN_DISCIPLINES = [
  'Architecture', 'Interior Design', 'Structural Engineering', 'Mechanical Engineering',
  'Electrical Engineering', 'Facade Engineering', 'Lighting Design', 'Acoustic Engineering',
  'Sustainability Engineering', 'Quantity Surveying', 'Cost Consultancy', 'Traffic Engineering',
  'Stormwater Management', 'Sewage Systems', 'Pavement Design', 'Hardscape Design',
  'Softscape Design', 'Feasibility Studies',
]

export const OUTPUT_FORMATS = ['CAD', 'BIM', 'CAD+BIM']

export const DESIGN_FINANCIAL_STATUS = [
  'Closed - No Dispute - All design fees paid',
  'Closed - Settled officially after dispute',
  'Open - Managed by DPM',
  'Open - Dispute/Long Delay - Handed over to Finance/Contracts',
  'No Design Fees - N/A',
]

export const PAY_STATUS = ['Not Due', 'Invoices Paid', 'Unsettled', 'Completed', 'N/A']

// dpmId / cpmId reference hrData EMPLOYEES; companyId references crmData INITIAL_COMPANIES (nullable).
//
// Marketing fields (absent = default): `marketingDescription` (string|null — written by
// Marketing, required before a project can be marked Completed), `photosApproved`
// (bool — professional photography signed off by Marketing, also blocks completion),
// `confidential` (bool — hide from portfolio / proposals; the PM decides at project
// start. `undefined` = predates the field / not decided — blocks stage advance until
// the PM picks. Two seeds below are left undecided on purpose to demo that gate).
// Richer portfolio fields (3 Jul, replacing the Proposal Builder): `images`
// (file-name-only list, Phase 2 storage placeholder), `specialFeatures`
// (free-form strings — varies wildly by project type, so no fixed schema),
// and `photoWorkflow` ({ step: 0-3 index into PHOTO_WORKFLOW_STEPS, photographer,
// notes } — progress of the photography state machine; done = photosApproved).
export const PROJECTS = [
  {
    id: 1, projectNo: 'P-2701', name: 'Harbour Point Medical Centre', employer: 'Al Reem Development Co', companyId: null, owner: 'Al Reem Development Co',
    type: 'Buildings', mainFunction: 'Healthcare', location: 'Abu Dhabi', sector: 'Al Reem Island', plot: 'RM-114', builtupArea: 28500,
    description: 'Four-storey outpatient medical centre with day-surgery unit and rooftop MEP plant.',
    marketingDescription: 'A 28,500 sqm healthcare destination on Al Reem Island: day-surgery suites, imaging, and outpatient clinics designed around daylight-filled waiting courtyards, delivered in BIM from concept through supervision.',
    images: ['harbour-point-hero-courtyard.jpg', 'harbour-point-entrance-dusk.jpg', 'harbour-point-surgery-suite.jpg'],
    specialFeatures: ['4 day-surgery theatres', '62 outpatient clinics', '3 daylight waiting courtyards', 'LEED Gold target'],
    confidential: false,
    generalStatus: 'In Progress', fund: 'Private', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 4200000, constructionCost: 165000000, contractorName: 'Emirates BuildCo LLC',
    dpmId: 7, cpmId: 10,
    stagesInvolved: ['Data Collection', 'Concept', 'Schematic', 'Detailed', 'Tender Docs', 'IFC', 'Tendering', 'Construction', 'D&L'], currentStage: 'Construction',
    design: { sow: ['Architecture', 'Interior Design', 'Structural Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Sustainability Engineering', 'Quantity Surveying'], status: 'Completed', outputFormat: 'BIM', startYear: 2024, completionYear: 2025, financialStatus: 'Closed - No Dispute - All design fees paid', payStatus: 'Completed' },
    supervision: { coverage: 'Full', status: 'In Progress', payStatus: 'Invoices Paid', contractualCompletion: '2027-03-31', estimatedCompletion: '2027-05-15', approvedPct: 65, actualPct: 58, startYear: 2025, completionYear: 2027 },
  },
  {
    id: 2, projectNo: 'P-2688', name: 'Crew Training Facility Extension', employer: 'Etihad Airways', companyId: 2, owner: 'Etihad Airways',
    type: 'Buildings', mainFunction: 'Offices Building', location: 'Abu Dhabi', sector: 'Khalifa City', plot: 'KC-208', builtupArea: 9400,
    description: 'Extension of the existing crew training block: simulator hall, classrooms, and parking deck.',
    generalStatus: 'In Progress', fund: 'Private', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 1850000, constructionCost: 62000000, contractorName: null,
    dpmId: 3, cpmId: null,
    stagesInvolved: ['Concept', 'Schematic', 'Detailed', 'Tender Docs'], currentStage: 'Detailed',
    design: { sow: ['Architecture', 'Structural Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Acoustic Engineering', 'Cost Consultancy'], status: 'In Progress', outputFormat: 'CAD+BIM', startYear: 2026, completionYear: null, financialStatus: 'Open - Managed by DPM', payStatus: 'Not Due' },
    supervision: null,
  },
  {
    id: 3, projectNo: 'P-2712', name: 'Al Dhafra Road Upgrades — Package 3', employer: 'Abu Dhabi Municipality', companyId: null, owner: 'Abu Dhabi Municipality',
    type: 'Infrastructure', mainFunction: 'Non-Building', location: 'Western Region', sector: 'Al Dhafra - Madinat Zayed', plot: null, builtupArea: 0,
    description: '14 km of internal road upgrades incl. street lighting, stormwater, and junction improvements.',
    confidential: false,
    generalStatus: 'In Progress', fund: 'Government', contractType: 'Call-off / Framework Agreement', contractSigned: true, loaObtained: true,
    contractValue: 6800000, constructionCost: 240000000, contractorName: null,
    dpmId: 2, cpmId: null,
    stagesInvolved: ['Data Collection', 'Concept', 'Detailed', 'Tender Docs', 'IFC'], currentStage: 'Tender Docs',
    design: { sow: ['Traffic Engineering', 'Pavement Design', 'Stormwater Management', 'Sewage Systems', 'Electrical Engineering', 'Cost Consultancy'], status: 'In Progress', outputFormat: 'CAD', startYear: 2025, completionYear: null, financialStatus: 'Open - Managed by DPM', payStatus: 'Invoices Paid' },
    supervision: null,
  },
  {
    id: 4, projectNo: 'P-2645', name: 'Fabrication Plant Extension', employer: 'Gulf Steel Fabrication', companyId: 6, owner: 'Gulf Steel Fabrication',
    type: 'Buildings', mainFunction: 'Industrial', location: 'Sharjah', sector: 'SAIF Zone', plot: 'SZ-77', builtupArea: 12800,
    description: 'Heavy fabrication bay extension with 40T crane runway and new substation.',
    confidential: true,
    generalStatus: 'In Progress', fund: 'Bank-Other', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 980000, constructionCost: 34000000, contractorName: null,
    dpmId: 3, cpmId: null,
    stagesInvolved: ['Concept', 'Detailed', 'Tender Docs'], currentStage: 'Tender Docs',
    design: { sow: ['Architecture', 'Structural Engineering', 'Mechanical Engineering', 'Electrical Engineering'], status: 'Completed', outputFormat: 'CAD', startYear: 2024, completionYear: 2025, financialStatus: 'Open - Dispute/Long Delay - Handed over to Finance/Contracts', payStatus: 'Unsettled' },
    supervision: null,
  },
  {
    id: 5, projectNo: 'P-2670', name: 'Saadiyat Villas — Cluster 4', employer: 'Emaar Properties', companyId: 4, owner: 'Emaar Properties',
    type: 'Buildings', mainFunction: 'Residential Communities', location: 'Abu Dhabi', sector: 'Saadiyat Island', plot: 'SD-C4', builtupArea: 41200,
    description: '38 villas across three prototypes with community landscaping and entry pavilion.',
    marketingDescription: 'Thirty-eight villas across three prototypes on Saadiyat Island, unified by native-planting landscaping and a sculptural entry pavilion — full design and supervision scope for Emaar Properties.',
    images: ['saadiyat-c4-aerial.jpg', 'saadiyat-c4-prototype-a.jpg', 'saadiyat-c4-entry-pavilion.jpg', 'saadiyat-c4-landscape.jpg'],
    specialFeatures: ['38 villas across 3 prototypes', 'Native-planting landscape masterplan', 'Sculptural entry pavilion', 'Community pool + gym block'],
    confidential: false,
    generalStatus: 'In Progress', fund: 'Private', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 5100000, constructionCost: 210000000, contractorName: 'Coastline Contracting',
    dpmId: 7, cpmId: 10,
    stagesInvolved: ['Concept', 'Schematic', 'Detailed', 'Tender Docs', 'IFC', 'Tendering', 'Construction', 'D&L'], currentStage: 'Construction',
    lessons: [
      { id: 1, text: 'Prototype villa mockup review with the client early saved weeks of detailed-design rework — repeat on every residential community job.', date: '2024-09-12', author: 'Layla Hassan' },
      { id: 2, text: 'Landscaping tender should have been split from the main package; combining it delayed award by six weeks.', date: '2025-03-04', author: 'Khalid Mansour' },
    ],
    design: { sow: ['Architecture', 'Interior Design', 'Structural Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Hardscape Design', 'Softscape Design'], status: 'Completed', outputFormat: 'BIM', startYear: 2023, completionYear: 2024, financialStatus: 'Closed - No Dispute - All design fees paid', payStatus: 'Completed' },
    supervision: { coverage: 'Full', status: 'In Progress', payStatus: 'Invoices Paid', contractualCompletion: '2026-12-15', estimatedCompletion: '2026-12-10', approvedPct: 30, actualPct: 31, startYear: 2025, completionYear: 2026 },
  },
  {
    id: 6, projectNo: 'P-2699', name: 'Substation Access & Landscaping Works', employer: 'DEWA', companyId: 3, owner: 'DEWA',
    type: 'Infrastructure', mainFunction: 'Non-Building', location: 'Dubai', sector: 'Al Qudra', plot: null, builtupArea: 0,
    description: 'Supervision of access roads, boundary works, and landscaping around two new substations.',
    photoWorkflow: { step: 1, photographer: 'External — LensCraft Studios (Ravi)', notes: 'Booked for the week of 10 Aug, pending Supervision confirmation.' },
    confidential: false,
    generalStatus: 'In Progress', fund: 'Government', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 720000, constructionCost: 18500000, contractorName: 'Desert Line Projects',
    dpmId: null, cpmId: 8,
    stagesInvolved: ['Construction', 'D&L'], currentStage: 'Construction',
    design: null,
    supervision: { coverage: 'Partial', status: 'In Progress', payStatus: 'Invoices Paid', contractualCompletion: '2026-09-30', estimatedCompletion: '2026-09-20', approvedPct: 80, actualPct: 81, startYear: 2025, completionYear: 2026 },
  },
  {
    id: 7, projectNo: 'P-2725', name: 'TIS — Khalifa City School Cluster', employer: 'Department of Municipalities and Transport', companyId: null, owner: 'Department of Municipalities and Transport',
    type: 'Transportation', mainFunction: 'Educational', location: 'Abu Dhabi', sector: 'Khalifa City', plot: null, builtupArea: 0,
    scope: 'Study / Advisory', studyType: 'Traffic Impact Study (TIS)',
    description: 'Traffic impact study and access design review for a three-school cluster.',
    generalStatus: 'In Progress', fund: 'Government', contractType: 'Call-off / Framework Agreement', contractSigned: true, loaObtained: false,
    contractValue: 240000, constructionCost: null, contractorName: null,
    dpmId: 2, cpmId: null,
    stagesInvolved: ['Data Collection', 'Concept'], currentStage: 'Concept',
    design: { sow: ['Traffic Engineering', 'Feasibility Studies'], status: 'In Progress', outputFormat: 'CAD', startYear: 2026, completionYear: 2026, financialStatus: 'Open - Managed by DPM', payStatus: 'Not Due' },
    supervision: null,
  },
  {
    id: 8, projectNo: 'P-2650', name: 'Pump Station Upgrade — Ruwais', employer: 'ADNOC', companyId: 1, owner: 'ADNOC', dealId: 101,
    type: 'Buildings', mainFunction: 'Industrial', location: 'Western Region', sector: 'Ruwais', plot: 'RW-19', builtupArea: 3600,
    description: 'Construction supervision of pump station upgrade — the delivery side of the CRM-won deal.',
    confidential: false,
    generalStatus: 'In Progress', fund: 'Private', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 1350000, constructionCost: 48000000, contractorName: 'Emirates BuildCo LLC',
    dpmId: null, cpmId: 10,
    stagesInvolved: ['Tendering', 'Construction', 'D&L'], currentStage: 'Construction',
    design: null,
    supervision: { coverage: 'Full', status: 'In Progress', payStatus: 'Unsettled', contractualCompletion: '2026-11-30', estimatedCompletion: '2027-01-20', approvedPct: 45, actualPct: 38, startYear: 2025, completionYear: 2027 },
  },
  {
    id: 9, projectNo: 'P-2731', name: 'Site Engineering Secondment — Ruwais', employer: 'ADNOC', companyId: 1, owner: 'ADNOC',
    type: 'Secondment', mainFunction: 'Industrial', location: 'Western Region', sector: 'Ruwais', plot: null, builtupArea: 0,
    description: 'Two site engineers seconded to the employer\'s PMO under a framework agreement.',
    confidential: false,
    generalStatus: 'In Progress', fund: 'Private', contractType: 'Call-off / Framework Agreement', contractSigned: true, loaObtained: true,
    contractValue: 860000, constructionCost: null, contractorName: null,
    dpmId: 1, cpmId: null,
    stagesInvolved: ['Construction'], currentStage: 'Construction',
    design: null,
    supervision: null,
  },
  {
    id: 10, projectNo: 'P-2662', name: 'Al Ain Mosque & Community Hall', employer: 'Private Client — Al Ain', companyId: null, owner: 'Private Client — Al Ain',
    type: 'Buildings', mainFunction: 'Religious', location: 'Al Ain', sector: 'Al Jimi', plot: 'AJ-441', builtupArea: 4200,
    description: '600-worshipper mosque with attached community hall and imam residence.',
    confidential: false,
    generalStatus: 'On Hold', fund: 'Private', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 640000, constructionCost: 21000000, contractorName: null,
    dpmId: 7, cpmId: null,
    stagesInvolved: ['Concept', 'Schematic', 'Detailed'], currentStage: 'Schematic',
    design: { sow: ['Architecture', 'Interior Design', 'Structural Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Lighting Design'], status: 'In Progress', outputFormat: 'CAD', startYear: 2025, completionYear: null, financialStatus: 'Open - Managed by DPM', payStatus: 'Not Due' },
    supervision: null,
  },
  {
    id: 11, projectNo: 'P-2708', name: 'Madinat Zayed Retail Strip', employer: 'Al Dhafra Retail Holdings', companyId: null, owner: 'Al Dhafra Retail Holdings',
    type: 'Buildings', mainFunction: 'Commercial and Retail', location: 'Western Region', sector: 'Madinat Zayed', plot: 'MZ-63', builtupArea: 7800,
    description: 'Single-storey retail strip with anchor supermarket, F&B units, and surface parking.',
    confidential: false,
    generalStatus: 'In Progress', fund: 'Bank-ADCB', contractType: 'Design & Build', contractSigned: true, loaObtained: true,
    contractValue: 1120000, constructionCost: 39000000, contractorName: 'Coastline Contracting',
    dpmId: 3, cpmId: 8,
    stagesInvolved: ['Concept', 'Schematic', 'Detailed', 'Tender Docs', 'IFC', 'Construction'], currentStage: 'IFC',
    design: { sow: ['Architecture', 'Structural Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Quantity Surveying', 'Hardscape Design'], status: 'In Progress', outputFormat: 'BIM', startYear: 2025, completionYear: 2026, financialStatus: 'Open - Managed by DPM', payStatus: 'Invoices Paid' },
    supervision: { coverage: 'Partial', status: 'Not Started', payStatus: 'Not Due', contractualCompletion: '2027-06-30', estimatedCompletion: '2027-06-30', approvedPct: 0, actualPct: 0, startYear: 2026, completionYear: 2027 },
  },
  {
    id: 12, projectNo: 'P-2597', name: 'Corniche Tower Facade Retrofit', employer: 'Emaar Properties', companyId: 4, owner: 'Emaar Properties',
    type: 'Buildings', mainFunction: 'Offices Building', location: 'Abu Dhabi', sector: 'Corniche', plot: 'CN-12', builtupArea: 0,
    description: 'Facade condition assessment and retrofit design for a 24-storey office tower.',
    marketingDescription: 'Condition assessment and full retrofit design for a 24-storey Corniche office tower — thermal performance, safety, and a refreshed identity delivered without decanting the building.', photosApproved: true,
    images: ['corniche-tower-facade-after.jpg', 'corniche-tower-before-after.jpg', 'corniche-tower-detail-panel.jpg'],
    specialFeatures: ['24 storeys re-skinned without decanting', '32% thermal performance improvement', 'Drone-based condition survey (no scaffolding)'],
    confidential: false,
    generalStatus: 'Completed', fund: 'Private', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 510000, constructionCost: 12500000, contractorName: 'Skyline Facades',
    dpmId: 2, cpmId: null,
    stagesInvolved: ['Data Collection', 'Concept', 'Detailed', 'Tender Docs'], currentStage: 'Tender Docs',
    lessons: [
      { id: 1, text: 'Drone survey of the facade cost a fraction of scaffolding access and the client loved it — make it the default for retrofit assessments.', date: '2024-06-18', author: 'Sana Diab' },
    ],
    design: { sow: ['Facade Engineering', 'Structural Engineering', 'Feasibility Studies'], status: 'Completed', outputFormat: 'CAD', startYear: 2023, completionYear: 2024, financialStatus: 'Closed - No Dispute - All design fees paid', payStatus: 'Completed' },
    supervision: null,
  },
]
