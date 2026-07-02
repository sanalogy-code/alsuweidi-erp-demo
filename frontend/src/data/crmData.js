// Dummy CRM data for the proof-of-concept. Flat, relational-shaped arrays
// so Companies / Contacts / Pipeline views all read from one source of truth.

export const STAGES = ['Prospecting', 'Proposal', 'Negotiation', 'Won', 'Lost']

export const INITIAL_COMPANIES = [
  { id: 1, name: 'ADNOC', industry: 'Oil & Gas', location: 'Abu Dhabi', status: 'Active' },
  { id: 2, name: 'Etihad Airways', industry: 'Aviation', location: 'Abu Dhabi', status: 'Active' },
  { id: 3, name: 'DEWA', industry: 'Utilities', location: 'Dubai', status: 'Active' },
  { id: 4, name: 'Emaar Properties', industry: 'Real Estate', location: 'Dubai', status: 'Negotiation' },
  { id: 5, name: 'DP World', industry: 'Logistics', location: 'Dubai', status: 'Prospect' },
]

export const INITIAL_CONTACTS = [
  { id: 1, companyId: 1, name: 'Ahmed Al Mazrouei', title: 'Engineering Manager', email: 'ahmed@adnoc.ae', phone: '+971-2-401-2201', lastContact: '2026-06-28', notes: 'Discussed pump specifications' },
  { id: 2, companyId: 1, name: 'Fatima Al Mansoori', title: 'Project Lead', email: 'fatima@adnoc.ae', phone: '+971-2-401-2245', lastContact: '2026-06-20', notes: 'Requested proposal for Q3 project' },
  { id: 3, companyId: 2, name: 'Mohammed Al Ketbi', title: 'Technical Director', email: 'mkb@etihad.ae', phone: '+971-2-599-1102', lastContact: '2026-06-25', notes: 'Maintenance contract renewal' },
  { id: 4, companyId: 2, name: 'Noura Al Zaabi', title: 'Procurement Manager', email: 'noura@etihad.ae', phone: '+971-2-599-1187', lastContact: '2026-06-10', notes: 'Reviewing GSE upgrade scope' },
  { id: 5, companyId: 3, name: 'Sara Al Mansoori', title: 'Operations Manager', email: 'sara@dewa.gov.ae', phone: '+971-4-324-6610', lastContact: '2026-06-22', notes: 'Follow up on grid upgrade project' },
  { id: 6, companyId: 3, name: 'Khalid Al Shehhi', title: 'Procurement', email: 'khalid@dewa.gov.ae', phone: '+971-4-324-6688', lastContact: '2026-05-15', notes: 'Waiting for RFQ approval' },
  { id: 7, companyId: 4, name: 'Layla Al Mansouri', title: 'VP Engineering', email: 'layla@emaar.ae', phone: '+971-4-367-3300', lastContact: '2026-06-15', notes: 'Proposal under review' },
  { id: 8, companyId: 4, name: 'Rashid Al Nuaimi', title: 'Finance Director', email: 'rashid@emaar.ae', phone: '+971-4-367-3355', lastContact: null, notes: 'Introduced via Layla, not yet contacted directly' },
  { id: 9, companyId: 5, name: 'Omar Al Mazrouei', title: 'CEO', email: 'omar@dpworld.ae', phone: '+971-4-881-5200', lastContact: null, notes: 'Cold prospect - needs warm introduction' },
]

export const INITIAL_DEALS = [
  { id: 101, companyId: 1, contactId: 1, title: 'Pump Station Upgrade', value: 850000, stage: 'Won', probability: 100, closeDate: '2026-Q2' },
  { id: 102, companyId: 1, contactId: 2, title: 'Pipeline Inspection', value: 320000, stage: 'Proposal', probability: 60, closeDate: '2026-Q3' },
  { id: 103, companyId: 1, contactId: 1, title: 'Control System Retrofit', value: 1330000, stage: 'Negotiation', probability: 75, closeDate: '2026-Q4' },
  { id: 201, companyId: 2, contactId: 3, title: 'Hangar Electrical Systems', value: 1500000, stage: 'Won', probability: 100, closeDate: '2026-Q1' },
  { id: 202, companyId: 2, contactId: 3, title: 'Maintenance Contract 2026', value: 300000, stage: 'Proposal', probability: 50, closeDate: '2026-Q2' },
  { id: 203, companyId: 2, contactId: 4, title: 'Ground Support Equipment Upgrade', value: 420000, stage: 'Prospecting', probability: 20, closeDate: '2026-Q4' },
  { id: 301, companyId: 3, contactId: 5, title: 'Smart Grid Upgrade Phase 2', value: 950000, stage: 'Negotiation', probability: 70, closeDate: '2026-Q3' },
  { id: 302, companyId: 3, contactId: 6, title: 'Substation Inspection Program', value: 210000, stage: 'Prospecting', probability: 25, closeDate: '2027-Q1' },
  { id: 401, companyId: 4, contactId: 7, title: 'Downtown Development - Infrastructure', value: 3200000, stage: 'Proposal', probability: 55, closeDate: '2026-Q4' },
  { id: 402, companyId: 4, contactId: 8, title: 'Marina Tower MEP Consultancy', value: 680000, stage: 'Lost', probability: 0, closeDate: '2026-Q2' },
]

export const STAGE_COLOR = {
  Prospecting: 'bg-gray-100 text-gray-700 border-gray-300',
  Proposal: 'bg-blue-100 text-blue-700 border-blue-300',
  Negotiation: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Won: 'bg-green-100 text-green-700 border-green-300',
  Lost: 'bg-red-100 text-red-700 border-red-300',
}

// Full literal class names so Tailwind's content scanner can see them
// (string-concatenating a color name at runtime would not be detected).
export const STAGE_BAR_COLOR = {
  Prospecting: 'bg-gray-400',
  Proposal: 'bg-blue-400',
  Negotiation: 'bg-yellow-400',
  Won: 'bg-green-400',
  Lost: 'bg-red-400',
}

export function getStatusColor(status) {
  switch (status) {
    case 'Won': return 'bg-green-200 text-green-800'
    case 'Proposal': return 'bg-blue-200 text-blue-800'
    case 'Negotiation': return 'bg-yellow-200 text-yellow-800'
    case 'Lost': return 'bg-red-200 text-red-800'
    case 'Active': return 'bg-green-100 text-green-700'
    case 'Prospect': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-200 text-gray-700'
  }
}

export function formatCurrency(value) {
  if (!value) return 'TBD'
  return `AED ${(value / 1000000).toFixed(2)}M`
}

export function formatCurrencyShort(value) {
  if (!value) return 'AED 0'
  if (value >= 1000000) return `AED ${(value / 1000000).toFixed(2)}M`
  return `AED ${Math.round(value / 1000)}K`
}

export function daysSince(date) {
  if (!date) return 'Never'
  const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
