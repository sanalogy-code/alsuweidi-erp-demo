import { useState } from 'react'
import Modal from '../crm/Modal'
import DocumentChecklist, { missingRequiredDocs } from '../DocumentChecklist'
import EmploymentRecordFields, {
  emptyEmploymentForm, employmentFormComplete, buildEmploymentRecord, inputCls, labelCls,
} from './EmploymentRecordFields'
import { EMPLOYEE_DOCUMENT_TYPES, NATIONALITIES, UAE_BANKS, RELATIONSHIP_TYPES } from '../../data/hrData'

// HR direct entry — register an employee without the self-service wizard (walk-ins,
// transfers, records being back-filled). Same employment form as the new-joiner
// review, but the personal side is editable by HR too. Required documents still apply.

const MARITAL = ['Single', 'Married', 'Widowed', 'Divorced']
const EMIRATES = ['Abu Dhabi', 'Al Ain', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']

export default function AddEmployeeModal({ employees, onClose, onAdd }) {
  const [personal, setPersonal] = useState({
    firstName: '', lastName: '', dob: '', nationality: '', maritalStatus: 'Single',
    phone: '', personalEmail: '', residentialEmirate: 'Abu Dhabi',
    emergencyName: '', emergencyRelationship: 'Spouse', emergencyPhone: '',
    bankName: UAE_BANKS[0], iban: '',
  })
  const [documents, setDocuments] = useState([])
  const [form, setForm] = useState(() => emptyEmploymentForm())
  const [autoFilled, setAutoFilled] = useState([])

  const set = (key) => (e) => setPersonal({ ...personal, [key]: e.target.value })

  const docCtx = { nonUaeNational: personal.nationality !== 'United Arab Emirates' }
  const missingDocs = missingRequiredDocs(EMPLOYEE_DOCUMENT_TYPES, documents, docCtx)

  const canSave =
    personal.firstName.trim() && personal.lastName.trim() && personal.nationality &&
    employmentFormComplete(form) && missingDocs.length === 0

  const handleSave = () => {
    onAdd({
      ...buildEmploymentRecord(form),
      name: `${personal.firstName.trim()} ${personal.lastName.trim()}`,
      email: `${personal.firstName.trim().toLowerCase()}.${personal.lastName.trim().toLowerCase()}@alsuweidi.com`,
      phone: personal.phone, mobilePhone: personal.phone,
      nationality: personal.nationality,
      passport: null, visa: null, emiratesId: null,
      dependents: [],
      accomplishments: [],
      emergencyContact: personal.emergencyName
        ? { name: personal.emergencyName, relationship: personal.emergencyRelationship, phone: personal.emergencyPhone }
        : null,
      documents,
      bank: personal.iban ? { bankName: personal.bankName, iban: personal.iban } : null,
    })
    onClose()
  }

  return (
    <Modal title="Add employee — direct entry" onClose={onClose} wide>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800 mb-4">
        For walk-ins, transfers, and back-filled records. If the person can self-serve, ask them to
        log in as a new hire and complete their own profile instead — it lands in your Inbox for review.
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Left: the personal side HR fills in on the employee's behalf */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide font-semibold text-gray-500">Personal details</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>First name *</label><input value={personal.firstName} onChange={set('firstName')} className={inputCls} /></div>
            <div><label className={labelCls}>Last name *</label><input value={personal.lastName} onChange={set('lastName')} className={inputCls} /></div>
            <div><label className={labelCls}>Date of birth</label><input type="date" value={personal.dob} onChange={set('dob')} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Nationality *</label>
              <select value={personal.nationality} onChange={set('nationality')} className={inputCls}>
                <option value="">Select…</option>
                {NATIONALITIES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Marital status</label>
              <select value={personal.maritalStatus} onChange={set('maritalStatus')} className={inputCls}>
                {MARITAL.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Lives in</label>
              <select value={personal.residentialEmirate} onChange={set('residentialEmirate')} className={inputCls}>
                {EMIRATES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Mobile</label><input value={personal.phone} onChange={set('phone')} placeholder="+971…" className={inputCls} /></div>
            <div><label className={labelCls}>Personal email</label><input type="email" value={personal.personalEmail} onChange={set('personalEmail')} className={inputCls} /></div>
          </div>

          <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 pt-2">Emergency contact</div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelCls}>Name</label><input value={personal.emergencyName} onChange={set('emergencyName')} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Relationship</label>
              <select value={personal.emergencyRelationship} onChange={set('emergencyRelationship')} className={inputCls}>
                {RELATIONSHIP_TYPES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Phone</label><input value={personal.emergencyPhone} onChange={set('emergencyPhone')} className={inputCls} /></div>
          </div>

          <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 pt-2">Salary account</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Bank</label>
              <select value={personal.bankName} onChange={set('bankName')} className={inputCls}>
                {UAE_BANKS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>IBAN</label><input value={personal.iban} onChange={set('iban')} placeholder="AE…" className={inputCls} /></div>
          </div>

          <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 pt-2">Documents</div>
          <DocumentChecklist
            docTypes={EMPLOYEE_DOCUMENT_TYPES}
            documents={documents}
            onChange={setDocuments}
            ctx={docCtx}
          />
        </div>

        {/* Right: the employment record, same as the new-joiner review */}
        <div className="space-y-3 border-l border-gray-100 pl-6">
          <div className="text-xs uppercase tracking-wide font-semibold text-gray-500">Employment record</div>
          <EmploymentRecordFields
            form={form}
            setForm={setForm}
            autoFilled={autoFilled}
            setAutoFilled={setAutoFilled}
            employees={employees}
            bankName={personal.bankName}
          />

          {missingDocs.length > 0 && (
            <div className="text-xs text-red-600">
              Missing required document{missingDocs.length > 1 ? 's' : ''}: {missingDocs.map((d) => d.label).join(', ')}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark disabled:opacity-40"
          >
            Create employee record
          </button>
        </div>
      </div>
    </Modal>
  )
}
