import { useState } from 'react'
import {
  ArrowRight, Users, Building2, UserPlus, List, Network, Award, AlertTriangle,
  Home, ClipboardList, Briefcase, GraduationCap, Inbox, CalendarRange,
  CalendarClock, Fingerprint, Banknote, CalendarDays, Plane, FileText, ShieldAlert,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import OnboardingChecklist from '../components/hr/OnboardingChecklist'
import EmployeeList from '../components/hr/EmployeeList'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import LeaveRequestModal from '../components/hr/LeaveRequestModal'
import LeaveRequestsList from '../components/hr/LeaveRequestsList'
import LeaveDashboard from '../components/hr/LeaveDashboard'
import AccomplishmentsSearch from '../components/hr/AccomplishmentsSearch'
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
import { HR_STATS, EMPLOYEES, LEAVE_REQUESTS, CERTIFICATE_REQUESTS, COMPLAINTS, OPEN_POSITIONS, CANDIDATES, ANNUAL_LEAVE_ENTITLEMENT } from '../data/hrData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'
import { parseLocalDate, todayLocal } from '../utils/date'

export default function HR({ user, onLogout, holidays = [], onUpdateHolidays }) {
  const [view, setView] = useState('myhr')
  const [peopleView, setPeopleView] = useState('list')
  const [plannerView, setPlannerView] = useState('calendar')
  const [employees, setEmployees] = useState(EMPLOYEES)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [leaveRequests, setLeaveRequests] = useState(LEAVE_REQUESTS)
  const [certificateRequests, setCertificateRequests] = useState(CERTIFICATE_REQUESTS)
  const [complaints, setComplaints] = useState(COMPLAINTS)
  const [candidates, setCandidates] = useState(CANDIDATES)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [showConcernModal, setShowConcernModal] = useState(false)
  const [letterRequest, setLetterRequest] = useState(null)

  const isHrStaff = HR_STAFF_ROLES.includes(user?.role)
  const canViewSensitive = SENSITIVE_VIEW_ROLES.includes(user?.role)
  const isNewHire = !!user?.isNewHire

  const matchedEmployee = employees.find((e) => e.name.toLowerCase() === (user?.username || '').toLowerCase())
  const myName = (matchedEmployee?.name || user?.username || '').toLowerCase()

  const inboxCount = isHrStaff ? buildInboxItems({ leaveRequests, certificateRequests, complaints, candidates }).length : 0
  const renewalItems = canViewSensitive ? buildRenewalItems(employees) : []
  const overdueCount = renewalItems.filter((i) => i.days < 0).length

  const myLeaveUsed = matchedEmployee
    ? leaveRequests.filter((r) => r.employeeId === matchedEmployee.id && r.status === 'approved' && r.type === 'Vacation').reduce((s, r) => s + r.days, 0)
    : null
  const myPendingCount =
    leaveRequests.filter((r) => r.employeeName.toLowerCase() === myName && r.status === 'pending').length +
    certificateRequests.filter((r) => r.employeeName.toLowerCase() === myName && r.status === 'pending').length +
    complaints.filter((c) => !c.anonymous && (c.submittedBy || '').toLowerCase() === myName && c.status !== 'resolved').length

  const nextHoliday = holidays
    .filter((h) => h.status === 'approved' && parseLocalDate(h.endDate || h.date) >= todayLocal())
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const NAV_MAIN = [
    { key: 'myhr', label: 'My HR', icon: Home },
    { key: 'people', label: 'People', icon: Users },
    { key: 'requests', label: 'My requests', icon: ClipboardList, badge: myPendingCount },
    { key: 'careers', label: 'Careers', icon: Briefcase },
    ...(isNewHire ? [{ key: 'onboarding', label: 'Onboarding', icon: GraduationCap }] : []),
  ]

  const NAV_HR = [
    ...(isHrStaff ? [{ key: 'inbox', label: 'Inbox', icon: Inbox, badge: inboxCount }] : []),
    ...(canViewSensitive ? [
      { key: 'leaveplanner', label: 'Leave planner', icon: CalendarRange },
      { key: 'renewals', label: 'Renewals', icon: CalendarClock, badge: overdueCount },
      { key: 'attendance', label: 'Attendance', icon: Fingerprint },
      { key: 'payroll', label: 'Payroll', icon: Banknote },
    ] : []),
    ...(isHrStaff ? [{ key: 'holidays', label: 'Holidays', icon: CalendarDays }] : []),
  ]

  const handleAddDependent = (employeeId, dependent) => {
    setEmployees(employees.map((e) => (e.id === employeeId ? { ...e, dependents: [...e.dependents, dependent] } : e)))
    setSelectedEmployee((prev) => (prev && prev.id === employeeId ? { ...prev, dependents: [...prev.dependents, dependent] } : prev))
  }

  const handleAddAccomplishment = (employeeId, acc) => {
    setEmployees(employees.map((e) => (e.id === employeeId ? { ...e, accomplishments: [...e.accomplishments, acc] } : e)))
    setSelectedEmployee((prev) => (prev && prev.id === employeeId ? { ...prev, accomplishments: [...prev.accomplishments, acc] } : prev))
  }

  const handleVerifyAccomplishment = (employeeId, idx) => {
    const verify = (accs) => accs.map((a, i) => (i === idx ? { ...a, verified: true } : a))
    setEmployees(employees.map((e) => (e.id === employeeId ? { ...e, accomplishments: verify(e.accomplishments) } : e)))
    setSelectedEmployee((prev) => (prev && prev.id === employeeId ? { ...prev, accomplishments: verify(prev.accomplishments) } : prev))
  }

  const handleLeaveAction = (id, status) => {
    setLeaveRequests(leaveRequests.map((r) => (r.id === id ? { ...r, status, approvedBy: status === 'approved' ? user?.username : null, approvedDate: new Date().toISOString().slice(0, 10) } : r)))
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
                      <div className="text-xs text-gray-500">Leave, certificates, concerns, and candidates — oldest first.</div>
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

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
              <div className="flex justify-end">
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
                </div>
              </div>
              {peopleView === 'list' && <EmployeeList employees={employees} onViewEmployee={setSelectedEmployee} />}
              {peopleView === 'chart' && <OrgChart employees={employees} onViewEmployee={setSelectedEmployee} />}
              {peopleView === 'skills' && <AccomplishmentsSearch employees={employees} />}
            </div>
          )}

          {view === 'requests' && (
            <MyRequests
              user={user}
              matchedEmployee={matchedEmployee}
              leaveRequests={leaveRequests}
              certificateRequests={certificateRequests}
              complaints={complaints}
              onNewLeave={() => setShowLeaveModal(true)}
              onNewCertificate={() => setShowCertModal(true)}
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
              onAdvanceCandidate={(id, next) => setCandidates(candidates.map((c) => (c.id === id ? { ...c, status: next } : c)))}
            />
          )}

          {view === 'onboarding' && isNewHire && <OnboardingChecklist userName={user?.username} />}

          {view === 'inbox' && isHrStaff && (
            <HRInbox
              leaveRequests={leaveRequests}
              certificateRequests={certificateRequests}
              complaints={complaints}
              candidates={candidates}
              onLeaveAction={handleLeaveAction}
              onPrepareCert={(req) => setLetterRequest(req)}
              onRejectCert={handleRejectCert}
              onAdvanceComplaint={(id, next) => setComplaints(complaints.map((c) => (c.id === id ? { ...c, status: next } : c)))}
              onAdvanceCandidate={(id, next) => setCandidates(candidates.map((c) => (c.id === id ? { ...c, status: next } : c)))}
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
                />
              )}
            </div>
          )}

          {view === 'renewals' && canViewSensitive && <RenewalsReport employees={employees} onViewEmployee={setSelectedEmployee} />}

          {view === 'attendance' && canViewSensitive && <AttendanceTab employees={employees} />}

          {view === 'payroll' && canViewSensitive && <PayrollTab employees={employees} />}

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
          canViewSensitive={canViewSensitive}
        />
      )}

      {showLeaveModal && (
        <LeaveRequestModal
          employee={matchedEmployee || { id: null, name: user?.username || 'Unknown' }}
          onClose={() => setShowLeaveModal(false)}
          onSubmit={(newRequest) => {
            setLeaveRequests([...leaveRequests, { ...newRequest, id: Math.max(...leaveRequests.map((r) => r.id), 0) + 1 }])
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
