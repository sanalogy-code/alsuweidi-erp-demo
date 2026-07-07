// Office Administration — dummy data (7 Jul, Sana: "admin is admin staff, not IT
// admin — these shouldn't share a module"). This module is the ADMIN STAFF
// workspace (office administration / document control); the Admin Center stays
// pure system administration (users, roles, audit, system feedback).
//
// Core register: CORRESPONDENCE — consultancies live by letter reference numbers.
// Refs follow the house pattern OUT-YYYY-NNN / IN-YYYY-NNN.

export const OFFICE_VIEW_ROLES = ['adminstaff', 'admin', 'management']

export const LETTER_TYPES = ['Letter', 'Transmittal', 'NOC request', 'Invoice cover', 'Contract / LOA', 'Authority submission', 'Other']

export const LETTER_STATUSES = [
  { key: 'action_required', label: 'Action required', chip: 'bg-amber-100 text-amber-700' },
  { key: 'replied', label: 'Replied', chip: 'bg-blue-100 text-blue-700' },
  { key: 'filed', label: 'Filed', chip: 'bg-gray-100 text-gray-500' },
]
export const letterStatusMeta = (k) => LETTER_STATUSES.find((s) => s.key === k) || LETTER_STATUSES[0]

// direction: 'in' | 'out'. projectId → projectsData PROJECTS (nullable).
export const CORRESPONDENCE = [
  { id: 1, ref: 'IN-2026-118', direction: 'in', date: '2026-07-05', party: 'Emirates BuildCo LLC', subject: 'Notice under SC 20.1 — medical equipment vendor drawings delay (EBC/HPM/L-204)', type: 'Letter', projectId: 1, status: 'action_required', attachment: 'EBC-HPM-L-204.pdf', dueBy: '2026-07-19' },
  { id: 2, ref: 'OUT-2026-141', direction: 'out', date: '2026-07-02', party: 'ADCD (Civil Defence)', subject: 'Response to smoke-control shop drawing comments — fan duty clarification', type: 'Authority submission', projectId: 1, status: 'filed', attachment: 'HPM-ADCD-response-fan-duty.pdf', dueBy: null },
  { id: 3, ref: 'IN-2026-121', direction: 'in', date: '2026-06-30', party: 'DMT / ITC', subject: 'TIS review comments — Khalifa City school cluster (extend AM peak analysis)', type: 'Letter', projectId: 7, status: 'action_required', attachment: 'ITC-TIS-comments-r1.pdf', dueBy: '2026-07-21' },
  { id: 4, ref: 'OUT-2026-138', direction: 'out', date: '2026-06-30', party: 'ADNOC', subject: 'Supervision fee invoice Q2 2026 — cover letter (INV-2026-007)', type: 'Invoice cover', projectId: 8, status: 'filed', attachment: 'PSU-invoice-cover-Q2.pdf', dueBy: null },
  { id: 5, ref: 'IN-2026-115', direction: 'in', date: '2026-06-25', party: 'Aldar Properties', subject: 'RFP — TIS and access design, Al Shamkha plots (award pending)', type: 'Letter', projectId: null, status: 'replied', attachment: 'aldar-rfp-shamkha.pdf', dueBy: null },
  { id: 6, ref: 'OUT-2026-142', direction: 'out', date: '2026-07-06', party: 'Emaar Properties', subject: 'Statement of account — Saadiyat Villas C4 (Q2 supervision fees outstanding)', type: 'Letter', projectId: 5, status: 'filed', attachment: 'emaar-soa-2026-06.pdf', dueBy: null },
]
