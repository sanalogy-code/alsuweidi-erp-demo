import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Layers, HardHat, CalendarRange, ListTodo,
  Banknote, Scale, ClipboardList, Landmark, Users, ArrowLeft,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import PmOverview from '../components/projects/pm/PmOverview'
import DeliverablesView from '../components/projects/pm/DeliverablesView'
import DesignStagesView from '../components/projects/pm/DesignStagesView'
import SiteView from '../components/projects/pm/SiteView'
import ScheduleView from '../components/projects/pm/ScheduleView'
import PmTasksView from '../components/projects/pm/PmTasksView'
import FeesView from '../components/projects/pm/FeesView'
import ClaimsView from '../components/projects/pm/ClaimsView'
import ReportsView from '../components/projects/pm/ReportsView'
import AuthoritiesView from '../components/projects/pm/AuthoritiesView'
import TeamView from '../components/projects/pm/TeamView'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import StagePipeline from '../components/projects/StagePipeline'
import { getPmRecord, claimDeadlines, daysUntil } from '../data/pmData'
import { scopeOf } from '../data/projectsData'
import { EMPLOYEES } from '../data/hrData'
import { INVOICES } from '../data/financeData'
import { TIMESHEETS } from '../data/timesheetData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'

// Per-project project-controls workspace (Batch 9) — the full PM module from
// PM_RESEARCH.md. Registers live in page state seeded from data/pmData.js; like
// the other modules, edits last for the session (Phase 2 persists them).

export default function ProjectWorkspace({ user, onLogout, projects }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const project = projects.find((p) => p.id === Number(id))
  const [pm, setPm] = useState(() => getPmRecord(Number(id)))
  const [view, setView] = useState('overview')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const canViewSensitive = SENSITIVE_VIEW_ROLES.includes(user?.role)
  const isHrStaff = HR_STAFF_ROLES.includes(user?.role)

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} title="Projects" showBack />
        <div className="max-w-md mx-auto px-6 py-24 text-center text-sm text-gray-500">
          Project not found.{' '}
          <button onClick={() => navigate('/projects')} className="text-brand hover:underline">Back to Projects</button>
        </div>
      </div>
    )
  }

  const scope = scopeOf(project)
  const hasDesign = scope.includes('Design')
  const hasSupervision = scope.includes('Supervision') || project.type === 'Secondment'

  // Badges that make the sidebar itself a status report.
  const claimAlertCount = pm.claims.filter((c) => {
    const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
    if (c.status === 'event_logged' && noticeDue) return daysUntil(noticeDue) <= 10
    if (c.status === 'notice_served' && detailedDue) return daysUntil(detailedDue) <= 10
    return false
  }).length
  const openSite = pm.wirs.filter((w) => w.status !== 'approved' && w.status !== 'approved_as_noted').length
    + pm.ncrs.filter((n) => n.status !== 'closed').length
  const openTasks = pm.tasks.filter((t) => t.status === 'open').length
  const reportsDue = pm.reports.filter((r) => !r.submittedDate).length

  const NAV = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'deliverables', label: 'Deliverables', icon: FileText, show: hasDesign || pm.deliverables.length > 0 },
    { key: 'design', label: 'Design stages', icon: Layers, show: hasDesign },
    { key: 'site', label: 'Site', icon: HardHat, show: hasSupervision, badge: openSite },
    { key: 'schedule', label: 'Schedule', icon: CalendarRange },
    { key: 'tasks', label: 'Tasks', icon: ListTodo, badge: openTasks },
    { key: 'fees', label: 'Fees & cost', icon: Banknote, show: canViewSensitive },
    { key: 'claims', label: 'Claims & EOT', icon: Scale, badge: claimAlertCount },
    { key: 'reports', label: 'Progress reports', icon: ClipboardList, badge: reportsDue },
    { key: 'authorities', label: 'Authorities', icon: Landmark },
    { key: 'team', label: 'Team', icon: Users },
  ].filter((n) => n.show !== false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="Projects" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand mb-3">
          <ArrowLeft size={13} /> All projects
        </button>
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs text-gray-400 font-mono">{project.projectNo}</div>
              <h1 className="text-lg font-semibold text-gray-800">{project.name}</h1>
              <div className="text-xs text-gray-500 mt-0.5">{project.employer} · {project.location} · {scope}</div>
            </div>
            <span className={`text-[11px] px-2 py-1 rounded-full ${project.generalStatus === 'Completed' ? 'bg-green-100 text-green-700' : project.generalStatus === 'On Hold' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {project.generalStatus}
            </span>
          </div>
          <div className="mt-3">
            <StagePipeline stagesInvolved={project.stagesInvolved} currentStage={project.currentStage} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <aside className="w-full sm:w-48 shrink-0 sm:sticky sm:top-6">
            <div className="flex sm:flex-col flex-wrap gap-1">
              {NAV.map((item) => {
                const Icon = item.icon
                const active = view === item.key
                return (
                  <button key={item.key} onClick={() => setView(item.key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition text-left ${active ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}>
                    <Icon size={15} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shrink-0">{item.badge}</span>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="hidden sm:block mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
              Demo registers — edits last for this session. Real persistence, storage, and deadline notifications are Phase 2.
            </div>
          </aside>

          <main className="flex-1 min-w-0 w-full">
            {view === 'overview' && <PmOverview pm={pm} project={project} invoices={INVOICES} onJump={setView} />}
            {view === 'deliverables' && <DeliverablesView pm={pm} onUpdate={setPm} />}
            {view === 'design' && <DesignStagesView pm={pm} onUpdate={setPm} />}
            {view === 'site' && <SiteView pm={pm} onUpdate={setPm} />}
            {view === 'schedule' && <ScheduleView pm={pm} />}
            {view === 'tasks' && <PmTasksView pm={pm} onUpdate={setPm} teamNames={pm.team.map((t) => t.name)} />}
            {view === 'fees' && <FeesView pm={pm} project={project} invoices={INVOICES} timesheets={TIMESHEETS} canViewSensitive={canViewSensitive} onUpdate={setPm} />}
            {view === 'claims' && <ClaimsView pm={pm} onUpdate={setPm} />}
            {view === 'reports' && <ReportsView pm={pm} onUpdate={setPm} />}
            {view === 'authorities' && <AuthoritiesView pm={pm} onUpdate={setPm} />}
            {view === 'team' && <TeamView pm={pm} onUpdate={setPm} employees={EMPLOYEES} onViewEmployee={setSelectedEmployee} />}
          </main>
        </div>
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee} employees={EMPLOYEES} user={user}
          isHrStaff={isHrStaff} canViewSensitive={canViewSensitive}
          onClose={() => setSelectedEmployee(null)} onViewEmployee={setSelectedEmployee} readOnly
        />
      )}
    </div>
  )
}
