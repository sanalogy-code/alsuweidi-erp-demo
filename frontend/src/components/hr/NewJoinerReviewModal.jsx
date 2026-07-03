import { useState } from 'react'
import Modal from '../crm/Modal'
import DocumentChecklist from '../DocumentChecklist'
import EmploymentRecordFields, {
  emptyEmploymentForm, employmentFormComplete, buildEmploymentRecord,
} from './EmploymentRecordFields'
import { EMPLOYEE_DOCUMENT_TYPES } from '../../data/hrData'

// HR's half of the new-joiner flow: verify what the employee submitted, then
// complete the employment record (shared fields with the direct "Add employee" path).

function Info({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-800">{children || '—'}</div>
    </div>
  )
}

export default function NewJoinerReviewModal({ joiner, employees, onClose, onApprove }) {
  const p = joiner.personal
  const fullName = `${p.firstName} ${p.lastName}`

  const [form, setForm] = useState(() => emptyEmploymentForm(joiner.positionTitle || ''))
  const [autoFilled, setAutoFilled] = useState([])

  const canApprove = employmentFormComplete(form)

  const handleApprove = () => {
    onApprove(joiner.id, {
      ...buildEmploymentRecord(form),
      name: fullName,
      email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@alsuweidi.com`,
      phone: p.phone, mobilePhone: p.phone,
      nationality: p.nationality,
      passport: null, visa: null, emiratesId: null,
      dependents: joiner.dependents.map((d) => ({ ...d, nationality: p.nationality, passport: null, visa: null, emiratesId: null, insurance: null })),
      accomplishments: joiner.engineerLicense?.held
        ? [{ type: 'PE License', issuer: joiner.engineerLicense.organization || 'License body', date: new Date().toISOString().slice(0, 10), expiryDate: joiner.engineerLicense.expiryDate || null, verified: true }]
        : [],
      emergencyContact: p.emergencyContact,
      documents: joiner.documents,
      bank: joiner.bank,
    })
    onClose()
  }

  return (
    <Modal title={`New joiner — ${fullName}`} onClose={onClose} wide>
      <div className="grid grid-cols-2 gap-6">
        {/* Left: what the employee submitted */}
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wide font-semibold text-gray-500">Submitted by {p.firstName} on {joiner.submittedDate}</div>
          <div className="grid grid-cols-2 gap-3">
            <Info label="Nationality">{p.nationality}</Info>
            <Info label="Date of birth">{p.dob}</Info>
            <Info label="Marital status">{p.maritalStatus}{joiner.dependents.length > 0 && ` • ${joiner.dependents.length} dependent${joiner.dependents.length > 1 ? 's' : ''}`}</Info>
            <Info label="Lives in">{p.residentialEmirate}{p.inUae === false ? ' (outside UAE)' : ''}</Info>
            <Info label="Contact">{p.phone}<br />{p.personalEmail}</Info>
            <Info label="Emergency contact">{p.emergencyContact?.name} ({p.emergencyContact?.relationship})</Info>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Qualifications</div>
            {joiner.qualifications.map((q, i) => (
              <div key={i} className="text-sm text-gray-800">{q.certificate} — {q.program} ({q.year})</div>
            ))}
            {joiner.engineerLicense?.held && (
              <div className="text-sm text-gray-800 mt-0.5">Engineering license — {joiner.engineerLicense.organization} {joiner.engineerLicense.level}{joiner.engineerLicense.expiryDate ? `, expires ${joiner.engineerLicense.expiryDate}` : ''}</div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Salary account</div>
            <div className="text-sm text-gray-800">{joiner.bank?.bankName} — {joiner.bank?.iban}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1.5">Documents (verify against originals)</div>
            <DocumentChecklist
              docTypes={EMPLOYEE_DOCUMENT_TYPES.filter((t) => joiner.documents.some((d) => d.type === t.key) || t.requiredWhen === 'always')}
              documents={joiner.documents}
              onChange={() => {}}
              readOnly
              ctx={{ nonUaeNational: p.nationality !== 'United Arab Emirates' }}
            />
          </div>
        </div>

        {/* Right: what HR completes */}
        <div className="space-y-3 border-l border-gray-100 pl-6">
          <div className="text-xs uppercase tracking-wide font-semibold text-gray-500">Employment record (HR)</div>
          <EmploymentRecordFields
            form={form}
            setForm={setForm}
            autoFilled={autoFilled}
            setAutoFilled={setAutoFilled}
            employees={employees}
            bankName={joiner.bank?.bankName}
          />

          <button
            onClick={handleApprove}
            disabled={!canApprove}
            className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark disabled:opacity-40"
          >
            Approve & create employee record
          </button>
        </div>
      </div>
    </Modal>
  )
}
