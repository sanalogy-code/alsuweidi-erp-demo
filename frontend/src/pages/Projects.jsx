import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Plus, UsersRound, Inbox, Gauge, FileBarChart, ShieldAlert } from 'lucide-react'
import Navbar from '../components/Navbar'
import SidebarNav from '../components/SidebarNav'
import ProjectList from '../components/projects/ProjectList'
import ProjectDetailModal from '../components/projects/ProjectDetailModal'
import ProjectsDashboard from '../components/projects/ProjectsDashboard'
import NewProjectModal from '../components/projects/NewProjectModal'
import ResourcePlannerView from '../components/projects/pm/ResourcePlannerView'
import MyWorkView from '../components/projects/pm/MyWorkView'
import PmDashboard from '../components/projects/pm/PmDashboard'
import DmrView from '../components/projects/pm/DmrView'
import CmrView from '../components/projects/pm/CmrView'
import RiskReportView from '../components/projects/pm/RiskReportView'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import { EMPLOYEES } from '../data/hrData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'

// Two areas (Batch 11, Sana's structure): PROJECT MANAGEMENT is the working tool
// (my work, management dashboard, resources); DATABASE is the records side
// (portfolio list + record stats).
const NAV_GROUPS = [
  { label: 'Project Management', items: [
    { key: 'mywork', label: 'My Work', icon: Inbox },
    { key: 'pmdash', label: 'Active projects', icon: Gauge },
    { key: 'reviews', label: 'Project reviews', icon: FileBarChart },
    { key: 'risks', label: 'Risk report', icon: ShieldAlert },
    { key: 'resources', label: 'Resources', icon: UsersRound },
  ] },
  { label: 'Database', items: [
    { key: 'portfolio', label: 'Portfolio', icon: FolderKanban },
    { key: 'dashboard', label: 'Record stats', icon: LayoutDashboard },
  ] },
]

export default function Projects({ user, onLogout, projects = [], pmRecords = {}, timesheets = [], allocations = [], onUpdateAllocations, onUpdateProject, onAddProject, onAddMarketingTask, invoices, expenses }) {
  const location = useLocation()
  const navigate = useNavigate()
  // My Work is the daily-driver landing view (Batch 10) — the first thing a PM
  // or engineer sees is what's waiting on them, not a stats page.
  const [view, setView] = useState(location.state?.view || 'mywork')
  // Project reviews lens: design (weekly, the old DMR) vs construction (monthly, the old CMR)
  const [reviewLens, setReviewLens] = useState('design')
  const openWorkspace = (p, target) => navigate(`/projects/${p.id}`, target ? { state: target } : undefined)
  // CRM's "view project" / "open in Projects" hands over a project id via router state
  const [selectedProject, setSelectedProject] = useState(
    () => projects.find((p) => p.id === location.state?.openProjectId) || null
  )
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showNewProject, setShowNewProject] = useState(false)

  useEffect(() => {
    if (location.state?.view) setView(location.state.view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const canViewSensitive = SENSITIVE_VIEW_ROLES.includes(user?.role)
  const isHrStaff = HR_STAFF_ROLES.includes(user?.role)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="Projects" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <SidebarNav groups={NAV_GROUPS} active={view} onSelect={setView}>
          {onAddProject && (
            <button
              onClick={() => setShowNewProject(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mb-2 rounded-md text-sm font-medium bg-brand text-white hover:bg-brand-dark transition"
            >
              <Plus size={15} /> New project
            </button>
          )}
        </SidebarNav>

        <main className="flex-1 min-w-0 w-full">
          {view === 'mywork' && (
            <MyWorkView user={user} projects={projects} pmRecords={pmRecords} onOpenWorkspace={openWorkspace} />
          )}
          {view === 'pmdash' && (
            <PmDashboard projects={projects} pmRecords={pmRecords} timesheets={timesheets} onOpenWorkspace={openWorkspace} canViewSensitive={canViewSensitive} invoices={invoices} />
          )}
          {view === 'reviews' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <button onClick={() => setReviewLens('design')} className={`px-3 py-1.5 rounded-md border font-medium transition ${reviewLens === 'design' ? 'border-brand text-brand bg-brand/5' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>Design review (weekly)</button>
                <button onClick={() => setReviewLens('construction')} className={`px-3 py-1.5 rounded-md border font-medium transition ${reviewLens === 'construction' ? 'border-brand text-brand bg-brand/5' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>Construction review (monthly)</button>
              </div>
              {reviewLens === 'design'
                ? <DmrView projects={projects} pmRecords={pmRecords} onOpenWorkspace={openWorkspace} invoices={invoices} expenses={expenses} />
                : <CmrView projects={projects} pmRecords={pmRecords} onOpenWorkspace={openWorkspace} canViewSensitive={canViewSensitive} invoices={invoices} />}
            </div>
          )}
          {view === 'risks' && (
            <RiskReportView projects={projects} pmRecords={pmRecords} onOpenWorkspace={openWorkspace} />
          )}
          {view === 'dashboard' && (
            <ProjectsDashboard projects={projects} pmRecords={pmRecords} canViewSensitive={canViewSensitive} onViewProject={setSelectedProject} onOpenWorkspace={openWorkspace} />
          )}
          {view === 'portfolio' && (
            <ProjectList projects={projects} employees={EMPLOYEES} user={user} onViewProject={setSelectedProject} onOpenWorkspace={openWorkspace} />
          )}
          {view === 'resources' && (
            <ResourcePlannerView projects={projects} pmRecords={pmRecords} employees={EMPLOYEES} timesheets={timesheets} allocations={allocations} onUpdateAllocations={onUpdateAllocations} onOpenWorkspace={openWorkspace} />
          )}
        </main>
      </div>

      {showNewProject && (
        <NewProjectModal
          employees={EMPLOYEES}
          existingProjects={projects}
          onClose={() => setShowNewProject(false)}
          onCreate={(p) => setSelectedProject(onAddProject(p))}
        />
      )}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          employees={EMPLOYEES}
          canViewSensitive={canViewSensitive}
          invoices={invoices}
          onClose={() => setSelectedProject(null)}
          onViewEmployee={(emp) => setSelectedEmployee(emp)}
          onUpdateProject={(p) => { onUpdateProject?.(p); setSelectedProject(p) }}
          onAddMarketingTask={onAddMarketingTask}
          onOpenWorkspace={(p) => navigate(`/projects/${p.id}`)}
        />
      )}

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          employees={EMPLOYEES}
          user={user}
          isHrStaff={isHrStaff}
          canViewSensitive={canViewSensitive}
          onClose={() => setSelectedEmployee(null)}
          onViewEmployee={setSelectedEmployee}
          readOnly
        />
      )}
    </div>
  )
}
