import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ArrowRight, Users, Building2, UserPlus, List, Network, Award, AlertTriangle,
  Home, ClipboardList, Briefcase, GraduationCap, Inbox, CalendarRange,
  CalendarClock, Fingerprint, Banknote, CalendarDays, Plane, FileText, ShieldAlert,
  UserMinus, Landmark, LineChart, TrendingUp, FileUser, Clock, ClipboardCheck, CreditCard,
} from 'lucide-react'
import Navbar from '../components/Navbar'
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
import NewJoinerWizard from '../components/hr/NewJoinerWizard'
import NewJoinerReviewModal from '../components/hr/NewJoinerReviewModal'
import AddEmployeeModal from '../components/hr/AddEmployeeModal'
import OffboardingTab from '../components/hr/OffboardingTab'
import ProTasksView from '../components/hr/ProTasksView'
import StaffPlanningTab from '../components/hr/StaffPlanningTab'
import MyTimesheet from '../components/hr/MyTimesheet'
import TimesheetApprovals from '../components/hr/TimesheetApprovals'
import BusinessCardRequestModal from '../components/hr/BusinessCardRequestModal'
import {
  HR_STATS, EMPLOYEES, LEAVE_REQUESTS, CERTIFICATE_REQUESTS, COMPLAINTS, OPEN_POSITIONS, CANDIDATES,
  ANNUAL_LEAVE_ENTITLEMENT, NEW_JOINERS, OFFBOARDINGS, PRO_TASKS, STAFF_PLANS, REFERRAL_BONUS_AED,
  BUSINESS_CARD_REQUESTS, LEAVE_PENDING_STATUSES, leaveStatusForNew,
} from '../data/hrData'
import { weekStartOf, addDays, toLocalISO } from '../data/timesheetData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'
import { parseLocalDate, todayLocal } from '../utils/date'

export default function HR({ user, onLogout, holidays = [], onUpdateHolidays, projects = [], onEmployeeAdded, timesheets = [], setTimesheets }) {
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

  const nextHoliday = holidays
    .filter((h) => h.status === 'approved' && parseLocalDate(h.endDate || h.date) >= todayLocal())
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  // Timesheets: upsert my week; count submitted weeks for the approvals badge;
  // count last week's non-submitters for the payroll hold flag.
  const saveTimesheet = (ts) => {
    if (ts.id) setTimesheets((prev) => prev.map((t) => (t.id === ts.id ? ts : t)))
    else setTimesheets((prev) => [...prev, { ...ts, id: Math.max(...prev.map((t) => t.id), 0) + 1 }])
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
    ] : []),
    { key: 'requests', label: 'My requests', icon: ClipboardList, badge: myPendingCount },
    { key: 'careers', label: 'Careers', icon: Briefcase },
    ...(isNewHire ? [
      { key: 'profile', label: 'My profile setup', icon: UserPlus },
      { key: 'onboarding', label: 'Onboarding', icon: GraduationCap },
    ] : []),
  ]

  const NAV_HR = [
    ...(isHrStaff ? [{ key: 'inbox', label: 'Inbox', icon: Inbox, badge: inboxCount }] : []),
    ...(canViewSensitive ? [
      { key: 'leaveplanner', label: 'Leave planner', icon: CalendarRange },
      { key: 'renewals', label: 'Renewals', icon: CalendarClock, badge: overdueCount },
      { key: 'timesheets', label: 'Timesheets', icon: ClipboardCheck, badge: submittedTimesheets },
      { key: 'attendance', label: 'Attendance', icon: Fingerprint },
      { key: 'payroll', label: 'Payroll', icon: Banknote },
      { key: 'staffplan', label: 'Staff planning', icon: LineChart },
    ] : []),
    ...(isHrStaff ? [
      { key: 'offboarding', label: 'Offboarding', icon: UserMinus, badge: offboardings.filter((o) => o.status === 'in_progress').length },
      { key: 'protasks', label: 'PRO tasks', icon: Landmark, badge: proTasks.filter((t) => t.status !== 'done').length },
      { key: 'holidays', label: 'Holidays', icon: CalendarDays },
    ] : []),
  ]

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
        awardedDate: new Date().toISOString().slice(0, 10),
        status: 'pending_payroll',
      }])
    }
  }

  // Both paths that create an employee record notify Marketing (headshot + welcome email tasks).
  const addEmployeeRecord = (record) => {
    const created = { ...record, id: Math.max(...employees.map((e) => e.id), 0) + 1 }
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
    setLeaveRequests(leaveRequests.map((r) => (r.id === id ? { ...r, status, approvedBy: status === 'approved' ? user?.username : null, approvedDate: new Date().toISOString().slice(0, 10) } : r)))
  }
  // Manager step: approve forwards the request to HR; deny ends it.
  const handleManagerLeaveAction = (id, approve) => {
    setLeaveRequests(leaveRequests.map((r) => (r.id === id
      ? approve
        ? { ...r, status: 'pending_hr', managerApprovedBy: user?.username, managerApprovedDate: new Date().toISOString().slice(0, 10) }
        : { ...r, status: 'denied' }
      : r)))
  }

  const handleFulfilCard = (id) => {
    setBusinessCardRequests(businessCardRequests.map((r) => (r.id === id ? { ...r, status: 'delivered', resolvedDate: new Date().toISOString().slice(0, 10) } : r)))
  }

  const handleRejectCert = (id) => {
    setCertificateRequests(certificateRequests.map((r) => (r.id === id ? { ...r, status: 'rejected', resolvedDate: new Date().toISOString().slice(0, 10) } : r)))
  }

  const handleSaveLetter = (requestId, letterText) => {
    setCertificateRequests(certificateRequests.map((r) => (r.id === requestId
      ? { ...r, letterText, status: 'issued', resolvedDate: r.resolvedDate || new Date().toISOString().slice(0, 10) }
      : r)))
  }

  const navButton = (item) => {
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
        {item.badge > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shrink-0">
            {item.badge}
          </span>
        )}
      </button>
    )
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
        <aside className="w-full sm:w-44 shrink-0 sm:sticky sm:top-6">
          <div className="flex sm:flex-col flex-wrap gap-1">
            {NAV_MAIN.map(navButton)}
          </div>
          {NAV_HR.length > 0 && (
            <>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1 hidden sm:block">HR Workspace</div>
              <div className="flex sm:flex-col flex-wrap gap-1 mt-1 sm:mt-0">
                {NAV_HR.map(navButton)}
              </div>
            </>
          )}
        </aside>

        <main className="flex-1 min-w-0 w-full">
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
              onSubmitCandidate={(c) => setCandidates([...candidates, { ...c, id: Math.max(...candidates.map((x) => x.id), 0) + 1 }])}
              onAdvanceCandidate={advanceCandidate}
              referralBonuses={referralBonuses}
            />
          )}

          {view === 'onboarding' && isNewHire && <OnboardingChecklist userName={user?.username} />}

          {view === 'profile' && isNewHire && (
            <NewJoinerWizard
              user={user}
              onSubmit={(j) => setNewJoiners([...newJoiners, { ...j, id: Math.max(...newJoiners.map((x) => x.id), 0) + 1 }])}
            />
          )}

          {view === 'offboarding' && isHrStaff && (
            <OffboardingTab
              employees={employees}
              offboardings={offboardings}
              onStart={(o) => setOffboardings([...offboardings, { ...o, id: Math.max(...offboardings.map((x) => x.id), 0) + 1 }])}
              onUpdate={(o) => setOffboardings(offboardings.map((x) => (x.id === o.id ? o : x)))}
            />
          )}

          {view === 'protasks' && isHrStaff && (
            <ProTasksView
              tasks={proTasks}
              employees={employees}
              onUpdate={(t) => setProTasks(proTasks.map((x) => (x.id === t.id ? t : x)))}
              onCreate={(t) => setProTasks([...proTasks, { ...t, id: Math.max(...proTasks.map((x) => x.id), 0) + 1 }])}
            />
          )}

          {view === 'staffplan' && canViewSensitive && (
            <StaffPlanningTab
              plans={staffPlans}
              projects={projects}
              onAdd={(p) => setStaffPlans([...staffPlans, { ...p, id: Math.max(...staffPlans.map((x) => x.id), 0) + 1 }])}
              onUpdate={(p) => setStaffPlans(staffPlans.map((x) => (x.id === p.id ? p : x)))}
              onRemove={(id) => setStaffPlans(staffPlans.filter((x) => x.id !== id))}
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

          {view === 'attendance' && canViewSensitive && <AttendanceTab employees={employees} />}

          {view === 'payroll' && canViewSensitive && <PayrollTab employees={employees} offboardings={offboardings} referralBonuses={referralBonuses} timesheetHold={timesheetHold} onViewTimesheets={() => setView('timesheets')} />}

          {view === 'holidays' && isHrStaff && <HolidaysTab holidays={holidays} onUpdateHolidays={onUpdateHolidays} />}
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
              id: Math.max(...leaveRequests.map((r) => r.id), 0) + 1,
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
            setBusinessCardRequests([...businessCardRequests, { ...req, id: Math.max(...businessCardRequests.map((r) => r.id), 0) + 1 }])
          }}
        />
      )}

      {showCertModal && (
        <CertificateRequestModal
          user={user}
          employees={employees}
          onClose={() => setShowCertModal(false)}
          onSubmit={(newRequest) => {
            setCertificateRequests([...certificateRequests, { ...newRequest, id: Math.max(...certificateRequests.map((r) => r.id), 0) + 1 }])
          }}
        />
      )}

      {showConcernModal && (
        <ComplaintModal
          user={user}
          onClose={() => setShowConcernModal(false)}
          onSubmit={(c) => setComplaints([...complaints, { ...c, id: Math.max(...complaints.map((x) => x.id), 0) + 1 }])}
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
