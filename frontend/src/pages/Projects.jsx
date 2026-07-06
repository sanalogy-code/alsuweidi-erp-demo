import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Plus, UsersRound, Inbox, Gauge } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProjectList from '../components/projects/ProjectList'
import ProjectDetailModal from '../components/projects/ProjectDetailModal'
import ProjectsDashboard from '../components/projects/ProjectsDashboard'
import NewProjectModal from '../components/projects/NewProjectModal'
import ResourcesView from '../components/projects/pm/ResourcesView'
import MyWorkView from '../components/projects/pm/MyWorkView'
import PmDashboard from '../components/projects/pm/PmDashboard'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import { EMPLOYEES } from '../data/hrData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'

// Two areas (Batch 11, Sana's structure): PROJECT MANAGEMENT is the working tool
// (my work, management dashboard, resources); DATABASE is the records side
// (portfolio list + record stats).
const NAV_GROUPS = [
  { label: 'Project Management', items: [
    { key: 'mywork', label: 'My Work', icon: Inbox },
    { key: 'pmdash', label: 'Management', icon: Gauge },
    { key: 'resources', label: 'Resources', icon: UsersRound },
  ] },
  { label: 'Database', items: [
    { key: 'portfolio', label: 'Portfolio', icon: FolderKanban },
    { key: 'dashboard', label: 'Record stats', icon: LayoutDashboard },
  ] },
]

export default function Projects({ user, onLogout, projects = [], pmRecords = {}, onUpdateProject, onAddProject, onAddMarketingTask }) {
  const location = useLocation()
  const navigate = useNavigate()
  // My Work is the daily-driver landing view (Batch 10) — the first thing a PM
  // or engineer sees is what's waiting on them, not a stats page.
  const [view, setView] = useState('mywork')
  const openWorkspace = (p, target) => navigate(`/projects/${p.id}`, target ? { state: target } : undefined)
  // CRM's "view project" / "open in Projects" hands over a project id via router state
  const [selectedProject, setSelectedProject] = useState(
    () => projects.find((p) => p.id === location.state?.openProjectId) || null
  )
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showNewProject, setShowNewProject] = useState(false)

  const canViewSensitive = SENSITIVE_VIEW_ROLES.includes(user?.role)
  const isHrStaff = HR_STAFF_ROLES.includes(user?.role)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="Projects" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <aside className="w-full sm:w-44 shrink-0 sm:sticky sm:top-6">
          {onAddProject && (
            <button
              onClick={() => setShowNewProject(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mb-2 rounded-md text-sm font-medium bg-brand text-white hover:bg-brand-dark transition"
            >
              <Plus size={15} /> New project
            </button>
          )}
          <div className="space-y-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 px-3 mb-1">{group.label}</div>
                <div className="flex sm:flex-col flex-wrap gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = view === item.key
                    return (
                      <button
                        key={item.key}
                        onClick={() => setView(item.key)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition text-left ${active ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
                      >
                        <Icon size={15} className="shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0 w-full">
          {view === 'mywork' && (
            <MyWorkView user={user} projects={projects} pmRecords={pmRecords} onOpenWorkspace={openWorkspace} />
          )}
          {view === 'pmdash' && (
            <PmDashboard projects={projects} pmRecords={pmRecords} onOpenWorkspace={openWorkspace} />
          )}
          {view === 'dashboard' && (
            <ProjectsDashboard projects={projects} pmRecords={pmRecords} canViewSensitive={canViewSensitive} onViewProject={setSelectedProject} onOpenWorkspace={openWorkspace} />
          )}
          {view === 'portfolio' && (
            <ProjectList projects={projects} employees={EMPLOYEES} user={user} onViewProject={setSelectedProject} onOpenWorkspace={openWorkspace} />
          )}
          {view === 'resources' && (
            <ResourcesView projects={projects} pmRecords={pmRecords} employees={EMPLOYEES} onViewProject={(p) => openWorkspace(p)} />
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
