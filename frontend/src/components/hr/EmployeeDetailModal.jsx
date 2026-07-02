import { useState } from 'react'
import { X, FileText, Award } from 'lucide-react'
import Modal from '../crm/Modal'

export default function EmployeeDetailModal({ employee, onClose }) {
  const [detailTab, setDetailTab] = useState('info')

  if (!employee) return null

  const startDate = new Date(employee.startDate)
  const yearsAtCompany = ((new Date() - startDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)

  const visaStatusColor = {
    Valid: 'bg-green-100 text-green-700',
    Expiring: 'bg-yellow-100 text-yellow-700',
    Expired: 'bg-red-100 text-red-700',
    Pending: 'bg-blue-100 text-blue-700',
  }

  return (
    <Modal title={employee.name} onClose={onClose} wide>
      <div className="mb-4 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setDetailTab('info')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${detailTab === 'info' ? 'text-brand border-brand' : 'text-gray-500 border-transparent'}`}
        >
          Info
        </button>
        <button
          onClick={() => setDetailTab('visa')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${detailTab === 'visa' ? 'text-brand border-brand' : 'text-gray-500 border-transparent'}`}
        >
          Visa & Dependents
        </button>
        <button
          onClick={() => setDetailTab('accomplishments')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${detailTab === 'accomplishments' ? 'text-brand border-brand' : 'text-gray-500 border-transparent'}`}
        >
          <Award size={14} className="inline mr-1" />
          Accomplishments
        </button>
        <button
          onClick={() => setDetailTab('documents')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${detailTab === 'documents' ? 'text-brand border-brand' : 'text-gray-500 border-transparent'}`}
        >
          <FileText size={14} className="inline mr-1" />
          Documents
        </button>
      </div>

      {detailTab === 'info' && (
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
              <label className="text-xs text-gray-500">Location</label>
              <div className="font-medium text-gray-800">{employee.location}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Employment Type</label>
              <div className="font-medium text-gray-800">{employee.employmentType}</div>
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
      )}

      {detailTab === 'visa' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">Visa Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${visaStatusColor[employee.visa.status] || 'bg-gray-100'}`}>
                  {employee.visa.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiry Date:</span>
                <span className="font-medium">{new Date(employee.visa.expiryDate).toLocaleDateString('en-AE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sponsor:</span>
                <span className="font-medium">{employee.visa.sponsor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Passport #:</span>
                <span className="font-medium">{employee.visa.passportNumber}</span>
              </div>
            </div>
          </div>

          {employee.dependents && employee.dependents.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">Dependents ({employee.dependents.length})</h3>
              <div className="space-y-2">
                {employee.dependents.map((dep, idx) => (
                  <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                    <div className="font-medium text-gray-800">{dep.name}</div>
                    <div className="text-xs text-gray-600">
                      {dep.relationship} • DOB: {new Date(dep.dob).toLocaleDateString('en-AE')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {detailTab === 'accomplishments' && (
        <div className="space-y-3">
          {employee.accomplishments && employee.accomplishments.length > 0 ? (
            employee.accomplishments.map((acc, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-blue-900">{acc.type}</div>
                  <div className="text-xs text-blue-700">{new Date(acc.date).toLocaleDateString('en-AE')}</div>
                </div>
                <div className="text-xs text-blue-800">Issued by: {acc.issuer}</div>
                {acc.expiryDate && (
                  <div className="text-xs text-blue-700 mt-1">
                    Expires: {new Date(acc.expiryDate).toLocaleDateString('en-AE')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No accomplishments recorded yet</div>
          )}
        </div>
      )}

      {detailTab === 'documents' && (
        <div className="space-y-3 text-sm text-gray-600">
          <div className="bg-gray-50 rounded p-4 text-center">
            <FileText size={32} className="mx-auto mb-2 text-gray-400" />
            <div className="font-medium text-gray-700 mb-1">Document Storage</div>
            <div className="text-xs text-gray-500">Passport, Visa, Certificates, CV — Phase 2 with file upload</div>
          </div>
        </div>
      )}
    </Modal>
  )
}
