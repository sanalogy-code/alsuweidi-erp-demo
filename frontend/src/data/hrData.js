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
  { label: 'Request Certificate' },
]

export const LEAVE_TYPES = ['Vacation', 'Sick', 'Unpaid', 'Bereavement', 'Parental']

// One enum rather than a separate list — Secondment is an employment type like the others
// (ALSUWEIDI staff embedded at a client or site), matching the CRM contact taxonomy's use of the term.
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Secondment', 'Intern']

// Two-step approval chain (decision 3 Jul): a request goes to the employee's
// line manager first ('pending_manager'), then to HR for final approval
// ('pending_hr'). Employees without a line manager skip straight to HR.
// Legacy 'pending' is treated as 'pending_hr'.
export const LEAVE_PENDING_STATUSES = ['pending', 'pending_manager', 'pending_hr']

export const leaveStatusForNew = (employee) => (employee?.managerId ? 'pending_manager' : 'pending_hr')

export const LEAVE_REQUESTS = [
  { id: 1, employeeId: 1, employeeName: 'Osama Hussain', type: 'Vacation', startDate: '2026-07-15', endDate: '2026-07-22', days: 8, reason: 'Summer holiday', status: 'approved', approvedBy: 'Layla Al Mazrouei', approvedDate: '2026-06-28', requestedDate: '2026-06-20', managerApprovedBy: null, managerApprovedDate: null },
  { id: 2, employeeId: 5, employeeName: 'Layla Al Mazrouei', type: 'Sick', startDate: '2026-07-08', endDate: '2026-07-08', days: 1, reason: 'Medical appointment', status: 'pending_hr', approvedBy: null, approvedDate: null, requestedDate: '2026-07-01', managerApprovedBy: null, managerApprovedDate: null },
  { id: 3, employeeId: 2, employeeName: 'Naseeb Shaheen', type: 'Vacation', startDate: '2026-08-01', endDate: '2026-08-15', days: 15, reason: 'Eid holiday', status: 'pending_hr', approvedBy: null, approvedDate: null, requestedDate: '2026-06-28', managerApprovedBy: null, managerApprovedDate: null },
  { id: 4, employeeId: 8, employeeName: 'Hassan Al Shamsi', type: 'Vacation', startDate: '2026-07-20', endDate: '2026-07-24', days: 5, reason: 'Family trip', status: 'pending_manager', approvedBy: null, approvedDate: null, requestedDate: '2026-06-30', managerApprovedBy: null, managerApprovedDate: null },
  { id: 5, employeeId: 10, employeeName: 'Samir Al Mazrouei', type: 'Sick', startDate: '2026-07-06', endDate: '2026-07-07', days: 2, reason: 'Flu', status: 'approved', approvedBy: 'Layla Al Mazrouei', approvedDate: '2026-07-01', requestedDate: '2026-06-30', managerApprovedBy: 'Osama Hussain', managerApprovedDate: '2026-06-30' },
  { id: 6, employeeId: 7, employeeName: 'Fatima Al Mansouri', type: 'Vacation', startDate: '2026-07-27', endDate: '2026-07-31', days: 5, reason: 'Short break', status: 'approved', approvedBy: 'Layla Al Mazrouei', approvedDate: '2026-06-30', requestedDate: '2026-06-25', managerApprovedBy: 'Naseeb Shaheen', managerApprovedDate: '2026-06-28' },
  { id: 7, employeeId: 3, employeeName: 'Mohammad Kubba', type: 'Vacation', startDate: '2026-07-29', endDate: '2026-08-04', days: 7, reason: 'Family visit abroad', status: 'pending_manager', approvedBy: null, approvedDate: null, requestedDate: '2026-07-01', managerApprovedBy: null, managerApprovedDate: null },
]

// UAE public holidays. Islamic dates are announced on moon sighting, so entries start as
// 'pending' and HR approves (or corrects the dates) once official — approved ones surface
// on every employee's home dashboard.
export const PUBLIC_HOLIDAYS = [
  { id: 1, name: "New Year's Day", date: '2026-01-01', endDate: null, status: 'approved', note: '' },
  { id: 2, name: 'Eid Al Fitr', date: '2026-03-19', endDate: '2026-03-22', status: 'approved', note: 'Confirmed after moon sighting' },
  { id: 3, name: 'Arafat Day', date: '2026-05-26', endDate: null, status: 'approved', note: '' },
  { id: 4, name: 'Eid Al Adha', date: '2026-05-27', endDate: '2026-05-29', status: 'approved', note: '' },
  { id: 5, name: 'Islamic New Year', date: '2026-06-16', endDate: null, status: 'approved', note: '' },
  { id: 6, name: "Prophet Muhammad's Birthday (PBUH)", date: '2026-08-25', endDate: null, status: 'pending', note: 'Expected date — subject to moon sighting' },
  { id: 7, name: 'Commemoration Day', date: '2026-12-01', endDate: null, status: 'approved', note: '' },
  { id: 8, name: 'UAE National Day', date: '2026-12-02', endDate: '2026-12-03', status: 'approved', note: '' },
]

export const ANNUAL_LEAVE_ENTITLEMENT = 30 // calendar days per year, UAE standard for >1yr service

export const COMPLAINT_CATEGORIES = ['Workplace Conduct / Harassment', 'Manager Conduct', 'Payroll / Compensation Dispute', 'Health & Safety', 'Facilities / Equipment', 'Other']

// Complaints are visible to HR staff only — not even management, since a complaint may concern a manager.
export const COMPLAINTS = [
  { id: 1, category: 'Health & Safety', description: 'Scaffolding on the Al Ain site is missing edge protection on level 3. Reported to site foreman last week, still not fixed.', anonymous: false, submittedBy: 'Hassan Al Shamsi', submittedDate: '2026-06-25', status: 'under_review' },
  { id: 2, category: 'Manager Conduct', description: 'Repeated last-minute weekend work requests without notice or overtime recording.', anonymous: true, submittedBy: null, submittedDate: '2026-06-30', status: 'submitted' },
]

// Company policy: flat AED 500 gift for any successful referral (paid once the referral is hired).
export const REFERRAL_BONUS_AED = 500

export const OPEN_POSITIONS = [
  { id: 1, title: 'Senior Structural Engineer', dept: 'Engineering', location: 'Abu Dhabi HQ', type: 'Full-time', referralBonus: REFERRAL_BONUS_AED, postedDate: '2026-06-15' },
  { id: 2, title: 'Document Controller', dept: 'Admin', location: 'Abu Dhabi HQ', type: 'Full-time', referralBonus: REFERRAL_BONUS_AED, postedDate: '2026-06-22' },
  { id: 3, title: 'Site Engineer', dept: 'Projects', location: 'Al Ain Branch', type: 'Contract', referralBonus: REFERRAL_BONUS_AED, postedDate: '2026-07-01' },
]

export const CANDIDATES = [
  { id: 1, positionId: 1, kind: 'referral', candidateName: 'Rami Haddad', contact: 'rami.h@gmail.com', referredBy: 'Naseeb Shaheen', note: 'Ex-colleague, 12 years structural experience, Aldar projects', status: 'interviewing', submittedDate: '2026-06-20' },
  { id: 2, positionId: 2, kind: 'internal', candidateName: 'Maryam Al Kaabi', contact: 'maryam@alsuweidi.com', referredBy: null, note: 'Interested in a lateral move into document control', status: 'new', submittedDate: '2026-06-28' },
]

// Snapshot as of today. The live feed from fingerprint/card readers needs the Phase 2 backend —
// these figures are illustrative so HR can sign off on the dashboard layout first.
export const ATTENDANCE_TODAY = [
  { employeeId: 1, status: 'site', checkIn: '07:45', site: 'Marina Tower', hoursWeek: 34.5, lateMonth: 0, absentMonth: 0 },
  { employeeId: 2, status: 'present', checkIn: '08:20', site: null, hoursWeek: 36.0, lateMonth: 1, absentMonth: 0 },
  { employeeId: 3, status: 'present', checkIn: '08:05', site: null, hoursWeek: 35.0, lateMonth: 0, absentMonth: 0 },
  { employeeId: 4, status: 'absent', checkIn: null, site: null, hoursWeek: 21.0, lateMonth: 3, absentMonth: 1 },
  { employeeId: 5, status: 'present', checkIn: '08:31', site: null, hoursWeek: 35.5, lateMonth: 0, absentMonth: 0 },
  { employeeId: 6, status: 'present', checkIn: '07:58', site: null, hoursWeek: 37.0, lateMonth: 0, absentMonth: 0 },
  { employeeId: 7, status: 'present', checkIn: '08:44', site: null, hoursWeek: 33.5, lateMonth: 2, absentMonth: 0 },
  { employeeId: 8, status: 'site', checkIn: '06:55', site: 'Al Ain pump station', hoursWeek: 41.0, lateMonth: 0, absentMonth: 0 },
  { employeeId: 9, status: 'present', checkIn: '08:12', site: null, hoursWeek: 34.0, lateMonth: 0, absentMonth: 0 },
  { employeeId: 10, status: 'site', checkIn: '06:40', site: 'Madinat Zayed site', hoursWeek: 42.5, lateMonth: 0, absentMonth: 0 },
]

// UAE HR letter/certificate requests — the standard set most companies field: proof of employment
// and income (salary/employment certificates), bank-facing letters, embassy/visa letters, an NOC for
// anything requiring the employer's sign-off (driving license, part-time work, sponsor transfer), and
// experience/service letters for leavers.
export const CERTIFICATE_TYPES = [
  { value: 'salary', label: 'Salary Certificate', description: 'States current basic salary and allowances — for loans, credit cards, visa sponsorship.' },
  { value: 'employment', label: 'Employment Certificate', description: 'Confirms job title, department, and employment status — general proof of employment.' },
  { value: 'salary_transfer', label: 'Salary Transfer Letter', description: 'Confirms salary is paid via WPS to a specific bank — for opening a bank account.' },
  { value: 'noc', label: 'No Objection Certificate (NOC)', description: "Employer's sign-off for something outside work — driving license, part-time work, visa sponsorship transfer, etc." },
  { value: 'embassy', label: 'Embassy / Visa Letter', description: 'Formal letter for an embassy or consulate supporting a visa application.' },
  { value: 'experience', label: 'Experience / Service Certificate', description: 'Full tenure, role history, and last drawn salary — typically requested when leaving the company.' },
]

export const CERTIFICATE_LANGUAGES = ['English', 'Arabic', 'Bilingual (English & Arabic)']

export const ADDRESSEE_SUGGESTIONS = [
  'To Whom It May Concern',
  'Emirates NBD Bank',
  'ADCB',
  'UAE Embassy',
  'GDRFA (General Directorate of Residency and Foreigners Affairs)',
  'RTA (Roads and Transport Authority)',
]

export const CERTIFICATE_REQUESTS = [
  { id: 1, employeeId: 1, employeeName: 'Osama Hussain', type: 'salary', addressedTo: 'Emirates NBD Bank', language: 'English', purpose: 'Personal loan application', nocObject: '', status: 'issued', requestedDate: '2026-06-20', resolvedDate: '2026-06-22' },
  { id: 2, employeeId: 3, employeeName: 'Mohammad Kubba', type: 'noc', addressedTo: 'RTA (Roads and Transport Authority)', language: 'English', purpose: 'Driving license renewal', nocObject: 'UAE driving license renewal', status: 'pending', requestedDate: '2026-06-29', resolvedDate: null },
  { id: 3, employeeId: 8, employeeName: 'Hassan Al Shamsi', type: 'embassy', addressedTo: 'UAE Embassy', language: 'Bilingual (English & Arabic)', purpose: 'Family visit visa sponsorship', nocObject: '', status: 'pending', requestedDate: '2026-07-01', resolvedDate: null },
]

// Business card requests — same request → HR inbox → fulfil shape as
// certificates. HR marks the card printed & delivered to close it.
export const BUSINESS_CARD_REQUESTS = [
  { id: 1, employeeId: 2, employeeName: 'Naseeb Shaheen', nameOnCard: 'Naseeb Shaheen', titleOnCard: 'Lead Structural Engineer', mobile: '+971-50-222-3456', notes: 'Bilingual (English/Arabic), 200 cards', status: 'pending', requestedDate: '2026-07-01', resolvedDate: null },
]

// Payroll (UAE model): monthly salary = basic + allowances, paid via WPS (Wage Protection System —
// employer submits a SIF file to its bank / MOHRE each cycle). No income tax; variations come from
// overtime and deductions (unpaid leave, salary advance repayments). Per-month adjustments below;
// anything not listed defaults to zero adjustments for that employee.
export const PAYROLL_MONTHS = [
  { value: '2026-08', label: 'August 2026', status: 'draft' },
  { value: '2026-07', label: 'July 2026', status: 'draft' },
  { value: '2026-06', label: 'June 2026', status: 'paid' },
  { value: '2026-05', label: 'May 2026', status: 'paid' },
]

export const PAYROLL_ADJUSTMENTS = {
  '2026-07': [
    { employeeId: 8, overtime: 850, deduction: 0, note: 'Site overtime — 12 hrs' },
    { employeeId: 10, overtime: 1200, deduction: 0, note: 'Site overtime — 16 hrs' },
    { employeeId: 4, overtime: 0, deduction: 1250, note: 'Salary advance repayment (2 of 4)' },
    { employeeId: 2, overtime: 0, deduction: 1600, note: 'Unpaid leave — 2 days' },
  ],
  '2026-06': [
    { employeeId: 10, overtime: 900, deduction: 0, note: 'Site overtime — 12 hrs' },
    { employeeId: 4, overtime: 0, deduction: 1250, note: 'Salary advance repayment (1 of 4)' },
  ],
  '2026-05': [
    { employeeId: 8, overtime: 640, deduction: 0, note: 'Site overtime — 9 hrs' },
  ],
}

export const ACCOMPLISHMENT_TYPES = ['PE License', 'BIM Certification', 'Safety Induction', 'ISO Training', 'AutoCAD', 'Revit', 'Site Supervision', 'Project Management']

// Sponsored dependents (spouse, children) carry their own passport/visa/Emirates ID/insurance —
// visa is null for UAE nationals (citizens don't hold a residence visa, incl. their dependents).
export const RELATIONSHIP_TYPES = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other']

export const EMPLOYEES = [
  // `grade` is optional pending the management decision on grades/salary bands
  // (see the Grades & bands view) — only provisionally assigned on a few records.
  { id: 1, name: 'Osama Hussain', title: 'Senior Project Manager', dept: 'Projects', location: 'Abu Dhabi HQ', employmentType: 'Full-time', grade: 'G6', email: 'osama@alsuweidi.com', phone: '+971-50-111-2345', mobilePhone: '+971-50-111-2345', startDate: '2015-03-15', status: 'active', managerId: null, contractEndDate: '2027-03-15', nationality: 'Egypt', passport: { number: 'A2456781', country: 'Egypt', type: 'Ordinary', issueDate: '2019-02-10', expiryDate: '2029-02-09' }, visa: { number: '201/2015/1/445210', type: 'Employment Residence Visa', status: 'Valid', issueDate: '2015-04-01', expiryDate: '2028-05-20', sponsor: 'ALSUWEIDI' }, emiratesId: { number: '784-1978-4451207-1', expiryDate: '2028-05-20' }, dependents: [{ name: 'Hana Hussain', relationship: 'Spouse', dob: '1985-06-15', nationality: 'Egypt', passport: { number: 'A3456782', country: 'Egypt', type: 'Ordinary', issueDate: '2020-01-15', expiryDate: '2030-01-14' }, visa: { number: '201/2015/2/445211', type: 'Residence Visa - Dependent (Spouse)', status: 'Valid', issueDate: '2015-05-01', expiryDate: '2028-05-20' }, emiratesId: { number: '784-1985-4451208-2', expiryDate: '2028-05-20' }, insurance: { provider: 'Daman', policyNumber: 'DM-778812', expiryDate: '2026-08-31' } }, { name: 'Omar Hussain', relationship: 'Son', dob: '2010-03-22', nationality: 'Egypt', passport: { number: 'A4456783', country: 'Egypt', type: 'Ordinary', issueDate: '2021-06-01', expiryDate: '2026-05-31' }, visa: { number: '201/2015/3/445212', type: 'Residence Visa - Dependent (Child)', status: 'Valid', issueDate: '2015-05-01', expiryDate: '2028-05-20' }, emiratesId: { number: '784-2010-4451209-3', expiryDate: '2028-05-20' }, insurance: { provider: 'Daman', policyNumber: 'DM-778813', expiryDate: '2026-08-31' } }], accomplishments: [{ type: 'Project Management', issuer: 'PMI', date: '2018-07-10', expiryDate: null }, { type: 'Site Supervision', issuer: 'ALSUWEIDI', date: '2015-06-01', expiryDate: null }], emergencyContact: { name: 'Hana Hussain', relationship: 'Spouse', phone: '+971-50-111-9999' }, compensation: { basicSalary: 28000, housingAllowance: 8000, transportAllowance: 2000, otherBenefits: 'Annual flight allowance, health insurance (family)', noticePeriodDays: 90 } },
  { id: 2, name: 'Naseeb Shaheen', title: 'Lead Structural Engineer', dept: 'Engineering', location: 'Amman Office (Jordan)', workWeek: 'sun-thu', employmentType: 'Full-time', email: 'naseeb@alsuweidi.com', phone: '+971-50-222-3456', mobilePhone: '+971-50-222-3456', startDate: '2018-06-01', status: 'active', managerId: null, contractEndDate: '2027-06-01', nationality: 'Jordan', passport: { number: 'K1122334', country: 'Jordan', type: 'Ordinary', issueDate: '2018-09-05', expiryDate: '2028-09-04' }, visa: { number: '201/2018/1/556321', type: 'Employment Residence Visa', status: 'Valid', issueDate: '2018-06-15', expiryDate: '2027-08-15', sponsor: 'ALSUWEIDI' }, emiratesId: { number: '784-1982-5563210-4', expiryDate: '2027-08-15' }, dependents: [{ name: 'Salma Shaheen', relationship: 'Spouse', dob: '1990-12-08', nationality: 'Jordan', passport: { number: 'K2233445', country: 'Jordan', type: 'Ordinary', issueDate: '2019-03-01', expiryDate: '2029-02-28' }, visa: { number: '201/2018/2/556322', type: 'Residence Visa - Dependent (Spouse)', status: 'Valid', issueDate: '2018-07-01', expiryDate: '2027-08-15' }, emiratesId: { number: '784-1990-5563211-5', expiryDate: '2027-08-15' }, insurance: { provider: 'AXA Gulf', policyNumber: 'AX-334221', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'PE License', issuer: 'UAE Engineers Register', date: '2016-04-15', expiryDate: null }, { type: 'AutoCAD', issuer: 'Autodesk', date: '2015-01-20', expiryDate: null }, { type: 'BIM Certification', issuer: 'buildingSMART', date: '2023-09-10', expiryDate: null }], emergencyContact: { name: 'Salma Shaheen', relationship: 'Spouse', phone: '+971-50-222-9999' }, compensation: { basicSalary: 24000, housingAllowance: 7000, transportAllowance: 1800, otherBenefits: 'Annual flight allowance, health insurance (family)', noticePeriodDays: 60 } },
  { id: 3, name: 'Mohammad Kubba', title: 'MEP Design Manager', dept: 'Engineering', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'mkubba@alsuweidi.com', phone: '+971-50-333-4567', mobilePhone: '+971-50-333-4567', startDate: '2016-08-10', status: 'active', managerId: 2, contractEndDate: '2026-08-10', nationality: 'Iraq', passport: { number: 'H5566778', country: 'Iraq', type: 'Ordinary', issueDate: '2017-05-20', expiryDate: '2027-05-19' }, visa: { number: '201/2016/1/667890', type: 'Employment Residence Visa', status: 'Valid', issueDate: '2016-08-15', expiryDate: '2026-09-20', sponsor: 'ALSUWEIDI' }, emiratesId: { number: '784-1983-6678901-6', expiryDate: '2026-09-20' }, dependents: [{ name: 'Noor Kubba', relationship: 'Spouse', dob: '1988-03-25', nationality: 'Iraq', passport: { number: 'H6677889', country: 'Iraq', type: 'Ordinary', issueDate: '2018-02-10', expiryDate: '2028-02-09' }, visa: { number: '201/2016/2/667891', type: 'Residence Visa - Dependent (Spouse)', status: 'Valid', issueDate: '2016-09-01', expiryDate: '2026-09-20' }, emiratesId: { number: '784-1988-6678902-7', expiryDate: '2026-09-20' }, insurance: { provider: 'Oman Insurance (Sukoon)', policyNumber: 'OS-112233', expiryDate: '2027-01-31' } }, { name: 'Zain Kubba', relationship: 'Son', dob: '2012-07-14', nationality: 'Iraq', passport: { number: 'H7788990', country: 'Iraq', type: 'Ordinary', issueDate: '2022-01-10', expiryDate: '2027-01-09' }, visa: { number: '201/2016/3/667892', type: 'Residence Visa - Dependent (Child)', status: 'Valid', issueDate: '2016-09-01', expiryDate: '2026-09-20' }, emiratesId: { number: '784-2012-6678903-8', expiryDate: '2026-09-20' }, insurance: { provider: 'Oman Insurance (Sukoon)', policyNumber: 'OS-112234', expiryDate: '2027-01-31' } }, { name: 'Leila Kubba', relationship: 'Daughter', dob: '2015-11-02', nationality: 'Iraq', passport: { number: 'H8899001', country: 'Iraq', type: 'Ordinary', issueDate: '2022-01-10', expiryDate: '2027-01-09' }, visa: { number: '201/2016/4/667893', type: 'Residence Visa - Dependent (Child)', status: 'Valid', issueDate: '2016-09-01', expiryDate: '2026-09-20' }, emiratesId: { number: '784-2015-6678904-9', expiryDate: '2026-09-20' }, insurance: { provider: 'Oman Insurance (Sukoon)', policyNumber: 'OS-112235', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'PE License', issuer: 'UAE Engineers Register', date: '2017-06-20', expiryDate: null }, { type: 'Revit', issuer: 'Autodesk', date: '2016-09-15', expiryDate: null }, { type: 'BIM Certification', issuer: 'buildingSMART', date: '2024-02-28', expiryDate: null }], emergencyContact: { name: 'Noor Kubba', relationship: 'Spouse', phone: '+971-50-333-9999' }, compensation: { basicSalary: 22000, housingAllowance: 6500, transportAllowance: 1800, otherBenefits: 'Health insurance (family)', noticePeriodDays: 60 } },
  { id: 4, name: 'Ahmed El Haddad', title: 'BIM Coordinator', dept: 'IT/BIM', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'ahaddad@alsuweidi.com', phone: '+971-50-444-5678', mobilePhone: '+971-50-444-5678', startDate: '2019-01-20', status: 'active', managerId: null, contractEndDate: '2027-01-20', nationality: 'Lebanon', passport: { number: 'RL334455', country: 'Lebanon', type: 'Ordinary', issueDate: '2016-11-05', expiryDate: '2026-11-04' }, visa: { number: '201/2019/1/778901', type: 'Employment Residence Visa', status: 'Expired', issueDate: '2019-01-20', expiryDate: '2025-09-10', sponsor: 'ALSUWEIDI' }, emiratesId: { number: '784-1984-7789012-0', expiryDate: '2025-09-10' }, dependents: [], accomplishments: [{ type: 'BIM Certification', issuer: 'buildingSMART', date: '2022-04-15', expiryDate: null }, { type: 'Revit', issuer: 'Autodesk', date: '2019-03-20', expiryDate: null }, { type: 'Safety Induction', issuer: 'ALSUWEIDI', date: '2019-01-25', expiryDate: '2026-01-25' }], emergencyContact: { name: 'Sami El Haddad', relationship: 'Brother', phone: '+971-50-444-9999' }, compensation: { basicSalary: 15000, housingAllowance: 4500, transportAllowance: 1500, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 30 } },
  { id: 5, name: 'Layla Al Mazrouei', title: 'HR Manager', dept: 'HR', location: 'Abu Dhabi HQ', employmentType: 'Full-time', grade: 'G5', email: 'layla@alsuweidi.com', phone: '+971-50-555-6789', mobilePhone: '+971-50-555-6789', startDate: '2017-11-05', status: 'active', managerId: null, contractEndDate: '2028-11-05', nationality: 'United Arab Emirates', passport: { number: 'UAE778812', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2021-03-01', expiryDate: '2031-02-28' }, visa: null, emiratesId: { number: '784-1985-9988771-1', expiryDate: '2031-02-28' }, dependents: [], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2020-05-10', expiryDate: null }], emergencyContact: { name: 'Yousef Al Mazrouei', relationship: 'Spouse', phone: '+971-50-555-9999' }, compensation: { basicSalary: 21000, housingAllowance: 6000, transportAllowance: 1800, otherBenefits: 'Health insurance (family)', noticePeriodDays: 60 } },
  { id: 6, name: 'Khalid Al Ketbi', title: 'Finance Director', dept: 'Finance', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'khalid@alsuweidi.com', phone: '+971-50-666-7890', mobilePhone: '+971-50-666-7890', startDate: '2014-02-15', status: 'active', managerId: null, contractEndDate: '2027-02-15', nationality: 'United Arab Emirates', passport: { number: 'UAE223344', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2019-06-10', expiryDate: '2029-06-09' }, visa: null, emiratesId: { number: '784-1975-2233440-2', expiryDate: '2029-06-09' }, dependents: [{ name: 'Aisha Al Ketbi', relationship: 'Spouse', dob: '1987-09-12', nationality: 'United Arab Emirates', passport: { number: 'UAE334455', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2020-04-15', expiryDate: '2030-04-14' }, visa: null, emiratesId: { number: '784-1987-3344551-3', expiryDate: '2030-04-14' }, insurance: { provider: 'MetLife', policyNumber: 'ML-556677', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2018-03-22', expiryDate: null }], emergencyContact: { name: 'Aisha Al Ketbi', relationship: 'Spouse', phone: '+971-50-666-9999' }, compensation: { basicSalary: 32000, housingAllowance: 9000, transportAllowance: 2200, otherBenefits: 'Annual flight allowance, health insurance (family), car allowance', noticePeriodDays: 90 } },
  { id: 7, name: 'Fatima Al Mansouri', title: 'Senior Architect', dept: 'Engineering', location: 'Dubai Office', employmentType: 'Full-time', email: 'fatima@alsuweidi.com', phone: '+971-4-456-7890', mobilePhone: '+971-50-777-8901', startDate: '2016-09-01', status: 'active', managerId: 2, contractEndDate: '2026-09-01', nationality: 'United Arab Emirates', passport: { number: 'UAE445566', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2020-10-01', expiryDate: '2030-09-30' }, visa: null, emiratesId: { number: '784-1988-4455661-4', expiryDate: '2030-09-30' }, dependents: [], accomplishments: [{ type: 'PE License', issuer: 'UAE Engineers Register', date: '2015-10-08', expiryDate: null }, { type: 'AutoCAD', issuer: 'Autodesk', date: '2014-05-12', expiryDate: null }, { type: 'BIM Certification', issuer: 'buildingSMART', date: '2023-11-20', expiryDate: null }], emergencyContact: { name: 'Reem Al Mansouri', relationship: 'Sister', phone: '+971-50-777-9999' }, compensation: { basicSalary: 23000, housingAllowance: 6500, transportAllowance: 1800, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 60 } },
  { id: 8, name: 'Hassan Al Shamsi', title: 'Project Coordinator', dept: 'Projects', location: 'Al Ain Branch', employmentType: 'Full-time', grade: 'G3', email: 'hassan@alsuweidi.com', phone: '+971-3-789-0123', mobilePhone: '+971-50-888-9012', startDate: '2020-05-10', status: 'active', managerId: 1, contractEndDate: '2026-08-15', nationality: 'United Arab Emirates', passport: { number: 'UAE556677', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2019-08-20', expiryDate: '2029-08-19' }, visa: null, emiratesId: { number: '784-1992-5566772-5', expiryDate: '2029-08-19' }, dependents: [{ name: 'Amira Al Shamsi', relationship: 'Spouse', dob: '1993-01-30', nationality: 'United Arab Emirates', passport: { number: 'UAE667788', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2021-05-01', expiryDate: '2031-04-30' }, visa: null, emiratesId: { number: '784-1993-6677883-6', expiryDate: '2031-04-30' }, insurance: { provider: 'Daman', policyNumber: 'DM-889900', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'Safety Induction', issuer: 'ALSUWEIDI', date: '2020-05-15', expiryDate: '2027-05-15' }, { type: 'Site Supervision', issuer: 'ALSUWEIDI', date: '2021-03-10', expiryDate: null }], emergencyContact: { name: 'Amira Al Shamsi', relationship: 'Spouse', phone: '+971-50-888-9999' }, compensation: { basicSalary: 12000, housingAllowance: 3500, transportAllowance: 1200, otherBenefits: 'Health insurance (family)', noticePeriodDays: 30 } },
  { id: 9, name: 'Maryam Al Kaabi', title: 'Compliance Officer', dept: 'Admin', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'maryam@alsuweidi.com', phone: '+971-2-123-4575', mobilePhone: '+971-50-999-0123', startDate: '2019-03-15', status: 'active', managerId: null, contractEndDate: '2027-03-15', nationality: 'United Arab Emirates', passport: { number: 'UAE778899', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2018-12-15', expiryDate: '2028-12-14' }, visa: null, emiratesId: { number: '784-1990-7788994-7', expiryDate: '2028-12-14' }, dependents: [], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2022-06-15', expiryDate: null }], emergencyContact: { name: 'Khalifa Al Kaabi', relationship: 'Father', phone: '+971-50-999-9999' }, compensation: { basicSalary: 16000, housingAllowance: 4500, transportAllowance: 1500, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 30 } },
  { id: 10, name: 'Samir Al Mazrouei', title: 'Site Supervisor', dept: 'Projects', location: 'Site-Based', workWeek: 'mon-sat', employmentType: 'Secondment', email: 'samir@alsuweidi.com', phone: '+971-50-123-4567', mobilePhone: '+971-50-123-4567', startDate: '2018-07-20', status: 'active', managerId: 1, contractEndDate: '2026-07-20', nationality: 'United Arab Emirates', passport: { number: 'UAE889900', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2017-07-01', expiryDate: '2027-06-30' }, visa: null, emiratesId: { number: '784-1989-8899005-8', expiryDate: '2027-06-30' }, dependents: [{ name: 'Hind Al Mazrouei', relationship: 'Spouse', dob: '1992-05-18', nationality: 'United Arab Emirates', passport: { number: 'UAE990011', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2019-09-10', expiryDate: '2029-09-09' }, visa: null, emiratesId: { number: '784-1992-9900116-9', expiryDate: '2029-09-09' }, insurance: { provider: 'AXA Gulf', policyNumber: 'AX-990112', expiryDate: '2026-07-15' } }, { name: 'Sara Al Mazrouei', relationship: 'Daughter', dob: '2018-09-05', nationality: 'United Arab Emirates', passport: { number: 'UAE001122', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2023-02-01', expiryDate: '2028-01-31' }, visa: null, emiratesId: { number: '784-2018-0011227-0', expiryDate: '2028-01-31' }, insurance: { provider: 'AXA Gulf', policyNumber: 'AX-990113', expiryDate: '2026-07-15' } }], accomplishments: [{ type: 'Site Supervision', issuer: 'ALSUWEIDI', date: '2018-08-05', expiryDate: null }, { type: 'Safety Induction', issuer: 'ALSUWEIDI', date: '2018-07-25', expiryDate: '2025-07-25' }], emergencyContact: { name: 'Hind Al Mazrouei', relationship: 'Spouse', phone: '+971-50-123-9999' }, compensation: { basicSalary: 13000, housingAllowance: 3500, transportAllowance: 1200, otherBenefits: 'Health insurance (family)', noticePeriodDays: 30 } },
  { id: 11, name: 'Priya Nair', title: 'Document Controller', dept: 'Admin', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'priya@alsuweidi.com', phone: '+971-50-234-8899', mobilePhone: '+971-50-234-8899', startDate: '2026-06-15', status: 'active', managerId: 9, contractEndDate: '2028-06-15', nationality: 'India', passport: { number: 'Z8812345', country: 'India', type: 'Ordinary', issueDate: '2022-11-20', expiryDate: '2032-11-19' }, visa: { number: '201/2026/1/889123', type: 'Employment Residence Visa', status: 'Valid', issueDate: '2026-02-05', expiryDate: '2028-02-04', sponsor: 'ALSUWEIDI' }, emiratesId: { number: '784-1996-8891230-1', expiryDate: '2028-02-04' }, dependents: [], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2024-03-12', expiryDate: null }], emergencyContact: { name: 'Arun Nair', relationship: 'Spouse', phone: '+971-50-234-7777' }, compensation: { basicSalary: 9000, housingAllowance: 3000, transportAllowance: 1000, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 30 }, probation: { months: 6, endDate: '2026-12-15', guaranteedIncrement: { amount: 1500, note: 'Agreed at offer — applies to basic salary', applied: false } }, documents: [{ type: 'passport', fileName: 'nair_passport.pdf', uploadedDate: '2026-06-10', status: 'verified', reviewedBy: 'Layla Al Mazrouei', reviewedDate: '2026-06-16', rejectReason: null }, { type: 'photo', fileName: 'nair_photo.jpg', uploadedDate: '2026-06-10', status: 'verified', reviewedBy: 'Layla Al Mazrouei', reviewedDate: '2026-06-16', rejectReason: null }, { type: 'degree', fileName: 'bcom_attested.pdf', uploadedDate: '2026-06-10', status: 'rejected', reviewedBy: 'Layla Al Mazrouei', reviewedDate: '2026-06-16', rejectReason: 'Attestation stamp not legible — please re-scan the attested copy.' }, { type: 'visa', fileName: 'nair_visa.pdf', uploadedDate: '2026-06-20', status: 'pending', reviewedBy: null, reviewedDate: null, rejectReason: null }] },
]

// ---------------------------------------------------------------------------
// New-joiner self-registration (replaces the old 8-tab "Register New Employee")
// ---------------------------------------------------------------------------
// The old system asked ~70 fields in one HR-facing form, with four overlapping
// job-title fields and cryptic codes ("Working Time: Type 17 D9.0 W44.5 H2").
// Redesign: the employee fills what only they know (4 short steps), HR completes
// the employment terms — most of which auto-fill from policy defaults below.

export const DEPARTMENTS = ['Engineering', 'Projects', 'HR', 'Finance', 'Admin', 'IT/BIM']

// One designation instead of Specialty + Main Designation + Other Designation +
// Profession-in-work-permit. Picking a designation auto-fills dept and seniority;
// the work-permit title defaults to the same text and is only edited when MOHRE
// requires a different wording.
export const DESIGNATIONS = [
  { title: 'Site Engineer', dept: 'Projects', seniority: 'Mid-level' },
  { title: 'Project Coordinator', dept: 'Projects', seniority: 'Mid-level' },
  { title: 'Senior Project Manager', dept: 'Projects', seniority: 'Senior' },
  { title: 'Structural Engineer', dept: 'Engineering', seniority: 'Mid-level' },
  { title: 'Senior Structural Engineer', dept: 'Engineering', seniority: 'Senior' },
  { title: 'Architect', dept: 'Engineering', seniority: 'Mid-level' },
  { title: 'MEP Engineer', dept: 'Engineering', seniority: 'Mid-level' },
  { title: 'BIM Coordinator', dept: 'IT/BIM', seniority: 'Mid-level' },
  { title: 'Document Controller', dept: 'Admin', seniority: 'Junior' },
  { title: 'HR Officer', dept: 'HR', seniority: 'Mid-level' },
  { title: 'Accountant', dept: 'Finance', seniority: 'Mid-level' },
  { title: 'Site Supervisor', dept: 'Projects', seniority: 'Mid-level' },
]

// Choosing an employment type pre-fills every policy field the old form asked
// one by one (severance pay type, leave calculation type, leave paid type,
// timesheet required, probation, notice) — HR only overrides exceptions.
export const EMPLOYMENT_TYPE_DEFAULTS = {
  'Full-time':  { probationMonths: 6, noticePeriodDays: 30, timesheetRequired: true,  severancePay: 'Applicable',     leaveBasis: 'Calendar days, full monthly salary' },
  'Part-time':  { probationMonths: 3, noticePeriodDays: 30, timesheetRequired: true,  severancePay: 'Pro-rated',      leaveBasis: 'Working days, pro-rated salary' },
  'Contract':   { probationMonths: 3, noticePeriodDays: 30, timesheetRequired: true,  severancePay: 'Per contract',   leaveBasis: 'Calendar days, full monthly salary' },
  'Secondment': { probationMonths: 0, noticePeriodDays: 30, timesheetRequired: true,  severancePay: 'Per agreement',  leaveBasis: 'Per client agreement' },
  'Intern':     { probationMonths: 0, noticePeriodDays: 7,  timesheetRequired: false, severancePay: 'Not applicable', leaveBasis: 'Not applicable' },
}

// Work-week patterns — which days of the Sun..Sat week grid are weekend for an
// employee. Company default is Mon–Fri (UAE); Jordan-based staff work Sun–Thu;
// site teams run six days. HR picks the pattern on the employment form (auto-
// defaulted from employment type / location); the timesheet grid, weekend
// shading, and the leave calendar all follow the employee's own pattern.
export const WORK_WEEK_PATTERNS = {
  'mon-fri': { label: 'Mon–Fri (company default)', weekend: [0, 6] },
  'sun-thu': { label: 'Sun–Thu (Jordan office)', weekend: [5, 6] },
  'mon-sat': { label: 'Mon–Sat (site, 6-day)', weekend: [0] },
}
export const DEFAULT_WORK_WEEK = 'mon-fri'

export const defaultWorkWeekFor = ({ location = '', employmentType = '' } = {}) => {
  const loc = location.toLowerCase()
  if (loc.includes('jordan') || loc.includes('amman')) return 'sun-thu'
  if (loc.includes('site') || employmentType === 'Secondment') return 'mon-sat'
  return DEFAULT_WORK_WEEK
}

// Employees without an explicit pattern (older records) get the company default.
export const workWeekOf = (employee) => WORK_WEEK_PATTERNS[employee?.workWeek] || WORK_WEEK_PATTERNS[DEFAULT_WORK_WEEK]

// Plain-English schedule presets replacing "Type 17 Full day D9.0 W44.5 H2 Start From Monday"
export const SCHEDULE_PRESETS = [
  'Office — Mon-Fri, 8:30-17:30 (1h break)',
  'Office — flexible start 8:00-9:30, 8.5h/day',
  'Site — 6 days/week, per project schedule',
  'Part-time — mornings, Mon-Fri',
]

export const UAE_BANKS = ['Emirates NBD', 'FAB (First Abu Dhabi Bank)', 'ADCB', 'ADIB', 'Mashreq', 'RAKBANK', 'Dubai Islamic Bank', 'Wio Bank', 'Other']

export const NATIONALITIES = ['United Arab Emirates', 'Egypt', 'Jordan', 'Lebanon', 'Iraq', 'Syria', 'Palestine', 'India', 'Pakistan', 'Philippines', 'United Kingdom', 'Other']

export const PAYROLL_CATEGORIES = ['Staff (WPS)', 'Management (WPS)', 'Intern stipend', 'Secondment (client-billed)']

// ---------------------------------------------------------------------------
// Typed documents — every upload declares what it is; required ones block submit.
// requiredWhen: 'always' | 'nonUaeNational' | null (optional)
// ---------------------------------------------------------------------------
export const EMPLOYEE_DOCUMENT_TYPES = [
  { key: 'passport',   label: 'Passport copy',              requiredWhen: 'always' },
  { key: 'photo',      label: 'Passport-size photo',        requiredWhen: 'always' },
  { key: 'degree',     label: 'Highest degree certificate (attested)', requiredWhen: 'always' },
  { key: 'visa',       label: 'Current UAE visa page',      requiredWhen: 'nonUaeNational' },
  { key: 'emiratesId', label: 'Emirates ID (both sides)',   requiredWhen: null },
  { key: 'license',    label: 'Engineering license',        requiredWhen: null },
  { key: 'experience', label: 'Experience certificates',    requiredWhen: null },
  { key: 'other',      label: 'Other',                      requiredWhen: null },
]

// One pending new joiner so HR sees the review flow immediately.
export const NEW_JOINERS = [
  {
    id: 1,
    status: 'submitted', // draft -> submitted -> approved
    submittedDate: '2026-07-02',
    personal: {
      firstName: 'Daniel', lastName: 'Okoye', gender: 'Male', dob: '1991-04-18',
      nationality: 'Other', maritalStatus: 'Married', personalEmail: 'daniel.okoye@gmail.com',
      phone: '+971-52-334-5566', residentialEmirate: 'Abu Dhabi', inUae: true,
      emergencyContact: { name: 'Grace Okoye', relationship: 'Spouse', phone: '+971-52-334-7788' },
    },
    qualifications: [{ certificate: "Bachelor's", program: 'Civil Engineering', year: '2013' }],
    engineerLicense: { held: true, organization: 'Society of Engineers UAE', level: 'Professional', expiryDate: '2027-03-01' },
    documents: [
      { type: 'passport', fileName: 'okoye_passport.pdf', uploadedDate: '2026-07-02' },
      { type: 'photo', fileName: 'okoye_photo.jpg', uploadedDate: '2026-07-02' },
      { type: 'degree', fileName: 'bsc_civil_attested.pdf', uploadedDate: '2026-07-02' },
      { type: 'visa', fileName: 'current_visa_page.pdf', uploadedDate: '2026-07-02' },
    ],
    bank: { bankName: 'Emirates NBD', iban: 'AE07 0331 2345 6789 0123 456' },
    dependents: [{ name: 'Grace Okoye', relationship: 'Spouse', dob: '1993-08-21' }],
    positionTitle: 'Site Engineer',
  },
]

// ---------------------------------------------------------------------------
// Offboarding
// ---------------------------------------------------------------------------
export const OFFBOARDING_REASONS = ['Resignation', 'End of contract', 'Termination', 'Retirement']

export const OFFBOARDING_CHECKLIST_TEMPLATE = [
  { key: 'notice', label: 'Notice period confirmed & last working day agreed' },
  { key: 'handover', label: 'Project handover completed (sign-off by manager)' },
  { key: 'exit_interview', label: 'Exit interview conducted' },
  { key: 'it_assets', label: 'Laptop, access cards & site equipment returned' },
  { key: 'access', label: 'System accounts & building access revoked' },
  { key: 'visa_cancel', label: 'Visa & work permit cancellation filed (PRO)' },
  { key: 'settlement', label: 'Final settlement paid (salary, leave encashment, gratuity)' },
  { key: 'experience_cert', label: 'Experience certificate issued' },
]

export const OFFBOARDINGS = [
  {
    id: 1, employeeId: 4, employeeName: 'Ahmed El Haddad', reason: 'Resignation',
    startedDate: '2026-06-20', lastWorkingDay: '2026-08-14',
    exitInterviewDate: '2026-08-10', exitInterviewNotes: '',
    checklist: { notice: true, handover: false, exit_interview: false, it_assets: false, access: false, visa_cancel: false, settlement: false, experience_cert: false },
    status: 'in_progress', // in_progress -> completed
  },
]

// ---------------------------------------------------------------------------
// PRO (government-services) task queue — the PRO company logs in with the
// 'PRO / Government services' role and works these directly in the system.
// ---------------------------------------------------------------------------
export const PRO_TASK_TYPES = ['New work permit', 'Visa stamping', 'Visa renewal', 'Visa cancellation', 'Emirates ID application', 'Labour card renewal', 'Document attestation']

export const PRO_TASKS = [
  { id: 1, employeeName: 'Ahmed El Haddad', taskType: 'Visa renewal', details: 'Employment residence visa expired 2025-09-10 — renew urgently.', dueDate: '2026-07-20', status: 'in_progress', createdDate: '2026-06-25', documents: [{ type: 'passport', fileName: 'haddad_passport.pdf', uploadedDate: '2026-06-25' }], notes: 'Medical + biometrics booked 8 July.' },
  { id: 2, employeeName: 'Daniel Okoye', taskType: 'New work permit', details: 'New joiner — work permit application, joining ~1 Aug.', dueDate: '2026-07-25', status: 'open', createdDate: '2026-07-02', documents: [], notes: '' },
  { id: 3, employeeName: 'Mohammad Kubba', taskType: 'Visa renewal', details: 'Residence visa expires 2026-09-20 — start renewal within 60 days.', dueDate: '2026-08-20', status: 'open', createdDate: '2026-07-01', documents: [], notes: '' },
]

// ---------------------------------------------------------------------------
// Staff planning — hires needed for upcoming/known projects.
// ---------------------------------------------------------------------------
export const STAFF_PLANS = [
  { id: 1, projectRef: 'P-2601 — Khalifa City Villas (Design + Supervision)', role: 'Site Engineer', count: 2, neededBy: '2026-08-01', status: 'position_open', notes: 'One covered by Daniel Okoye (joining) — one more needed.' },
  { id: 2, projectRef: 'P-2601 — Khalifa City Villas (Design + Supervision)', role: 'Document Controller', count: 1, neededBy: '2026-08-15', status: 'planned', notes: '' },
  { id: 3, projectRef: 'Pipeline: Smart Grid Upgrade - DEWA (Negotiation)', role: 'MEP Engineer', count: 2, neededBy: '2026-10-01', status: 'planned', notes: 'Only if deal closes — watch CRM stage.' },
]

export const STAFF_PLAN_STATUS = {
  planned: { label: 'Planned', color: 'bg-gray-100 text-gray-600' },
  position_open: { label: 'Position open', color: 'bg-blue-100 text-blue-700' },
  interviewing: { label: 'Interviewing', color: 'bg-yellow-100 text-yellow-700' },
  hired: { label: 'Hired', color: 'bg-green-100 text-green-700' },
}
