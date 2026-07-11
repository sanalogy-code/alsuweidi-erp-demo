// All dummy/mock data for the proof-of-concept UI. No network calls, no backend.
// Swap this file for real API/data-layer calls once we move to a live build.

export const ANNOUNCEMENTS = [
  {
    title: 'Welcome to ALSUWEIDI ERP',
    body: "Your new platform for CRM, Projects, HR and more. This is an early look — we'd love your feedback.",
  },
  {
    title: 'Q3 Planning Meeting',
    body: 'Join us on July 15th for our quarterly planning session. All departments attending, lunch provided.',
  },
  {
    title: 'New Office Hours Policy',
    body: 'Flexible hours are now available. Work when you\'re most productive — details under Company Updates.',
  },
  {
    title: 'Team Celebration',
    body: 'Congratulations to the team on winning the Design Excellence Award for Marina Tower.',
  },
]

// Home page news cards (2026-07 redesign) — each carries a media image (stock
// placeholders from Unsplash for now; Phase 2 storage swaps in real company
// photos). The gradient + emoji render as the fallback if an image fails.
export const NEWS = [
  {
    id: 1, kicker: 'Event', title: 'Q3 Planning Meeting — 15 July',
    body: 'All departments attending · lunch provided · Boardroom A',
    by: 'Leadership', when: '3 days ago', emoji: '🗓️',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=60&auto=format&fit=crop',
    media: 'linear-gradient(135deg, #8f0f10 0%, #c81516 55%, #e04a3a 100%)',
  },
  {
    id: 2, kicker: 'Policy', title: 'Flexible office hours are live',
    body: 'Work when you’re most productive — details in the HR policy hub.',
    by: 'HR', when: '2 days ago', emoji: '⏰',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=60&auto=format&fit=crop',
    media: 'linear-gradient(135deg, #1f2937 0%, #374151 60%, #4b5563 100%)',
  },
  {
    id: 3, kicker: 'Award', title: 'Design Excellence — Marina Tower',
    body: 'Congratulations to the whole team on the win.',
    by: 'Marketing', when: '5 days ago', emoji: '🏆',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=60&auto=format&fit=crop',
    media: 'linear-gradient(135deg, #115e59 0%, #0d9488 60%, #2dd4bf 100%)',
  },
]

export const COMPANY_UPDATES = [
  { title: 'New office hours policy', by: 'HR', when: '2 days ago' },
  { title: 'Q3 planning meeting scheduled', by: 'Leadership', when: '3 days ago' },
  { title: 'Team lunch celebration', by: 'Admin', when: '5 days ago' },
]

export const RECENT_PROJECTS = [
  { name: 'Marina Tower Redesign', status: 'In Progress' },
  { name: 'Downtown Plaza Phase 2', status: 'Planning' },
  { name: 'Pump Station Upgrade - ADNOC', status: 'Won' },
  { name: 'Smart Grid Upgrade - DEWA', status: 'Negotiation' },
]

export const TEAM_MEMBERS = [
  { initials: 'MJ', name: 'Mike Johnson', role: 'PM' },
  { initials: 'AL', name: 'Ana Lopez', role: 'Designer' },
  { initials: 'CW', name: 'Chen Wu', role: 'Engineer' },
  { initials: 'RL', name: 'Rachel Lee', role: 'QA' },
]

export const QUICK_LINKS = [
  { label: 'Newsletter' },
  { label: 'Company Directory' },
  { label: 'Policies & Docs' },
]

export const QUICK_ACTIONS = [
  { icon: '📝', label: 'Fill Timesheet' },
  { icon: '📋', label: 'Request Leave' },
  { icon: '🎓', label: 'Request Certificate' },
  { icon: '🖥️', label: 'Hardware Request' },
]

export const MODULES = [
  { key: 'crm', icon: '📊', label: 'CRM', description: 'Companies, contacts & pipeline', path: '/crm', status: 'live' },
  { key: 'projects', icon: '🏗️', label: 'Projects', description: 'Design & supervision portfolio', path: '/projects', status: 'live' },
  { key: 'hr', icon: '👥', label: 'HR', description: 'Onboarding, policies & more', path: '/hr', status: 'live' },
  { key: 'it', icon: '🖥️', label: 'IT & Assets', description: 'Hardware requests, assets & licenses', path: '/it', status: 'live' },
  { key: 'marketing', icon: '📈', label: 'Marketing', description: 'Content, portfolio, branding & analytics', path: '/marketing', status: 'live' },
  // Finance tile is gated — only shown to FINANCE_VIEW_ROLES (see roles below). HomePage filters on `roles`.
  { key: 'finance', icon: '💰', label: 'Financials', description: 'Invoices, expenses, cash & P&L', path: '/finance', status: 'live', roles: ['admin', 'management', 'finance'] },
  // Office Administration = the ADMIN STAFF workspace (correspondence, registrations).
  { key: 'office', icon: '🗂️', label: 'Office Administration', description: 'Correspondence, registrations & licenses', path: '/office', status: 'live', roles: ['adminstaff', 'admin', 'management'] },
  // Admin Center = SYSTEM administration only — gated to ADMIN_VIEW_ROLES (adminData.js).
  { key: 'admin', icon: '⚙️', label: 'Admin Center', description: 'Users, roles, audit & system feedback', path: '/admin', status: 'live', roles: ['admin', 'management'] },
]

export const ROLES = [
  { value: 'sales', label: 'Sales / Business Dev' },
  { value: 'pm', label: 'Project Manager' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'HR' },
  { value: 'it', label: 'IT' },
  { value: 'adminstaff', label: 'Admin Staff (office administration)' },
  { value: 'finance', label: 'Finance / Accountant' },
  { value: 'management', label: 'Management' },
  { value: 'admin', label: 'Admin (system)' },
  { value: 'pro', label: 'PRO / Government Services (external)' },
]

// Role → workspace matrix. Every role gets the employee-level views (My requests,
// timesheets, leave, branding materials). Workspace ownership on top of that:
//
//   role        | HR workspace | IT workspace | Marketing workspace
//   ------------|--------------|--------------|--------------------
//   hr          | owner        | —            | —
//   it          | —            | owner        | —
//   marketing   | —            | —            | owner
//   adminstaff  | —            | —            | —   (office admin: employee-level only, no sensitive data)
//   management  | yes          | yes          | yes
//   admin       | yes          | yes          | yes (system role)
//   sales / pm / pro | —       | —            | —

// HR staff who process requests (issue certificates, run payroll actions)
export const HR_STAFF_ROLES = ['hr', 'admin']

// Roles allowed to view sensitive employee data: visa/passport, dependents, compensation,
// renewals, payroll. HR staff plus top management — nobody else (not IT, not admin staff).
export const SENSITIVE_VIEW_ROLES = ['hr', 'admin', 'management']

// IT & Assets workspace (request queue, asset registry, license radar):
// owned by IT, with admin + top management retaining access.
export const IT_VIEW_ROLES = ['it', 'admin', 'management']

// Marketing workspace (inbox, content calendar, portfolio, proposals, analytics):
// marketing + top management only. Branding materials are visible to everyone.
export const MARKETING_VIEW_ROLES = ['marketing', 'management', 'admin']

// Financials & Accounting module (invoices, expenses, cash position, P&L):
// the whole module is sensitive — top management, system admin, and the dedicated
// `finance` role (added 7 Jul per Sana: the accountant needs full working control —
// create invoices, record payments, log expenses with receipt attachments).
export const FINANCE_VIEW_ROLES = ['management', 'admin', 'finance']
