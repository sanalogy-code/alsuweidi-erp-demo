import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
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
import TimesheetGate from './components/TimesheetGate'
import FeedbackButton, { INITIAL_FEEDBACK } from './components/SystemFeedback'
import { PUBLIC_HOLIDAYS } from './data/hrData'
import { TIMESHEETS } from './data/timesheetData'
import { PROJECTS } from './data/projectsData'
import { getPmRecord, emptyPmRecord, INITIAL_ALLOCATIONS } from './data/pmData'
import { INITIAL_DEALS } from './data/crmData'
import { MARKETING_TASKS } from './data/marketingData'

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('erp_demo_user')
    return saved ? JSON.parse(saved) : null
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
  const addFeedback = (f) => setSystemFeedback((prev) => [{ ...f, id: Math.max(0, ...prev.map((x) => x.id)) + 1 }, ...prev])
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
  const navigate = useNavigate()

  // Auto-assigned to all of Marketing. Deduped: one open task per type per subject.
  const addMarketingTask = (task) => {
    setMarketingTasks((prev) => {
      const exists = prev.some((t) => t.type === task.type && t.relatedKind === task.relatedKind && t.relatedId === task.relatedId && t.status === 'pending')
      if (exists) return prev
      return [...prev, {
        dueDate: null, notes: '', status: 'pending',
        createdDate: new Date().toISOString().slice(0, 10), completedDate: null,
        ...task,
        id: Math.max(0, ...prev.map((t) => t.id)) + 1,
      }]
    })
  }

  const completeMarketingTask = (id, note) => {
    setMarketingTasks((prev) => prev.map((t) => (t.id === id
      ? { ...t, status: 'done', completedDate: new Date().toISOString().slice(0, 10), notes: note || t.notes }
      : t)))
  }

  const addProject = (project) => {
    const created = { ...project, id: Math.max(0, ...projects.map((p) => p.id)) + 1 }
    setProjects([...projects, created])
    setPmRecords((prev) => ({ ...prev, [created.id]: emptyPmRecord(created) }))
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
    <>
      <TimesheetGate user={user} timesheets={timesheets} />
      <FeedbackButton user={user} onSubmit={addFeedback} />
      <Routes>
      <Route path="/dev" element={<DevDashboard />} />
      <Route path="/" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} />} />
      <Route path="/home" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} />} />
      <Route path="/crm" element={<CRM user={user} onLogout={handleLogout} projects={projects} onAddProject={addProject} deals={deals} setDeals={setDeals} />} />
      <Route path="/projects" element={<Projects user={user} onLogout={handleLogout} projects={projects} pmRecords={pmRecords} timesheets={timesheets} allocations={allocations} onUpdateAllocations={setAllocations} onUpdateProject={updateProject} onAddProject={addProject} onAddMarketingTask={addMarketingTask} />} />
      <Route path="/projects/:id" element={<ProjectWorkspace user={user} onLogout={handleLogout} projects={projects} pmRecords={pmRecords} timesheets={timesheets} onUpdatePm={updatePmRecord} onUpdateProject={updateProject} onAddMarketingTask={addMarketingTask} />} />
      <Route path="/hr" element={<HR user={user} onLogout={handleLogout} holidays={holidays} onUpdateHolidays={setHolidays} projects={projects} onEmployeeAdded={handleEmployeeAdded} timesheets={timesheets} setTimesheets={setTimesheets} />} />
      <Route path="/it" element={<IT user={user} onLogout={handleLogout} />} />
      <Route path="/finance" element={<Finance user={user} onLogout={handleLogout} />} />
      <Route path="/marketing" element={<Marketing user={user} onLogout={handleLogout} projects={projects} onUpdateProject={updateProject} deals={deals} marketingTasks={marketingTasks} onCompleteTask={completeMarketingTask} />} />
      <Route path="/content" element={<Marketing user={user} onLogout={handleLogout} projects={projects} onUpdateProject={updateProject} deals={deals} marketingTasks={marketingTasks} onCompleteTask={completeMarketingTask} />} />
      <Route path="/admin" element={<Admin user={user} onLogout={handleLogout} feedback={systemFeedback} onUpdateFeedback={setSystemFeedback} />} />
      <Route path="*" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} />} />
      </Routes>
    </>
  )
}
