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
