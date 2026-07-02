import { X } from 'lucide-react'
import Modal from '../crm/Modal'

export default function EmployeeDetailModal({ employee, onClose }) {
  if (!employee) return null

  const startDate = new Date(employee.startDate)
  const yearsAtCompany = ((new Date() - startDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)

  return (
    <Modal title={employee.name} onClose={onClose} wide>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">Employment Info</h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-gray-500">Title</label>
              <div className="font-medium text-gray-800">{employee.title}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Department</label>
              <div className="font-medium text-gray-800">{employee.dept}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <div className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                {employee.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Start Date</label>
              <div className="font-medium text-gray-800">{startDate.toLocaleDateString('en-AE')}</div>
              <div className="text-xs text-gray-500 mt-1">{yearsAtCompany} years at ALSUWEIDI</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">Contact</h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <a href={`mailto:${employee.email}`} className="font-medium text-brand hover:underline">
                {employee.email}
              </a>
            </div>
            <div>
              <label className="text-xs text-gray-500">Phone</label>
              <a href={`tel:${employee.phone}`} className="font-medium text-brand hover:underline">
                {employee.phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="text-xs text-gray-500 hover:text-gray-700">Coming soon: Leave balance, Benefits, Performance reviews</button>
      </div>
    </Modal>
  )
}
