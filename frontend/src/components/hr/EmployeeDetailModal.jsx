import { useState } from 'react'
import { X, FileText, Award, DollarSign, Plus } from 'lucide-react'
import Modal from '../crm/Modal'
import { RELATIONSHIP_TYPES, ACCOMPLISHMENT_TYPES } from '../../data/hrData'

const visaStatusColor = {
  Valid: 'bg-green-100 text-green-700',
  Expiring: 'bg-yellow-100 text-yellow-700',
  Expired: 'bg-red-100 text-red-700',
  Pending: 'bg-blue-100 text-blue-700',
}

const calcAge = (dob) => Math.floor((new Date() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25))

const EMPTY_DEPENDENT_FORM = {
  name: '',
  relationship: 'Son',
  dob: '',
  nationality: '',
  passportNumber: '',
  passportCountry: '',
  passportExpiry: '',
  visaNumber: '',
  visaExpiry: '',
  emiratesIdNumber: '',
  emiratesIdExpiry: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  insuranceExpiry: '',
}

function IdentityBlock({ title, passport, visa, emiratesId, nationality }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">{title ? `${title} — Passport` : 'Passport'}</h4>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Nationality:</span><span className="font-medium">{nationality || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Number:</span><span className="font-medium">{passport?.number || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Country of Issue:</span><span className="font-medium">{passport?.country || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium">{passport?.type || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Expiry:</span><span className="font-medium">{passport?.expiryDate ? new Date(passport.expiryDate).toLocaleDateString('en-AE') : '—'}</span></div>
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">UAE Residence Visa</h4>
        {visa ? (
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${visaStatusColor[visa.status] || 'bg-gray-100'}`}>{visa.status}</span>
            </div>
            <div className="flex justify-between"><span className="text-gray-600">Number:</span><span className="font-medium">{visa.number}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium">{visa.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Expiry:</span><span className="font-medium">{new Date(visa.expiryDate).toLocaleDateString('en-AE')}</span></div>
            {visa.sponsor && <div className="flex justify-between"><span className="text-gray-600">Sponsor:</span><span className="font-medium">{visa.sponsor}</span></div>}
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 rounded p-2">UAE National — no residence visa required</div>
        )}
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Emirates ID</h4>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Number:</span><span className="font-medium">{emiratesId?.number || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Expiry:</span><span className="font-medium">{emiratesId?.expiryDate ? new Date(emiratesId.expiryDate).toLocaleDateString('en-AE') : '—'}</span></div>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeDetailModal({ employee, employees = [], user, isHrStaff = false, onClose, onViewEmployee, onAddDependent, onAddAccomplishment, onVerifyAccomplishment, canViewSensitive = false }) {
  const [detailTab, setDetailTab] = useState('info')
  const [addingDependent, setAddingDependent] = useState(false)
  const [depForm, setDepForm] = useState(EMPTY_DEPENDENT_FORM)
  const [addingAcc, setAddingAcc] = useState(false)
  const [accForm, setAccForm] = useState({ type: ACCOMPLISHMENT_TYPES[0], issuer: '', date: '', expiryDate: '' })

  // Employees maintain their own accomplishments (courses, certificates) — self-added entries
  // stay flagged until HR verifies them. HR can add or verify for anyone.
  const isSelf = !!user?.username && employee?.name?.toLowerCase() === user.username.toLowerCase()
  const canEditAccomplishments = isSelf || isHrStaff

  if (!employee) return null

  const startDate = new Date(employee.startDate)
  const yearsAtCompany = ((new Date() - startDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
  const manager = employees.find((e) => e.id === employee.managerId)
  const totalMonthly = employee.compensation
    ? employee.compensation.basicSalary + employee.compensation.housingAllowance + employee.compensation.transportAllowance
    : null

  const resetDepForm = () => {
    setDepForm({ ...EMPTY_DEPENDENT_FORM, nationality: employee.nationality || '', passportCountry: employee.nationality || '' })
    setAddingDependent(false)
  }

  const handleAddDependent = (e) => {
    e.preventDefault()
    if (!depForm.name.trim() || !depForm.dob) {
      alert('Name and date of birth are required')
      return
    }
    const isUaeNational = depForm.nationality.trim().toLowerCase() === 'united arab emirates'
    const dependent = {
      name: depForm.name.trim(),
      relationship: depForm.relationship,
      dob: depForm.dob,
      nationality: depForm.nationality.trim() || null,
      passport: depForm.passportNumber
        ? { number: depForm.passportNumber, country: depForm.passportCountry || depForm.nationality, type: 'Ordinary', issueDate: null, expiryDate: depForm.passportExpiry || null }
        : null,
      visa: !isUaeNational && depForm.visaNumber
        ? { number: depForm.visaNumber, type: `Residence Visa - Dependent (${depForm.relationship})`, status: 'Valid', issueDate: null, expiryDate: depForm.visaExpiry || null }
        : null,
      emiratesId: depForm.emiratesIdNumber ? { number: depForm.emiratesIdNumber, expiryDate: depForm.emiratesIdExpiry || null } : null,
      insurance: depForm.insuranceProvider
        ? { provider: depForm.insuranceProvider, policyNumber: depForm.insurancePolicyNumber || null, expiryDate: depForm.insuranceExpiry || null }
        : null,
    }
    onAddDependent(employee.id, dependent)
    resetDepForm()
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
        {canViewSensitive && (
          <button
            onClick={() => setDetailTab('visa')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${detailTab === 'visa' ? 'text-brand border-brand' : 'text-gray-500 border-transparent'}`}
          >
            Visa & Dependents
          </button>
        )}
        <button
          onClick={() => setDetailTab('accomplishments')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${detailTab === 'accomplishments' ? 'text-brand border-brand' : 'text-gray-500 border-transparent'}`}
        >
          <Award size={14} className="inline mr-1" />
          Accomplishments
        </button>
        {canViewSensitive && (
          <button
            onClick={() => setDetailTab('compensation')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${detailTab === 'compensation' ? 'text-brand border-brand' : 'text-gray-500 border-transparent'}`}
          >
            <DollarSign size={14} className="inline mr-1" />
            Compensation
          </button>
        )}
        {canViewSensitive && (
          <button
            onClick={() => setDetailTab('documents')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${detailTab === 'documents' ? 'text-brand border-brand' : 'text-gray-500 border-transparent'}`}
          >
            <FileText size={14} className="inline mr-1" />
            Documents
          </button>
        )}
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
              <label className="text-xs text-gray-500">Nationality</label>
              <div className="font-medium text-gray-800">{employee.nationality}</div>
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
            <div>
              <label className="text-xs text-gray-500">Reports To</label>
              {manager ? (
                <button
                  onClick={() => onViewEmployee?.(manager)}
                  className="font-medium text-brand hover:underline block"
                >
                  {manager.name} <span className="text-gray-400 font-normal">— {manager.title}</span>
                </button>
              ) : (
                <div className="font-medium text-gray-800">— (no manager, department head)</div>
              )}
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

          {employee.emergencyContact && (
            <>
              <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3 mt-5">Emergency Contact</h3>
              <div className="space-y-1 text-sm">
                <div className="font-medium text-gray-800">{employee.emergencyContact.name}</div>
                <div className="text-xs text-gray-500">{employee.emergencyContact.relationship}</div>
                <a href={`tel:${employee.emergencyContact.phone}`} className="text-brand hover:underline block">
                  {employee.emergencyContact.phone}
                </a>
              </div>
            </>
          )}
        </div>
        </div>
      )}

      {detailTab === 'visa' && canViewSensitive && (
        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">{employee.name} — Identity Documents</h3>
            <IdentityBlock passport={employee.passport} visa={employee.visa} emiratesId={employee.emiratesId} nationality={employee.nationality} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500">Dependents ({employee.dependents.length})</h3>
              {!addingDependent && (
                <button
                  onClick={() => { setDepForm({ ...EMPTY_DEPENDENT_FORM, nationality: employee.nationality || '', passportCountry: employee.nationality || '' }); setAddingDependent(true) }}
                  className="text-xs font-medium text-brand hover:underline flex items-center gap-1"
                >
                  <Plus size={13} /> Add Dependent
                </button>
              )}
            </div>

            {employee.dependents.length === 0 && !addingDependent && (
              <div className="text-sm text-gray-500">No dependents recorded yet</div>
            )}

            <div className="space-y-4">
              {employee.dependents.map((dep, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="font-medium text-gray-800">{dep.name}</div>
                    <div className="text-xs text-gray-500">{dep.relationship} • Age {calcAge(dep.dob)} • DOB {new Date(dep.dob).toLocaleDateString('en-AE')}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <IdentityBlock passport={dep.passport} visa={dep.visa} emiratesId={dep.emiratesId} nationality={dep.nationality} />
                    <div>
                      <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Health Insurance</h4>
                      {dep.insurance ? (
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between"><span className="text-gray-600">Provider:</span><span className="font-medium">{dep.insurance.provider}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">Policy #:</span><span className="font-medium">{dep.insurance.policyNumber || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">Expiry:</span><span className="font-medium">{dep.insurance.expiryDate ? new Date(dep.insurance.expiryDate).toLocaleDateString('en-AE') : '—'}</span></div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Not on file</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {addingDependent && (
              <form onSubmit={handleAddDependent} className="mt-4 space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                    <input required value={depForm.name} onChange={(e) => setDepForm({ ...depForm, name: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                    <select value={depForm.relationship} onChange={(e) => setDepForm({ ...depForm, relationship: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                      {RELATIONSHIP_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                    <input required type="date" value={depForm.dob} onChange={(e) => setDepForm({ ...depForm, dob: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nationality</label>
                    <input value={depForm.nationality} onChange={(e) => setDepForm({ ...depForm, nationality: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Passport Number</label>
                    <input value={depForm.passportNumber} onChange={(e) => setDepForm({ ...depForm, passportNumber: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Passport Expiry</label>
                    <input type="date" value={depForm.passportExpiry} onChange={(e) => setDepForm({ ...depForm, passportExpiry: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Visa Number (blank if UAE national)</label>
                    <input value={depForm.visaNumber} onChange={(e) => setDepForm({ ...depForm, visaNumber: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Visa Expiry</label>
                    <input type="date" value={depForm.visaExpiry} onChange={(e) => setDepForm({ ...depForm, visaExpiry: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Emirates ID Number</label>
                    <input value={depForm.emiratesIdNumber} onChange={(e) => setDepForm({ ...depForm, emiratesIdNumber: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Emirates ID Expiry</label>
                    <input type="date" value={depForm.emiratesIdExpiry} onChange={(e) => setDepForm({ ...depForm, emiratesIdExpiry: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Insurance Provider</label>
                    <input value={depForm.insuranceProvider} onChange={(e) => setDepForm({ ...depForm, insuranceProvider: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Policy Number</label>
                    <input value={depForm.insurancePolicyNumber} onChange={(e) => setDepForm({ ...depForm, insurancePolicyNumber: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Insurance Expiry</label>
                    <input type="date" value={depForm.insuranceExpiry} onChange={(e) => setDepForm({ ...depForm, insuranceExpiry: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark">Save Dependent</button>
                  <button type="button" onClick={resetDepForm} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {detailTab === 'accomplishments' && (
        <div className="space-y-3">
          {canEditAccomplishments && !addingAcc && (
            <div className="flex justify-end">
              <button
                onClick={() => { setAccForm({ type: ACCOMPLISHMENT_TYPES[0], issuer: '', date: '', expiryDate: '' }); setAddingAcc(true) }}
                className="text-xs font-medium text-brand hover:underline flex items-center gap-1"
              >
                <Plus size={13} /> {isSelf && !isHrStaff ? 'Add my certificate / course' : 'Add accomplishment'}
              </button>
            </div>
          )}

          {addingAcc && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!accForm.issuer.trim() || !accForm.date) {
                  alert('Issuer and date are required')
                  return
                }
                onAddAccomplishment?.(employee.id, {
                  type: accForm.type,
                  issuer: accForm.issuer.trim(),
                  date: accForm.date,
                  expiryDate: accForm.expiryDate || null,
                  verified: isHrStaff, // HR-added entries are verified; self-added await HR
                })
                setAddingAcc(false)
              }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 grid grid-cols-4 gap-2 items-end"
            >
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={accForm.type} onChange={(e) => setAccForm({ ...accForm, type: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                  {ACCOMPLISHMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Issuer</label>
                <input required value={accForm.issuer} onChange={(e) => setAccForm({ ...accForm, issuer: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input required type="date" value={accForm.date} onChange={(e) => setAccForm({ ...accForm, date: e.target.value })} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="flex gap-1">
                <button type="submit" className="flex-1 bg-brand text-white py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark">Add</button>
                <button type="button" onClick={() => setAddingAcc(false)} className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-md text-xs font-medium hover:bg-gray-200">Cancel</button>
              </div>
              {!isHrStaff && (
                <div className="col-span-4 text-xs text-gray-500">Self-added entries show as "Pending HR verification" until HR confirms — no approval workflow needed to submit.</div>
              )}
            </form>
          )}

          {employee.accomplishments && employee.accomplishments.length > 0 ? (
            employee.accomplishments.map((acc, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-blue-900 flex items-center gap-2">
                    {acc.type}
                    {acc.verified === false && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium">Pending HR verification</span>
                    )}
                  </div>
                  <div className="text-xs text-blue-700">{new Date(acc.date).toLocaleDateString('en-AE')}</div>
                </div>
                <div className="text-xs text-blue-800">Issued by: {acc.issuer}</div>
                {acc.expiryDate && (
                  <div className="text-xs text-blue-700 mt-1">
                    Expires: {new Date(acc.expiryDate).toLocaleDateString('en-AE')}
                  </div>
                )}
                {acc.verified === false && isHrStaff && (
                  <button
                    onClick={() => onVerifyAccomplishment?.(employee.id, idx)}
                    className="mt-2 text-xs font-medium text-green-700 hover:underline"
                  >
                    ✓ Verify
                  </button>
                )}
              </div>
            ))
          ) : (
            !addingAcc && <div className="text-sm text-gray-500">No accomplishments recorded yet</div>
          )}
        </div>
      )}

      {detailTab === 'compensation' && canViewSensitive && employee.compensation && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">Monthly Package (AED)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Basic Salary:</span>
                <span className="font-medium">{employee.compensation.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Housing Allowance:</span>
                <span className="font-medium">{employee.compensation.housingAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transport Allowance:</span>
                <span className="font-medium">{employee.compensation.transportAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-800 font-semibold">Total Monthly Package:</span>
                <span className="font-semibold text-brand">{totalMonthly.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">Other Benefits</h3>
            <div className="text-sm text-gray-700">{employee.compensation.otherBenefits}</div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">Notice Period</h3>
            <div className="text-sm text-gray-700">{employee.compensation.noticePeriodDays} days</div>
          </div>
        </div>
      )}

      {detailTab === 'documents' && canViewSensitive && (
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
