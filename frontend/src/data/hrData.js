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

export const LEAVE_REQUESTS = [
  { id: 1, employeeId: 1, employeeName: 'Osama Hussain', type: 'Vacation', startDate: '2026-07-15', endDate: '2026-07-22', days: 8, reason: 'Summer holiday', status: 'approved', approvedBy: 'Layla Al Mazrouei', approvedDate: '2026-06-28' },
  { id: 2, employeeId: 5, employeeName: 'Layla Al Mazrouei', type: 'Sick', startDate: '2026-07-08', endDate: '2026-07-08', days: 1, reason: 'Medical appointment', status: 'pending', approvedBy: null, approvedDate: null },
  { id: 3, employeeId: 2, employeeName: 'Naseeb Shaheen', type: 'Vacation', startDate: '2026-08-01', endDate: '2026-08-15', days: 15, reason: 'Eid holiday', status: 'pending', approvedBy: null, approvedDate: null },
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

// Payroll (UAE model): monthly salary = basic + allowances, paid via WPS (Wage Protection System —
// employer submits a SIF file to its bank / MOHRE each cycle). No income tax; variations come from
// overtime and deductions (unpaid leave, salary advance repayments). Per-month adjustments below;
// anything not listed defaults to zero adjustments for that employee.
export const PAYROLL_MONTHS = [
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
  { id: 1, name: 'Osama Hussain', title: 'Senior Project Manager', dept: 'Projects', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'osama@alsuweidi.com', phone: '+971-50-111-2345', mobilePhone: '+971-50-111-2345', startDate: '2015-03-15', status: 'active', managerId: null, contractEndDate: '2027-03-15', nationality: 'Egypt', passport: { number: 'A2456781', country: 'Egypt', type: 'Ordinary', issueDate: '2019-02-10', expiryDate: '2029-02-09' }, visa: { number: '201/2015/1/445210', type: 'Employment Residence Visa', status: 'Valid', issueDate: '2015-04-01', expiryDate: '2028-05-20', sponsor: 'ALSUWEIDI' }, emiratesId: { number: '784-1978-4451207-1', expiryDate: '2028-05-20' }, dependents: [{ name: 'Hana Hussain', relationship: 'Spouse', dob: '1985-06-15', nationality: 'Egypt', passport: { number: 'A3456782', country: 'Egypt', type: 'Ordinary', issueDate: '2020-01-15', expiryDate: '2030-01-14' }, visa: { number: '201/2015/2/445211', type: 'Residence Visa - Dependent (Spouse)', status: 'Valid', issueDate: '2015-05-01', expiryDate: '2028-05-20' }, emiratesId: { number: '784-1985-4451208-2', expiryDate: '2028-05-20' }, insurance: { provider: 'Daman', policyNumber: 'DM-778812', expiryDate: '2027-01-31' } }, { name: 'Omar Hussain', relationship: 'Son', dob: '2010-03-22', nationality: 'Egypt', passport: { number: 'A4456783', country: 'Egypt', type: 'Ordinary', issueDate: '2021-06-01', expiryDate: '2026-05-31' }, visa: { number: '201/2015/3/445212', type: 'Residence Visa - Dependent (Child)', status: 'Valid', issueDate: '2015-05-01', expiryDate: '2028-05-20' }, emiratesId: { number: '784-2010-4451209-3', expiryDate: '2028-05-20' }, insurance: { provider: 'Daman', policyNumber: 'DM-778813', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'Project Management', issuer: 'PMI', date: '2018-07-10', expiryDate: null }, { type: 'Site Supervision', issuer: 'ALSUWEIDI', date: '2015-06-01', expiryDate: null }], emergencyContact: { name: 'Hana Hussain', relationship: 'Spouse', phone: '+971-50-111-9999' }, compensation: { basicSalary: 28000, housingAllowance: 8000, transportAllowance: 2000, otherBenefits: 'Annual flight allowance, health insurance (family)', noticePeriodDays: 90 } },
  { id: 2, name: 'Naseeb Shaheen', title: 'Lead Structural Engineer', dept: 'Engineering', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'naseeb@alsuweidi.com', phone: '+971-50-222-3456', mobilePhone: '+971-50-222-3456', startDate: '2018-06-01', status: 'active', managerId: null, contractEndDate: '2027-06-01', nationality: 'Jordan', passport: { number: 'K1122334', country: 'Jordan', type: 'Ordinary', issueDate: '2018-09-05', expiryDate: '2028-09-04' }, visa: { number: '201/2018/1/556321', type: 'Employment Residence Visa', status: 'Valid', issueDate: '2018-06-15', expiryDate: '2027-08-15', sponsor: 'ALSUWEIDI' }, emiratesId: { number: '784-1982-5563210-4', expiryDate: '2027-08-15' }, dependents: [{ name: 'Salma Shaheen', relationship: 'Spouse', dob: '1990-12-08', nationality: 'Jordan', passport: { number: 'K2233445', country: 'Jordan', type: 'Ordinary', issueDate: '2019-03-01', expiryDate: '2029-02-28' }, visa: { number: '201/2018/2/556322', type: 'Residence Visa - Dependent (Spouse)', status: 'Valid', issueDate: '2018-07-01', expiryDate: '2027-08-15' }, emiratesId: { number: '784-1990-5563211-5', expiryDate: '2027-08-15' }, insurance: { provider: 'AXA Gulf', policyNumber: 'AX-334221', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'PE License', issuer: 'UAE Engineers Register', date: '2016-04-15', expiryDate: null }, { type: 'AutoCAD', issuer: 'Autodesk', date: '2015-01-20', expiryDate: null }, { type: 'BIM Certification', issuer: 'buildingSMART', date: '2023-09-10', expiryDate: null }], emergencyContact: { name: 'Salma Shaheen', relationship: 'Spouse', phone: '+971-50-222-9999' }, compensation: { basicSalary: 24000, housingAllowance: 7000, transportAllowance: 1800, otherBenefits: 'Annual flight allowance, health insurance (family)', noticePeriodDays: 60 } },
  { id: 3, name: 'Mohammad Kubba', title: 'MEP Design Manager', dept: 'Engineering', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'mkubba@alsuweidi.com', phone: '+971-50-333-4567', mobilePhone: '+971-50-333-4567', startDate: '2016-08-10', status: 'active', managerId: 2, contractEndDate: '2026-08-10', nationality: 'Iraq', passport: { number: 'H5566778', country: 'Iraq', type: 'Ordinary', issueDate: '2017-05-20', expiryDate: '2027-05-19' }, visa: { number: '201/2016/1/667890', type: 'Employment Residence Visa', status: 'Valid', issueDate: '2016-08-15', expiryDate: '2026-09-20', sponsor: 'ALSUWEIDI' }, emiratesId: { number: '784-1983-6678901-6', expiryDate: '2026-09-20' }, dependents: [{ name: 'Noor Kubba', relationship: 'Spouse', dob: '1988-03-25', nationality: 'Iraq', passport: { number: 'H6677889', country: 'Iraq', type: 'Ordinary', issueDate: '2018-02-10', expiryDate: '2028-02-09' }, visa: { number: '201/2016/2/667891', type: 'Residence Visa - Dependent (Spouse)', status: 'Valid', issueDate: '2016-09-01', expiryDate: '2026-09-20' }, emiratesId: { number: '784-1988-6678902-7', expiryDate: '2026-09-20' }, insurance: { provider: 'Oman Insurance (Sukoon)', policyNumber: 'OS-112233', expiryDate: '2027-01-31' } }, { name: 'Zain Kubba', relationship: 'Son', dob: '2012-07-14', nationality: 'Iraq', passport: { number: 'H7788990', country: 'Iraq', type: 'Ordinary', issueDate: '2022-01-10', expiryDate: '2027-01-09' }, visa: { number: '201/2016/3/667892', type: 'Residence Visa - Dependent (Child)', status: 'Valid', issueDate: '2016-09-01', expiryDate: '2026-09-20' }, emiratesId: { number: '784-2012-6678903-8', expiryDate: '2026-09-20' }, insurance: { provider: 'Oman Insurance (Sukoon)', policyNumber: 'OS-112234', expiryDate: '2027-01-31' } }, { name: 'Leila Kubba', relationship: 'Daughter', dob: '2015-11-02', nationality: 'Iraq', passport: { number: 'H8899001', country: 'Iraq', type: 'Ordinary', issueDate: '2022-01-10', expiryDate: '2027-01-09' }, visa: { number: '201/2016/4/667893', type: 'Residence Visa - Dependent (Child)', status: 'Valid', issueDate: '2016-09-01', expiryDate: '2026-09-20' }, emiratesId: { number: '784-2015-6678904-9', expiryDate: '2026-09-20' }, insurance: { provider: 'Oman Insurance (Sukoon)', policyNumber: 'OS-112235', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'PE License', issuer: 'UAE Engineers Register', date: '2017-06-20', expiryDate: null }, { type: 'Revit', issuer: 'Autodesk', date: '2016-09-15', expiryDate: null }, { type: 'BIM Certification', issuer: 'buildingSMART', date: '2024-02-28', expiryDate: null }], emergencyContact: { name: 'Noor Kubba', relationship: 'Spouse', phone: '+971-50-333-9999' }, compensation: { basicSalary: 22000, housingAllowance: 6500, transportAllowance: 1800, otherBenefits: 'Health insurance (family)', noticePeriodDays: 60 } },
  { id: 4, name: 'Ahmed El Haddad', title: 'BIM Coordinator', dept: 'IT/BIM', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'ahaddad@alsuweidi.com', phone: '+971-50-444-5678', mobilePhone: '+971-50-444-5678', startDate: '2019-01-20', status: 'active', managerId: null, contractEndDate: '2027-01-20', nationality: 'Lebanon', passport: { number: 'RL334455', country: 'Lebanon', type: 'Ordinary', issueDate: '2016-11-05', expiryDate: '2026-11-04' }, visa: { number: '201/2019/1/778901', type: 'Employment Residence Visa', status: 'Expired', issueDate: '2019-01-20', expiryDate: '2025-09-10', sponsor: 'ALSUWEIDI' }, emiratesId: { number: '784-1984-7789012-0', expiryDate: '2025-09-10' }, dependents: [], accomplishments: [{ type: 'BIM Certification', issuer: 'buildingSMART', date: '2022-04-15', expiryDate: null }, { type: 'Revit', issuer: 'Autodesk', date: '2019-03-20', expiryDate: null }, { type: 'Safety Induction', issuer: 'ALSUWEIDI', date: '2019-01-25', expiryDate: '2026-01-25' }], emergencyContact: { name: 'Sami El Haddad', relationship: 'Brother', phone: '+971-50-444-9999' }, compensation: { basicSalary: 15000, housingAllowance: 4500, transportAllowance: 1500, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 30 } },
  { id: 5, name: 'Layla Al Mazrouei', title: 'HR Manager', dept: 'HR', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'layla@alsuweidi.com', phone: '+971-50-555-6789', mobilePhone: '+971-50-555-6789', startDate: '2017-11-05', status: 'active', managerId: null, contractEndDate: '2028-11-05', nationality: 'United Arab Emirates', passport: { number: 'UAE778812', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2021-03-01', expiryDate: '2031-02-28' }, visa: null, emiratesId: { number: '784-1985-9988771-1', expiryDate: '2031-02-28' }, dependents: [], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2020-05-10', expiryDate: null }], emergencyContact: { name: 'Yousef Al Mazrouei', relationship: 'Spouse', phone: '+971-50-555-9999' }, compensation: { basicSalary: 21000, housingAllowance: 6000, transportAllowance: 1800, otherBenefits: 'Health insurance (family)', noticePeriodDays: 60 } },
  { id: 6, name: 'Khalid Al Ketbi', title: 'Finance Director', dept: 'Finance', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'khalid@alsuweidi.com', phone: '+971-50-666-7890', mobilePhone: '+971-50-666-7890', startDate: '2014-02-15', status: 'active', managerId: null, contractEndDate: '2027-02-15', nationality: 'United Arab Emirates', passport: { number: 'UAE223344', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2019-06-10', expiryDate: '2029-06-09' }, visa: null, emiratesId: { number: '784-1975-2233440-2', expiryDate: '2029-06-09' }, dependents: [{ name: 'Aisha Al Ketbi', relationship: 'Spouse', dob: '1987-09-12', nationality: 'United Arab Emirates', passport: { number: 'UAE334455', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2020-04-15', expiryDate: '2030-04-14' }, visa: null, emiratesId: { number: '784-1987-3344551-3', expiryDate: '2030-04-14' }, insurance: { provider: 'MetLife', policyNumber: 'ML-556677', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2018-03-22', expiryDate: null }], emergencyContact: { name: 'Aisha Al Ketbi', relationship: 'Spouse', phone: '+971-50-666-9999' }, compensation: { basicSalary: 32000, housingAllowance: 9000, transportAllowance: 2200, otherBenefits: 'Annual flight allowance, health insurance (family), car allowance', noticePeriodDays: 90 } },
  { id: 7, name: 'Fatima Al Mansouri', title: 'Senior Architect', dept: 'Engineering', location: 'Dubai Office', employmentType: 'Full-time', email: 'fatima@alsuweidi.com', phone: '+971-4-456-7890', mobilePhone: '+971-50-777-8901', startDate: '2016-09-01', status: 'active', managerId: 2, contractEndDate: '2026-09-01', nationality: 'United Arab Emirates', passport: { number: 'UAE445566', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2020-10-01', expiryDate: '2030-09-30' }, visa: null, emiratesId: { number: '784-1988-4455661-4', expiryDate: '2030-09-30' }, dependents: [], accomplishments: [{ type: 'PE License', issuer: 'UAE Engineers Register', date: '2015-10-08', expiryDate: null }, { type: 'AutoCAD', issuer: 'Autodesk', date: '2014-05-12', expiryDate: null }, { type: 'BIM Certification', issuer: 'buildingSMART', date: '2023-11-20', expiryDate: null }], emergencyContact: { name: 'Reem Al Mansouri', relationship: 'Sister', phone: '+971-50-777-9999' }, compensation: { basicSalary: 23000, housingAllowance: 6500, transportAllowance: 1800, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 60 } },
  { id: 8, name: 'Hassan Al Shamsi', title: 'Project Coordinator', dept: 'Projects', location: 'Al Ain Branch', employmentType: 'Full-time', email: 'hassan@alsuweidi.com', phone: '+971-3-789-0123', mobilePhone: '+971-50-888-9012', startDate: '2020-05-10', status: 'active', managerId: 1, contractEndDate: '2026-08-15', nationality: 'United Arab Emirates', passport: { number: 'UAE556677', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2019-08-20', expiryDate: '2029-08-19' }, visa: null, emiratesId: { number: '784-1992-5566772-5', expiryDate: '2029-08-19' }, dependents: [{ name: 'Amira Al Shamsi', relationship: 'Spouse', dob: '1993-01-30', nationality: 'United Arab Emirates', passport: { number: 'UAE667788', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2021-05-01', expiryDate: '2031-04-30' }, visa: null, emiratesId: { number: '784-1993-6677883-6', expiryDate: '2031-04-30' }, insurance: { provider: 'Daman', policyNumber: 'DM-889900', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'Safety Induction', issuer: 'ALSUWEIDI', date: '2020-05-15', expiryDate: '2027-05-15' }, { type: 'Site Supervision', issuer: 'ALSUWEIDI', date: '2021-03-10', expiryDate: null }], emergencyContact: { name: 'Amira Al Shamsi', relationship: 'Spouse', phone: '+971-50-888-9999' }, compensation: { basicSalary: 12000, housingAllowance: 3500, transportAllowance: 1200, otherBenefits: 'Health insurance (family)', noticePeriodDays: 30 } },
  { id: 9, name: 'Maryam Al Kaabi', title: 'Compliance Officer', dept: 'Admin', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'maryam@alsuweidi.com', phone: '+971-2-123-4575', mobilePhone: '+971-50-999-0123', startDate: '2019-03-15', status: 'active', managerId: null, contractEndDate: '2027-03-15', nationality: 'United Arab Emirates', passport: { number: 'UAE778899', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2018-12-15', expiryDate: '2028-12-14' }, visa: null, emiratesId: { number: '784-1990-7788994-7', expiryDate: '2028-12-14' }, dependents: [], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2022-06-15', expiryDate: null }], emergencyContact: { name: 'Khalifa Al Kaabi', relationship: 'Father', phone: '+971-50-999-9999' }, compensation: { basicSalary: 16000, housingAllowance: 4500, transportAllowance: 1500, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 30 } },
  { id: 10, name: 'Samir Al Mazrouei', title: 'Site Supervisor', dept: 'Projects', location: 'Site-Based', employmentType: 'Secondment', email: 'samir@alsuweidi.com', phone: '+971-50-123-4567', mobilePhone: '+971-50-123-4567', startDate: '2018-07-20', status: 'active', managerId: 1, contractEndDate: '2026-07-20', nationality: 'United Arab Emirates', passport: { number: 'UAE889900', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2017-07-01', expiryDate: '2027-06-30' }, visa: null, emiratesId: { number: '784-1989-8899005-8', expiryDate: '2027-06-30' }, dependents: [{ name: 'Hind Al Mazrouei', relationship: 'Spouse', dob: '1992-05-18', nationality: 'United Arab Emirates', passport: { number: 'UAE990011', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2019-09-10', expiryDate: '2029-09-09' }, visa: null, emiratesId: { number: '784-1992-9900116-9', expiryDate: '2029-09-09' }, insurance: { provider: 'AXA Gulf', policyNumber: 'AX-990112', expiryDate: '2027-01-31' } }, { name: 'Sara Al Mazrouei', relationship: 'Daughter', dob: '2018-09-05', nationality: 'United Arab Emirates', passport: { number: 'UAE001122', country: 'United Arab Emirates', type: 'Ordinary', issueDate: '2023-02-01', expiryDate: '2028-01-31' }, visa: null, emiratesId: { number: '784-2018-0011227-0', expiryDate: '2028-01-31' }, insurance: { provider: 'AXA Gulf', policyNumber: 'AX-990113', expiryDate: '2027-01-31' } }], accomplishments: [{ type: 'Site Supervision', issuer: 'ALSUWEIDI', date: '2018-08-05', expiryDate: null }, { type: 'Safety Induction', issuer: 'ALSUWEIDI', date: '2018-07-25', expiryDate: '2025-07-25' }], emergencyContact: { name: 'Hind Al Mazrouei', relationship: 'Spouse', phone: '+971-50-123-9999' }, compensation: { basicSalary: 13000, housingAllowance: 3500, transportAllowance: 1200, otherBenefits: 'Health insurance (family)', noticePeriodDays: 30 } },
]
