// Dummy IT data — hardware assets, software licenses, and the request queue.
// assignedToId references hrData EMPLOYEES. All invented, no real serials.

export const ASSET_TYPES = ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Tablet', 'Printer', 'Plotter', 'Peripheral', 'Other']

export const ASSET_STATUS = {
  in_use: { label: 'In use', chip: 'bg-green-100 text-green-700' },
  in_stock: { label: 'In stock', chip: 'bg-blue-100 text-blue-700' },
  repair: { label: 'In repair', chip: 'bg-amber-100 text-amber-700' },
  retired: { label: 'Retired', chip: 'bg-gray-100 text-gray-500' },
}

export const IT_ASSETS = [
  { id: 1, tag: 'IT-0031', type: 'Laptop', model: 'Dell Precision 5680', serial: 'DP568-4471X', purchaseDate: '2025-02-11', valueAed: 9800, assignedToId: 2, status: 'in_use', notes: 'BIM workstation spec' },
  { id: 2, tag: 'IT-0032', type: 'Laptop', model: 'Dell Precision 5680', serial: 'DP568-4472Y', purchaseDate: '2025-02-11', valueAed: 9800, assignedToId: 3, status: 'in_use', notes: null },
  { id: 3, tag: 'IT-0040', type: 'Laptop', model: 'Lenovo ThinkPad T14', serial: 'LT14-90213', purchaseDate: '2025-09-02', valueAed: 4200, assignedToId: 7, status: 'in_use', notes: null },
  { id: 4, tag: 'IT-0041', type: 'Laptop', model: 'Lenovo ThinkPad T14', serial: 'LT14-90214', purchaseDate: '2025-09-02', valueAed: 4200, assignedToId: null, status: 'in_stock', notes: 'Earmarked for Daniel Okoye (new joiner, starts 15 Jul)' },
  { id: 5, tag: 'IT-0022', type: 'Monitor', model: 'Dell U2723QE 27"', serial: 'DU27-3301A', purchaseDate: '2024-06-20', valueAed: 2100, assignedToId: 2, status: 'in_use', notes: null },
  { id: 6, tag: 'IT-0018', type: 'Plotter', model: 'HP DesignJet T1700', serial: 'HPDJ-77281', purchaseDate: '2023-11-05', valueAed: 16500, assignedToId: null, status: 'repair', notes: 'Feed roller fault — vendor ticket open' },
  { id: 7, tag: 'IT-0044', type: 'Phone', model: 'iPhone 15', serial: 'IP15-58102', purchaseDate: '2025-10-14', valueAed: 3400, assignedToId: 10, status: 'in_use', notes: 'Site line' },
  { id: 8, tag: 'IT-0009', type: 'Desktop', model: 'HP Z4 G4 Workstation', serial: 'HPZ4-11934', purchaseDate: '2022-03-18', valueAed: 12000, assignedToId: null, status: 'retired', notes: 'Written off Q1 2026' },
]

export const SOFTWARE_LICENSES = [
  { id: 1, name: 'Autodesk AEC Collection (AutoCAD + Revit)', seats: 12, seatsUsed: 11, renewalDate: '2026-08-10', costAedYearly: 42000, owner: 'IT/BIM' },
  { id: 2, name: 'Microsoft 365 Business Standard', seats: 45, seatsUsed: 42, renewalDate: '2027-01-15', costAedYearly: 24300, owner: 'Admin' },
  { id: 3, name: 'Adobe Creative Cloud (2 seats)', seats: 2, seatsUsed: 2, renewalDate: '2026-06-20', costAedYearly: 5200, owner: 'Marketing' },
  { id: 4, name: 'Primavera P6 Professional', seats: 4, seatsUsed: 3, renewalDate: '2027-03-01', costAedYearly: 11800, owner: 'Projects' },
  { id: 5, name: 'ETABS / SAFE structural suite', seats: 3, seatsUsed: 3, renewalDate: '2026-11-30', costAedYearly: 15600, owner: 'Engineering' },
]

export const IT_REQUEST_TYPES = ['Hardware', 'Software / license', 'Repair / replacement', 'Access / accounts']

export const IT_REQUEST_STATUS = {
  pending: { label: 'Pending', chip: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved — procuring', chip: 'bg-blue-100 text-blue-700' },
  fulfilled: { label: 'Fulfilled', chip: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', chip: 'bg-red-100 text-red-700' },
}

export const IT_REQUESTS = [
  { id: 1, requestedBy: 'Osama Hussain', type: 'Hardware', item: 'Second monitor', justification: 'Drawing review + email side by side', requestedDate: '2026-06-28', status: 'pending', resolution: null, resolvedDate: null },
  { id: 2, requestedBy: 'Mariam Al Shamsi', type: 'Software / license', item: 'Primavera P6 seat', justification: 'Taking over programme updates for two supervision projects', requestedDate: '2026-06-25', status: 'approved', resolution: 'Seat available on current licence — assigning', resolvedDate: '2026-06-30' },
  { id: 3, requestedBy: 'Daniel Okoye', type: 'Hardware', item: 'Laptop for new joiner', justification: 'Starting 15 Jul — needs BIM-capable machine', requestedDate: '2026-06-22', status: 'fulfilled', resolution: 'Assigned spare ThinkPad IT-0041', resolvedDate: '2026-07-01' },
  { id: 4, requestedBy: 'Khalid Rahman', type: 'Repair / replacement', item: 'Plotter feed roller', justification: 'IFC packages printing skewed', requestedDate: '2026-06-18', status: 'approved', resolution: 'Vendor ticket open — asset IT-0018 flagged in repair', resolvedDate: '2026-06-24' },
]

// ---------------------------------------------------------------------------
// SLA targets (working days) per request type — open = pending or approved.
// ---------------------------------------------------------------------------
export const SLA_TARGETS = {
  'Access / accounts': 1,
  'Software / license': 2,
  'Repair / replacement': 3,
  'Hardware': 5,
}

// ---------------------------------------------------------------------------
// Installed software per asset — licenseId → SOFTWARE_LICENSES, assetId →
// IT_ASSETS. A license is over-deployed when installs exceed its seat count.
// ---------------------------------------------------------------------------
export const INSTALLED_SOFTWARE = [
  { id: 1, assetId: 1, licenseId: 1, installedDate: '2025-02-14' },
  { id: 2, assetId: 1, licenseId: 2, installedDate: '2025-02-14' },
  { id: 3, assetId: 2, licenseId: 1, installedDate: '2025-02-14' },
  { id: 4, assetId: 2, licenseId: 2, installedDate: '2025-02-14' },
  { id: 5, assetId: 2, licenseId: 5, installedDate: '2025-03-01' },
  { id: 6, assetId: 3, licenseId: 2, installedDate: '2025-09-05' },
  { id: 7, assetId: 3, licenseId: 3, installedDate: '2025-09-05' },
  { id: 8, assetId: 4, licenseId: 2, installedDate: '2026-07-01' },
  { id: 9, assetId: 4, licenseId: 3, installedDate: '2026-07-01' },
  { id: 10, assetId: 1, licenseId: 3, installedDate: '2026-06-20' }, // 3rd CC install on a 2-seat license — over-deployed
]

// ---------------------------------------------------------------------------
// Preventive maintenance — site/survey equipment (not yet in the asset
// registry proper; free-text asset names for the demo).
// ---------------------------------------------------------------------------
export const MAINTENANCE_ITEMS = [
  { id: 1, asset: 'Leica TS16 total station', task: 'Calibration (accredited lab)', everyMonths: 12, lastDone: '2025-06-15', nextDue: '2026-06-15' },
  { id: 2, asset: 'Leica NA720 auto level', task: 'Collimation check', everyMonths: 6, lastDone: '2026-02-10', nextDue: '2026-08-10' },
  { id: 3, asset: 'HP DesignJet T1700 plotter (IT-0018)', task: 'Vendor service — rollers + heads', everyMonths: 6, lastDone: '2026-01-20', nextDue: '2026-07-20' },
  { id: 4, asset: 'Site drone — DJI Mavic 3E', task: 'Firmware + gimbal service', everyMonths: 4, lastDone: '2026-04-05', nextDue: '2026-08-05' },
]

// ---------------------------------------------------------------------------
// Access requests — tied to the Admin Center role×module matrix
// (adminData PERMISSION_MODULES / ACCESS_LEVELS). Approval here is a record
// only: enforcement is the Phase 2 auth backend.
// ---------------------------------------------------------------------------
export const ACCESS_REQUESTS = [
  { id: 1, requestedBy: 'Hassan Al Shamsi', role: 'pm', module: 'crm', level: 'full', justification: 'Following up his own leads for the Al Ain branch — needs to log meetings, not just view', requestedDate: '2026-07-04', status: 'pending', decidedBy: null, decidedDate: null, decisionNote: null },
  { id: 2, requestedBy: 'Priya Nair', role: 'adminstaff', module: 'projects', level: 'view', justification: 'Document control — needs to see project numbers and deliverable refs to file correspondence correctly', requestedDate: '2026-07-01', status: 'approved', decidedBy: 'Ahmed El Haddad', decidedDate: '2026-07-02', decisionNote: 'View only — matches DC duties' },
  { id: 3, requestedBy: 'Reem Al Falasi', role: 'marketing', module: 'finance', level: 'view', justification: 'Wants invoice totals for the annual report infographic', requestedDate: '2026-06-29', status: 'declined', decidedBy: 'Ahmed El Haddad', decidedDate: '2026-06-30', decisionNote: 'Finance is sensitive — ask Finance to export the figures instead' },
]

// ---------------------------------------------------------------------------
// System status board — ALL MOCK until real monitoring/backup feeds exist
// (Phase 2). Numbers are illustrative.
// ---------------------------------------------------------------------------
export const SYSTEM_STATUS = [
  { id: 1, service: 'File server (office NAS)', status: 'ok', uptimePct: 99.9, lastBackup: '2026-07-07 02:00', restoreTest: '2026-05-14', note: 'Nightly backup to cloud bucket' },
  { id: 2, service: 'ERP demo host', status: 'ok', uptimePct: 99.7, lastBackup: '2026-07-07 03:15', restoreTest: '2026-06-02', note: 'Frontend demo — no server-side data yet' },
  { id: 3, service: 'Mail (Microsoft 365)', status: 'ok', uptimePct: 100, lastBackup: '2026-07-06 23:00', restoreTest: '2026-04-20', note: 'Third-party mailbox backup' },
  { id: 4, service: 'Backup job — site photos archive', status: 'degraded', uptimePct: 97.2, lastBackup: '2026-07-04 02:00', restoreTest: '2026-03-30', note: 'Last two nightly runs skipped — disk 91% full' },
]
