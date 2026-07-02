import { useState } from 'react'
import { ArrowRight, Users, Building2, UserPlus, Award } from 'lucide-react'
import Navbar from '../components/Navbar'
import OnboardingChecklist from '../components/hr/OnboardingChecklist'
import EmployeeList from '../components/hr/EmployeeList'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import LeaveRequestModal from '../components/hr/LeaveRequestModal'
import LeaveRequestsList from '../components/hr/LeaveRequestsList'
import AccomplishmentsSearch from '../components/hr/AccomplishmentsSearch'
import OrgChart from '../components/hr/OrgChart'
import { HR_STATS, QUICK_LINKS, EMPLOYEES, LEAVE_REQUESTS } from '../data/hrData'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'directory', label: 'Directory' },
  { key: 'orgchart', label: 'Org Chart' },
  { key: 'accomplishments', label: 'Accomplishments' },
  { key: 'leave', label: 'Leave' },
  { key: 'onboarding', label: 'Onboarding' },
]

export default function HR({ user, onLogout }) {
  const [tab, setTab] = useState('overview')
  const [employees, setEmployees] = useState(EMPLOYEES)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState(LEAVE_REQUESTS)

  const handleAddDependent = (employeeId, dependent) => {
    setEmployees(employees.map((e) => (e.id === employeeId ? { ...e, dependents: [...e.dependents, dependent] } : e)))
    setSelectedEmployee((prev) => (prev && prev.id === employeeId ? { ...prev, dependents: [...prev.dependents, dependent] } : prev))
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
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t.key ? 'text-brand border-brand' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
            >
              {t.label}
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

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => l.label === 'Org Chart' && setTab('orgchart')}
                    className="text-left text-sm text-brand font-medium hover:underline px-1 py-1"
                  >
                    → {l.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {tab === 'directory' && <EmployeeList employees={employees} onViewEmployee={setSelectedEmployee} />}

        {tab === 'orgchart' && <OrgChart employees={employees} onViewEmployee={setSelectedEmployee} />}

        {tab === 'accomplishments' && <AccomplishmentsSearch employees={employees} />}

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

        {tab === 'onboarding' && <OnboardingChecklist userName={user?.username} />}
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          employees={employees}
          onClose={() => setSelectedEmployee(null)}
          onViewEmployee={setSelectedEmployee}
          onAddDependent={handleAddDependent}
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
    </div>
  )
}
