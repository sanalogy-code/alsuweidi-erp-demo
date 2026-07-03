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
  { key: 'admin', icon: '⚙️', label: 'Admin Center', description: 'Users, roles & permissions', path: '/admin', status: 'soon' },
]

export const ROLES = [
  { value: 'sales', label: 'Sales / Business Dev' },
  { value: 'pm', label: 'Project Manager' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'HR' },
  { value: 'management', label: 'Management' },
  { value: 'admin', label: 'Admin' },
  { value: 'pro', label: 'PRO / Government Services (external)' },
]

// HR staff who process requests (issue certificates, run payroll actions)
export const HR_STAFF_ROLES = ['hr', 'admin']

// Roles allowed to view sensitive employee data: visa/passport, dependents, compensation,
// renewals, payroll. HR staff plus top management — nobody else.
export const SENSITIVE_VIEW_ROLES = ['hr', 'admin', 'management']

// Marketing workspace (inbox, content calendar, portfolio, proposals, analytics):
// marketing + top management only. Branding materials are visible to everyone.
export const MARKETING_VIEW_ROLES = ['marketing', 'management', 'admin']
