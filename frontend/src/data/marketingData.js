// Dummy Marketing data for the proof-of-concept. Local state only, same as CRM/HR.
//
// The Marketing workspace (inbox, content calendar, portfolio, proposals, analytics)
// is visible to marketing + top management only — see MARKETING_VIEW_ROLES in
// dashboardData.js. Branding materials are the exception: visible to everyone.

// ---------------------------------------------------------------------------
// Marketing inbox tasks
// ---------------------------------------------------------------------------
// Auto-created by cross-module events, assigned to all of Marketing:
//  - project created            → marketing_description (project can't complete without it)
//  - project nears completion   → project_photos (professional photography sign-off,
//                                  NOT site-engineer mobile snaps — blocks completion)
//  - employee joins             → employee_headshot + welcome_email (email is designed
//                                  by Marketing, then checked for errors and sent by HR)

export const MARKETING_TASK_TYPES = {
  marketing_description: {
    label: 'Project description',
    chip: 'bg-blue-100 text-blue-700',
    hint: 'Write the portfolio/marketing description — the project cannot be marked Completed without it.',
  },
  project_photos: {
    label: 'Project photos',
    chip: 'bg-purple-100 text-purple-700',
    hint: 'Arrange and approve professional project photography — blocks project completion.',
  },
  employee_headshot: {
    label: 'Headshot',
    chip: 'bg-amber-100 text-amber-700',
    hint: 'Schedule a professional headshot for the new joiner (if needed).',
  },
  welcome_email: {
    label: 'Welcome email',
    chip: 'bg-green-100 text-green-700',
    hint: 'Design the welcome email — HR checks it and sends it.',
  },
}

// relatedKind: 'project' | 'employee' — relatedId points at PROJECTS or EMPLOYEES.
export const MARKETING_TASKS = [
  {
    id: 1, type: 'marketing_description', relatedKind: 'project', relatedId: 7,
    relatedName: 'P-2725 — TIS — Khalifa City School Cluster',
    status: 'pending', dueDate: null, notes: '', createdDate: '2026-06-20', completedDate: null,
  },
  {
    id: 2, type: 'project_photos', relatedKind: 'project', relatedId: 6,
    relatedName: 'P-2699 — Substation Access & Landscaping Works',
    status: 'pending', dueDate: '2026-08-15', notes: 'Supervision at 80% — book photographer before handover.', createdDate: '2026-06-28', completedDate: null,
  },
  {
    id: 3, type: 'employee_headshot', relatedKind: 'employee', relatedId: 11,
    relatedName: 'Priya Nair — Document Controller',
    status: 'pending', dueDate: null, notes: '', createdDate: '2026-02-02', completedDate: null,
  },
  {
    id: 4, type: 'welcome_email', relatedKind: 'employee', relatedId: 11,
    relatedName: 'Priya Nair — Document Controller',
    status: 'pending', dueDate: null, notes: '', createdDate: '2026-02-02', completedDate: null,
  },
  {
    id: 5, type: 'marketing_description', relatedKind: 'project', relatedId: 12,
    relatedName: 'P-2597 — Corniche Tower Facade Retrofit',
    status: 'done', dueDate: null, notes: 'Published to portfolio.', createdDate: '2024-11-02', completedDate: '2024-11-20',
  },
]

// ---------------------------------------------------------------------------
// Content calendar
// ---------------------------------------------------------------------------

export const CONTENT_TYPES = ['LinkedIn post', 'Project spotlight', 'News article', 'Newsletter', 'Campaign', 'Event']

export const CONTENT_CHANNELS = ['LinkedIn', 'Website', 'Email', 'Instagram', 'Print', 'Event']

// idea → draft → pending_approval → approved → published
export const CONTENT_STATUSES = {
  idea: { label: 'Idea', chip: 'bg-gray-100 text-gray-600' },
  draft: { label: 'Draft', chip: 'bg-blue-100 text-blue-700' },
  pending_approval: { label: 'Pending approval', chip: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', chip: 'bg-emerald-100 text-emerald-700' },
  published: { label: 'Published', chip: 'bg-green-100 text-green-700' },
}

// relatedProjectId is nullable — links a post to a portfolio project.
export const CONTENT_ITEMS = [
  { id: 1, title: 'Saadiyat Villas Cluster 4 — construction milestone', type: 'Project spotlight', channel: 'LinkedIn', date: '2026-07-06', owner: 'Marketing', status: 'approved', relatedProjectId: 5, notes: 'Drone footage approved by client — tag Emaar.' },
  { id: 2, title: 'Meet our engineers — Fatima Al Mansouri', type: 'LinkedIn post', channel: 'LinkedIn', date: '2026-07-09', owner: 'Marketing', status: 'draft', relatedProjectId: null, notes: 'People-of-ALSUWEIDI series, part 3.' },
  { id: 3, title: 'Q3 company newsletter', type: 'Newsletter', channel: 'Email', date: '2026-07-15', owner: 'Marketing', status: 'pending_approval', relatedProjectId: null, notes: 'Includes Q3 planning meeting recap and new-joiner welcomes.' },
  { id: 4, title: 'Healthcare design capabilities campaign', type: 'Campaign', channel: 'LinkedIn', date: '2026-07-20', owner: 'Marketing', status: 'idea', relatedProjectId: 1, notes: 'Anchor on Harbour Point Medical Centre once photos are in.' },
  { id: 5, title: 'Eid Al Adha greeting', type: 'LinkedIn post', channel: 'LinkedIn', date: '2026-07-01', owner: 'Marketing', status: 'published', relatedProjectId: null, notes: '' },
  { id: 6, title: 'Corniche Tower retrofit — case study page', type: 'News article', channel: 'Website', date: '2026-07-28', owner: 'Marketing', status: 'draft', relatedProjectId: 12, notes: 'Completed project — full case study with before/after.' },
  { id: 7, title: 'Big 5 exhibition stand planning', type: 'Event', channel: 'Event', date: '2026-08-12', owner: 'Marketing', status: 'idea', relatedProjectId: null, notes: 'Book stand by end of July.' },
]

// ---------------------------------------------------------------------------
// Branding materials — visible to EVERYONE (files are name-only until Phase 2 storage)
// ---------------------------------------------------------------------------

export const BRAND_ASSET_CATEGORIES = ['Logos', 'Templates', 'Guidelines', 'Stationery', 'Photography']

export const BRAND_ASSETS = [
  { id: 1, name: 'Primary logo — full colour', category: 'Logos', format: 'SVG + PNG', sizeLabel: '2 MB', updatedDate: '2026-01-10', description: 'Main logo for light backgrounds. Never stretch or recolour.' },
  { id: 2, name: 'Logo — white / reversed', category: 'Logos', format: 'SVG + PNG', sizeLabel: '2 MB', updatedDate: '2026-01-10', description: 'For dark backgrounds and photography overlays.' },
  { id: 3, name: 'Logo — Arabic lockup', category: 'Logos', format: 'SVG + PNG', sizeLabel: '2 MB', updatedDate: '2026-01-10', description: 'Bilingual lockup for government submissions.' },
  { id: 4, name: 'PowerPoint template', category: 'Templates', format: 'PPTX', sizeLabel: '8 MB', updatedDate: '2026-03-02', description: 'Client presentations — includes cover, divider, and project-sheet layouts.' },
  { id: 5, name: 'Word report template', category: 'Templates', format: 'DOCX', sizeLabel: '1 MB', updatedDate: '2026-03-02', description: 'Technical reports and design statements.' },
  { id: 6, name: 'Proposal cover pages', category: 'Templates', format: 'INDD + PDF', sizeLabel: '14 MB', updatedDate: '2026-05-18', description: 'Fee proposal and EOI covers, English and Arabic.' },
  { id: 7, name: 'Brand guidelines v3', category: 'Guidelines', format: 'PDF', sizeLabel: '6 MB', updatedDate: '2026-02-14', description: 'Colours, typography, logo clear-space, photography style.' },
  { id: 8, name: 'Email signature kit', category: 'Stationery', format: 'HTML', sizeLabel: '0.1 MB', updatedDate: '2026-04-01', description: 'Standard signature — fill in name, title, and mobile only.' },
  { id: 9, name: 'Letterhead', category: 'Stationery', format: 'DOCX + PDF', sizeLabel: '1 MB', updatedDate: '2026-01-22', description: 'Official letterhead — used by HR certificate letters.' },
  { id: 10, name: 'Approved project photography set', category: 'Photography', format: 'JPG', sizeLabel: '240 MB', updatedDate: '2026-06-05', description: 'Marketing-approved hero shots of completed projects.' },
]

// ---------------------------------------------------------------------------
// Analytics (mock feeds — real numbers need Phase 2 integrations)
// ---------------------------------------------------------------------------

export const LINKEDIN_STATS = {
  followers: 12480,
  followersDelta30d: 320,
  impressions30d: 58400,
  engagementRate: 4.6,
  // Same seniority tiers as the CRM contact taxonomy — deliberately shared.
  followerSeniority: [
    { tier: 'Entry', pct: 18 },
    { tier: 'Senior', pct: 34 },
    { tier: 'Manager', pct: 22 },
    { tier: 'Director', pct: 14 },
    { tier: 'VP', pct: 7 },
    { tier: 'C-Suite', pct: 5 },
  ],
}

export const WEBSITE_STATS = {
  visits30d: 9120,
  portfolioViews30d: 3640,
  topPages: [
    { page: 'Portfolio — Healthcare', views: 980 },
    { page: 'Portfolio — Residential Communities', views: 760 },
    { page: 'Careers', views: 640 },
    { page: 'About us', views: 410 },
  ],
}
