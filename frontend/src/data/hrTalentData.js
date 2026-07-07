// Talent & development seeds: appraisals, training, warnings, exit interviews,
// grades/bands. Local state only, same as the rest of the HR module.

// ---------------------------------------------------------------------------
// Appraisals — annual cycle, three steps: self-assessment → manager review →
// HR sign-off. Default model built to react to; competencies, scale, and the
// sign-off step are all up for discussion with management.
// ---------------------------------------------------------------------------
export const APPRAISAL_CYCLE = {
  id: 1,
  name: '2026 Mid-Year Review',
  period: 'January – June 2026',
  dueDate: '2026-07-31',
  status: 'open',
}

export const APPRAISAL_COMPETENCIES = [
  { key: 'delivery', label: 'Delivery', hint: 'Gets work done on time and to commitment' },
  { key: 'quality', label: 'Quality', hint: 'Accuracy and standard of technical output' },
  { key: 'collaboration', label: 'Collaboration', hint: 'Works well across teams, clients, and site' },
  { key: 'initiative', label: 'Initiative', hint: 'Spots problems and acts without being asked' },
  { key: 'leadership', label: 'Leadership', hint: 'Guides, mentors, and raises the team' },
]

// Step chain: self → manager → hr → complete
export const APPRAISAL_STEP_META = {
  self: { label: 'Self-assessment', color: 'bg-blue-100 text-blue-700' },
  manager: { label: 'Manager review', color: 'bg-amber-100 text-amber-700' },
  hr: { label: 'HR sign-off', color: 'bg-purple-100 text-purple-700' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-700' },
}

export const RATING_LABELS = { 1: 'Needs improvement', 2: 'Developing', 3: 'Meets expectations', 4: 'Exceeds', 5: 'Outstanding' }

// Overall score = average of the manager's ratings (self ratings inform the conversation only).
export const appraisalScore = (a) => {
  const vals = Object.values(a.managerRatings || {}).filter((v) => v > 0)
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
}

export const APPRAISALS = [
  { id: 1, cycleId: 1, employeeId: 8, employeeName: 'Hassan Al Shamsi', managerId: 1, status: 'self', selfRatings: {}, selfComments: '', managerRatings: {}, managerComments: '', signedOffBy: null, signedOffDate: null },
  { id: 2, cycleId: 1, employeeId: 10, employeeName: 'Samir Al Mazrouei', managerId: 1, status: 'manager', selfRatings: { delivery: 4, quality: 4, collaboration: 3, initiative: 4, leadership: 3 }, selfComments: 'Kept the Madinat Zayed site on programme through two design changes. Want to take a formal supervision course this year.', managerRatings: {}, managerComments: '', signedOffBy: null, signedOffDate: null },
  { id: 3, cycleId: 1, employeeId: 3, employeeName: 'Mohammad Kubba', managerId: 2, status: 'hr', selfRatings: { delivery: 4, quality: 5, collaboration: 4, initiative: 3, leadership: 4 }, selfComments: 'MEP packages issued on time on all three live projects; introduced clash-review checklist.', managerRatings: { delivery: 4, quality: 5, collaboration: 4, initiative: 4, leadership: 4 }, managerComments: 'Strong half — the clash-review checklist cut rework noticeably. Ready for more client-facing exposure.', signedOffBy: null, signedOffDate: null },
  { id: 4, cycleId: 1, employeeId: 7, employeeName: 'Fatima Al Mansouri', managerId: 2, status: 'complete', selfRatings: { delivery: 4, quality: 4, collaboration: 5, initiative: 4, leadership: 3 }, selfComments: 'Led the concept package for Khalifa City Villas.', managerRatings: { delivery: 4, quality: 4, collaboration: 5, initiative: 4, leadership: 4 }, managerComments: 'Consistently dependable; clients ask for her by name.', signedOffBy: 'Layla Al Mazrouei', signedOffDate: '2026-07-03' },
]

// ---------------------------------------------------------------------------
// Training & development — catalogue + enrollment requests (HR approves).
// Completing a course auto-adds an accomplishment on the employee record,
// mapped to the existing ACCOMPLISHMENT_TYPES via accomplishmentType.
// ---------------------------------------------------------------------------
export const COURSE_COST_BANDS = ['Under AED 2,000', 'AED 2,000 – 5,000', 'AED 5,000 – 15,000', 'Over AED 15,000']

export const TRAINING_COURSES = [
  { id: 1, title: 'PMP Exam Preparation', provider: 'PMI / local partner', mode: 'Classroom', duration: '5 days', costBand: 'AED 5,000 – 15,000', tags: ['PMP', 'Project Management'], accomplishmentType: 'Project Management' },
  { id: 2, title: 'NEBOSH International General Certificate', provider: 'NEBOSH (accredited centre, Abu Dhabi)', mode: 'Classroom', duration: '10 days', costBand: 'AED 5,000 – 15,000', tags: ['HSE', 'Safety'], accomplishmentType: 'Safety Induction' },
  { id: 3, title: 'Revit Structure — Advanced', provider: 'Autodesk Authorized Training Center', mode: 'Online', duration: '3 days', costBand: 'AED 2,000 – 5,000', tags: ['Revit', 'BIM'], accomplishmentType: 'Revit' },
  { id: 4, title: 'ISO 9001:2015 Lead Auditor', provider: 'International Standards', mode: 'Classroom', duration: '5 days', costBand: 'AED 5,000 – 15,000', tags: ['ISO', 'Quality'], accomplishmentType: 'ISO Training' },
  { id: 5, title: 'Primavera P6 Fundamentals', provider: 'Oracle University partner', mode: 'Online', duration: '4 days', costBand: 'AED 2,000 – 5,000', tags: ['Planning', 'Project Management'], accomplishmentType: 'Project Management' },
  { id: 6, title: 'Site Supervision & UAE Building Codes', provider: 'ALSUWEIDI (internal)', mode: 'On-site', duration: '2 days', costBand: 'Under AED 2,000', tags: ['Site', 'Codes'], accomplishmentType: 'Site Supervision' },
]

export const ENROLLMENT_STATUS_META = {
  requested: { label: 'Requested', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-600' },
}

export const ENROLLMENTS = [
  { id: 1, courseId: 3, employeeId: 4, employeeName: 'Ahmed El Haddad', justification: 'Advanced Revit needed for the federated model on Marina Tower.', status: 'completed', requestedDate: '2026-03-02', decidedDate: '2026-03-05', completedDate: '2026-04-18' },
  { id: 2, courseId: 1, employeeId: 8, employeeName: 'Hassan Al Shamsi', justification: 'Working toward PM track — agreed with Osama in last appraisal.', status: 'approved', requestedDate: '2026-06-10', decidedDate: '2026-06-14', completedDate: null },
  { id: 3, courseId: 2, employeeId: 10, employeeName: 'Samir Al Mazrouei', justification: 'Site safety lead on the 6-day pattern — NEBOSH required by two clients.', status: 'requested', requestedDate: '2026-07-01', decidedDate: null, completedDate: null },
  { id: 4, courseId: 4, employeeId: 9, employeeName: 'Maryam Al Kaabi', justification: 'Compliance role — lead auditor status lets us run internal audits ourselves.', status: 'requested', requestedDate: '2026-07-03', decidedDate: null, completedDate: null },
]

// ---------------------------------------------------------------------------
// Disciplinary / warning letters — HR-only register (like complaints: not even
// management, since a warning file is between HR, the manager, and the employee).
// ---------------------------------------------------------------------------
export const WARNING_LEVELS = ['Verbal warning', 'Written warning', 'Final written warning']
export const WARNING_CATEGORIES = ['Attendance', 'Conduct', 'Performance', 'Safety violation', 'Policy breach']

export const WARNINGS = [
  { id: 1, employeeId: 4, employeeName: 'Ahmed El Haddad', level: 'Verbal warning', category: 'Attendance', date: '2026-04-14', summary: 'Three late arrivals in March without prior notice; expectations reset in a documented conversation.', issuedBy: 'Layla Al Mazrouei', acknowledged: true, acknowledgedDate: '2026-04-14' },
  { id: 2, employeeId: 4, employeeName: 'Ahmed El Haddad', level: 'Written warning', category: 'Attendance', date: '2026-05-28', summary: 'Recurring lateness after verbal warning (3 further instances in May). Improvement expected within 60 days.', issuedBy: 'Layla Al Mazrouei', acknowledged: true, acknowledgedDate: '2026-05-30' },
  { id: 3, employeeId: 10, employeeName: 'Samir Al Mazrouei', level: 'Verbal warning', category: 'Safety violation', date: '2026-02-19', summary: 'Allowed a subcontractor to work at height without harness check on Madinat Zayed site. Toolbox talk repeated with the crew.', issuedBy: 'Osama Hussain', acknowledged: false, acknowledgedDate: null },
]

// ---------------------------------------------------------------------------
// Exit interviews — leavers log (most leavers are no longer in EMPLOYEES, so
// records carry their own dept/tenure).
// ---------------------------------------------------------------------------
export const EXIT_REASONS = ['Compensation', 'Career growth', 'Relocation', 'Management', 'Other']

export const EXIT_INTERVIEWS = [
  { id: 1, employeeName: 'Tariq Aziz', dept: 'Engineering', lastWorkingDay: '2025-03-31', tenureYears: 4.5, reason: 'Compensation', destination: 'Competitor consultancy, Dubai', wouldRehire: true, notes: 'Left for ~25% package uplift. Positive about the team; would return for a senior role.' },
  { id: 2, employeeName: 'Grace Fernandes', dept: 'Admin', lastWorkingDay: '2025-08-15', tenureYears: 2.1, reason: 'Relocation', destination: 'Returning to family in Goa, India', wouldRehire: true, notes: 'Family reasons only. Strong performer — flagged for remote/contract work if we ever support it.' },
  { id: 3, employeeName: 'Yusuf Rahman', dept: 'Projects', lastWorkingDay: '2025-11-30', tenureYears: 1.2, reason: 'Management', destination: 'Client-side PMO role', wouldRehire: false, notes: 'Cited unclear reporting lines between site and HQ. Feedback shared with department heads.' },
  { id: 4, employeeName: 'Elena Petrova', dept: 'Engineering', lastWorkingDay: '2026-02-28', tenureYears: 3.8, reason: 'Career growth', destination: 'Regional design director role, KSA', wouldRehire: true, notes: 'No senior design leadership seat open here. Amicable — good alumni contact for NEOM-adjacent leads.' },
  { id: 5, employeeName: 'Ravi Menon', dept: 'Finance', lastWorkingDay: '2026-05-31', tenureYears: 6.3, reason: 'Compensation', destination: 'Group finance role, holding company', wouldRehire: true, notes: 'Counter-offer declined. Suggested we benchmark finance salaries against market yearly.' },
]

// Joiners/leavers by month for 2026 — deterministic illustrative history; the
// EMPLOYEES seed only carries current staff, so months are labelled as mock.
export const HEADCOUNT_MONTHLY_2026 = [
  { month: 'Jan', joiners: 2, leavers: 1 },
  { month: 'Feb', joiners: 1, leavers: 1 },
  { month: 'Mar', joiners: 3, leavers: 0 },
  { month: 'Apr', joiners: 0, leavers: 1 },
  { month: 'May', joiners: 2, leavers: 1 },
  { month: 'Jun', joiners: 1, leavers: 0 },
]

// ---------------------------------------------------------------------------
// Grades & salary bands — pending management decision. The grade field on the
// employee record stays optional until grades are confirmed.
// ---------------------------------------------------------------------------
export const SALARY_BANDS = [
  { grade: 'G1', label: 'Junior / support', minBasic: 5000, maxBasic: 9000 },
  { grade: 'G2', label: 'Officer / coordinator', minBasic: 8000, maxBasic: 13000 },
  { grade: 'G3', label: 'Engineer / specialist', minBasic: 12000, maxBasic: 18000 },
  { grade: 'G4', label: 'Senior engineer', minBasic: 16000, maxBasic: 23000 },
  { grade: 'G5', label: 'Lead / manager', minBasic: 20000, maxBasic: 27000 },
  { grade: 'G6', label: 'Senior manager', minBasic: 25000, maxBasic: 32000 },
  { grade: 'G7', label: 'Director', minBasic: 30000, maxBasic: 40000 },
]
