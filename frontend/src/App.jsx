import { useMemo, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'
import DevDashboard from './pages/DevDashboard'
import HomePage from './pages/HomePage'
import CRM from './pages/CRM'
import HR from './pages/HR'
import Projects from './pages/Projects'
import ProjectWorkspace from './pages/ProjectWorkspace'
import IT from './pages/IT'
import Marketing from './pages/Marketing'
import Finance from './pages/Finance'
import Admin from './pages/Admin'
import Office from './pages/Office'
import TimesheetGate from './components/TimesheetGate'
import { NotificationsProvider } from './components/NotificationsBell'
import FeedbackButton, { INITIAL_FEEDBACK } from './components/SystemFeedback'
import { INITIAL_STAFFING_REQUESTS } from './data/rfpData'
import { PUBLIC_HOLIDAYS, EMPLOYEES } from './data/hrData'
import { TIMESHEETS, weekStartOf, toLocalISO } from './data/timesheetData'
import { parseLocalDate, todayISO } from './utils/date'
import { PROJECTS } from './data/projectsData'
import { getPmRecord, emptyPmRecord, INITIAL_ALLOCATIONS } from './data/pmData'
import { INITIAL_DEALS } from './data/crmData'
import { MARKETING_TASKS } from './data/marketingData'
import { nextId } from './utils/id'
import { useFinanceState } from './state/financeState'
import { useAuditLog } from './state/auditLog'

export default function App() {
  const [user, setUser] = useState(() => {
    // Guard the parse: a corrupt/legacy value here would throw during the very
    // first render — before any ErrorBoundary mounts — leaving a blank white page
    // that a refresh can't fix. Bad data just drops us to the login screen.
    try {
      const saved = localStorage.getItem('erp_demo_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      localStorage.removeItem('erp_demo_user')
      return null
    }
  })
  // Lifted here (not HR-page state) so an HR approval shows up on the Home dashboard tile in the same session
  const [holidays, setHolidays] = useState(PUBLIC_HOLIDAYS)
  // Lifted so a project created from a won CRM deal exists when the Projects page mounts
  const [projects, setProjects] = useState(PROJECTS)
  // PM registers lifted here (Batch 10) so workspace edits survive navigation and
  // the cross-project "My Work" view sees one consistent state.
  const [pmRecords, setPmRecords] = useState(() => Object.fromEntries(PROJECTS.map((p) => [p.id, getPmRecord(p)])))
  const updatePmRecord = (projectId, next) => setPmRecords((prev) => ({ ...prev, [projectId]: next }))
  // Cross-project planned resource allocations (Batch 12 resource planner).
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS)
  // System feedback (bugs/feature requests) — reported from anywhere via the
  // floating button, triaged in the Admin Center.
  const [systemFeedback, setSystemFeedback] = useState(INITIAL_FEEDBACK)
  const addFeedback = (f) => setSystemFeedback((prev) => [{ ...f, id: nextId(prev) }, ...prev])
  // Pipeline staffing requests: raised on an RFP in CRM, triaged in HR Staff
  // planning (Batch 16c). Lifted here because it crosses the CRM↔HR boundary.
  const [staffingRequests, setStaffingRequests] = useState(INITIAL_STAFFING_REQUESTS)
  const addStaffingRequest = (r) => setStaffingRequests((prev) => [{ ...r, id: nextId(prev), date: todayISO(), status: 'requested' }, ...prev])

  // Task-hours → timesheet (Batch 16): logging hours on a project task writes
  // them into the assignee's weekly timesheet under that project's code, so the
  // timesheet becomes a by-product of task work instead of a Thursday chore.
  // Only draft/rejected/new weeks accept hours — submitted/approved weeks are
  // locked (the approval already happened).
  const logTaskHours = (assigneeName, projectId, hours, dateISO) => {
    const emp = EMPLOYEES.find((e) => e.name.toLowerCase() === (assigneeName || '').toLowerCase())
    if (!emp) return { ok: false, reason: 'external' }
    const date = parseLocalDate(dateISO)
    const weekStart = toLocalISO(weekStartOf(date))
    const dayIdx = date.getDay()
    const existing = timesheets.find((t) => t.employeeId === emp.id && t.weekStart === weekStart)
    if (existing && existing.status !== 'draft' && existing.status !== 'rejected') {
      return { ok: false, reason: existing.status }
    }
    setTimesheets((prev) => {
      const ts = prev.find((t) => t.employeeId === emp.id && t.weekStart === weekStart)
      if (!ts) {
        return [...prev, {
          id: nextId(prev),
          employeeId: emp.id, employeeName: emp.name, weekStart,
          entries: [{ code: projectId, hours: Array.from({ length: 7 }, (_, i) => (i === dayIdx ? hours : 0)) }],
          status: 'draft', submittedDate: null, approvedBy: null, approvedDate: null, rejectReason: null,
        }]
      }
      const hasEntry = ts.entries.some((e) => e.code === projectId)
      const entries = hasEntry
        ? ts.entries.map((e) => (e.code === projectId ? { ...e, hours: e.hours.map((h, i) => (i === dayIdx ? (Number(h) || 0) + hours : h)) } : e))
        : [...ts.entries, { code: projectId, hours: Array.from({ length: 7 }, (_, i) => (i === dayIdx ? hours : 0)) }]
      return prev.map((t) => (t.id === ts.id ? { ...t, entries, status: 'draft' } : t))
    })
    return { ok: true, weekStart }
  }
  // Lifted so deal ids never reset and get reused across CRM remounts — a reused id
  // would make the won-deal card link to another session's project via dealId
  const [deals, setDeals] = useState(INITIAL_DEALS)
  // Lifted because Marketing's inbox is fed by events in other modules: a project
  // created (in Projects or CRM) needs a marketing description; a new employee
  // (added in HR) needs a headshot and a welcome email.
  const [marketingTasks, setMarketingTasks] = useState(MARKETING_TASKS)
  // Lifted so the timesheet reminder/lockout gate (rendered here, above every
  // page) clears the moment the week is submitted inside the HR module.
  const [timesheets, setTimesheets] = useState(TIMESHEETS)
  // ONE audit trail for the whole app — Admin's Activity log shows everything,
  // Finance's Activity view filters to its own module.
  const audit = useAuditLog()
  // Finance state lifted (code-quality item): Home KPIs, PM dashboards and the
  // project workspace read the same session invoices/expenses Finance edits.
  const finance = useFinanceState(user, audit.record)
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-assigned to all of Marketing. Deduped: one open task per type per subject.
  const addMarketingTask = (task) => {
    setMarketingTasks((prev) => {
      const exists = prev.some((t) => t.type === task.type && t.relatedKind === task.relatedKind && t.relatedId === task.relatedId && t.status === 'pending')
      if (exists) return prev
      return [...prev, {
        dueDate: null, notes: '', status: 'pending',
        createdDate: todayISO(), completedDate: null,
        ...task,
        id: nextId(prev),
      }]
    })
  }

  const completeMarketingTask = (id, note) => {
    setMarketingTasks((prev) => prev.map((t) => (t.id === id
      ? { ...t, status: 'done', completedDate: todayISO(), notes: note || t.notes }
      : t)))
  }

  const addProject = (project) => {
    const created = { ...project, id: nextId(projects) }
    setProjects([...projects, created])
    setPmRecords((prev) => ({ ...prev, [created.id]: emptyPmRecord(created) }))
    // Auto-draft a mobilization invoice in Finance (draft only — accountant
    // reviews and sends), mirroring the won-deal → marketing-task wiring.
    finance.draftInvoiceFromProject(created)
    // Every new project owes Marketing a portfolio description — it can't be
    // marked Completed without one.
    if (!created.marketingDescription) {
      addMarketingTask({
        type: 'marketing_description', relatedKind: 'project', relatedId: created.id,
        relatedName: `${created.projectNo} — ${created.name}`,
      })
    }
    return created
  }

  const updateProject = (project) => {
    setProjects(projects.map((p) => (p.id === project.id ? project : p)))
  }

  // Called by HR when a new employee record is created (direct entry or approved
  // new joiner): Marketing takes their headshot and designs the welcome email
  // (HR checks and sends it).
  const handleEmployeeAdded = (employee) => {
    const relatedName = `${employee.name}${employee.title ? ` — ${employee.title}` : ''}`
    addMarketingTask({ type: 'employee_headshot', relatedKind: 'employee', relatedId: employee.id ?? null, relatedName })
    addMarketingTask({ type: 'welcome_email', relatedKind: 'employee', relatedId: employee.id ?? null, relatedName })
  }

  const handleLogin = (data) => {
    setUser(data)
    localStorage.setItem('erp_demo_user', JSON.stringify(data))
    navigate('/home')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('erp_demo_user')
    navigate('/')
  }

  // Notification sources — memoized so the provider's feed composition (which
  // walks every project × phase) only reruns when one of these actually changes.
  // MUST stay above the `if (!user)` early return below: a hook called after a
  // conditional return runs only when logged in, so the hook count changes when
  // `user` toggles — that's React error #300 and the real cause of the
  // blank-page-until-refresh crash. Rules of Hooks: all hooks, every render.
  const notificationSources = useMemo(
    () => ({ projects, pmRecords, timesheets, marketingTasks, staffingRequests, systemFeedback }),
    [projects, pmRecords, timesheets, marketingTasks, staffingRequests, systemFeedback],
  )

  // The dev dashboard is reachable without logging in (it's the point — a
  // "behind the curtain" link off the fake login page; nothing sensitive on it).
  if (!user) {
    return (
      <Routes>
        <Route path="/dev" element={<DevDashboard />} />
        <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    )
  }

  return (
    // resetKey = pathname so a crash on one screen clears itself the moment you
    // navigate elsewhere — no hard refresh needed. Wraps the notifications
    // provider too, since that shell code runs on every route.
    <ErrorBoundary resetKey={location.pathname}>
    <NotificationsProvider user={user} sources={notificationSources}>
      <TimesheetGate user={user} timesheets={timesheets} />
      <FeedbackButton user={user} onSubmit={addFeedback} />
      <Routes>
      <Route path="/dev" element={<DevDashboard />} />
      <Route path="/" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} projects={projects} pmRecords={pmRecords} timesheets={timesheets} invoices={finance.invoices} deals={deals} marketingTasks={marketingTasks} systemFeedback={systemFeedback} />} />
      <Route path="/home" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} projects={projects} pmRecords={pmRecords} timesheets={timesheets} invoices={finance.invoices} deals={deals} marketingTasks={marketingTasks} systemFeedback={systemFeedback} />} />
      <Route path="/crm" element={<CRM user={user} onLogout={handleLogout} projects={projects} onAddProject={addProject} deals={deals} setDeals={setDeals} onRequestStaffing={addStaffingRequest} />} />
      <Route path="/projects" element={<Projects user={user} onLogout={handleLogout} projects={projects} pmRecords={pmRecords} timesheets={timesheets} allocations={allocations} onUpdateAllocations={setAllocations} onUpdateProject={updateProject} onAddProject={addProject} onAddMarketingTask={addMarketingTask} invoices={finance.invoices} expenses={finance.expenses} />} />
      <Route path="/projects/:id" element={<ProjectWorkspace user={user} onLogout={handleLogout} projects={projects} pmRecords={pmRecords} timesheets={timesheets} onLogTaskHours={logTaskHours} onUpdatePm={updatePmRecord} onUpdateProject={updateProject} onAddMarketingTask={addMarketingTask} invoices={finance.invoices} />} />
      <Route path="/hr" element={<HR user={user} onLogout={handleLogout} holidays={holidays} onUpdateHolidays={setHolidays} projects={projects} onEmployeeAdded={handleEmployeeAdded} timesheets={timesheets} setTimesheets={setTimesheets} staffingRequests={staffingRequests} onUpdateStaffingRequests={setStaffingRequests} />} />
      <Route path="/it" element={<IT user={user} onLogout={handleLogout} />} />
      <Route path="/finance" element={<Finance user={user} onLogout={handleLogout} finance={finance} auditEntries={audit.entries} />} />
      <Route path="/marketing" element={<Marketing user={user} onLogout={handleLogout} projects={projects} onUpdateProject={updateProject} deals={deals} marketingTasks={marketingTasks} onCompleteTask={completeMarketingTask} />} />
      <Route path="/content" element={<Marketing user={user} onLogout={handleLogout} projects={projects} onUpdateProject={updateProject} deals={deals} marketingTasks={marketingTasks} onCompleteTask={completeMarketingTask} />} />
      <Route path="/admin" element={<Admin user={user} onLogout={handleLogout} feedback={systemFeedback} onUpdateFeedback={setSystemFeedback} auditLog={audit.entries} />} />
      <Route path="/office" element={<Office user={user} onLogout={handleLogout} />} />
      <Route path="*" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} projects={projects} pmRecords={pmRecords} timesheets={timesheets} invoices={finance.invoices} deals={deals} marketingTasks={marketingTasks} systemFeedback={systemFeedback} />} />
      </Routes>
    </NotificationsProvider>
    </ErrorBoundary>
  )
}
