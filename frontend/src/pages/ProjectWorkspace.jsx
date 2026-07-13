import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Layers, HardHat, ListTodo,
  Banknote, Scale, Landmark, Users, ArrowLeft, Info,
  ShieldAlert, Receipt,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SubViewTabs from '../components/SubViewTabs'
import PmOverview from '../components/projects/pm/PmOverview'
import AllTasksView from '../components/projects/pm/AllTasksView'
import DeliverablesView from '../components/projects/pm/DeliverablesView'
import DesignStagesView from '../components/projects/pm/DesignStagesView'
import SiteView from '../components/projects/pm/SiteView'
import ScheduleView from '../components/projects/pm/ScheduleView'
import PlanView from '../components/projects/pm/PlanView'
import WeeklyUpdatesView from '../components/projects/pm/WeeklyUpdatesView'
import FeesView from '../components/projects/pm/FeesView'
import ClaimsView from '../components/projects/pm/ClaimsView'
import ReportsView from '../components/projects/pm/ReportsView'
import AuthoritiesView from '../components/projects/pm/AuthoritiesView'
import TeamView from '../components/projects/pm/TeamView'
import { RisksView, MeetingsView, PaymentsView, HandoverView, ConstructionFeedbackView } from '../components/projects/pm/GovernanceViews'
import TransmittalsView from '../components/projects/pm/TransmittalsView'
import RfiView from '../components/projects/pm/RfiView'
import GateCoordinationView from '../components/projects/pm/GateCoordinationView'
import PhotoReportView from '../components/projects/pm/PhotoReportView'
import SafetyLogView from '../components/projects/pm/SafetyLogView'
import QuickDailyEntry from '../components/projects/pm/QuickDailyEntry'
import ProjectDetailModal from '../components/projects/ProjectDetailModal'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import StagePipeline from '../components/projects/StagePipeline'
import { claimDeadlines, daysUntil, PHASE_META } from '../data/pmData'
import { scopeOf } from '../data/projectsData'
import { EMPLOYEES } from '../data/hrData'
import { INVOICES } from '../data/financeData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'

// Per-project project-controls workspace (Batch 9, restructured Batch 10).
// A project is delivered as PHASES — design / supervision / study — each its own
// engagement with its own team, tasks, schedule, fees, and weekly updates.
// Contract administration (claims, monthly reports, authorities) is project-level.
// PM state lives in App.jsx so edits survive navigation and feed "My Work".

export default function ProjectWorkspace({ user, onLogout, projects, pmRecords, timesheets = [], onLogTaskHours, onUpdatePm, onUpdateProject, onAddMarketingTask, invoices = INVOICES }) {
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

  // Intent groups per phase (Batch 23 — same sidebar-groups + sub-view-tabs
  // pattern as the module pages, SPEC §4). A Design+Supervision project had
  // grown to ~25 sidebar items; groups take a phase from up to 11 rows to 4–6.
  // View keys unchanged so My Work / notification deep-links still land.
  const phaseGroups = (ph) => {
    const openTasks = (ph.tasks || []).filter((t) => t.status !== 'done').length
    const delivBadge = ph.deliverables ? ph.deliverables.filter((d) => d.status === 'comments' || d.status === 'internal_review').length : 0
    const siteBadge = ph.wirs ? ph.wirs.filter((w) => w.status !== 'approved' && w.status !== 'approved_as_noted').length + (ph.ncrs || []).filter((n) => n.status !== 'closed').length : 0
    const rfiBadge = (ph.rfis || []).filter((r) => r.status === 'open').length
    const hseBadge = (ph.safetyObservations || []).filter((o) => o.status === 'open').length
    return [
      {
        key: 'g-plan', label: 'Plan & progress', icon: ListTodo, badge: openTasks,
        views: [
          { key: 'tasks', label: 'Tasks', badge: openTasks },
          { key: 'updates', label: 'Weekly updates' },
          { key: 'schedule', label: 'Schedule' },
        ],
      },
      ...(ph.deliverables ? [{
        key: 'g-docs', label: 'Deliverables', icon: FileText, badge: delivBadge,
        views: [
          { key: 'deliverables', label: 'Register', badge: delivBadge },
          { key: 'transmittals', label: 'Transmittals' },
        ],
      }] : []),
      ...(ph.designStages ? [{
        key: 'g-gates', label: 'Design gates', icon: Layers,
        views: [
          { key: 'design', label: 'Gates' },
          { key: 'gatecoord', label: 'Coordination' },
        ],
      }] : []),
      ...(ph.wirs ? [{
        key: 'g-site', label: 'Site', icon: HardHat, badge: siteBadge + rfiBadge + hseBadge,
        views: [
          { key: 'site', label: 'Registers', badge: siteBadge },
          { key: 'rfis', label: 'RFIs', badge: rfiBadge },
          { key: 'hse', label: 'Safety log', badge: hseBadge },
          { key: 'quickdaily', label: 'Quick daily' },
        ],
      }] : []),
      ...(canViewSensitive ? [{ key: 'g-fees', label: 'Fees & cost', icon: Banknote, views: [{ key: 'fees' }] }] : []),
      { key: 'g-team', label: 'Team', icon: Users, views: [{ key: 'team' }] },
    ]
  }

  const claimAlertCount = pm.claims.filter((c) => {
    const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
    if (c.status === 'event_logged' && noticeDue) return daysUntil(noticeDue) <= 10
    if (c.status === 'notice_served' && detailedDue) return daysUntil(detailedDue) <= 10
    return false
  }).length
  const reportsDue = pm.reports.filter((r) => !r.submittedDate).length

  const hasSupervision = pm.phases.some((ph) => ph.key === 'supervision')
  const openActions = (pm.meetings || []).reduce((s, m) => s + m.actions.filter((a) => a.status !== 'done').length, 0)
  const openRisks = (pm.risks || []).filter((r) => r.status === 'open' || r.status === 'mitigating').length

  const feedbackBadge = (pm.constructionFeedback || []).filter((f) => f.status !== 'completed').length
  const contractGroups = [
    {
      key: 'g-claims', label: 'Claims & reports', icon: Scale, badge: claimAlertCount + reportsDue,
      views: [
        { key: 'claims', label: 'Claims & EOT', badge: claimAlertCount },
        { key: 'reports', label: 'Progress reports', badge: reportsDue },
        ...(hasSupervision ? [{ key: 'photoreport', label: 'Photo report (4.21)' }] : []),
      ],
    },
    { key: 'g-auth', label: 'Authorities', icon: Landmark, views: [{ key: 'authorities' }] },
    {
      key: 'g-gov', label: 'Risks & meetings', icon: ShieldAlert, badge: openRisks + openActions,
      views: [
        { key: 'risks', label: 'Risks', badge: openRisks },
        { key: 'meetings', label: 'Meetings & actions', badge: openActions },
      ],
    },
    ...(hasSupervision ? [{
      key: 'g-closeout', label: 'Commercial & close-out', icon: Receipt, badge: feedbackBadge,
      views: [
        { key: 'payments', label: 'Payments (IPC)' },
        { key: 'handover', label: 'Handover' },
        { key: 'cfeedback', label: 'Site feedback', badge: feedbackBadge },
      ],
    }] : []),
  ]

  const activePhase = sel.phase ? pm.phases.find((ph) => ph.key === sel.phase) : null

  // The sidebar group the current selection lives in (drives the tab row).
  const activeGroup = sel.phase
    ? (activePhase ? phaseGroups(activePhase).find((g) => g.views.some((v) => v.key === sel.view)) : null)
    : contractGroups.find((g) => g.views.some((v) => v.key === sel.view)) || null

  // item = a group: clicking selects its first view; active when it owns sel.view.
  const navBtn = (item, phaseKey = null) => {
    const Icon = item.icon
    const active = sel.phase === phaseKey && item.views.some((v) => v.key === sel.view)
    return (
      <button key={`${phaseKey || 'project'}-${item.key}`} onClick={() => setSel({ phase: phaseKey, view: item.views[0].key })}
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
              {navBtn({ key: 'overview', label: 'Overview', icon: LayoutDashboard, views: [{ key: 'overview' }] })}
              {navBtn({ key: 'alltasks', label: 'All tasks', icon: ListTodo, views: [{ key: 'alltasks' }], badge: pm.phases.reduce((s, ph) => s + ph.tasks.filter((t) => t.status !== 'done').length, 0) })}
            </div>

            {pm.phases.map((ph) => {
              const meta = PHASE_META[ph.key] || { label: ph.label, chip: 'bg-gray-100 text-gray-600' }
              return (
                <div key={ph.key}>
                  <div className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded ${meta.chip}`}>{ph.label}</div>
                  <div className="flex sm:flex-col flex-wrap gap-0.5 mt-1">
                    {phaseGroups(ph).map((g) => navBtn(g, ph.key))}
                  </div>
                </div>
              )
            })}

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded bg-gray-100 text-gray-500">Contract admin</div>
              <div className="flex sm:flex-col flex-wrap gap-0.5 mt-1">
                {contractGroups.map((g) => navBtn(g))}
              </div>
            </div>

            <div className="hidden sm:block rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
              Demo registers — session-only. Real persistence, storage, and deadline notifications are Phase 2.
            </div>
          </aside>

          <main className="flex-1 min-w-0 w-full">
            <SubViewTabs views={activeGroup?.views} active={sel.view} onSelect={(v) => setSel({ phase: sel.phase, view: v })} />
            {sel.view === 'alltasks' && !sel.phase && <AllTasksView pm={pm} onUpdatePm={(next) => onUpdatePm(project.id, next)} currentUserName={user?.username} onLogHours={onLogTaskHours ? (assignee, hours, date) => onLogTaskHours(assignee, project.id, hours, date) : null} />}
            {sel.view === 'overview' && !sel.phase && <PmOverview pm={pm} project={project} invoices={invoices} onJump={jump} canViewSensitive={canViewSensitive} />}

            {activePhase && (<>
              {sel.view === 'tasks' && <PlanView pm={pm} phase={activePhase} onUpdatePhase={(next) => updatePhase(activePhase.key, next)} onUpdatePm={(next) => onUpdatePm(project.id, next)} currentUserName={user?.username} onLogHours={onLogTaskHours ? (assignee, hours, date) => onLogTaskHours(assignee, project.id, hours, date) : null} />}
              {sel.view === 'updates' && <WeeklyUpdatesView phase={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} currentUserName={user?.username} />}
              {sel.view === 'deliverables' && activePhase.deliverables && <DeliverablesView pm={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} />}
              {sel.view === 'transmittals' && activePhase.deliverables && <TransmittalsView phase={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} project={project} />}
              {sel.view === 'design' && activePhase.designStages && <DesignStagesView pm={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} />}
              {sel.view === 'gatecoord' && activePhase.designStages && <GateCoordinationView phase={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} currentUserName={user?.username} />}
              {sel.view === 'site' && activePhase.wirs && <SiteView pm={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} />}
              {sel.view === 'quickdaily' && activePhase.wirs && <QuickDailyEntry phase={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} />}
              {sel.view === 'rfis' && activePhase.wirs && <RfiView phase={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} currentUserName={user?.username} />}
              {sel.view === 'hse' && activePhase.wirs && <SafetyLogView phase={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} currentUserName={user?.username} />}
              {sel.view === 'schedule' && <ScheduleView pm={activePhase} />}
              {sel.view === 'fees' && <FeesView pm={activePhase} project={project} invoices={invoices} timesheets={timesheets} totalManhourBudget={pm.phases.reduce((s, ph) => s + (ph.fees.manhourBudget || 0), 0)} canViewSensitive={canViewSensitive} onUpdate={(next) => updatePhase(activePhase.key, next)} />}
              {sel.view === 'team' && <TeamView pm={activePhase} onUpdate={(next) => updatePhase(activePhase.key, next)} employees={EMPLOYEES} onViewEmployee={setSelectedEmployee} />}
            </>)}

            {sel.view === 'claims' && !sel.phase && <ClaimsView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
            {sel.view === 'reports' && !sel.phase && <ReportsView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
            {sel.view === 'photoreport' && !sel.phase && <PhotoReportView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} project={project} />}
            {sel.view === 'authorities' && !sel.phase && <AuthoritiesView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
            {sel.view === 'risks' && !sel.phase && <RisksView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
            {sel.view === 'meetings' && !sel.phase && <MeetingsView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
            {sel.view === 'payments' && !sel.phase && <PaymentsView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
            {sel.view === 'handover' && !sel.phase && <HandoverView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} />}
            {sel.view === 'cfeedback' && !sel.phase && <ConstructionFeedbackView pm={pm} onUpdate={(next) => onUpdatePm(project.id, next)} project={project} onUpdateProject={onUpdateProject} currentUserName={user?.username} />}
          </main>
        </div>
      </div>

      {showDetails && (
        <ProjectDetailModal
          project={project} employees={EMPLOYEES} canViewSensitive={canViewSensitive} invoices={invoices}
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
