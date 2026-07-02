import { useState } from 'react'
import Navbar from '../components/Navbar'
import ProjectList from '../components/projects/ProjectList'
import ProjectDetailModal from '../components/projects/ProjectDetailModal'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import { PROJECTS } from '../data/projectsData'
import { EMPLOYEES } from '../data/hrData'
import { HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'

export default function Projects({ user, onLogout }) {
  const [projects] = useState(PROJECTS)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const canViewSensitive = SENSITIVE_VIEW_ROLES.includes(user?.role)
  const isHrStaff = HR_STAFF_ROLES.includes(user?.role)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="Projects" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-sm text-gray-500">Design & supervision portfolio — dashboard and deal-to-project linking come next</p>
        </div>

        <ProjectList projects={projects} employees={EMPLOYEES} user={user} onViewProject={setSelectedProject} />
      </div>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          employees={EMPLOYEES}
          canViewSensitive={canViewSensitive}
          onClose={() => setSelectedProject(null)}
          onViewEmployee={(emp) => setSelectedEmployee(emp)}
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
          onAddDependent={() => {}}
          onAddAccomplishment={() => {}}
          onVerifyAccomplishment={() => {}}
        />
      )}
    </div>
  )
}
