// Admin Center seed data — user accounts, role → module access matrix, and a
// mock audit/usage log. Demo-grade: accounts mirror the HR employee seeds, the
// permission matrix mirrors the real *_VIEW_ROLES constants in dashboardData.js
// (which remain the actual client-side gates — editing the matrix here is a
// requirements-gathering mock, it does not re-gate the app). Phase 2 replaces
// all of this with real auth + server-side RBAC.

// Who can open the Admin Center. System admin owns it; management can look.
export const ADMIN_VIEW_ROLES = ['admin', 'management']

export const USER_STATUSES = [
  { key: 'active', label: 'Active' },
  { key: 'invited', label: 'Invited' },
  { key: 'disabled', label: 'Disabled' },
]

export const userStatusMeta = (status) =>
  ({
    active: { label: 'Active', chip: 'bg-emerald-50 text-emerald-700' },
    invited: { label: 'Invited', chip: 'bg-blue-50 text-blue-700' },
    disabled: { label: 'Disabled', chip: 'bg-gray-100 text-gray-500' },
  }[status] || { label: status, chip: 'bg-gray-100 text-gray-500' })

// User accounts. employeeId links to hrData EMPLOYEES where the account belongs
// to a staff member; null for system/external accounts (e.g. the PRO company).
export const USER_ACCOUNTS = [
  { id: 1, name: 'Osama Hussain', email: 'osama@alsuweidi.com', role: 'pm', employeeId: 1, status: 'active', createdDate: '2026-05-02', lastLogin: '2026-07-04 08:42', logins30d: 41 },
  { id: 2, name: 'Naseeb Shaheen', email: 'naseeb@alsuweidi.com', role: 'pm', employeeId: 2, status: 'active', createdDate: '2026-05-02', lastLogin: '2026-07-02 09:15', logins30d: 28 },
  { id: 3, name: 'Mohammad Kubba', email: 'mkubba@alsuweidi.com', role: 'pm', employeeId: 3, status: 'active', createdDate: '2026-05-02', lastLogin: '2026-07-03 14:03', logins30d: 22 },
  { id: 4, name: 'Ahmed El Haddad', email: 'ahaddad@alsuweidi.com', role: 'it', employeeId: 4, status: 'active', createdDate: '2026-05-02', lastLogin: '2026-07-04 07:58', logins30d: 52 },
  { id: 5, name: 'Layla Al Mazrouei', email: 'layla@alsuweidi.com', role: 'hr', employeeId: 5, status: 'active', createdDate: '2026-05-02', lastLogin: '2026-07-04 08:10', logins30d: 58 },
  { id: 6, name: 'Khalid Al Ketbi', email: 'khalid@alsuweidi.com', role: 'management', employeeId: 6, status: 'active', createdDate: '2026-05-02', lastLogin: '2026-07-03 16:40', logins30d: 19 },
  { id: 7, name: 'Fatima Al Mansouri', email: 'fatima@alsuweidi.com', role: 'sales', employeeId: 7, status: 'active', createdDate: '2026-05-02', lastLogin: '2026-06-30 11:22', logins30d: 15 },
  { id: 8, name: 'Hassan Al Shamsi', email: 'hassan@alsuweidi.com', role: 'pm', employeeId: 8, status: 'active', createdDate: '2026-05-02', lastLogin: '2026-07-04 08:05', logins30d: 33 },
  { id: 9, name: 'Maryam Al Kaabi', email: 'maryam@alsuweidi.com', role: 'adminstaff', employeeId: 9, status: 'active', createdDate: '2026-05-02', lastLogin: '2026-07-01 10:31', logins30d: 20 },
  { id: 10, name: 'Samir Al Mazrouei', email: 'samir@alsuweidi.com', role: 'pm', employeeId: 10, status: 'disabled', createdDate: '2026-05-02', lastLogin: '2026-06-12 07:44', logins30d: 4, disabledReason: 'Seconded to site JV — access suspended per IT policy' },
  { id: 11, name: 'Priya Nair', email: 'priya@alsuweidi.com', role: 'adminstaff', employeeId: 11, status: 'active', createdDate: '2026-06-15', lastLogin: '2026-07-03 09:20', logins30d: 12 },
  { id: 12, name: 'Sana Diab', email: 'sana@alsuweidi.com', role: 'admin', employeeId: null, status: 'active', createdDate: '2026-05-01', lastLogin: '2026-07-04 09:01', logins30d: 66 },
  { id: 13, name: 'Gulf PRO Services', email: 'pro@gulfproservices.ae', role: 'pro', employeeId: null, status: 'active', createdDate: '2026-05-20', lastLogin: '2026-07-02 13:12', logins30d: 9, note: 'External — PRO company account' },
  { id: 14, name: 'Reem Al Falasi', email: 'reem@alsuweidi.com', role: 'marketing', employeeId: null, status: 'invited', createdDate: '2026-07-02', lastLogin: null, logins30d: 0, note: 'Invitation email sent — awaiting password setup' },
]

// The modules the matrix covers, in home-tile order.
export const PERMISSION_MODULES = [
  { key: 'crm', label: 'CRM' },
  { key: 'projects', label: 'Projects' },
  { key: 'hr_self', label: 'HR — self-service' },
  { key: 'hr_workspace', label: 'HR — workspace' },
  { key: 'it_requests', label: 'IT — requests' },
  { key: 'it_workspace', label: 'IT — workspace' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'branding', label: 'Branding library' },
  { key: 'finance', label: 'Financials' },
  { key: 'admin', label: 'Admin Center' },
]

export const ACCESS_LEVELS = [
  { key: 'none', label: '—' },
  { key: 'view', label: 'View' },
  { key: 'full', label: 'Full' },
]

// Role × module access, mirroring what the UI actually gates today
// (dashboardData.js *_VIEW_ROLES + per-view checks). This IS the Phase 2
// access-control spec — keep it in sync when a gate changes.
export const DEFAULT_PERMISSIONS = {
  sales: { crm: 'full', projects: 'view', hr_self: 'full', hr_workspace: 'none', it_requests: 'full', it_workspace: 'none', marketing: 'none', branding: 'view', finance: 'none', admin: 'none' },
  pm: { crm: 'view', projects: 'full', hr_self: 'full', hr_workspace: 'none', it_requests: 'full', it_workspace: 'none', marketing: 'none', branding: 'view', finance: 'none', admin: 'none' },
  marketing: { crm: 'view', projects: 'view', hr_self: 'full', hr_workspace: 'none', it_requests: 'full', it_workspace: 'none', marketing: 'full', branding: 'full', finance: 'none', admin: 'none' },
  hr: { crm: 'none', projects: 'view', hr_self: 'full', hr_workspace: 'full', it_requests: 'full', it_workspace: 'none', marketing: 'none', branding: 'view', finance: 'none', admin: 'none' },
  it: { crm: 'none', projects: 'none', hr_self: 'full', hr_workspace: 'none', it_requests: 'full', it_workspace: 'full', marketing: 'none', branding: 'view', finance: 'none', admin: 'none' },
  adminstaff: { crm: 'none', projects: 'none', hr_self: 'full', hr_workspace: 'none', it_requests: 'full', it_workspace: 'none', marketing: 'none', branding: 'view', finance: 'none', admin: 'none' },
  pro: { crm: 'none', projects: 'none', hr_self: 'none', hr_workspace: 'none', it_requests: 'none', it_workspace: 'none', marketing: 'none', branding: 'none', finance: 'none', admin: 'none' },
  management: { crm: 'full', projects: 'full', hr_self: 'full', hr_workspace: 'full', it_requests: 'full', it_workspace: 'full', marketing: 'full', branding: 'full', finance: 'full', admin: 'view' },
  admin: { crm: 'full', projects: 'full', hr_self: 'full', hr_workspace: 'full', it_requests: 'full', it_workspace: 'full', marketing: 'full', branding: 'full', finance: 'full', admin: 'full' },
}

// Mock audit log — the kind of trail the Phase 2 backend will record for real.
// action kinds: login / create / update / approve / reject / delete / access_denied / export
export const AUDIT_LOG = [
  { id: 1, ts: '2026-07-04 09:01', user: 'Sana Diab', module: 'Admin', kind: 'login', detail: 'Signed in' },
  { id: 2, ts: '2026-07-04 08:42', user: 'Osama Hussain', module: 'HR', kind: 'approve', detail: 'Approved team timesheet — Hassan Al Shamsi, week of 22 Jun' },
  { id: 3, ts: '2026-07-04 08:31', user: 'Layla Al Mazrouei', module: 'HR', kind: 'approve', detail: 'Leave request approved (HR step 2/2) — Hassan Al Shamsi, 3 days annual' },
  { id: 4, ts: '2026-07-04 08:12', user: 'Khalid Al Ketbi', module: 'Financials', kind: 'update', detail: 'Invoice INV-2026-014 marked paid — AED 183,750' },
  { id: 5, ts: '2026-07-04 08:05', user: 'Hassan Al Shamsi', module: 'HR', kind: 'create', detail: 'Submitted timesheet — week of 29 Jun' },
  { id: 6, ts: '2026-07-03 16:44', user: 'Fatima Al Mansouri', module: 'Financials', kind: 'access_denied', detail: 'Attempted to open /finance — role has no access' },
  { id: 7, ts: '2026-07-03 16:40', user: 'Khalid Al Ketbi', module: 'Financials', kind: 'approve', detail: 'Expense approved — subconsultant fees, AED 42,000' },
  { id: 8, ts: '2026-07-03 15:20', user: 'Ahmed El Haddad', module: 'IT & Assets', kind: 'update', detail: 'Asset IT-0031 reassigned to Priya Nair' },
  { id: 9, ts: '2026-07-03 14:03', user: 'Mohammad Kubba', module: 'Projects', kind: 'update', detail: 'Supervision actual % updated — P-118 Khalifa City School' },
  { id: 10, ts: '2026-07-03 11:47', user: 'Reem Al Falasi', module: 'Admin', kind: 'create', detail: 'User invited by Sana Diab — role Marketing' },
  { id: 11, ts: '2026-07-03 10:58', user: 'Layla Al Mazrouei', module: 'HR', kind: 'reject', detail: 'Document rejected — Priya Nair degree certificate (attestation illegible)' },
  { id: 12, ts: '2026-07-03 10:35', user: 'Fatima Al Mansouri', module: 'CRM', kind: 'export', detail: 'Contact export — 34 contacts (Excel)' },
  { id: 13, ts: '2026-07-03 09:20', user: 'Priya Nair', module: 'HR', kind: 'update', detail: 'Re-uploaded rejected document — degree certificate' },
  { id: 14, ts: '2026-07-02 15:12', user: 'Gulf PRO Services', module: 'HR', kind: 'update', detail: 'PRO task completed — visa stamping, Ahmed El Haddad' },
  { id: 15, ts: '2026-07-02 13:40', user: 'Sana Diab', module: 'Admin', kind: 'update', detail: 'Samir Al Mazrouei account disabled — secondment policy' },
  { id: 16, ts: '2026-07-02 11:05', user: 'Layla Al Mazrouei', module: 'HR', kind: 'create', detail: 'Payroll run generated — June 2026 WPS SIF' },
  { id: 17, ts: '2026-07-01 17:22', user: 'Khalid Al Ketbi', module: 'Financials', kind: 'create', detail: 'Invoice INV-2026-017 drafted — Nadd Al Shiba Villas supervision' },
  { id: 18, ts: '2026-07-01 14:16', user: 'Ahmed El Haddad', module: 'IT & Assets', kind: 'create', detail: 'License added — Bluebeam Revu, 8 seats' },
  { id: 19, ts: '2026-07-01 10:31', user: 'Maryam Al Kaabi', module: 'HR', kind: 'create', detail: 'Business card request submitted' },
  { id: 20, ts: '2026-06-30 12:02', user: 'Osama Hussain', module: 'CRM', kind: 'update', detail: 'Deal moved to Negotiation — DEWA Smart Grid Upgrade' },
  { id: 21, ts: '2026-06-30 09:48', user: 'Hassan Al Shamsi', module: 'IT & Assets', kind: 'create', detail: 'Hardware request — replacement dock' },
  { id: 22, ts: '2026-06-29 16:35', user: 'Sana Diab', module: 'Admin', kind: 'update', detail: 'Role permissions reviewed — no changes' },
  { id: 23, ts: '2026-06-29 11:20', user: 'Layla Al Mazrouei', module: 'HR', kind: 'create', detail: 'Certificate letter issued — salary certificate, Naseeb Shaheen' },
  { id: 24, ts: '2026-06-28 10:15', user: 'Fatima Al Mansouri', module: 'CRM', kind: 'create', detail: 'Interaction logged — site visit, Emirates Steel' },
]

export const AUDIT_KINDS = [
  { key: 'login', label: 'Login', chip: 'bg-gray-100 text-gray-600' },
  { key: 'create', label: 'Create', chip: 'bg-blue-50 text-blue-700' },
  { key: 'update', label: 'Update', chip: 'bg-indigo-50 text-indigo-700' },
  { key: 'approve', label: 'Approve', chip: 'bg-emerald-50 text-emerald-700' },
  { key: 'reject', label: 'Reject', chip: 'bg-red-50 text-red-600' },
  { key: 'delete', label: 'Delete', chip: 'bg-red-50 text-red-600' },
  { key: 'access_denied', label: 'Access denied', chip: 'bg-amber-50 text-amber-700' },
  { key: 'export', label: 'Export', chip: 'bg-purple-50 text-purple-700' },
]

export const auditKindMeta = (kind) =>
  AUDIT_KINDS.find((k) => k.key === kind) || { label: kind, chip: 'bg-gray-100 text-gray-600' }

// Mock 30-day usage per module (sessions). Illustrative only — real usage
// analytics need the Phase 2 backend.
export const MODULE_USAGE_30D = [
  { module: 'HR', sessions: 412 },
  { module: 'Projects', sessions: 268 },
  { module: 'CRM', sessions: 231 },
  { module: 'IT & Assets', sessions: 122 },
  { module: 'Marketing', sessions: 98 },
  { module: 'Financials', sessions: 41 },
  { module: 'Admin', sessions: 22 },
]
