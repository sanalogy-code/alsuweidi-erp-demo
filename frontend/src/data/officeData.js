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

// ---------------------------------------------------------------------------
// Meeting rooms — bookings are per-day time slots; clash detection in the view.
// ---------------------------------------------------------------------------
export const MEETING_ROOMS = [
  { id: 1, name: 'Majlis', capacity: 14, features: 'Client-facing · large screen + VC' },
  { id: 2, name: 'Boardroom', capacity: 8, features: 'VC unit · whiteboard' },
  { id: 3, name: 'Small meeting room', capacity: 4, features: 'Whiteboard only' },
]

export const ROOM_BOOKINGS = [
  { id: 1, roomId: 1, date: '2026-07-07', from: '10:00', to: '11:30', bookedBy: 'Osama Hussain', purpose: 'Emirates BuildCo — SC 20.1 delay notice review' },
  { id: 2, roomId: 2, date: '2026-07-07', from: '09:00', to: '09:30', bookedBy: 'Layla Al Mazrouei', purpose: 'Weekly HR stand-up' },
  { id: 3, roomId: 2, date: '2026-07-07', from: '14:00', to: '15:30', bookedBy: 'Khalid Al Ketbi', purpose: 'Q2 invoicing review with projects leads' },
  { id: 4, roomId: 3, date: '2026-07-08', from: '11:00', to: '12:00', bookedBy: 'Priya Nair', purpose: 'Document control induction — new joiner' },
  { id: 5, roomId: 1, date: '2026-07-09', from: '13:00', to: '16:00', bookedBy: 'Fatima Al Mansouri', purpose: 'Aldar Al Shamkha RFP — proposal workshop' },
]

// ---------------------------------------------------------------------------
// Office supplies requests — requested → ordered → delivered (or declined).
// ---------------------------------------------------------------------------
export const SUPPLY_STATUSES = {
  requested: { label: 'Requested', chip: 'bg-amber-100 text-amber-700' },
  ordered: { label: 'Ordered', chip: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Delivered', chip: 'bg-green-100 text-green-700' },
  declined: { label: 'Declined', chip: 'bg-red-100 text-red-700' },
}

export const SUPPLY_REQUESTS = [
  { id: 1, item: 'A1 plotter paper rolls (box of 4)', qty: 2, requestedBy: 'Priya Nair', requestedDate: '2026-07-05', neededBy: '2026-07-10', status: 'requested', note: 'IFC package printing next week' },
  { id: 2, item: 'Toner — HP LaserJet (black)', qty: 3, requestedBy: 'Maryam Al Kaabi', requestedDate: '2026-07-02', neededBy: null, status: 'ordered', note: null },
  { id: 3, item: 'Arabic coffee + dates (majlis stock)', qty: 1, requestedBy: 'Maryam Al Kaabi', requestedDate: '2026-06-28', neededBy: '2026-07-01', status: 'delivered', note: 'Client visits this month' },
  { id: 4, item: 'Standing desk converter', qty: 1, requestedBy: 'Hassan Al Shamsi', requestedDate: '2026-06-25', neededBy: null, status: 'declined', note: 'Declined — furniture requests go through HR facilities budget' },
]

// ---------------------------------------------------------------------------
// Courier / dispatch log — sits beside the correspondence register; refs are
// free-text so a waybill can point at an OUT-2026-NNN letter or a project no.
// ---------------------------------------------------------------------------
export const COURIER_COMPANIES = ['Aramex', 'Emirates Post', 'FedEx', 'DHL', 'Company driver']

export const COURIER_STATUSES = {
  sent: { label: 'Sent', chip: 'bg-blue-100 text-blue-700' },
  in_transit: { label: 'In transit', chip: 'bg-amber-100 text-amber-700' },
  delivered: { label: 'Delivered', chip: 'bg-green-100 text-green-700' },
  received: { label: 'Received', chip: 'bg-green-100 text-green-700' },
}

export const COURIER_LOG = [
  { id: 1, direction: 'out', date: '2026-07-06', company: 'Aramex', waybill: 'ARX-4471820', party: 'ADCD (Civil Defence), Abu Dhabi', ref: 'OUT-2026-141', status: 'in_transit', receivedBy: null, contents: 'Smoke-control response package — 3 drawing sets' },
  { id: 2, direction: 'out', date: '2026-07-02', company: 'Company driver', waybill: '—', party: 'ADNOC HQ, Corniche', ref: 'OUT-2026-138 / INV-2026-007', status: 'delivered', receivedBy: 'ADNOC mailroom (stamped copy on file)', contents: 'Q2 supervision invoice — original + copy' },
  { id: 3, direction: 'in', date: '2026-07-01', company: 'Emirates Post', waybill: 'EP-889145203AE', party: 'DMT / ITC', ref: 'IN-2026-121', status: 'received', receivedBy: 'Priya Nair', contents: 'TIS review comments — hard copy' },
  { id: 4, direction: 'out', date: '2026-06-30', company: 'FedEx', waybill: 'FX-772938114', party: 'Emirates BuildCo LLC, Musaffah', ref: 'P-104', status: 'delivered', receivedBy: 'Site office DC', contents: 'Signed WIR batch + transmittal' },
  { id: 5, direction: 'in', date: '2026-06-27', company: 'Aramex', waybill: 'ARX-4463017', party: 'Aldar Properties', ref: 'IN-2026-115', status: 'received', receivedBy: 'Maryam Al Kaabi', contents: 'RFP dossier — Al Shamkha plots' },
]

// ---------------------------------------------------------------------------
// Company vehicles, booking log, and Salik/fines. Payroll deduction is a
// display-only flag — actual deduction is a Phase 2 payroll integration, and
// the RTA/Salik feed is Phase 2 too (entries are keyed by hand for now).
// ---------------------------------------------------------------------------
export const VEHICLES = [
  { id: 1, plate: 'AD 5 71249', model: 'Toyota Land Cruiser 2023', assignment: 'Pool — site visits', color: 'White' },
  { id: 2, plate: 'AD 14 88031', model: 'Nissan Sunny 2024', assignment: 'Pool — errands / PRO runs', color: 'Silver' },
]

export const VEHICLE_BOOKINGS = [
  { id: 1, vehicleId: 1, driver: 'Samir Al Mazrouei', date: '2026-07-06', purpose: 'Hospital site — supervision visit', kmOut: 48210, kmIn: 48332 },
  { id: 2, vehicleId: 2, driver: 'Maryam Al Kaabi', date: '2026-07-05', purpose: 'TAMM service centre — trade licence renewal papers', kmOut: 12040, kmIn: 12088 },
  { id: 3, vehicleId: 1, driver: 'Hassan Al Shamsi', date: '2026-07-08', purpose: 'Khalifa City school cluster — site walk', kmOut: null, kmIn: null },
]

export const SALIK_FINES = [
  { id: 1, vehicleId: 1, date: '2026-07-06', type: 'salik', amountAed: 4, driver: 'Samir Al Mazrouei', deductFromPayroll: false, note: 'Sheikh Zayed bridge gate' },
  { id: 2, vehicleId: 1, date: '2026-06-28', type: 'fine', amountAed: 600, driver: 'Samir Al Mazrouei', deductFromPayroll: true, note: 'Speeding — 21 km/h over, E11' },
  { id: 3, vehicleId: 2, date: '2026-06-30', type: 'salik', amountAed: 4, driver: 'Maryam Al Kaabi', deductFromPayroll: false, note: null },
  { id: 4, vehicleId: 2, date: '2026-06-22', type: 'fine', amountAed: 150, driver: 'Maryam Al Kaabi', deductFromPayroll: false, note: 'Parking — Mussafah; company absorbed (work errand)' },
]
