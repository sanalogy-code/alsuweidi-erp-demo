import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Plus, UsersRound } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProjectList from '../components/projects/ProjectList'
import ProjectDetailModal from '../components/projects/ProjectDetailModal'
import ProjectsDashboard from '../components/projects/ProjectsDashboard'
import NewProjectModal from '../components/projects/NewProjectModal'
import ResourcesView from '../components/projects/pm/ResourcesView'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import { EMPLOYEES } from '../data/hrData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'portfolio', label: 'Portfolio', icon: FolderKanban },
  { key: 'resources', label: 'Resources', icon: UsersRound },
]

export default function Projects({ user, onLogout, projects = [], onUpdateProject, onAddProject, onAddMarketingTask }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState('dashboard')
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
          <div className="flex sm:flex-col flex-wrap gap-1">
            {NAV.map((item) => {
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
        </aside>

        <main className="flex-1 min-w-0 w-full">
          {view === 'dashboard' && (
            <ProjectsDashboard projects={projects} canViewSensitive={canViewSensitive} onViewProject={setSelectedProject} />
          )}
          {view === 'portfolio' && (
            <ProjectList projects={projects} employees={EMPLOYEES} user={user} onViewProject={setSelectedProject} />
          )}
          {view === 'resources' && (
            <ResourcesView projects={projects} employees={EMPLOYEES} onViewProject={setSelectedProject} />
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
