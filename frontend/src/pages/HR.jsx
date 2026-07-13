import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ArrowRight, Users, Building2, UserPlus, List, Network, Award, AlertTriangle,
  Home, ClipboardList, Briefcase, GraduationCap, Inbox,
  Banknote, CalendarDays, Plane, FileText, ShieldAlert,
  Landmark, TrendingUp, FileUser, Clock, ClipboardCheck, CreditCard,
  Star, LogOut,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SidebarNav from '../components/SidebarNav'
import SubViewTabs from '../components/SubViewTabs'
import OnboardingChecklist from '../components/hr/OnboardingChecklist'
import EmployeeList from '../components/hr/EmployeeList'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import LeaveRequestModal from '../components/hr/LeaveRequestModal'
import LeaveRequestsList from '../components/hr/LeaveRequestsList'
import LeaveDashboard from '../components/hr/LeaveDashboard'
import AccomplishmentsSearch from '../components/hr/AccomplishmentsSearch'
import CvSearch from '../components/hr/CvSearch'
import OrgChart from '../components/hr/OrgChart'
import RenewalsReport, { buildRenewalItems } from '../components/hr/RenewalsReport'
import CertificateRequestModal from '../components/hr/CertificateRequestModal'
import CertificateLetterModal from '../components/hr/CertificateLetterModal'
import ComplaintModal from '../components/hr/ComplaintModal'
import MyRequests from '../components/hr/MyRequests'
import HRInbox, { buildInboxItems } from '../components/hr/HRInbox'
import PayrollTab from '../components/hr/PayrollTab'
import HolidaysTab from '../components/hr/HolidaysTab'
import CareersTab from '../components/hr/CareersTab'
import AttendanceTab from '../components/hr/AttendanceTab'
import TimesheetInsights from '../components/hr/TimesheetInsights'
import NewJoinerWizard from '../components/hr/NewJoinerWizard'
import NewJoinerReviewModal from '../components/hr/NewJoinerReviewModal'
import AddEmployeeModal from '../components/hr/AddEmployeeModal'
import OffboardingTab from '../components/hr/OffboardingTab'
import ProTasksView from '../components/hr/ProTasksView'
import StaffPlanningTab from '../components/hr/StaffPlanningTab'
import MyTimesheet from '../components/hr/MyTimesheet'
import TimesheetApprovals from '../components/hr/TimesheetApprovals'
import BusinessCardRequestModal from '../components/hr/BusinessCardRequestModal'
import AppraisalsView from '../components/hr/AppraisalsView'
import TrainingTab from '../components/hr/TrainingTab'
import WarningsRegister from '../components/hr/WarningsRegister'
import ExitInterviews from '../components/hr/ExitInterviews'
import HeadcountDashboard from '../components/hr/HeadcountDashboard'
import GradesBands from '../components/hr/GradesBands'
import {
  APPRAISALS, ENROLLMENTS, TRAINING_COURSES, WARNINGS, EXIT_INTERVIEWS,
} from '../data/hrTalentData'
import {
  HR_STATS, EMPLOYEES, LEAVE_REQUESTS, CERTIFICATE_REQUESTS, COMPLAINTS, OPEN_POSITIONS, CANDIDATES,
  ANNUAL_LEAVE_ENTITLEMENT, NEW_JOINERS, OFFBOARDINGS, PRO_TASKS, STAFF_PLANS, REFERRAL_BONUS_AED,
  BUSINESS_CARD_REQUESTS, LEAVE_PENDING_STATUSES, leaveStatusForNew,
} from '../data/hrData'
import { weekStartOf, addDays, toLocalISO } from '../data/timesheetData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'
import { parseLocalDate, todayLocal, todayISO } from '../utils/date'
import { nextId } from '../utils/id'

export default function HR({ user, onLogout, holidays = [], onUpdateHolidays, projects = [], onEmployeeAdded, timesheets = [], setTimesheets, staffingRequests = [], onUpdateStaffingRequests }) {
  const location = useLocation()
  // Home-page quick actions deep-link straight to a view (e.g. Fill Timesheet)
  const [view, setView] = useState(location.state?.view || 'myhr')
  const [peopleView, setPeopleView] = useState('list')
  const [plannerView, setPlannerView] = useState('calendar')
  const [employees, setEmployees] = useState(EMPLOYEES)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [leaveRequests, setLeaveRequests] = useState(LEAVE_REQUESTS)
  const [certificateRequests, setCertificateRequests] = useState(CERTIFICATE_REQUESTS)
  const [complaints, setComplaints] = useState(COMPLAINTS)
  const [candidates, setCandidates] = useState(CANDIDATES)
  const [newJoiners, setNewJoiners] = useState(NEW_JOINERS)
  const [offboardings, setOffboardings] = useState(OFFBOARDINGS)
  const [proTasks, setProTasks] = useState(PRO_TASKS)
  const [staffPlans, setStaffPlans] = useState(STAFF_PLANS)
  const [businessCardRequests, setBusinessCardRequests] = useState(BUSINESS_CARD_REQUESTS)
  const [appraisals, setAppraisals] = useState(APPRAISALS)
  const [enrollments, setEnrollments] = useState(ENROLLMENTS)
  const [warnings, setWarnings] = useState(WARNINGS)
  const [exits, setExits] = useState(EXIT_INTERVIEWS)
  const [referralBonuses, setReferralBonuses] = useState([])
  const [reviewJoiner, setReviewJoiner] = useState(null)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [showConcernModal, setShowConcernModal] = useState(false)
  const [letterRequest, setLetterRequest] = useState(null)

  const isHrStaff = HR_STAFF_ROLES.includes(user?.role)
  const canViewSensitive = SENSITIVE_VIEW_ROLES.includes(user?.role)
  const isNewHire = !!user?.isNewHire
  const isPro = user?.role === 'pro'

  const matchedEmployee = employees.find((e) => e.name.toLowerCase() === (user?.username || '').toLowerCase())
  const myName = (matchedEmployee?.name || user?.username || '').toLowerCase()

  // Line-manager lens: anyone with direct reports approves their team's timesheets.
  const myTeam = matchedEmployee ? employees.filter((e) => e.managerId === matchedEmployee.id) : []
  const isManager = myTeam.length > 0
  const teamIds = new Set(myTeam.map((e) => e.id))
  const teamTimesheets = timesheets.filter((t) => teamIds.has(t.employeeId))

  const pendingJoiners = newJoiners.filter((j) => j.status === 'submitted')
  const inboxCount = isHrStaff ? buildInboxItems({ leaveRequests, certificateRequests, complaints, candidates, businessCardRequests }).length + pendingJoiners.length : 0

  // Leave two-step chain: the manager's team-leave queue (step 1), then HR (step 2).
  const teamLeavePending = leaveRequests.filter((r) => teamIds.has(r.employeeId) && r.status === 'pending_manager')

  // Probation endings within 60 days (guaranteed increments must not be missed)
  const probationDue = canViewSensitive
    ? employees.filter((e) => e.probation && !e.probation.guaranteedIncrement?.applied &&
        parseLocalDate(e.probation.endDate) >= todayLocal() &&
        (parseLocalDate(e.probation.endDate) - todayLocal()) / (1000 * 60 * 60 * 24) <= 60)
    : []
  const renewalItems = canViewSensitive ? buildRenewalItems(employees) : []
  const overdueCount = renewalItems.filter((i) => i.days < 0).length

  const myLeaveUsed = matchedEmployee
    ? leaveRequests.filter((r) => r.employeeId === matchedEmployee.id && r.status === 'approved' && r.type === 'Vacation').reduce((s, r) => s + r.days, 0)
    : null
  const myPendingCount =
    leaveRequests.filter((r) => r.employeeName.toLowerCase() === myName && LEAVE_PENDING_STATUSES.includes(r.status)).length +
    certificateRequests.filter((r) => r.employeeName.toLowerCase() === myName && r.status === 'pending').length +
    businessCardRequests.filter((r) => r.employeeName.toLowerCase() === myName && r.status === 'pending').length +
    complaints.filter((c) => !c.anonymous && (c.submittedBy || '').toLowerCase() === myName && c.status !== 'resolved').length

  // Talent & development badges/handlers (appraisals, training, warnings, exits)
  const myAppraisalPending = matchedEmployee ? appraisals.filter((a) => a.employeeId === matchedEmployee.id && a.status === 'self').length : 0
  const teamAppraisalsPending = appraisals.filter((a) => teamIds.has(a.employeeId) && a.status === 'manager').length
  const hrSignoffPending = appraisals.filter((a) => a.status === 'hr').length
  const trainingPending = enrollments.filter((e) => e.status === 'requested').length

  const updateAppraisal = (a) => setAppraisals(appraisals.map((x) => (x.id === a.id ? a : x)))

  const requestEnrollment = (courseId, justification) => {
    setEnrollments([...enrollments, {
      id: nextId(enrollments),
      courseId,
      employeeId: matchedEmployee?.id || null,
      employeeName: matchedEmployee?.name || user?.username || 'Unknown',
      justification,
      status: 'requested',
      requestedDate: todayISO(),
      decidedDate: null,
      completedDate: null,
    }])
  }
  const decideEnrollment = (id, approve) => {
    setEnrollments(enrollments.map((e) => (e.id === id ? { ...e, status: approve ? 'approved' : 'declined', decidedDate: todayISO() } : e)))
  }
  // Completion auto-adds an accomplishment to the employee record (mapped to
  // the existing ACCOMPLISHMENT_TYPES via the course's accomplishmentType).
  const completeEnrollment = (id) => {
    const en = enrollments.find((e) => e.id === id)
    const course = TRAINING_COURSES.find((c) => c.id === en?.courseId)
    const today = todayISO()
    setEnrollments(enrollments.map((e) => (e.id === id ? { ...e, status: 'completed', completedDate: today } : e)))
    if (en?.employeeId && course && employees.some((e) => e.id === en.employeeId)) {
      handleAddAccomplishment(en.employeeId, { type: course.accomplishmentType, issuer: course.provider, date: today, expiryDate: null })
    }
  }

  const issueWarning = (w) => setWarnings([...warnings, { ...w, id: nextId(warnings) }])
  const acknowledgeWarning = (id) => setWarnings(warnings.map((w) => (w.id === id ? { ...w, acknowledged: true, acknowledgedDate: todayISO() } : w)))
  const logExit = (rec) => setExits([...exits, { ...rec, id: nextId(exits) }])

  const nextHoliday = holidays
    .filter((h) => h.status === 'approved' && parseLocalDate(h.endDate || h.date) >= todayLocal())
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  // Timesheets: upsert my week; count submitted weeks for the approvals badge;
  // count last week's non-submitters for the payroll hold flag.
  const saveTimesheet = (ts) => {
    if (ts.id) setTimesheets((prev) => prev.map((t) => (t.id === ts.id ? ts : t)))
    else setTimesheets((prev) => [...prev, { ...ts, id: nextId(prev) }])
  }
  const actionTimesheet = (ts) => {
    setTimesheets((prev) => prev.map((t) => (t.id === ts.id ? { ...ts, approvedBy: ts.status === 'approved' ? user?.username : null } : t)))
  }
  const submittedTimesheets = timesheets.filter((t) => t.status === 'submitted').length
  const lastWeekISO = toLocalISO(addDays(weekStartOf(new Date()), -7))
  const timesheetHold = canViewSensitive
    ? employees.filter((e) => e.status === 'active' &&
        !timesheets.some((t) => t.employeeId === e.id && t.weekStart === lastWeekISO && (t.status === 'submitted' || t.status === 'approved'))).length
    : 0

  const NAV_MAIN = [
    { key: 'myhr', label: 'My HR', icon: Home },
    { key: 'people', label: 'People', icon: Users },
    { key: 'mytimesheet', label: 'My timesheet', icon: Clock },
    ...(isManager ? [
      { key: 'teamtimesheets', label: 'Team timesheets', icon: ClipboardCheck, badge: teamTimesheets.filter((t) => t.status === 'submitted').length },
      { key: 'teamleave', label: 'Team leave', icon: Plane, badge: teamLeavePending.length },
      { key: 'teamappraisals', label: 'Team appraisals', icon: Star, badge: teamAppraisalsPending },
    ] : []),
    { key: 'myappraisal', label: 'My appraisal', icon: Star, badge: myAppraisalPending },
    { key: 'training', label: 'Training', icon: GraduationCap },
    { key: 'requests', label: 'My requests', icon: ClipboardList, badge: myPendingCount },
    { key: 'careers', label: 'Careers', icon: Briefcase },
    ...(isNewHire ? [
      { key: 'profile', label: 'My profile setup', icon: UserPlus },
      { key: 'onboarding', label: 'Onboarding', icon: GraduationCap },
    ] : []),
  ]

  // HR workspace, grouped by intent (same IA pattern as Finance: sidebar groups →
  // sub-view tabs). Old view keys are unchanged so HelpHub deep-links still land.
  const offboardingCount = offboardings.filter((o) => o.status === 'in_progress').length
  const proOpenCount = proTasks.filter((t) => t.status !== 'done').length
  const WS_GROUPS = [
    ...(isHrStaff ? [{
      key: 'g-inbox', label: 'Inbox', icon: Inbox, badge: inboxCount,
      views: [{ key: 'inbox' }],
    }] : []),
    ...(canViewSensitive ? [
      {
        key: 'g-time', label: 'Time & leave', icon: ClipboardCheck, badge: submittedTimesheets,
        views: [
          { key: 'timesheets', label: 'Timesheets', badge: submittedTimesheets },
          { key: 'tsinsights', label: 'Insights' },
          { key: 'attendance', label: 'Attendance' },
          { key: 'leaveplanner', label: 'Leave planner' },
        ],
      },
      {
        key: 'g-pay', label: 'Pay & planning', icon: Banknote,
        views: [
          { key: 'payroll', label: 'Payroll' },
          { key: 'staffplan', label: 'Staff planning' },
          { key: 'headcount', label: 'Headcount & attrition' },
          { key: 'gradesbands', label: 'Grades & bands' },
        ],
      },
    ] : []),
    ...(isHrStaff ? [
      {
        key: 'g-perf', label: 'Performance', icon: Star, badge: hrSignoffPending + trainingPending,
        views: [
          { key: 'appraisalcycle', label: 'Appraisal cycle', badge: hrSignoffPending },
          { key: 'trainingapprovals', label: 'Training approvals', badge: trainingPending },
          { key: 'warnings', label: 'Disciplinary' },
        ],
      },
      {
        key: 'g-exits', label: 'Exits', icon: LogOut, badge: offboardingCount,
        views: [
          { key: 'offboarding', label: 'Offboarding', badge: offboardingCount },
          { key: 'exitinterviews', label: 'Exit interviews' },
        ],
      },
    ] : []),
    ...(canViewSensitive || isHrStaff ? [{
      key: 'g-admin', label: 'Compliance & admin', icon: Landmark,
      badge: (canViewSensitive ? overdueCount : 0) + (isHrStaff ? proOpenCount : 0),
      views: [
        ...(canViewSensitive ? [{ key: 'renewals', label: 'Renewals', badge: overdueCount }] : []),
        ...(isHrStaff ? [
          { key: 'protasks', label: 'PRO tasks', badge: proOpenCount },
          { key: 'holidays', label: 'Holidays' },
        ] : []),
      ],
    }] : []),
  ]
  const activeWsGroup = WS_GROUPS.find((g) => g.views.some((v) => v.key === view))

  const handleAddDependent = (employeeId, dependent) => {
    setEmployees(employees.map((e) => (e.id === employeeId ? { ...e, dependents: [...e.dependents, dependent] } : e)))
    setSelectedEmployee((prev) => (prev && prev.id === employeeId ? { ...prev, dependents: [...prev.dependents, dependent] } : prev))
  }

  const handleAddAccomplishment = (employeeId, acc) => {
    setEmployees(employees.map((e) => (e.id === employeeId ? { ...e, accomplishments: [...e.accomplishments, acc] } : e)))
    setSelectedEmployee((prev) => (prev && prev.id === employeeId ? { ...prev, accomplishments: [...prev.accomplishments, acc] } : prev))
  }

  const handleUpdateDocuments = (employeeId, documents) => {
    setEmployees(employees.map((e) => (e.id === employeeId ? { ...e, documents } : e)))
    setSelectedEmployee((prev) => (prev && prev.id === employeeId ? { ...prev, documents } : prev))
  }

  const handleVerifyAccomplishment = (employeeId, idx) => {
    const verify = (accs) => accs.map((a, i) => (i === idx ? { ...a, verified: true } : a))
    setEmployees(employees.map((e) => (e.id === employeeId ? { ...e, accomplishments: verify(e.accomplishments) } : e)))
    setSelectedEmployee((prev) => (prev && prev.id === employeeId ? { ...prev, accomplishments: verify(prev.accomplishments) } : prev))
  }

  // One place candidates advance from (Careers + Inbox): a hired referral
  // automatically awards the flat AED 500 referral gift to the referrer.
  const advanceCandidate = (id, next) => {
    const candidate = candidates.find((c) => c.id === id)
    setCandidates(candidates.map((c) => (c.id === id ? { ...c, status: next } : c)))
    if (next === 'hired' && candidate?.referredBy) {
      setReferralBonuses([...referralBonuses, {
        id: referralBonuses.length + 1,
        referrer: candidate.referredBy,
        candidate: candidate.candidateName,
        amount: REFERRAL_BONUS_AED,
        awardedDate: todayISO(),
        status: 'pending_payroll',
      }])
    }
  }

  // Both paths that create an employee record notify Marketing (headshot + welcome email tasks).
  const addEmployeeRecord = (record) => {
    const created = { ...record, id: nextId(employees) }
    setEmployees([...employees, created])
    onEmployeeAdded?.(created)
    return created
  }

  const handleApproveJoiner = (joinerId, employeeRecord) => {
    addEmployeeRecord(employeeRecord)
    setNewJoiners(newJoiners.map((j) => (j.id === joinerId ? { ...j, status: 'approved' } : j)))
  }

  // Two-step leave chain: line manager first, then HR final approval.
  const handleLeaveAction = (id, status) => {
    setLeaveRequests(leaveRequests.map((r) => (r.id === id
      ? {
          ...r, status, decidedDate: todayISO(),
          approvedBy: status === 'approved' ? user?.username : null,
          approvedDate: status === 'approved' ? todayISO() : null,
        }
      : r)))
  }
  // Manager step: approve forwards the request to HR; deny ends it.
  const handleManagerLeaveAction = (id, approve) => {
    setLeaveRequests(leaveRequests.map((r) => (r.id === id
      ? approve
        ? { ...r, status: 'pending_hr', managerApprovedBy: user?.username, managerApprovedDate: todayISO() }
        : { ...r, status: 'denied' }
      : r)))
  }

  const handleFulfilCard = (id) => {
    setBusinessCardRequests(businessCardRequests.map((r) => (r.id === id ? { ...r, status: 'delivered', resolvedDate: todayISO() } : r)))
  }

  const handleRejectCert = (id) => {
    setCertificateRequests(certificateRequests.map((r) => (r.id === id ? { ...r, status: 'rejected', resolvedDate: todayISO() } : r)))
  }

  const handleSaveLetter = (requestId, letterText) => {
    setCertificateRequests(certificateRequests.map((r) => (r.id === requestId
      ? { ...r, letterText, status: 'issued', resolvedDate: r.resolvedDate || todayISO() }
      : r)))
  }

  // The PRO company sees only its task queue — no employee data, no HR workspace.
  if (isPro) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} title="PRO Tasks" showBack />
        <div className="max-w-4xl mx-auto px-6 py-6">
          <ProTasksView
            tasks={proTasks}
            isPro
            onUpdate={(t) => setProTasks(proTasks.map((x) => (x.id === t.id ? t : x)))}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="HR" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <SidebarNav
          groups={[
            { items: NAV_MAIN },
            { label: 'HR Workspace', items: WS_GROUPS.map(({ key, label, icon, badge }) => ({ key, label, icon, badge })) },
          ]}
          active={activeWsGroup ? activeWsGroup.key : view}
          onSelect={(key) => {
            const group = WS_GROUPS.find((g) => g.key === key)
            setView(group ? group.views[0].key : key)
          }}
        />

        <main className="flex-1 min-w-0 w-full">
          <SubViewTabs views={activeWsGroup?.views} active={view} onSelect={setView} />
          {view === 'myhr' && (
            <div className="space-y-6">
              {canViewSensitive && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <Users size={18} className="text-brand mb-2" />
                    <div className="text-xs text-gray-500">Total Employees</div>
                    <div className="text-2xl font-bold text-gray-800">{HR_STATS.totalEmployees}</div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <Building2 size={18} className="text-brand mb-2" />
                    <div className="text-xs text-gray-500">Departments</div>
                    <div className="text-2xl font-bold text-gray-800">{HR_STATS.departments}</div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <UserPlus size={18} className="text-brand mb-2" />
                    <div className="text-xs text-gray-500">New Hires This Month</div>
                    <div className="text-2xl font-bold text-gray-800">{HR_STATS.newHiresThisMonth}</div>
                  </div>
                </div>
              )}

              {isHrStaff && inboxCount > 0 && (
                <button
                  onClick={() => setView('inbox')}
                  className="w-full bg-white border border-blue-200 rounded-lg shadow-sm p-4 text-left hover:border-blue-300 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Inbox size={20} className="text-blue-600" />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{inboxCount} item{inboxCount > 1 ? 's' : ''} waiting in your inbox</div>
                      <div className="text-xs text-gray-500">Leave, certificates, business cards, concerns, and candidates — oldest first.</div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 shrink-0" />
                </button>
              )}

              {canViewSensitive && renewalItems.length > 0 && (
                <button
                  onClick={() => setView('renewals')}
                  className={`w-full bg-white border rounded-lg shadow-sm p-4 text-left transition flex items-center justify-between ${overdueCount > 0 ? 'border-red-200 hover:border-red-300' : 'border-amber-200 hover:border-amber-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className={overdueCount > 0 ? 'text-red-600' : 'text-amber-600'} />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {overdueCount > 0 && `${overdueCount} overdue, `}{renewalItems.length - overdueCount} renewal{renewalItems.length - overdueCount === 1 ? '' : 's'} due within 90 days
                      </div>
                      <div className="text-xs text-gray-500">Visas, passports, contracts, and insurance — employees and their dependents.</div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 shrink-0" />
                </button>
              )}

              {probationDue.length > 0 && (
                <div className="bg-white border border-emerald-200 rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={20} className="text-emerald-600" />
                    <div className="text-sm font-semibold text-gray-800">Probation ending soon</div>
                  </div>
                  {probationDue.map((e) => (
                    <div key={e.id} className="flex justify-between items-center text-sm py-1">
                      <button onClick={() => setSelectedEmployee(e)} className="text-brand hover:underline font-medium">{e.name}</button>
                      <span className="text-xs text-gray-500">
                        Ends {parseLocalDate(e.probation.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {e.probation.guaranteedIncrement && ` — guaranteed increment AED ${e.probation.guaranteedIncrement.amount.toLocaleString()} due`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isNewHire && (
                <button
                  onClick={() => setView('profile')}
                  className="w-full bg-white border border-brand/30 rounded-lg shadow-sm p-4 text-left hover:border-brand transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus size={20} className="text-brand" />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Complete your employee profile</div>
                      <div className="text-xs text-gray-500">Personal details, qualifications, documents & bank — four short steps, then HR takes over.</div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 shrink-0" />
                </button>
              )}

              {isNewHire && (
                <button
                  onClick={() => setView('onboarding')}
                  className="w-full bg-gradient-to-br from-brand to-brand-dark rounded-lg shadow-md p-6 text-left text-white hover:scale-[1.005] transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/80 mb-1">New here?</div>
                    <div className="text-lg font-bold">Complete your onboarding checklist</div>
                    <p className="text-sm text-white/80 mt-1">Policies, working hours, safety induction, and how-tos — read, watch, and acknowledge.</p>
                  </div>
                  <ArrowRight size={22} className="shrink-0" />
                </button>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <button onClick={() => setShowLeaveModal(true)} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-left hover:border-brand hover:shadow-md transition">
                  <Plane size={18} className="text-brand mb-2" />
                  <div className="text-sm font-semibold text-gray-800">Request leave</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {myLeaveUsed !== null ? `${ANNUAL_LEAVE_ENTITLEMENT - myLeaveUsed} of ${ANNUAL_LEAVE_ENTITLEMENT} days left` : 'Annual, sick & more'}
                  </div>
                </button>
                <button onClick={() => setShowCertModal(true)} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-left hover:border-brand hover:shadow-md transition">
                  <FileText size={18} className="text-brand mb-2" />
                  <div className="text-sm font-semibold text-gray-800">Request certificate</div>
                  <div className="text-xs text-gray-500 mt-0.5">Salary, NOC, embassy…</div>
                </button>
                <button onClick={() => setShowCardModal(true)} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-left hover:border-brand hover:shadow-md transition">
                  <CreditCard size={18} className="text-brand mb-2" />
                  <div className="text-sm font-semibold text-gray-800">Business card</div>
                  <div className="text-xs text-gray-500 mt-0.5">Printed &amp; delivered by HR</div>
                </button>
                <button onClick={() => setShowConcernModal(true)} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-left hover:border-brand hover:shadow-md transition">
                  <ShieldAlert size={18} className="text-brand mb-2" />
                  <div className="text-sm font-semibold text-gray-800">Raise a concern</div>
                  <div className="text-xs text-gray-500 mt-0.5">Private to HR</div>
                </button>
                <button onClick={() => setView('requests')} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-left hover:border-brand hover:shadow-md transition">
                  <ClipboardList size={18} className="text-brand mb-2" />
                  <div className="text-sm font-semibold text-gray-800">My requests</div>
                  <div className="text-xs text-gray-500 mt-0.5">{myPendingCount > 0 ? `${myPendingCount} in progress` : 'Track submissions'}</div>
                </button>
              </div>

              {nextHoliday && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarDays size={18} className="text-brand" />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Next public holiday: {nextHoliday.name}</div>
                      <div className="text-xs text-gray-500">
                        {parseLocalDate(nextHoliday.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                        {nextHoliday.endDate && ` – ${parseLocalDate(nextHoliday.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`}
                        {nextHoliday.note && ` • ${nextHoliday.note}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'people' && (
            <div className="space-y-3">
              <div className="flex justify-end items-center gap-2">
                {isHrStaff && (
                  <button
                    onClick={() => setShowAddEmployee(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand-dark transition"
                  >
                    <UserPlus size={13} /> Add employee
                  </button>
                )}
                <div className="inline-flex bg-gray-100 rounded-md p-1 gap-1">
                  <button
                    onClick={() => setPeopleView('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${peopleView === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List size={13} /> List
                  </button>
                  <button
                    onClick={() => setPeopleView('chart')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${peopleView === 'chart' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Network size={13} /> Org Chart
                  </button>
                  <button
                    onClick={() => setPeopleView('skills')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${peopleView === 'skills' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Award size={13} /> Accomplishments
                  </button>
                  {isHrStaff && (
                    <button
                      onClick={() => setPeopleView('cvs')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${peopleView === 'cvs' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <FileUser size={13} /> CV search
                    </button>
                  )}
                </div>
              </div>
              {peopleView === 'list' && <EmployeeList employees={employees} onViewEmployee={setSelectedEmployee} />}
              {peopleView === 'chart' && <OrgChart employees={employees} onViewEmployee={setSelectedEmployee} />}
              {peopleView === 'skills' && <AccomplishmentsSearch employees={employees} />}
              {peopleView === 'cvs' && isHrStaff && <CvSearch employees={employees} onViewEmployee={setSelectedEmployee} />}
            </div>
          )}

          {view === 'requests' && (
            <MyRequests
              user={user}
              matchedEmployee={matchedEmployee}
              leaveRequests={leaveRequests}
              certificateRequests={certificateRequests}
              complaints={complaints}
              businessCardRequests={businessCardRequests}
              onNewLeave={() => setShowLeaveModal(true)}
              onNewCertificate={() => setShowCertModal(true)}
              onNewBusinessCard={() => setShowCardModal(true)}
              onNewConcern={() => setShowConcernModal(true)}
            />
          )}

          {view === 'careers' && (
            <CareersTab
              positions={OPEN_POSITIONS}
              candidates={candidates}
              user={user}
              isHrStaff={isHrStaff}
              onSubmitCandidate={(c) => setCandidates([...candidates, { ...c, id: nextId(candidates) }])}
              onAdvanceCandidate={advanceCandidate}
              referralBonuses={referralBonuses}
            />
          )}

          {view === 'onboarding' && isNewHire && <OnboardingChecklist userName={user?.username} />}

          {view === 'profile' && isNewHire && (
            <NewJoinerWizard
              user={user}
              onSubmit={(j) => setNewJoiners([...newJoiners, { ...j, id: nextId(newJoiners) }])}
            />
          )}

          {view === 'offboarding' && isHrStaff && (
            <OffboardingTab
              employees={employees}
              offboardings={offboardings}
              onStart={(o) => setOffboardings([...offboardings, { ...o, id: nextId(offboardings) }])}
              onUpdate={(o) => setOffboardings(offboardings.map((x) => (x.id === o.id ? o : x)))}
            />
          )}

          {view === 'protasks' && isHrStaff && (
            <ProTasksView
              tasks={proTasks}
              employees={employees}
              onUpdate={(t) => setProTasks(proTasks.map((x) => (x.id === t.id ? t : x)))}
              onCreate={(t) => setProTasks([...proTasks, { ...t, id: nextId(proTasks) }])}
            />
          )}

          {view === 'staffplan' && canViewSensitive && (
            <StaffPlanningTab
              plans={staffPlans}
              projects={projects}
              onAdd={(p) => setStaffPlans([...staffPlans, { ...p, id: nextId(staffPlans) }])}
              onUpdate={(p) => setStaffPlans(staffPlans.map((x) => (x.id === p.id ? p : x)))}
              onRemove={(id) => setStaffPlans(staffPlans.filter((x) => x.id !== id))}
              staffingRequests={staffingRequests}
              onUpdateStaffingRequests={onUpdateStaffingRequests}
            />
          )}

          {view === 'inbox' && isHrStaff && (
            <HRInbox
              leaveRequests={leaveRequests}
              certificateRequests={certificateRequests}
              complaints={complaints}
              candidates={candidates}
              businessCardRequests={businessCardRequests}
              onFulfilCard={handleFulfilCard}
              onLeaveAction={handleLeaveAction}
              onPrepareCert={(req) => setLetterRequest(req)}
              onRejectCert={handleRejectCert}
              onAdvanceComplaint={(id, next) => setComplaints(complaints.map((c) => (c.id === id ? { ...c, status: next } : c)))}
              onAdvanceCandidate={advanceCandidate}
              newJoiners={pendingJoiners}
              onReviewJoiner={setReviewJoiner}
            />
          )}

          {view === 'leaveplanner' && canViewSensitive && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="inline-flex bg-gray-100 rounded-md p-1 gap-1">
                  <button
                    onClick={() => setPlannerView('calendar')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${plannerView === 'calendar' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Calendar & Balances
                  </button>
                  <button
                    onClick={() => setPlannerView('requests')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${plannerView === 'requests' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    All Requests
                  </button>
                </div>
              </div>
              {plannerView === 'calendar' ? (
                <LeaveDashboard employees={employees} requests={leaveRequests} holidays={holidays} />
              ) : (
                <LeaveRequestsList
                  requests={leaveRequests}
                  onRequestNewLeave={() => setShowLeaveModal(true)}
                  onApprove={(id) => handleLeaveAction(id, 'approved')}
                  onDeny={(id) => handleLeaveAction(id, 'denied')}
                  actionable={['pending', 'pending_hr']}
                />
              )}
            </div>
          )}

          {view === 'renewals' && canViewSensitive && <RenewalsReport employees={employees} onViewEmployee={setSelectedEmployee} />}

          {view === 'mytimesheet' && (
            <MyTimesheet
              employee={matchedEmployee}
              projects={projects}
              timesheets={timesheets}
              onSave={saveTimesheet}
            />
          )}

          {view === 'teamleave' && isManager && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Leave requests from your direct reports — you approve first, then HR gives final approval.
              </p>
              <LeaveRequestsList
                requests={leaveRequests.filter((r) => teamIds.has(r.employeeId))}
                onRequestNewLeave={() => setShowLeaveModal(true)}
                onApprove={(id) => handleManagerLeaveAction(id, true)}
                onDeny={(id) => handleManagerLeaveAction(id, false)}
                actionable={['pending_manager']}
                approveLabel="Approve → HR"
              />
            </div>
          )}

          {view === 'teamtimesheets' && isManager && (
            <TimesheetApprovals
              mode="manager"
              timesheets={teamTimesheets}
              employees={myTeam}
              projects={projects}
              onAction={actionTimesheet}
            />
          )}

          {view === 'timesheets' && canViewSensitive && (
            <TimesheetApprovals
              mode="oversight"
              timesheets={timesheets}
              employees={employees}
              projects={projects}
              onAction={actionTimesheet}
            />
          )}

          {view === 'tsinsights' && canViewSensitive && (
            <TimesheetInsights timesheets={timesheets} employees={employees} projects={projects} />
          )}

          {view === 'attendance' && canViewSensitive && <AttendanceTab employees={employees} />}

          {view === 'payroll' && canViewSensitive && <PayrollTab employees={employees} offboardings={offboardings} referralBonuses={referralBonuses} timesheetHold={timesheetHold} onViewTimesheets={() => setView('timesheets')} />}

          {view === 'holidays' && isHrStaff && <HolidaysTab holidays={holidays} onUpdateHolidays={onUpdateHolidays} />}

          {view === 'myappraisal' && (
            <AppraisalsView mode="self" appraisals={appraisals} onUpdate={updateAppraisal} matchedEmployee={matchedEmployee} user={user} />
          )}

          {view === 'teamappraisals' && isManager && (
            <AppraisalsView mode="manager" appraisals={appraisals} onUpdate={updateAppraisal} teamIds={teamIds} user={user} />
          )}

          {view === 'appraisalcycle' && isHrStaff && (
            <AppraisalsView mode="hr" appraisals={appraisals} onUpdate={updateAppraisal} user={user} />
          )}

          {view === 'training' && (
            <TrainingTab mode="self" enrollments={enrollments} onRequest={requestEnrollment} matchedEmployee={matchedEmployee} user={user} />
          )}

          {view === 'trainingapprovals' && isHrStaff && (
            <TrainingTab mode="hr" enrollments={enrollments} onDecide={decideEnrollment} onComplete={completeEnrollment} user={user} />
          )}

          {/* Strictly HR-only, like complaints — a warning file may concern a manager. */}
          {view === 'warnings' && isHrStaff && (
            <WarningsRegister warnings={warnings} employees={employees} onIssue={issueWarning} onAcknowledge={acknowledgeWarning} user={user} />
          )}

          {view === 'exitinterviews' && isHrStaff && <ExitInterviews exits={exits} onLog={logExit} />}

          {view === 'headcount' && canViewSensitive && <HeadcountDashboard employees={employees} exits={exits} />}

          {view === 'gradesbands' && canViewSensitive && <GradesBands employees={employees} />}
        </main>
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          employees={employees}
          user={user}
          isHrStaff={isHrStaff}
          onClose={() => setSelectedEmployee(null)}
          onViewEmployee={setSelectedEmployee}
          onAddDependent={handleAddDependent}
          onAddAccomplishment={handleAddAccomplishment}
          onVerifyAccomplishment={handleVerifyAccomplishment}
          onUpdateDocuments={handleUpdateDocuments}
          canViewSensitive={canViewSensitive}
        />
      )}

      {showLeaveModal && (
        <LeaveRequestModal
          employee={matchedEmployee || { id: null, name: user?.username || 'Unknown' }}
          onClose={() => setShowLeaveModal(false)}
          onSubmit={(newRequest) => {
            // Two-step chain: to the line manager first; straight to HR when there is none.
            setLeaveRequests([...leaveRequests, {
              ...newRequest,
              status: leaveStatusForNew(matchedEmployee),
              managerApprovedBy: null, managerApprovedDate: null,
              id: nextId(leaveRequests),
            }])
          }}
        />
      )}

      {showCardModal && (
        <BusinessCardRequestModal
          user={user}
          employees={employees}
          onClose={() => setShowCardModal(false)}
          onSubmit={(req) => {
            setBusinessCardRequests([...businessCardRequests, { ...req, id: nextId(businessCardRequests) }])
          }}
        />
      )}

      {showCertModal && (
        <CertificateRequestModal
          user={user}
          employees={employees}
          onClose={() => setShowCertModal(false)}
          onSubmit={(newRequest) => {
            setCertificateRequests([...certificateRequests, { ...newRequest, id: nextId(certificateRequests) }])
          }}
        />
      )}

      {showConcernModal && (
        <ComplaintModal
          user={user}
          onClose={() => setShowConcernModal(false)}
          onSubmit={(c) => setComplaints([...complaints, { ...c, id: nextId(complaints) }])}
        />
      )}

      {showAddEmployee && (
        <AddEmployeeModal
          employees={employees}
          onClose={() => setShowAddEmployee(false)}
          onAdd={addEmployeeRecord}
        />
      )}

      {reviewJoiner && (
        <NewJoinerReviewModal
          joiner={reviewJoiner}
          employees={employees}
          onClose={() => setReviewJoiner(null)}
          onApprove={handleApproveJoiner}
        />
      )}

      {letterRequest && (
        <CertificateLetterModal
          request={letterRequest}
          employee={employees.find((e) => e.id === letterRequest.employeeId)}
          onClose={() => setLetterRequest(null)}
          onSave={handleSaveLetter}
        />
      )}
    </div>
  )
}
