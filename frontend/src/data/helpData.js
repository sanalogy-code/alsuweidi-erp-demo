// Help content for the in-app Guide (the ? in every navbar). One maintained
// source: role orientations, a module map, and task "recipes" (a few steps + a
// deep-link that jumps you to the right screen). Kept at MODULE granularity on
// purpose — screens still change every batch, so per-page help would be a
// treadmill. When a module gains/loses a screen, update its tasks here.
//
// A recipe's `to` is { path, view? }; the pages read location.state.view to open
// that sub-view (see the deep-link seam in the page components). Tasks with no
// `to` describe a shell feature (search, notifications, feedback) reachable from
// any page.

// key → used to map the current route to a module for the contextual ?.
// `roles` gates which role orientations list this module as "yours".
export const HELP_MODULES = [
  { key: 'home', label: 'Home', path: '/home', icon: '🏠',
    blurb: 'Your launchpad: module tiles, My Week (tasks/approvals/timesheet at a glance), announcements and holidays. Management also gets the Company KPI panel with a board-pack print.' },
  { key: 'crm', label: 'CRM', path: '/crm', icon: '🤝',
    blurb: 'Clients, contacts and the sales pipeline, plus the Proposals (RFP) register where bids are scored, decided and tracked to award.' },
  { key: 'hr', label: 'HR', path: '/hr', icon: '👥',
    blurb: 'Everything people: your own timesheet/leave/certificates/appraisal on one side, and the HR workspace (approvals, payroll, renewals, hiring, appraisals, discipline) on the other.' },
  { key: 'projects', label: 'Projects', path: '/projects', icon: '🏗️',
    blurb: 'The delivery side: My Work, the management dashboard, resource planning, and a full per-project workspace (deliverables, site registers, FIDIC claims, authorities, reports).' },
  { key: 'finance', label: 'Financials', path: '/finance', icon: '💵',
    blurb: 'Invoices, receipts, credit notes, expenses & VAT, supplier payables, petty cash, retention, the month-end close, and the accountant’s monthly reports. Management/Finance only.' },
  { key: 'marketing', label: 'Marketing', path: '/marketing', icon: '📣',
    blurb: 'The marketing task inbox, content calendar and approvals, campaigns, portfolio readiness, events and award submissions.' },
  { key: 'it', label: 'IT & Assets', path: '/it', icon: '💻',
    blurb: 'Raise IT requests, and (for IT staff) the request queue with SLA timers, the asset registry, license renewals, installed-software map, maintenance schedule, access requests and a status board.' },
  { key: 'office', label: 'Office Admin', path: '/office', icon: '🗂️',
    blurb: 'The ODC desk: correspondence register, registrations & licenses, meeting-room booking, office supplies, courier log, vehicles & Salik, and document-numbering standards.' },
  { key: 'admin', label: 'Admin Center', path: '/admin', icon: '⚙️',
    blurb: 'System administration: user accounts, the role × module permissions matrix, delegation-of-authority limits, system-feedback triage and the activity log. Management/Admin only.' },
]

// Maps a pathname to a module key so the ? opens contextual to where you are.
export const moduleForPath = (pathname = '') => {
  const p = pathname.toLowerCase()
  if (p.startsWith('/crm')) return 'crm'
  if (p.startsWith('/hr')) return 'hr'
  if (p.startsWith('/projects')) return 'projects'
  if (p.startsWith('/finance')) return 'finance'
  if (p.startsWith('/marketing') || p.startsWith('/content')) return 'marketing'
  if (p.startsWith('/it')) return 'it'
  if (p.startsWith('/office')) return 'office'
  if (p.startsWith('/admin')) return 'admin'
  return 'home'
}

// Per-role "start here" orientation. `modules` lists the module keys most
// relevant to that role (used to order the module map). Roles match the login
// dropdown values.
export const ROLE_GUIDE = {
  management: {
    label: 'Management',
    intro: 'You see everything. Start on Home — the Company KPI panel (utilization, win rate, receivables, project health) is your one-screen pulse, and “Board pack (print)” turns it into a handout. Financials and the Admin Center are yours alone.',
    modules: ['home', 'projects', 'finance', 'crm', 'hr', 'admin'],
  },
  sales: {
    label: 'Sales / Business Dev',
    intro: 'CRM is your home: work the pipeline, keep companies and contacts current, and run bids through the Proposals (RFP) register — score go/win, record the bid decision, and request staffing on anything you expect to win.',
    modules: ['crm', 'home', 'marketing'],
  },
  pm: {
    label: 'Project Manager',
    intro: 'Start on Projects → My Work for everything waiting on you across projects. Open a project’s workspace to run deliverables, site registers (WIR/MIR/NCR), FIDIC claims with their notice countdowns, authorities and the monthly 4.21 report.',
    modules: ['projects', 'home', 'crm'],
  },
  marketing: {
    label: 'Marketing',
    intro: 'The Inbox auto-feeds you tasks from the rest of the company (new project → write a description; final stage → photos; new hire → headshot). Plan on the content calendar, group into campaigns, and keep the portfolio demo-ready.',
    modules: ['marketing', 'home', 'crm'],
  },
  hr: {
    label: 'HR',
    intro: 'The HR workspace is your desk: the Inbox collects everything waiting on HR, then Leave planner, Timesheets, Renewals, Payroll, Staff planning, Appraisals, Training, Discipline and the headcount dashboard. You also have your own self-service tabs.',
    modules: ['hr', 'home'],
  },
  it: {
    label: 'IT',
    intro: 'The Request queue with SLA timers is your worklist. Beyond it: the asset registry, license renewals, the installed-software map (seat-overrun flags), the maintenance schedule, access requests and the system-status board.',
    modules: ['it', 'home'],
  },
  adminstaff: {
    label: 'Admin Staff (ODC)',
    intro: 'The Office module is your desk: log every letter in the correspondence register, keep registrations & licenses current, and handle room bookings, supplies, couriers and the company vehicles (with Salik/fines).',
    modules: ['office', 'home'],
  },
  finance: {
    label: 'Finance / Accountant',
    intro: 'Your monthly cycle lives in Financials: raise invoices, record receipts against them, log expenses with VAT, approve and pay supplier invoices, reconcile petty cash, then run the Accountant reports (aging, statements, VAT paper) and tick off the month-end close.',
    modules: ['finance', 'home'],
  },
  admin: {
    label: 'Admin (system)',
    intro: 'The Admin Center is yours: manage user accounts, tune the role × module permissions matrix, set delegation-of-authority limits, and triage the system-feedback queue. You can also reach every module.',
    modules: ['admin', 'home', 'finance', 'projects'],
  },
  pro: {
    label: 'PRO / Government Services',
    intro: 'You work an isolated task queue for visa, work-permit and Emirates ID processing — no access to employee data. Your tasks appear under HR → PRO tasks.',
    modules: ['hr', 'home'],
  },
}

// The task recipes. Each: id, module, label, steps[], optional roles (default
// everyone), optional to { path, view }. Keep steps short and imperative.
export const HELP_TASKS = [
  // ---- Cross-app (shell features, no route) ----
  { id: 'search', module: 'home', label: 'Search anything', steps: ['Press Ctrl+K (or click the magnifier in the top bar) from any page.', 'Type a person, project, company, contact, RFP or screen name.', 'Click a result to jump straight there.'] },
  { id: 'notifs', module: 'home', label: 'Check what needs my attention', steps: ['Click the bell in the top bar — the number is your unread count.', 'It gathers approvals waiting on you, deadlines, timesheet reminders and queues you own.', 'Click any item to go to it; use the chips to filter by module.'] },
  { id: 'feedback', module: 'home', label: 'Report a bug or request a feature', steps: ['Click the floating Feedback button (bottom-right of any page).', 'Pick something’s broken / a feature request / a question, choose the module, and describe it.', 'It lands in Admin Center → System feedback for triage.'] },
  { id: 'myweek', module: 'home', label: 'See my week at a glance', steps: ['Open Home.', 'The “My week” strip shows your open tasks, approvals waiting on you, deadlines and this week’s timesheet state.', 'Click any card to jump to it.'], to: { path: '/home' } },

  // ---- CRM ----
  { id: 'crm-pipeline', module: 'crm', label: 'Move a deal through the pipeline', steps: ['CRM → Pipeline.', 'Drag a deal card to the next stage, or use the stage dropdown on the card.', 'Use the date-range selector to focus the board; edit or delete from the card.'], to: { path: '/crm', view: 'pipeline' } },
  { id: 'crm-log', module: 'crm', label: 'Log an interaction with a contact', steps: ['CRM → Contacts, open the contact.', 'Use “Log Interaction” — type, note, date.', 'It shows on the contact’s history and the company’s Activity tab.'], to: { path: '/crm', view: 'contacts' } },
  { id: 'crm-company', module: 'crm', label: 'Add a company with relationship tags', steps: ['CRM → Companies → add company.', 'Set website/size, pick relationship tags (a company can be Client and Supplier) and main services.', 'Filter the list by tag or service afterwards.'], to: { path: '/crm', view: 'companies' } },
  { id: 'crm-rfp', module: 'crm', label: 'Track a proposal and record a bid decision', steps: ['CRM → Proposals (RFPs) → Register.', 'Open an invited RFP; review the go/win recommendation and use “Record bid decision” (decided-by, rationale) to move to preparing or no-bid.', 'Work the tender document checklist and log bid-cost hours; on a loss, add a debrief and who you lost to.'], to: { path: '/crm', view: 'rfps' }, roles: ['sales', 'management', 'admin'] },
  { id: 'crm-staffing', module: 'crm', label: 'Request staffing on a bid', steps: ['CRM → Proposals, open a live RFP.', 'Use “Request staffing” — role, headcount, needed-by, note (contingent on award).', 'It lands in HR → Staff planning as a pipeline-intake request.'], to: { path: '/crm', view: 'rfps' }, roles: ['sales', 'management', 'admin'] },
  { id: 'crm-export', module: 'crm', label: 'Export a filtered contact list', steps: ['CRM → Contacts → Export.', 'Set the dropdown filters (company, relationship, seniority, last-contacted…); watch the live match count.', 'Download as Excel or CSV.'], to: { path: '/crm', view: 'contacts' } },

  // ---- HR (self-service) ----
  { id: 'hr-ts', module: 'hr', label: 'Submit my weekly timesheet', steps: ['HR → My timesheet.', 'Fill hours per project code / overhead per day — “Copy last week” pre-fills your usual rows.', 'Save draft, then Submit. A rejected week reopens with the reason.'], to: { path: '/hr', view: 'mytimesheet' } },
  { id: 'hr-leave', module: 'hr', label: 'Request annual leave', steps: ['HR → My requests (or the Request leave card on My HR).', 'Pick dates and type; submit.', 'It routes to your manager first, then HR — track it as “Awaiting manager (1/2)” etc.'], to: { path: '/hr', view: 'requests' } },
  { id: 'hr-cert', module: 'hr', label: 'Request a salary or employment certificate', steps: ['HR → My requests → request a certificate.', 'Choose the letter type (salary, NOC, embassy, experience…) and language.', 'HR drafts it from your record and issues the PDF on letterhead.'], to: { path: '/hr', view: 'requests' } },
  { id: 'hr-appraisal', module: 'hr', label: 'Fill in my self-appraisal', steps: ['HR → My appraisal.', 'Rate yourself 1–5 on each competency and add comments.', 'Submit — it moves to your manager, then HR sign-off.'], to: { path: '/hr', view: 'myappraisal' } },
  { id: 'hr-training', module: 'hr', label: 'Enroll in a training course', steps: ['HR → Training.', 'Browse the catalogue and request enrollment with a short justification.', 'HR approves; when marked complete it adds to your accomplishments.'], to: { path: '/hr', view: 'training' } },

  // ---- HR (workspace) ----
  { id: 'hr-add', module: 'hr', label: 'Add a new employee', steps: ['HR → People → Add employee.', 'Complete the employment form (designation auto-fills dept/seniority/policy defaults) and the required documents.', 'Save — Marketing is auto-tasked for a headshot and welcome email.'], to: { path: '/hr', view: 'people' }, roles: ['hr', 'admin', 'management'] },
  { id: 'hr-approve-ts', module: 'hr', label: 'Approve my team’s timesheets', steps: ['HR → Team timesheets (managers) or Timesheets (HR oversight).', 'Open a submitted week to see the per-day breakdown.', 'Approve, or reject with a reason. “Recently decided” confirms it landed.'], to: { path: '/hr', view: 'teamtimesheets' }, roles: ['hr', 'management', 'pm', 'admin'] },
  { id: 'hr-payroll', module: 'hr', label: 'Run the monthly payroll (WPS)', steps: ['HR → Payroll.', 'Review the run (basic + allowances + overtime − deductions); note anyone flagged for an unsubmitted timesheet.', 'Draft → Generate SIF → Submitted → Paid; open a payslip to check the gratuity estimate.'], to: { path: '/hr', view: 'payroll' }, roles: ['hr', 'management', 'admin'] },
  { id: 'hr-renewals', module: 'hr', label: 'Check visa & document renewals', steps: ['HR → Renewals.', 'It lists visas, passports, contracts and dependent insurance expiring within 90 days or overdue.', 'Filter by document type; each row names the notified owner.'], to: { path: '/hr', view: 'renewals' }, roles: ['hr', 'management', 'admin'] },
  { id: 'hr-warning', module: 'hr', label: 'Issue a warning letter', steps: ['HR → Disciplinary.', 'Use “Issue warning” — employee, category, level (verbal/written/final), summary.', 'Print it on letterhead with the acknowledgement line.'], to: { path: '/hr', view: 'warnings' }, roles: ['hr', 'admin'] },
  { id: 'hr-headcount', module: 'hr', label: 'See headcount & attrition', steps: ['HR → Headcount & attrition.', 'Read headcount by department, joiners vs leavers, annualized attrition and tenure buckets.', 'Exit reasons come from the Exit interviews log.'], to: { path: '/hr', view: 'headcount' }, roles: ['hr', 'management', 'admin'] },

  // ---- Projects ----
  { id: 'pj-mywork', module: 'projects', label: 'See everything assigned to me', steps: ['Projects → My Work.', 'It gathers your tasks, approvals waiting on you (WIR/MIR/NCR/QA) and contract deadlines across all projects.', 'Search to narrow; click through to the workspace.'], to: { path: '/projects', view: 'mywork' } },
  { id: 'pj-dash', module: 'projects', label: 'Check project health', steps: ['Projects → Active projects.', 'One row per active project: RAG health, % complete, late tasks, next milestone, SPI, hours vs budget (and cost/invoiced for sensitive roles).', 'Click a row to open the workspace.'], to: { path: '/projects', view: 'pmdash' }, roles: ['management', 'pm', 'admin'] },
  { id: 'pj-resources', module: 'projects', label: 'Plan resources across the team', steps: ['Projects → Resources.', 'Read the person × week capacity heatmap; expand a row for per-project planned hours vs 40h.', 'Use “Allocate” to add planned hours; logged timesheet hours show alongside.'], to: { path: '/projects', view: 'resources' }, roles: ['management', 'pm', 'admin'] },
  { id: 'pj-open', module: 'projects', label: 'Open a project’s workspace', steps: ['Projects → Portfolio (Database), find the project.', 'Click the row to open its workspace; the sidebar is scoped to what that project is (design / supervision / study).', 'Use “Details” for the old record card.'], to: { path: '/projects', view: 'portfolio' } },
  { id: 'pj-wir', module: 'projects', label: 'Raise a WIR / inspection request', steps: ['Open a supervision project’s workspace → Site.', 'On the WIR tab, add a request (ref, title, location, drawing ref).', 'It runs pending → approved / approved-as-noted; a resubmit keeps the same ref with rev history.'], to: { path: '/projects', view: 'portfolio' }, roles: ['pm', 'management', 'admin'] },
  { id: 'pj-daily', module: 'projects', label: 'Log a daily site report (fast)', steps: ['Open a supervision workspace → Quick daily entry.', 'Phone-friendly: date, manpower, plant count, one-line note — submit.', 'It appends to the daily-reports register with a “quick entry” badge.'], to: { path: '/projects', view: 'portfolio' }, roles: ['pm', 'management', 'admin'] },
  { id: 'pj-claim', module: 'projects', label: 'Track a FIDIC claim & its notice deadline', steps: ['Open a workspace → Claims & EOT.', 'Log the event; the 28-day notice countdown starts from awareness, then the 42/84-day detailed-claim window.', 'Keep the contemporary-records log current — deadlines also surface in My Work and the bell.'], to: { path: '/projects', view: 'portfolio' }, roles: ['pm', 'management', 'admin'] },
  { id: 'pj-transmittal', module: 'projects', label: 'Issue a drawing transmittal', steps: ['Open a design workspace → Transmittals.', 'Create one (auto TRN ref, recipient, purpose) and pick deliverables from the register as line items.', 'Open the print view for the sign-off block.'], to: { path: '/projects', view: 'portfolio' }, roles: ['pm', 'management', 'admin'] },

  // ---- Finance ----
  { id: 'fin-invoice', module: 'finance', label: 'Create a client invoice', steps: ['Financials → Invoices → New invoice.', 'Link a project, enter the amount (5% VAT auto), set issue/due dates, note the attachment file name.', 'Send it; status runs draft → sent → partially paid → paid.'], to: { path: '/finance', view: 'invoices' }, roles: ['finance', 'management', 'admin'] },
  { id: 'fin-receipt', module: 'finance', label: 'Record a receipt against invoices', steps: ['Financials → Receipts → Record receipt.', 'Pick the client, enter date/reference/bank, and allocate the amount across their open invoices.', 'Allocation drives each invoice’s paid / partially-paid status.'], to: { path: '/finance', view: 'receipts' }, roles: ['finance', 'management', 'admin'] },
  { id: 'fin-credit', module: 'finance', label: 'Issue a credit note', steps: ['Financials → Invoices.', 'On a sent invoice with an outstanding balance, use “Credit note” (reason + amount, capped at outstanding).', 'It nets the client’s balance on their statement.'], to: { path: '/finance', view: 'invoices' }, roles: ['finance', 'management', 'admin'] },
  { id: 'fin-expense', module: 'finance', label: 'Log an expense with VAT', steps: ['Financials → Expenses → add expense.', 'Category, amount, VAT (auto 5%, editable) and a “non-recoverable” flag where it applies; optional project job-costing link.', 'It flows into the VAT working paper under Accountant.'], to: { path: '/finance', view: 'expenses' }, roles: ['finance', 'management', 'admin'] },
  { id: 'fin-payables', module: 'finance', label: 'Approve & pay supplier invoices', steps: ['Financials → Payables.', 'Approve a pending supplier/subconsultant invoice; “Start payment run” groups approved ones with a total.', 'Mark the run paid.'], to: { path: '/finance', view: 'payables' }, roles: ['finance', 'management', 'admin'] },
  { id: 'fin-monthend', module: 'finance', label: 'Run the month-end close', steps: ['Financials → Month-end close.', 'Pick the month; tick each item (bank rec, receipts allocated, expenses approved, VAT reviewed, payroll posted…).', 'Each tick stamps who and when.'], to: { path: '/finance', view: 'monthend' }, roles: ['finance', 'management', 'admin'] },
  { id: 'fin-reports', module: 'finance', label: 'Produce the monthly accountant reports', steps: ['Financials → Accountant.', 'Receivables aging (the chase list), client statements, and the VAT return working paper.', 'Each has a CSV export.'], to: { path: '/finance', view: 'accountant' }, roles: ['finance', 'management', 'admin'] },

  // ---- Marketing ----
  { id: 'mk-inbox', module: 'marketing', label: 'Work the marketing task inbox', steps: ['Marketing → Inbox.', 'Tasks arrive automatically (new project → description; final stage → photos; new hire → headshot + welcome email).', 'The photo task is a 4-step workflow ending in review/approve/upload.'], to: { path: '/marketing', view: 'inbox' }, roles: ['marketing', 'management', 'admin'] },
  { id: 'mk-calendar', module: 'marketing', label: 'Plan content on the calendar', steps: ['Marketing → Content calendar.', 'Month or custom range; channels are Website / LinkedIn / Email, with copy + media as the primary fields.', 'Move items idea → draft → pending approval → approved → published.'], to: { path: '/marketing', view: 'calendar' }, roles: ['marketing', 'management', 'admin'] },
  { id: 'mk-campaign', module: 'marketing', label: 'Group content into a campaign', steps: ['Marketing → Campaigns → new campaign (name, goal, date range).', 'Attach content items to it.', 'The campaign card shows a published-progress line.'], to: { path: '/marketing', view: 'campaigns' }, roles: ['marketing', 'management', 'admin'] },
  { id: 'mk-event', module: 'marketing', label: 'Track an event or exhibition', steps: ['Marketing → Events → add event.', 'Name, dates, venue, type, budget, owner.', 'After it, record outcomes and a leads count.'], to: { path: '/marketing', view: 'events' }, roles: ['marketing', 'management', 'admin'] },

  // ---- IT ----
  { id: 'it-raise', module: 'it', label: 'Raise a hardware / software / access request', steps: ['IT & Assets → My requests.', 'Pick the type and describe what you need.', 'IT works it through approve → procure → fulfil; you’ll see the resolution note.'], to: { path: '/it', view: 'mine' } },
  { id: 'it-queue', module: 'it', label: 'Work the IT request queue', steps: ['IT & Assets → Request queue.', 'Approve → procure → fulfil, or reject with a reason.', 'Check SLA timers for anything running over target.'], to: { path: '/it', view: 'queue' }, roles: ['it', 'admin', 'management'] },
  { id: 'it-assets', module: 'it', label: 'Manage assets & licenses', steps: ['IT & Assets → Assets to tag and assign hardware; → Licenses for software seats and renewals.', 'The renewal radar flags 60-day/overdue.', 'Installed software maps what’s on each asset and flags seat overruns.'], to: { path: '/it', view: 'assets' }, roles: ['it', 'admin', 'management'] },

  // ---- Office ----
  { id: 'of-corr', module: 'office', label: 'Log incoming / outgoing correspondence', steps: ['Office Admin → Correspondence → log a letter.', 'Direction, party, project link, attachment; refs auto-number (IN/OUT-2026-NNN).', 'Reply-by tracking flags overdue items.'], to: { path: '/office', view: 'correspondence' }, roles: ['adminstaff', 'management', 'admin'] },
  { id: 'of-room', module: 'office', label: 'Book a meeting room', steps: ['Office Admin → Meeting rooms.', 'Pick a room and date, set from/to and the purpose.', 'Overlapping times are rejected with a clash message.'], to: { path: '/office', view: 'rooms' }, roles: ['adminstaff', 'management', 'admin'] },
  { id: 'of-vehicle', module: 'office', label: 'Book a vehicle & log Salik', steps: ['Office Admin → Vehicles & Salik.', 'Book a vehicle (driver, purpose, km out); “Log return” records km in.', 'Add Salik/fines per vehicle with a payroll-deduction flag.'], to: { path: '/office', view: 'vehicles' }, roles: ['adminstaff', 'management', 'admin'] },

  // ---- Admin ----
  { id: 'ad-users', module: 'admin', label: 'Manage users & roles', steps: ['Admin Center → Users.', 'Add a user (mock invite), edit role, reset password, disable or delete.', 'Use the shield icon to grant per-user special access to a module.'], to: { path: '/admin', view: 'users' }, roles: ['admin', 'management'] },
  { id: 'ad-perms', module: 'admin', label: 'Edit the permissions matrix', steps: ['Admin Center → Roles & permissions.', 'Click a cell to cycle — / View / Full for each role × module.', 'This mirrors the app’s gates and is the Phase 2 RBAC spec.'], to: { path: '/admin', view: 'roles' }, roles: ['admin', 'management'] },
  { id: 'ad-doa', module: 'admin', label: 'Set delegation-of-authority limits', steps: ['Admin Center → Authority & access.', 'Click a limit to edit the AED threshold per action × level (staff / dept head / management).', 'Add grade/employment-type visibility rules below.'], to: { path: '/admin', view: 'governance' }, roles: ['admin', 'management'] },
  { id: 'ad-feedback', module: 'admin', label: 'Triage system feedback', steps: ['Admin Center → System feedback.', 'Everything raised via the Feedback button lands here.', 'Move items through the triage statuses.'], to: { path: '/admin', view: 'feedback' }, roles: ['admin', 'management'] },
]
