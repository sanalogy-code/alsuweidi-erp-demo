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

export const LEAVE_TYPES = ['Vacation', 'Sick', 'Unpaid', 'Bereavement', 'Parental']

export const LEAVE_REQUESTS = [
  { id: 1, employeeId: 1, employeeName: 'Osama Hussain', type: 'Vacation', startDate: '2026-07-15', endDate: '2026-07-22', days: 8, reason: 'Summer holiday', status: 'approved', approvedBy: 'Layla Al Mazrouei', approvedDate: '2026-06-28' },
  { id: 2, employeeId: 5, employeeName: 'Layla Al Mazrouei', type: 'Sick', startDate: '2026-07-08', endDate: '2026-07-08', days: 1, reason: 'Medical appointment', status: 'pending', approvedBy: null, approvedDate: null },
  { id: 3, employeeId: 2, employeeName: 'Naseeb Shaheen', type: 'Vacation', startDate: '2026-08-01', endDate: '2026-08-15', days: 15, reason: 'Eid holiday', status: 'pending', approvedBy: null, approvedDate: null },
]

export const ACCOMPLISHMENT_TYPES = ['PE License', 'BIM Certification', 'Safety Induction', 'ISO Training', 'AutoCAD', 'Revit', 'Site Supervision', 'Project Management']

export const EMPLOYEES = [
  { id: 1, name: 'Osama Hussain', title: 'Senior Project Manager', dept: 'Projects', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'osama@alsuweidi.com', phone: '+971-50-111-2345', mobilePhone: '+971-50-111-2345', startDate: '2015-03-15', status: 'active', managerId: null, visa: { status: 'Valid', expiryDate: '2028-05-20', sponsor: 'ALSUWEIDI', passportNumber: 'AA123456' }, dependents: [{ name: 'Hana Hussain', relationship: 'Spouse', dob: '1985-06-15' }, { name: 'Omar Hussain', relationship: 'Son', dob: '2010-03-22' }], accomplishments: [{ type: 'Project Management', issuer: 'PMI', date: '2018-07-10', expiryDate: null }, { type: 'Site Supervision', issuer: 'ALSUWEIDI', date: '2015-06-01', expiryDate: null }], emergencyContact: { name: 'Hana Hussain', relationship: 'Spouse', phone: '+971-50-111-9999' }, compensation: { basicSalary: 28000, housingAllowance: 8000, transportAllowance: 2000, otherBenefits: 'Annual flight allowance, health insurance (family)', noticePeriodDays: 90 } },
  { id: 2, name: 'Naseeb Shaheen', title: 'Lead Structural Engineer', dept: 'Engineering', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'naseeb@alsuweidi.com', phone: '+971-50-222-3456', mobilePhone: '+971-50-222-3456', startDate: '2018-06-01', status: 'active', managerId: null, visa: { status: 'Valid', expiryDate: '2027-08-15', sponsor: 'ALSUWEIDI', passportNumber: 'BB234567' }, dependents: [{ name: 'Salma Shaheen', relationship: 'Spouse', dob: '1990-12-08' }], accomplishments: [{ type: 'PE License', issuer: 'UAE Engineers Register', date: '2016-04-15', expiryDate: null }, { type: 'AutoCAD', issuer: 'Autodesk', date: '2015-01-20', expiryDate: null }, { type: 'BIM Certification', issuer: 'buildingSMART', date: '2023-09-10', expiryDate: null }], emergencyContact: { name: 'Salma Shaheen', relationship: 'Spouse', phone: '+971-50-222-9999' }, compensation: { basicSalary: 24000, housingAllowance: 7000, transportAllowance: 1800, otherBenefits: 'Annual flight allowance, health insurance (family)', noticePeriodDays: 60 } },
  { id: 3, name: 'Mohammad Kubba', title: 'MEP Design Manager', dept: 'Engineering', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'mkubba@alsuweidi.com', phone: '+971-50-333-4567', mobilePhone: '+971-50-333-4567', startDate: '2016-08-10', status: 'active', managerId: 2, visa: { status: 'Valid', expiryDate: '2026-11-30', sponsor: 'ALSUWEIDI', passportNumber: 'CC345678' }, dependents: [{ name: 'Noor Kubba', relationship: 'Spouse', dob: '1988-03-25' }, { name: 'Zain Kubba', relationship: 'Son', dob: '2012-07-14' }, { name: 'Leila Kubba', relationship: 'Daughter', dob: '2015-11-02' }], accomplishments: [{ type: 'PE License', issuer: 'UAE Engineers Register', date: '2017-06-20', expiryDate: null }, { type: 'Revit', issuer: 'Autodesk', date: '2016-09-15', expiryDate: null }, { type: 'BIM Certification', issuer: 'buildingSMART', date: '2024-02-28', expiryDate: null }], emergencyContact: { name: 'Noor Kubba', relationship: 'Spouse', phone: '+971-50-333-9999' }, compensation: { basicSalary: 22000, housingAllowance: 6500, transportAllowance: 1800, otherBenefits: 'Health insurance (family)', noticePeriodDays: 60 } },
  { id: 4, name: 'Ahmed El Haddad', title: 'BIM Coordinator', dept: 'IT/BIM', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'ahaddad@alsuweidi.com', phone: '+971-50-444-5678', mobilePhone: '+971-50-444-5678', startDate: '2019-01-20', status: 'active', managerId: null, visa: { status: 'Valid', expiryDate: '2025-09-10', sponsor: 'ALSUWEIDI', passportNumber: 'DD456789' }, dependents: [], accomplishments: [{ type: 'BIM Certification', issuer: 'buildingSMART', date: '2022-04-15', expiryDate: null }, { type: 'Revit', issuer: 'Autodesk', date: '2019-03-20', expiryDate: null }, { type: 'Safety Induction', issuer: 'ALSUWEIDI', date: '2019-01-25', expiryDate: '2026-01-25' }], emergencyContact: { name: 'Sami El Haddad', relationship: 'Brother', phone: '+971-50-444-9999' }, compensation: { basicSalary: 15000, housingAllowance: 4500, transportAllowance: 1500, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 30 } },
  { id: 5, name: 'Layla Al Mazrouei', title: 'HR Manager', dept: 'HR', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'layla@alsuweidi.com', phone: '+971-50-555-6789', mobilePhone: '+971-50-555-6789', startDate: '2017-11-05', status: 'active', managerId: null, visa: { status: 'Valid', expiryDate: '2027-03-18', sponsor: 'ALSUWEIDI', passportNumber: 'EE567890' }, dependents: [], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2020-05-10', expiryDate: null }], emergencyContact: { name: 'Yousef Al Mazrouei', relationship: 'Spouse', phone: '+971-50-555-9999' }, compensation: { basicSalary: 21000, housingAllowance: 6000, transportAllowance: 1800, otherBenefits: 'Health insurance (family)', noticePeriodDays: 60 } },
  { id: 6, name: 'Khalid Al Ketbi', title: 'Finance Director', dept: 'Finance', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'khalid@alsuweidi.com', phone: '+971-50-666-7890', mobilePhone: '+971-50-666-7890', startDate: '2014-02-15', status: 'active', managerId: null, visa: { status: 'Valid', expiryDate: '2029-12-05', sponsor: 'ALSUWEIDI', passportNumber: 'FF678901' }, dependents: [{ name: 'Aisha Al Ketbi', relationship: 'Spouse', dob: '1987-09-12' }], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2018-03-22', expiryDate: null }], emergencyContact: { name: 'Aisha Al Ketbi', relationship: 'Spouse', phone: '+971-50-666-9999' }, compensation: { basicSalary: 32000, housingAllowance: 9000, transportAllowance: 2200, otherBenefits: 'Annual flight allowance, health insurance (family), car allowance', noticePeriodDays: 90 } },
  { id: 7, name: 'Fatima Al Mansouri', title: 'Senior Architect', dept: 'Engineering', location: 'Dubai Office', employmentType: 'Full-time', email: 'fatima@alsuweidi.com', phone: '+971-4-456-7890', mobilePhone: '+971-50-777-8901', startDate: '2016-09-01', status: 'active', managerId: 2, visa: { status: 'Valid', expiryDate: '2026-07-22', sponsor: 'ALSUWEIDI', passportNumber: 'GG789012' }, dependents: [], accomplishments: [{ type: 'PE License', issuer: 'UAE Engineers Register', date: '2015-10-08', expiryDate: null }, { type: 'AutoCAD', issuer: 'Autodesk', date: '2014-05-12', expiryDate: null }, { type: 'BIM Certification', issuer: 'buildingSMART', date: '2023-11-20', expiryDate: null }], emergencyContact: { name: 'Reem Al Mansouri', relationship: 'Sister', phone: '+971-50-777-9999' }, compensation: { basicSalary: 23000, housingAllowance: 6500, transportAllowance: 1800, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 60 } },
  { id: 8, name: 'Hassan Al Shamsi', title: 'Project Coordinator', dept: 'Projects', location: 'Al Ain Branch', employmentType: 'Full-time', email: 'hassan@alsuweidi.com', phone: '+971-3-789-0123', mobilePhone: '+971-50-888-9012', startDate: '2020-05-10', status: 'active', managerId: 1, visa: { status: 'Valid', expiryDate: '2025-04-14', sponsor: 'ALSUWEIDI', passportNumber: 'HH890123' }, dependents: [{ name: 'Amira Al Shamsi', relationship: 'Spouse', dob: '1993-01-30' }], accomplishments: [{ type: 'Safety Induction', issuer: 'ALSUWEIDI', date: '2020-05-15', expiryDate: '2027-05-15' }, { type: 'Site Supervision', issuer: 'ALSUWEIDI', date: '2021-03-10', expiryDate: null }], emergencyContact: { name: 'Amira Al Shamsi', relationship: 'Spouse', phone: '+971-50-888-9999' }, compensation: { basicSalary: 12000, housingAllowance: 3500, transportAllowance: 1200, otherBenefits: 'Health insurance (family)', noticePeriodDays: 30 } },
  { id: 9, name: 'Maryam Al Kaabi', title: 'Compliance Officer', dept: 'Admin', location: 'Abu Dhabi HQ', employmentType: 'Full-time', email: 'maryam@alsuweidi.com', phone: '+971-2-123-4575', mobilePhone: '+971-50-999-0123', startDate: '2019-03-15', status: 'active', managerId: null, visa: { status: 'Valid', expiryDate: '2026-08-28', sponsor: 'ALSUWEIDI', passportNumber: 'II901234' }, dependents: [], accomplishments: [{ type: 'ISO Training', issuer: 'International Standards', date: '2022-06-15', expiryDate: null }], emergencyContact: { name: 'Khalifa Al Kaabi', relationship: 'Father', phone: '+971-50-999-9999' }, compensation: { basicSalary: 16000, housingAllowance: 4500, transportAllowance: 1500, otherBenefits: 'Health insurance (individual)', noticePeriodDays: 30 } },
  { id: 10, name: 'Samir Al Mazrouei', title: 'Site Supervisor', dept: 'Projects', location: 'Site-Based', employmentType: 'Full-time', email: 'samir@alsuweidi.com', phone: '+971-50-123-4567', mobilePhone: '+971-50-123-4567', startDate: '2018-07-20', status: 'active', managerId: 1, visa: { status: 'Valid', expiryDate: '2025-10-10', sponsor: 'ALSUWEIDI', passportNumber: 'JJ012345' }, dependents: [{ name: 'Hind Al Mazrouei', relationship: 'Spouse', dob: '1992-05-18' }, { name: 'Sara Al Mazrouei', relationship: 'Daughter', dob: '2018-09-05' }], accomplishments: [{ type: 'Site Supervision', issuer: 'ALSUWEIDI', date: '2018-08-05', expiryDate: null }, { type: 'Safety Induction', issuer: 'ALSUWEIDI', date: '2018-07-25', expiryDate: '2025-07-25' }], emergencyContact: { name: 'Hind Al Mazrouei', relationship: 'Spouse', phone: '+971-50-123-9999' }, compensation: { basicSalary: 13000, housingAllowance: 3500, transportAllowance: 1200, otherBenefits: 'Health insurance (family)', noticePeriodDays: 30 } },
]
