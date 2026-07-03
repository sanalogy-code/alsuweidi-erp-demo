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

// Non-project codes selectable alongside real projects.
export const GENERAL_CODES = [
  { code: 'general', label: 'General / non-project' },
  { code: 'leave', label: 'Leave / public holiday' },
  { code: 'training', label: 'Training & development' },
]

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

// entries[].code: a PROJECTS id (number) or a GENERAL_CODES code (string).
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
  // Draft = started but never submitted — still counts as missing for payroll.
  {
    id: 5, employeeId: 7, employeeName: 'Fatima Al Mansouri', weekStart: '2026-06-21',
    entries: [{ code: 5, hours: [0, 8, 8, 0, 0, 0, 0] }],
    status: 'draft', submittedDate: null, approvedBy: null, approvedDate: null, rejectReason: null,
  },
]
