import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CRM from './pages/CRM'
import HR from './pages/HR'
import Projects from './pages/Projects'
import IT from './pages/IT'
import Marketing from './pages/Marketing'
import ComingSoon from './pages/ComingSoon'
import { PUBLIC_HOLIDAYS } from './data/hrData'
import { PROJECTS } from './data/projectsData'
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
  // Lifted so deal ids never reset and get reused across CRM remounts — a reused id
  // would make the won-deal card link to another session's project via dealId
  const [deals, setDeals] = useState(INITIAL_DEALS)
  // Lifted because Marketing's inbox is fed by events in other modules: a project
  // created (in Projects or CRM) needs a marketing description; a new employee
  // (added in HR) needs a headshot and a welcome email.
  const [marketingTasks, setMarketingTasks] = useState(MARKETING_TASKS)
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

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} />} />
      <Route path="/home" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} />} />
      <Route path="/crm" element={<CRM user={user} onLogout={handleLogout} projects={projects} onAddProject={addProject} deals={deals} setDeals={setDeals} />} />
      <Route path="/projects" element={<Projects user={user} onLogout={handleLogout} projects={projects} onUpdateProject={updateProject} onAddProject={addProject} onAddMarketingTask={addMarketingTask} />} />
      <Route path="/hr" element={<HR user={user} onLogout={handleLogout} holidays={holidays} onUpdateHolidays={setHolidays} projects={projects} onEmployeeAdded={handleEmployeeAdded} />} />
      <Route path="/it" element={<IT user={user} onLogout={handleLogout} />} />
      <Route path="/marketing" element={<Marketing user={user} onLogout={handleLogout} projects={projects} onUpdateProject={updateProject} deals={deals} marketingTasks={marketingTasks} onCompleteTask={completeMarketingTask} />} />
      <Route path="/content" element={<Marketing user={user} onLogout={handleLogout} projects={projects} onUpdateProject={updateProject} deals={deals} marketingTasks={marketingTasks} onCompleteTask={completeMarketingTask} />} />
      <Route path="/admin" element={<ComingSoon user={user} onLogout={handleLogout} moduleKey="admin" />} />
      <Route path="*" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} />} />
    </Routes>
  )
}
