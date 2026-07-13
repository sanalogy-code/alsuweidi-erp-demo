// Dummy Marketing data for the proof-of-concept. Local state only, same as CRM/HR.
//
// The Marketing workspace (inbox, content calendar, portfolio, analytics)
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
    hint: 'Run the photography workflow — arrange, coordinate, shoot, approve. Blocks project completion.',
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
// Project photography workflow — the project_photos task is a small state
// machine, not one click. Progress lives on the PROJECT record
// (`photoWorkflow: { step, photographer, notes }`) so the completion gate and
// the inbox read the same state. Final step sets `photosApproved`.
// ---------------------------------------------------------------------------

export const PHOTO_WORKFLOW_STEPS = [
  {
    key: 'arrange', label: 'Arrange photographer',
    hint: 'Book an external photographer or assign an in-house Marketing person.',
    action: 'Photographer arranged',
  },
  {
    key: 'coordinate', label: 'Coordinate with Supervision',
    hint: 'Agree the shoot date with the Supervision team — it must happen before handover.',
    action: 'Shoot scheduled with Supervision',
  },
  {
    key: 'shoot', label: 'Photos taken',
    hint: 'The shoot has happened; raw photos received from the photographer.',
    action: 'Photos received',
  },
  {
    key: 'review', label: 'Review & approve',
    hint: 'Review the set, approve the selects, and upload to the project record — this closes the task.',
    action: 'Approve & upload',
  },
]

// ---------------------------------------------------------------------------
// Content calendar
// ---------------------------------------------------------------------------

export const CONTENT_TYPES = ['LinkedIn post', 'Project spotlight', 'News article', 'Newsletter', 'Campaign', 'Event']

// Fixed channel set (Sana, 3 Jul): the company publishes on exactly these three.
export const CONTENT_CHANNELS = ['Website', 'LinkedIn', 'Email']

// idea → draft → pending_approval → approved → published
export const CONTENT_STATUSES = {
  idea: { label: 'Idea', chip: 'bg-gray-100 text-gray-600' },
  draft: { label: 'Draft', chip: 'bg-blue-100 text-blue-700' },
  pending_approval: { label: 'Pending approval', chip: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', chip: 'bg-emerald-100 text-emerald-700' },
  published: { label: 'Published', chip: 'bg-green-100 text-green-700' },
}

// relatedProjectId is nullable — links a post to a portfolio project.
// campaignId is nullable — groups the item under a CAMPAIGNS entry.
// `approval` is nullable — set when the item moves to approved (who/when/comment),
// so the approval chain is auditable, not just a status flip.
// The content itself is the `copy` (text) and `media` (file-name-only until
// Phase 2 storage); `title` is an optional internal reference label.
export const CONTENT_ITEMS = [
  { id: 1, title: 'Saadiyat Villas Cluster 4 — construction milestone', type: 'Project spotlight', channel: 'LinkedIn', date: '2026-07-06', owner: 'Marketing', status: 'approved', relatedProjectId: 5, campaignId: null, approval: { by: 'Khalid Al Suweidi', date: '2026-07-03', comment: 'Client tag confirmed with Emaar comms — good to go.' }, copy: 'Cluster 4 at Saadiyat Villas has reached a major construction milestone — all 38 villa structures are now topped out. Proud to deliver full design and supervision for @Emaar Properties on this landmark community. #engineering #abudhabi', media: 'saadiyat-c4-drone-milestone.mp4', notes: 'Drone footage approved by client — tag Emaar.' },
  { id: 2, title: 'Meet our engineers — Fatima Al Mansouri', type: 'LinkedIn post', channel: 'LinkedIn', date: '2026-07-09', owner: 'Marketing', status: 'draft', relatedProjectId: null, campaignId: 2, approval: null, copy: 'People of ALSUWEIDI, part 3: meet Fatima Al Mansouri, the structural engineer behind some of our most ambitious facades. "The best structure is the one nobody notices — it just works."', media: 'people-fatima-al-mansouri.jpg', notes: 'People-of-ALSUWEIDI series, part 3.' },
  { id: 3, title: 'Q3 company newsletter', type: 'Newsletter', channel: 'Email', date: '2026-07-15', owner: 'Marketing', status: 'pending_approval', relatedProjectId: null, campaignId: null, approval: null, copy: 'Q3 kickoff edition: planning meeting recap, three project milestones, and a warm welcome to our new joiners. Full draft in the attached layout.', media: 'newsletter-2026-q3-draft.pdf', notes: 'Includes Q3 planning meeting recap and new-joiner welcomes.' },
  { id: 4, title: 'Healthcare design capabilities campaign', type: 'Campaign', channel: 'LinkedIn', date: '2026-07-20', owner: 'Marketing', status: 'idea', relatedProjectId: 1, campaignId: 1, approval: null, copy: '', media: '', notes: 'Anchor on Harbour Point Medical Centre once photos are in.' },
  { id: 5, title: 'Eid Al Adha greeting', type: 'LinkedIn post', channel: 'LinkedIn', date: '2026-07-01', owner: 'Marketing', status: 'published', relatedProjectId: null, campaignId: null, approval: { by: 'Khalid Al Suweidi', date: '2026-06-29', comment: '' }, copy: 'Eid Mubarak from all of us at ALSUWEIDI Engineering Consultants. Wishing you and your families a blessed Eid Al Adha.', media: 'eid-al-adha-2026-card.png', notes: '' },
  { id: 6, title: 'Corniche Tower retrofit — case study page', type: 'News article', channel: 'Website', date: '2026-07-28', owner: 'Marketing', status: 'draft', relatedProjectId: 12, campaignId: 1, approval: null, copy: 'How do you re-skin a 24-storey office tower without decanting a single tenant? Our facade team\'s condition assessment and retrofit design for Corniche Tower — full case study with before/after imagery.', media: 'corniche-retrofit-case-study.zip', notes: 'Completed project — full case study with before/after.' },
  { id: 7, title: 'Big 5 exhibition — save the date', type: 'Event', channel: 'Email', date: '2026-08-12', owner: 'Marketing', status: 'idea', relatedProjectId: null, campaignId: null, approval: null, copy: '', media: '', notes: 'Announce our Big 5 stand to the client mailing list — book stand by end of July.' },
]

// ---------------------------------------------------------------------------
// Campaigns — LIGHTWEIGHT FIRST SHAPE, scope to be confirmed with Sana.
// A campaign is just a named goal + date range that content items hang off
// (via campaignId). No budgets/audiences/UTMs yet — that's the scoping call.
// ---------------------------------------------------------------------------

export const CAMPAIGN_STATUSES = {
  planning: { label: 'Planning', chip: 'bg-gray-100 text-gray-600' },
  active: { label: 'Active', chip: 'bg-blue-100 text-blue-700' },
  done: { label: 'Done', chip: 'bg-green-100 text-green-700' },
}

export const CAMPAIGNS = [
  { id: 1, name: 'Design capabilities push — H2 2026', goal: 'Position the design practice (healthcare + facade retrofit) ahead of Q4 tenders.', startDate: '2026-07-01', endDate: '2026-10-31', status: 'active', owner: 'Marketing' },
  { id: 2, name: 'People of ALSUWEIDI', goal: 'Employer-brand series — one engineer profile a month to support hiring.', startDate: '2026-05-01', endDate: '2026-12-31', status: 'active', owner: 'Marketing' },
]

// ---------------------------------------------------------------------------
// Portfolio pack usage log — who sent/downloaded which pack, to whom.
// Manually logged for now: the CRM download button lives in the CRM module,
// so auto-logging from there is wired in Phase 2 (needs the shared store).
// ---------------------------------------------------------------------------

export const PACK_USAGE_LOG = [
  { id: 1, packId: 1, packName: 'ALSUWEIDI-Portfolio-Education-2026.pdf', action: 'sent', by: 'Naseeb Shaheen', date: '2026-06-30', client: 'ADEK', note: 'Follow-up to the Khalifa City schools meeting.' },
  { id: 2, packId: 4, packName: 'ALSUWEIDI-Portfolio-Communities-2026.pdf', action: 'downloaded', by: 'Osama Hussain', date: '2026-06-24', client: 'Modon Properties', note: '' },
  { id: 3, packId: 2, packName: 'ALSUWEIDI-Portfolio-DataCenter-2026.pdf', action: 'sent', by: 'Marketing', date: '2026-06-12', client: 'Khazna', note: 'Attached to intro email after WETEX contact.' },
]

// ---------------------------------------------------------------------------
// Event / exhibition tracker
// ---------------------------------------------------------------------------

export const EVENT_TYPES = ['Exhibition', 'Conference', 'Client event']

export const EVENT_STATUSES = {
  planned: { label: 'Planned', chip: 'bg-gray-100 text-gray-600' },
  confirmed: { label: 'Confirmed', chip: 'bg-blue-100 text-blue-700' },
  attended: { label: 'Attended', chip: 'bg-green-100 text-green-700' },
  skipped: { label: 'Skipped', chip: 'bg-slate-100 text-slate-500' },
}

export const MARKETING_EVENTS = [
  { id: 1, name: 'Cityscape Abu Dhabi 2026', dates: '2026-09-14 → 2026-09-16', venue: 'ADNEC, Abu Dhabi', type: 'Exhibition', owner: 'Marketing', budget: 85000, status: 'confirmed', outcomes: '', leadsCount: 0 },
  { id: 2, name: 'WETEX 2026', dates: '2026-10-06 → 2026-10-08', venue: 'DWTC, Dubai', type: 'Exhibition', owner: 'Marketing', budget: 40000, status: 'planned', outcomes: '', leadsCount: 0 },
  { id: 3, name: 'Big 5 Global 2026', dates: '2026-11-24 → 2026-11-27', venue: 'DWTC, Dubai', type: 'Exhibition', owner: 'Marketing', budget: 120000, status: 'planned', outcomes: 'Stand booking due end of July.', leadsCount: 0 },
  { id: 4, name: 'ADNOC suppliers forum', dates: '2026-05-19', venue: 'ADNOC HQ, Abu Dhabi', type: 'Client event', owner: 'Osama Hussain', budget: 5000, status: 'attended', outcomes: 'Two supervision leads; pump-station framework mentioned again.', leadsCount: 2 },
]

// ---------------------------------------------------------------------------
// Award submissions register
// ---------------------------------------------------------------------------

export const AWARD_STATUSES = {
  considering: { label: 'Considering', chip: 'bg-gray-100 text-gray-600' },
  preparing: { label: 'Preparing', chip: 'bg-blue-100 text-blue-700' },
  submitted: { label: 'Submitted', chip: 'bg-purple-100 text-purple-700' },
  shortlisted: { label: 'Shortlisted', chip: 'bg-amber-100 text-amber-700' },
  won: { label: 'Won', chip: 'bg-green-100 text-green-700' },
  lost: { label: 'Lost', chip: 'bg-red-100 text-red-700' },
}

// projectId → PROJECTS (nullable; projectName kept as the display fallback).
export const AWARD_SUBMISSIONS = [
  { id: 1, award: 'MEED Projects Awards — Building Project of the Year', organiser: 'MEED', category: 'Buildings', projectId: 12, projectName: 'Corniche Tower Facade Retrofit', deadline: '2026-03-15', status: 'won', owner: 'Marketing', notes: 'Won GCC category — press release published, trophy in reception.' },
  { id: 2, award: 'Construction Innovation Awards 2026', organiser: 'Big Project ME', category: 'Retrofit & Refurbishment', projectId: 5, projectName: 'Saadiyat Villas Cluster 4', deadline: '2026-08-30', status: 'preparing', owner: 'Marketing', notes: 'Need approved photography before the entry can be finalised.' },
  { id: 3, award: 'Abu Dhabi Sustainability Awards', organiser: 'Department of Energy', category: 'Sustainable Design', projectId: null, projectName: 'Khalifa City School Cluster (TIS)', deadline: '2026-05-01', status: 'lost', owner: 'Marketing', notes: 'Not shortlisted — feedback: entries favoured operational-stage evidence.' },
]

// ---------------------------------------------------------------------------
// Portfolio packs — category PDFs Marketing prepares/uploads for CRM to hand
// to clients. NOT auto-generated; file-name-only until Phase 2 storage.
// Categories derive from the data — Marketing types a new one to extend the list.
// ---------------------------------------------------------------------------

export const PORTFOLIO_PACKS = [
  { id: 1, category: 'Education', fileName: 'ALSUWEIDI-Portfolio-Education-2026.pdf', uploadedDate: '2026-05-12' },
  { id: 2, category: 'Data Center', fileName: 'ALSUWEIDI-Portfolio-DataCenter-2026.pdf', uploadedDate: '2026-06-02' },
  { id: 3, category: 'Mixed Use', fileName: 'ALSUWEIDI-Portfolio-MixedUse-2026.pdf', uploadedDate: '2026-04-20' },
  { id: 4, category: 'Communities', fileName: 'ALSUWEIDI-Portfolio-Communities-2026.pdf', uploadedDate: '2026-06-18' },
  { id: 5, category: 'Industrial', fileName: 'ALSUWEIDI-Portfolio-Industrial-2025.pdf', uploadedDate: '2025-11-30' },
]

// ---------------------------------------------------------------------------
// Branding materials — visible to EVERYONE (files are name-only until Phase 2 storage)
// ---------------------------------------------------------------------------

export const BRAND_ASSET_CATEGORIES = ['Logos', 'Fonts', 'Templates', 'Guidelines', 'Stationery', 'Photography']

// Logo library: three variants (Symbol, Primary, Vertical), each in at least
// two colour versions. Fonts: one Arabic + one English family.
export const BRAND_ASSETS = [
  { id: 1, name: 'Symbol — full colour', category: 'Logos', format: 'SVG + PNG', sizeLabel: '1 MB', updatedDate: '2026-01-10', description: 'The standalone mark — avatars, favicons, and stamps where space is tight.' },
  { id: 2, name: 'Symbol — white / reversed', category: 'Logos', format: 'SVG + PNG', sizeLabel: '1 MB', updatedDate: '2026-01-10', description: 'Symbol for dark backgrounds and photography overlays.' },
  { id: 3, name: 'Primary logo — full colour', category: 'Logos', format: 'SVG + PNG', sizeLabel: '2 MB', updatedDate: '2026-01-10', description: 'Horizontal lockup — the default logo on light backgrounds. Never stretch or recolour.' },
  { id: 4, name: 'Primary logo — white / reversed', category: 'Logos', format: 'SVG + PNG', sizeLabel: '2 MB', updatedDate: '2026-01-10', description: 'Horizontal lockup for dark backgrounds and report covers.' },
  { id: 5, name: 'Vertical logo — full colour', category: 'Logos', format: 'SVG + PNG', sizeLabel: '2 MB', updatedDate: '2026-01-10', description: 'Stacked lockup for narrow/portrait formats — hoarding panels, roll-ups, pull-up banners.' },
  { id: 6, name: 'Vertical logo — white / reversed', category: 'Logos', format: 'SVG + PNG', sizeLabel: '2 MB', updatedDate: '2026-01-10', description: 'Stacked lockup for dark portrait formats.' },
  { id: 7, name: 'English typeface — pending', category: 'Fonts', format: 'OTF + WOFF2', sizeLabel: '—', updatedDate: '2026-07-13', description: 'Official English typeface not yet supplied — Marketing to provide the font files and usage rules.' },
  { id: 8, name: 'Arabic typeface — pending', category: 'Fonts', format: 'OTF', sizeLabel: '—', updatedDate: '2026-07-13', description: 'Official Arabic typeface not yet supplied — Marketing to provide the font files and usage rules.' },
  { id: 9, name: 'PowerPoint template', category: 'Templates', format: 'PPTX', sizeLabel: '8 MB', updatedDate: '2026-03-02', description: 'Client presentations — includes cover, divider, and project-sheet layouts.' },
  { id: 10, name: 'Word report template', category: 'Templates', format: 'DOCX', sizeLabel: '1 MB', updatedDate: '2026-03-02', description: 'Technical reports and design statements.' },
  { id: 11, name: 'Proposal cover pages', category: 'Templates', format: 'INDD + PDF', sizeLabel: '14 MB', updatedDate: '2026-05-18', description: 'Fee proposal and EOI covers, English and Arabic.' },
  { id: 12, name: 'Brand Guidelines', category: 'Guidelines', format: 'PDF', sizeLabel: '6 MB', updatedDate: '2026-06-30', description: 'The full rulebook: colours, typography, logo clear-space, photography style.' },
  { id: 13, name: 'Platform + Narrative Guide', category: 'Guidelines', format: 'PDF', sizeLabel: '3 MB', updatedDate: '2026-06-30', description: 'What we say and where — tone of voice, key messages, and per-channel positioning.' },
  { id: 14, name: 'Email signature kit', category: 'Stationery', format: 'HTML', sizeLabel: '0.1 MB', updatedDate: '2026-04-01', description: 'Standard signature — fill in name, title, and mobile only.' },
  { id: 15, name: 'Letterhead', category: 'Stationery', format: 'DOCX + PDF', sizeLabel: '1 MB', updatedDate: '2026-01-22', description: 'Official letterhead — used by HR certificate letters.' },
  { id: 16, name: 'Approved project photography set', category: 'Photography', format: 'JPG', sizeLabel: '240 MB', updatedDate: '2026-06-05', description: 'Marketing-approved hero shots of completed projects.' },
]

// Quick guidelines — the Branding page's default view. The 30-second version
// of the Brand Guidelines PDF: which logo, which font, which colour, when.
export const BRAND_QUICK_GUIDELINES = {
  logos: [
    { variant: 'Primary (horizontal)', when: 'The default. Letterheads, reports, presentations, website header — anywhere with normal horizontal space.' },
    { variant: 'Vertical (stacked)', when: 'Narrow or portrait formats only: site hoardings, roll-up banners, social story formats.' },
    { variant: 'Symbol (mark only)', when: 'Tiny spaces where the wordmark would be illegible: avatars, favicons, app icons, document stamps. Never as the main logo on client-facing documents.' },
    { variant: 'Colour rule', when: 'Full colour (ALSUWEIDI Red) on white/light backgrounds; white/reversed on dark backgrounds and photos. Never place the full-colour logo on a busy photo without a scrim.' },
  ],
  // HONESTY RULE (13 Jul, Sana): the brand section must contain ONLY facts with a
  // real source. The logo file is the single source of truth today (#c81516 red,
  // white reversed). Fonts and any secondary palette are NOT known — they must
  // come from Marketing's official guidelines, not be invented as demo data.
  fonts: [
    { name: 'Not yet provided', when: 'The official English and Arabic typefaces have not been supplied to the system yet. Marketing: send the brand guidelines (or font files) and they will be listed here. Until then, use whatever your current templates use — do not guess from this page.' },
  ],
  colors: [
    { name: 'ALSUWEIDI Red', hex: '#c81516', when: 'From the logo file — the one confirmed brand colour. The logo, and what this whole system is themed with.' },
    { name: 'White (reversed)', hex: '#ffffff', when: 'From the logo file — the wordmark/emblem on red, and the reversed logo on dark backgrounds.' },
    { name: 'Secondary palette', hex: '#e5e7eb', when: 'Not yet defined. Any accent or support colours must come from the official Brand Guidelines — pending from Marketing.' },
  ],
}

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
