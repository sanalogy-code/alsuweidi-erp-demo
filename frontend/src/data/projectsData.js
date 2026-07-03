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

export const PROJECT_SCOPES = ['Design + Supervision', 'Design only', 'Supervision only', 'Secondment Services']

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
export const PROJECTS = [
  {
    id: 1, projectNo: 'P-2701', name: 'Harbour Point Medical Centre', employer: 'Al Reem Development Co', companyId: null, owner: 'Al Reem Development Co',
    type: 'Buildings', mainFunction: 'Healthcare', location: 'Abu Dhabi', sector: 'Al Reem Island', plot: 'RM-114', builtupArea: 28500,
    description: 'Four-storey outpatient medical centre with day-surgery unit and rooftop MEP plant.',
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
    generalStatus: 'In Progress', fund: 'Private', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 5100000, constructionCost: 210000000, contractorName: 'Coastline Contracting',
    dpmId: 7, cpmId: 10,
    stagesInvolved: ['Concept', 'Schematic', 'Detailed', 'Tender Docs', 'IFC', 'Tendering', 'Construction', 'D&L'], currentStage: 'Construction',
    design: { sow: ['Architecture', 'Interior Design', 'Structural Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Hardscape Design', 'Softscape Design'], status: 'Completed', outputFormat: 'BIM', startYear: 2023, completionYear: 2024, financialStatus: 'Closed - No Dispute - All design fees paid', payStatus: 'Completed' },
    supervision: { coverage: 'Full', status: 'In Progress', payStatus: 'Invoices Paid', contractualCompletion: '2026-12-15', estimatedCompletion: '2026-12-10', approvedPct: 30, actualPct: 31, startYear: 2025, completionYear: 2026 },
  },
  {
    id: 6, projectNo: 'P-2699', name: 'Substation Access & Landscaping Works', employer: 'DEWA', companyId: 3, owner: 'DEWA',
    type: 'Infrastructure', mainFunction: 'Non-Building', location: 'Dubai', sector: 'Al Qudra', plot: null, builtupArea: 0,
    description: 'Supervision of access roads, boundary works, and landscaping around two new substations.',
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
    generalStatus: 'Completed', fund: 'Private', contractType: 'Conventional', contractSigned: true, loaObtained: true,
    contractValue: 510000, constructionCost: 12500000, contractorName: 'Skyline Facades',
    dpmId: 2, cpmId: null,
    stagesInvolved: ['Data Collection', 'Concept', 'Detailed', 'Tender Docs'], currentStage: 'Tender Docs',
    design: { sow: ['Facade Engineering', 'Structural Engineering', 'Feasibility Studies'], status: 'Completed', outputFormat: 'CAD', startYear: 2023, completionYear: 2024, financialStatus: 'Closed - No Dispute - All design fees paid', payStatus: 'Completed' },
    supervision: null,
  },
]
