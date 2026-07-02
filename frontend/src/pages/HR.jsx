import { useState } from 'react'
import { ArrowRight, Users, Building2, UserPlus, Award, List, Network, FileText, AlertTriangle } from 'lucide-react'
import Navbar from '../components/Navbar'
import OnboardingChecklist from '../components/hr/OnboardingChecklist'
import EmployeeList from '../components/hr/EmployeeList'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import LeaveRequestModal from '../components/hr/LeaveRequestModal'
import LeaveRequestsList from '../components/hr/LeaveRequestsList'
import AccomplishmentsSearch from '../components/hr/AccomplishmentsSearch'
import OrgChart from '../components/hr/OrgChart'
import RenewalsReport, { buildRenewalItems } from '../components/hr/RenewalsReport'
import CertificateRequestModal from '../components/hr/CertificateRequestModal'
import CertificateRequestsList from '../components/hr/CertificateRequestsList'
import PayrollTab from '../components/hr/PayrollTab'
import { HR_STATS, QUICK_LINKS, EMPLOYEES, LEAVE_REQUESTS, CERTIFICATE_REQUESTS } from '../data/hrData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'

const BASE_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'directory', label: 'Directory' },
  { key: 'accomplishments', label: 'Accomplishments' },
  { key: 'leave', label: 'Leave' },
  { key: 'certificates', label: 'Certificates' },
]

export default function HR({ user, onLogout }) {
  const [tab, setTab] = useState('overview')
  const [directoryView, setDirectoryView] = useState('list')
  const [employees, setEmployees] = useState(EMPLOYEES)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState(LEAVE_REQUESTS)
  const [certificateRequests, setCertificateRequests] = useState(CERTIFICATE_REQUESTS)
  const [showCertModal, setShowCertModal] = useState(false)

  const isHrStaff = HR_STAFF_ROLES.includes(user?.role)
  const canViewSensitive = SENSITIVE_VIEW_ROLES.includes(user?.role)
  const isNewHire = !!user?.isNewHire
  const pendingCertCount = certificateRequests.filter((r) => r.status === 'pending').length
  const renewalItems = canViewSensitive ? buildRenewalItems(employees) : []
  const overdueCount = renewalItems.filter((i) => i.days < 0).length

  const TABS = [
    ...BASE_TABS,
    ...(canViewSensitive ? [{ key: 'renewals', label: 'Renewals' }, { key: 'payroll', label: 'Payroll' }] : []),
    ...(isNewHire ? [{ key: 'onboarding', label: 'Onboarding' }] : []),
  ]

  const handleAddDependent = (employeeId, dependent) => {
    setEmployees(employees.map((e) => (e.id === employeeId ? { ...e, dependents: [...e.dependents, dependent] } : e)))
    setSelectedEmployee((prev) => (prev && prev.id === employeeId ? { ...prev, dependents: [...prev.dependents, dependent] } : prev))
  }

  const handleQuickLink = (label) => {
    if (label === 'Request Certificate') setShowCertModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="HR" showBack />

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">HR</h1>
          <p className="text-sm text-gray-500">Employees, onboarding, leave & timesheets</p>
        </div>

        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t.key ? 'text-brand border-brand' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
            >
              {t.label}
              {t.key === 'certificates' && isHrStaff && pendingCertCount > 0 && (
                <span className="absolute -top-0.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                  {pendingCertCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
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

            {canViewSensitive && renewalItems.length > 0 && (
              <button
                onClick={() => setTab('renewals')}
                className={`w-full bg-white border rounded-lg shadow-sm p-4 text-left transition flex items-center justify-between ${overdueCount > 0 ? 'border-red-200 hover:border-red-300' : 'border-amber-200 hover:border-amber-300'}`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className={overdueCount > 0 ? 'text-red-600' : 'text-amber-600'} />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {overdueCount > 0 && `${overdueCount} overdue, `}{renewalItems.length - overdueCount} renewal{renewalItems.length - overdueCount === 1 ? '' : 's'} due within 90 days
                    </div>
                    <div className="text-xs text-gray-500">Visas, passports, and contracts — employees and their dependents.</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 shrink-0" />
              </button>
            )}

            {isHrStaff && pendingCertCount > 0 && (
              <button
                onClick={() => setTab('certificates')}
                className="w-full bg-white border border-amber-200 rounded-lg shadow-sm p-4 text-left hover:border-amber-300 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-amber-600" />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{pendingCertCount} new certificate request{pendingCertCount > 1 ? 's' : ''} pending</div>
                    <div className="text-xs text-gray-500">Salary, employment, NOC, bank, or embassy letters awaiting review.</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 shrink-0" />
              </button>
            )}

            {isNewHire && (
              <button
                onClick={() => setTab('onboarding')}
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

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => handleQuickLink(l.label)}
                    className="text-left text-sm text-brand font-medium hover:underline px-1 py-1"
                  >
                    → {l.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {tab === 'directory' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="inline-flex bg-gray-100 rounded-md p-1 gap-1">
                <button
                  onClick={() => setDirectoryView('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${directoryView === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List size={13} /> List
                </button>
                <button
                  onClick={() => setDirectoryView('chart')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${directoryView === 'chart' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Network size={13} /> Org Chart
                </button>
              </div>
            </div>
            {directoryView === 'list' ? (
              <EmployeeList employees={employees} onViewEmployee={setSelectedEmployee} />
            ) : (
              <OrgChart employees={employees} onViewEmployee={setSelectedEmployee} />
            )}
          </div>
        )}

        {tab === 'accomplishments' && <AccomplishmentsSearch employees={employees} />}

        {tab === 'renewals' && canViewSensitive && <RenewalsReport employees={employees} onViewEmployee={setSelectedEmployee} />}

        {tab === 'payroll' && canViewSensitive && <PayrollTab employees={employees} />}

        {tab === 'leave' && (
          <LeaveRequestsList
            requests={leaveRequests}
            onRequestNewLeave={() => setShowLeaveModal(true)}
            onApprove={(id) => {
              setLeaveRequests(leaveRequests.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)))
            }}
            onDeny={(id) => {
              setLeaveRequests(leaveRequests.map((r) => (r.id === id ? { ...r, status: 'denied' } : r)))
            }}
          />
        )}

        {tab === 'certificates' && (
          <CertificateRequestsList
            requests={certificateRequests}
            isHrStaff={isHrStaff}
            onNewRequest={() => setShowCertModal(true)}
            onIssue={(id) => {
              setCertificateRequests(certificateRequests.map((r) => (r.id === id ? { ...r, status: 'issued', resolvedDate: new Date().toISOString().slice(0, 10) } : r)))
            }}
            onReject={(id) => {
              setCertificateRequests(certificateRequests.map((r) => (r.id === id ? { ...r, status: 'rejected', resolvedDate: new Date().toISOString().slice(0, 10) } : r)))
            }}
          />
        )}

        {tab === 'onboarding' && isNewHire && <OnboardingChecklist userName={user?.username} />}
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          employees={employees}
          onClose={() => setSelectedEmployee(null)}
          onViewEmployee={setSelectedEmployee}
          onAddDependent={handleAddDependent}
          canViewSensitive={canViewSensitive}
        />
      )}

      {showLeaveModal && (
        <LeaveRequestModal
          employee={employees[0]}
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
    </div>
  )
}
