// Dummy weekly timesheet data — modeled on the current external timesheet system:
// hours logged per project code per day, submitted weekly, approved by the
// employee's line manager (employees.managerId). Employees without a line
// manager fall to HR, and HR keeps an oversight view of every submitted week.
//
// Policy hooks (see hrData ONBOARDING_SECTIONS): hours are logged weekly, submit
// by end of day Thursday; unsubmitted timesheets block payroll processing.
//
// The grid is always a Sunday → Saturday calendar week; which days count as
// weekend is per-employee (hrData WORK_WEEK_PATTERNS via workWeekOf) — company
// default Mon–Fri, Jordan staff Sun–Thu, site teams six days.

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Overhead (non-project) codes selectable alongside real projects — hours
// aren't always project-linked, so each internal bucket gets a real category
// instead of one catch-all "general".
export const OVERHEAD_CODES = [
  { code: 'admin', label: 'Overhead — Admin / office' },
  { code: 'it', label: 'Overhead — IT / systems' },
  { code: 'marketing', label: 'Overhead — Marketing' },
  { code: 'general', label: 'Overhead — General' },
  { code: 'leave', label: 'Leave / public holiday' },
  { code: 'training', label: 'Training & development' },
]

// Last working day of the Sun..Sat grid for a work-week pattern (the timesheet
// reminder fires on this day). E.g. Mon–Fri → Fri (5), Sun–Thu → Thu (4).
export const lastWorkingDayIndex = (workWeek) => {
  for (let i = 6; i >= 0; i--) if (!workWeek.weekend.includes(i)) return i
  return 6
}

const pad = (n) => String(n).padStart(2, '0')
export const toLocalISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Sunday of the week containing `date`, as a local-midnight Date.
export const weekStartOf = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export const fmtWeekRange = (weekStartISO) => {
  const [y, m, d] = weekStartISO.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const end = addDays(start, 6)
  const opts = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', opts)}`
}

export const timesheetTotal = (ts) => ts.entries.reduce((s, e) => s + e.hours.reduce((a, b) => a + (Number(b) || 0), 0), 0)

// entries[].code: a PROJECTS id (number) or an OVERHEAD_CODES code (string).
// hours: 7 numbers, Sun..Sat. status: draft | submitted | approved | rejected.
export const TIMESHEETS = [
  {
    id: 1, employeeId: 1, employeeName: 'Osama Hussain', weekStart: '2026-06-21',
    entries: [
      { code: 1, hours: [0, 8, 8, 4, 8, 8, 0] },
      { code: 'general', hours: [0, 0, 0, 4, 0, 0, 0] },
    ],
    status: 'submitted', submittedDate: '2026-06-25', approvedBy: null, approvedDate: null, rejectReason: null,
  },
  {
    id: 2, employeeId: 2, employeeName: 'Naseeb Shaheen', weekStart: '2026-06-21',
    entries: [{ code: 2, hours: [8, 8, 8, 8, 8, 0, 0] }],
    status: 'approved', submittedDate: '2026-06-25', approvedBy: 'Layla Al Mazrouei', approvedDate: '2026-06-28', rejectReason: null,
  },
  {
    id: 3, employeeId: 3, employeeName: 'Mohammad Kubba', weekStart: '2026-06-21',
    entries: [
      { code: 2, hours: [0, 4, 4, 4, 4, 4, 0] },
      { code: 11, hours: [0, 4, 4, 4, 4, 4, 0] },
    ],
    status: 'submitted', submittedDate: '2026-06-26', approvedBy: null, approvedDate: null, rejectReason: null,
  },
  {
    id: 4, employeeId: 10, employeeName: 'Samir Al Mazrouei', weekStart: '2026-06-21',
    entries: [{ code: 8, hours: [0, 8, 8, 8, 8, 8, 2] }],
    status: 'submitted', submittedDate: '2026-06-27', approvedBy: null, approvedDate: null, rejectReason: null,
  },
  // Samir is the default demo login — his last week is submitted so the
  // timesheet lockout never interrupts a management walkthrough.
  {
    id: 6, employeeId: 10, employeeName: 'Samir Al Mazrouei', weekStart: '2026-06-28',
    entries: [{ code: 8, hours: [0, 8, 8, 8, 8, 8, 0] }],
    status: 'submitted', submittedDate: '2026-07-04', approvedBy: null, approvedDate: null, rejectReason: null,
  },
  // Draft = started but never submitted — still counts as missing for payroll.
  {
    id: 5, employeeId: 7, employeeName: 'Fatima Al Mansouri', weekStart: '2026-06-21',
    entries: [{ code: 5, hours: [0, 8, 8, 0, 0, 0, 0] }],
    status: 'draft', submittedDate: null, approvedBy: null, approvedDate: null, rejectReason: null,
  },
]
