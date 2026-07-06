import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Layers, HardHat, CalendarRange, ListTodo,
  Banknote, Scale, ClipboardList, Landmark, Users, ArrowLeft, CalendarCheck2, Info,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import PmOverview from '../components/projects/pm/PmOverview'
import DeliverablesView from '../components/projects/pm/DeliverablesView'
import DesignStagesView from '../components/projects/pm/DesignStagesView'
import SiteView from '../components/projects/pm/SiteView'
import ScheduleView from '../components/projects/pm/ScheduleView'
import PmTasksView from '../components/projects/pm/PmTasksView'
import WeeklyUpdatesView from '../components/projects/pm/WeeklyUpdatesView'
import FeesView from '../components/projects/pm/FeesView'
import ClaimsView from '../components/projects/pm/ClaimsView'
import ReportsView from '../components/projects/pm/ReportsView'
import AuthoritiesView from '../components/projects/pm/AuthoritiesView'
import TeamView from '../components/projects/pm/TeamView'
import ProjectDetailModal from '../components/projects/ProjectDetailModal'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import StagePipeline from '../components/projects/StagePipeline'
import { claimDeadlines, daysUntil, PHASE_META } from '../data/pmData'
import { scopeOf } from '../data/projectsData'
import { EMPLOYEES } from '../data/hrData'
import { INVOICES } from '../data/financeData'
import { TIMESHEETS } from '../data/timesheetData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'

// Per-project project-controls workspace (Batch 9, restructured Batch 10).
// A project is delivered as PHASES — design / supervision / study — each its own
// engagement with its own team, tasks, schedule, fees, and weekly updates.
// Contract administration (claims, monthly reports, authorities) is project-level.
// PM state lives in App.jsx so edits survive navigation and feed "My Work".

export default function ProjectWorkspace({ user, onLogout, projects, pmRecords, onUpdatePm, onUpdateProject, onAddMarketingTask }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const project = projects.find((p) => p.id === Number(id))
  const pm = pmRecords[Number(id)]

  // My Work / dashboard hand over a target section via router state.
  const initial = location.state || {}
  const [sel, setSel] = useState({ phase: initial.phase || null, view: initial.view || 'overview' })
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const canViewSensitive = SENSITIVE_VIEW_ROLES.includes(user?.role)
  const isHrStaff = HR_STAFF_ROLES.includes(user?.role)

  if (!project || !pm) {
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

  const updatePhase = (key, next) => onUpdatePm(project.id, { ...pm, phases: pm.phases.map((ph) => (ph.key === key ? next : ph)) })
  const jump = ({ phase = null, view }) => setSel({ phase, view })

  // Section list per phase, shaped by what that phase actually is.
  const phaseSections = (ph) => [
    { key: 'tasks', label: 'Tasks', icon: ListTodo, badge: ph.tasks.filter((t) => t.status !== 'done').length },
    { key: 'updates', label: 'Weekly updates', icon: CalendarCheck2 },
    ...(ph.deliverables ? [{ key: 'deliverables', label: 'Deliverables', icon: FileText, badge: ph.deliverables.filter((d) => d.status === 'comments' || d.status === 'internal_review').length }] : []),
    ...(ph.designStages ? [{ key: 'design', label: 'Design gates', icon: Layers }] : []),
    ...(ph.wirs ? [{ key: 'site', label: 'Site', icon: HardHat, badge: ph.wirs.filter((w) => w.status !== 'approved' && w.status !== 'approved_as_noted').length + ph.ncrs.filter((n) => n.status !== 'closed').length }] : []),
    { key: 'schedule', label: 'Schedule', icon: CalendarRange },
    ...(canViewSensitive ? [{ key: 'fees', label: 'Fees & cost', icon: Banknote }] : []),
    { key: 'team', label: 'Team', icon: Users },
  ]

  const claimAlertCount = pm.claims.filter((c) => {
    const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
    if (c.status === 'event_logged' && noticeDue) return daysUntil(noticeDue) <= 10
    if (c.status === 'notice_served' && detailedDue) return daysUntil(detailedDue) <= 10
    return false
  }).length
  const reportsDue = pm.reports.filter((r) => !r.submittedDate).length

  const contractSections = [
    { key: 'claims', label: 'Claims & EOT', icon: Scale, badge: claimAlertCount },
    { key: 'reports', label: 'Progress reports', icon: ClipboardList, badge: reportsDue },
    { key: 'authorities', label: 'Authorities', icon: Landmark },
  ]

  const activePhase = sel.phase ? pm.phases.find((ph) => ph.key === sel.phase) : null

  const navBtn = (item, phaseKey = null) => {
    const Icon = item.icon
    const active = sel.view === item.key && sel.phase === phaseKey
    return (
      <button key={`${phaseKey || 'project'}-${item.key}`} onClick={() => setSel({ phase: phaseKey, view: item.key })}
        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition text-left ${active ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}>
        <Icon size={14} className="shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shrink-0">{item.badge}</span>
        )}
      </button>
    )
  }

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
              <div className="text-xs text-gray-500 mt-0.5">{project.employer} · {project.location} · {scopeOf(project)}{project.studyType ? ` (${project.studyType})` : ''}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDetails(true)} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-600 border border-gray-300 hover:border-brand hover:text-brand transition">
                <Info size={12} /> Details
              </button>
              <span className={`text-[11px] px-2 py-1 rounded-full ${project.generalStatus === 'Completed' ? 'bg-green-100 text-green-700' : project.generalStatus === 'On Hold' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {project.generalStatus}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <StagePipeline stagesInvolved={project.stagesInvolved} currentStage={project.currentStage} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <aside className="w-full sm:w-52 shrink-0 sm:sticky sm:top-6 space-y-3">
            <div className="flex sm:flex-col flex-wrap gap-1">
              {navBtn({ key: 'overview', label: 'Overview', icon: LayoutDashboard })}
            </div>

            {pm.phases.map((ph) => {
              const meta = PHASE_META[ph.key] || { label: ph.label, chip: 'bg-gray-100 text-gray-600' }
              return (
                <div key={ph.key}>
                  <div className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded ${meta.chip}`}>{ph.label}</div>
                  <div className="flex sm:flex-col flex-wrap gap-0.5 mt-1">
                    {phaseSections(ph).map((s) => navBtn(s, ph.key))}
                  </div>
                </div>
              )
            })}

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded bg-gray-100 text-gray-500">Contract admin</div>
              <div className="flex sm:flex-col flex-wrap gap-0.5 mt-1">
                {contractSections.map((s) => navBtn(s))}
              </div>
            </div>

            <div className="hidden sm:block rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
              Demo registers — session-only. Real persistence, storage, and deadline notifications are Phase 2.
            </div>
          </aside>

          <main className="flex-1 min-w-0 w-full">
            {sel.view === 'overview' && !sel.phase && <PmOverview pm={pm} project={project} invoices={INVOICES} onJump={jump} />}

            {activePhase && (<>
              {sel.view === 'tasks' && <PmTasksView phase={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} currentUserName={user?.username} />}
              {sel.view === 'updates' && <WeeklyUpdatesView phase={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} currentUserName={user?.username} />}
              {sel.view === 'deliverables' && activePhase.deliverables && <DeliverablesView pm={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} />}
              {sel.view === 'design' && activePhase.designStages && <DesignStagesView pm={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} />}
              {sel.view === 'site' && activePhase.wirs && <SiteView pm={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} />}
              {sel.view === 'schedule' && <ScheduleView pm={activePhase} />}
              {sel.view === 'fees' && <FeesView pm={activePhase} project={project} invoices={INVOICES} timesheets={TIMESHEETS} canViewSensitive={canViewSensitive} onUpdate={(next) => updatePhase(activePhase.key, next)} />}
              {sel.view === 'team' && <TeamView pm={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} employees={EMPLOYEES} onViewEmployee={setSelectedEmployee} />}
            </>)}

            {sel.view === 'claims' && !sel.phase && <ClaimsView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
            {sel.view === 'reports' && !sel.phase && <ReportsView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
            {sel.view === 'authorities' && !sel.phase && <AuthoritiesView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
          </main>
        </div>
      </div>

      {showDetails && (
        <ProjectDetailModal
          project={project} employees={EMPLOYEES} canViewSensitive={canViewSensitive}
          onClose={() => setShowDetails(false)} onViewEmployee={setSelectedEmployee}
          onUpdateProject={onUpdateProject} onAddMarketingTask={onAddMarketingTask}
        />
      )}

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
