// Dummy HR data for the proof-of-concept. Local state only, same as CRM.

export const ONBOARDING_SECTIONS = [
  {
    id: 1,
    type: 'reading',
    title: 'Welcome to ALSUWEIDI',
    estMinutes: 5,
    summary: 'Our story, what we do, and what to expect in your first few weeks.',
    content: [
      'ALSUWEIDI Engineering Consultants has been delivering infrastructure, buildings, and industrial projects across the UAE for over two decades. You\'re joining a team of engineers, project managers, and specialists working on everything from government transport projects to landmark developments.',
      'Your first two weeks are about orientation, not output. Meet your team, get your systems set up, and work through this onboarding checklist. Your manager will walk you through your specific role and project assignments separately.',
      'If anything here is unclear, HR is your first point of contact — reach out anytime.',
    ],
  },
  {
    id: 2,
    type: 'policy',
    title: 'Working Hours & Attendance',
    estMinutes: 4,
    summary: 'Office hours, flexible work, and how attendance is tracked.',
    content: [
      'Core office hours are Sunday–Thursday, 8:30 AM – 5:30 PM, with a one-hour lunch break. We operate flexible start times between 8:00–9:30 AM, provided your 8.5 hours are covered and you\'re available for any 10 AM–3 PM core collaboration window.',
      'Site-based roles follow project schedules, which may include weekend or extended hours during critical phases — your PM will confirm this per project.',
      'All hours are logged through the ERP Timesheet tool weekly. Unsubmitted timesheets block payroll processing, so submit by end of day Thursday each week.',
    ],
  },
  {
    id: 3,
    type: 'policy',
    title: 'Code of Conduct',
    estMinutes: 6,
    summary: 'Professional conduct, confidentiality, and workplace standards.',
    content: [
      'We hold ourselves to professional engineering standards in every client interaction — accuracy, transparency, and accountability come first, even when it\'s uncomfortable to raise an issue.',
      'Client and project information is confidential by default. Don\'t discuss project details, pricing, or client relationships outside the company, including on personal social media.',
      'ALSUWEIDI is a harassment-free workplace. Any concerns can be raised confidentially with HR or your department head with no fear of retaliation.',
    ],
  },
  {
    id: 4,
    type: 'video',
    title: 'Health & Safety Induction',
    estMinutes: 8,
    summary: 'Site safety, PPE requirements, and emergency procedures.',
    videoLabel: 'Health & Safety Induction — 8 min',
  },
  {
    id: 5,
    type: 'howto',
    title: 'IT & Hardware Setup',
    estMinutes: 5,
    summary: 'How to request hardware, set up email, and connect to the VPN.',
    content: [
      '1. Your company email and Microsoft 365 account are provisioned before day one — check your personal email for the welcome message with temporary credentials.',
      '2. Request a laptop, monitor, or other hardware from the ERP Home page under Quick Actions → Hardware Request. IT typically fulfills requests within 2 business days.',
      '3. Install the VPN client (link sent by IT) to access internal file servers and project drives when working off-site.',
      '4. Set up multi-factor authentication on your first login — this is mandatory for all accounts.',
    ],
  },
  {
    id: 6,
    type: 'howto',
    title: 'Leave & Timesheets',
    estMinutes: 4,
    summary: 'How to request leave and fill in your weekly timesheet.',
    content: [
      '1. Submit leave requests through the ERP Home page under Quick Actions → Request Leave, at least 5 working days in advance for planned leave.',
      '2. Your manager approves or declines requests — you\'ll get a notification either way. Annual leave balance is visible on your employee dashboard.',
      '3. Timesheets are filled weekly under Quick Actions → Fill Timesheet. Log hours against the specific project code your PM gives you, not just "general."',
    ],
  },
  {
    id: 7,
    type: 'policy',
    title: 'Payroll & Benefits',
    estMinutes: 3,
    summary: 'Pay schedule, benefits enrollment, and expense claims.',
    content: [
      'Salaries are paid on the 26th of each month via WPS transfer to your registered bank account. Payslips are available on the employee dashboard.',
      'Health insurance coverage begins on your start date — your insurance card typically arrives within the first 2 weeks. Dependents can be added within 30 days of joining.',
      'Business expenses (travel, client meetings, site visits) are claimed through Finance with receipts attached — ask your manager for the claim form template.',
    ],
  },
]

export const TYPE_META = {
  reading: { label: 'Reading', color: 'bg-blue-100 text-blue-700' },
  policy: { label: 'Policy', color: 'bg-purple-100 text-purple-700' },
  video: { label: 'Video', color: 'bg-red-100 text-red-700' },
  howto: { label: 'How-To', color: 'bg-green-100 text-green-700' },
}

export const HR_STATS = {
  totalEmployees: 187,
  departments: 6,
  newHiresThisMonth: 4,
}

export const QUICK_LINKS = [
  { label: 'Employee Handbook' },
  { label: 'Leave Policy (Full)' },
  { label: 'IT Helpdesk' },
  { label: 'Org Chart' },
]
