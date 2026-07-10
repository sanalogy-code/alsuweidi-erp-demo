import { useState } from 'react'
import { CheckCircle, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import DocumentChecklist, { missingRequiredDocs } from '../DocumentChecklist'
import { EMPLOYEE_DOCUMENT_TYPES, NATIONALITIES, UAE_BANKS, RELATIONSHIP_TYPES } from '../../data/hrData'
import { todayISO } from '../../utils/date'

// The employee-facing half of the redesigned "Register New Employee" flow.
// Four short steps asking only what the employee knows; everything HR decides
// (department, salary, probation, WPS, work permit) lives in the HR review step.

const STEPS = ['Personal', 'Qualifications', 'Documents', 'Bank & family']

const EMIRATES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']
const CERT_LEVELS = ["High school", "Diploma", "Bachelor's", "Master's", 'PhD']

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export default function NewJoinerWizard({ user, onSubmit }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  const [personal, setPersonal] = useState({
    firstName: user?.username?.split(' ')[0] || '', lastName: user?.username?.split(' ').slice(1).join(' ') || '',
    gender: '', dob: '', nationality: '', maritalStatus: 'Single', personalEmail: '', phone: '',
    residentialEmirate: 'Abu Dhabi', inUae: true,
    emergencyContact: { name: '', relationship: 'Spouse', phone: '' },
  })
  const [qualifications, setQualifications] = useState([{ certificate: "Bachelor's", program: '', year: '' }])
  const [engineerLicense, setEngineerLicense] = useState({ held: false, organization: '', level: '', expiryDate: '' })
  const [documents, setDocuments] = useState([])
  const [bank, setBank] = useState({ bankName: '', iban: '' })
  const [dependents, setDependents] = useState([])

  const isUaeNational = personal.nationality === 'United Arab Emirates'
  // Auto-fill: UAE nationals never need a visa page; people outside the UAE don't have one yet.
  const needsVisaDoc = !isUaeNational && personal.inUae
  const docCtx = { nonUaeNational: needsVisaDoc }
  const missing = missingRequiredDocs(EMPLOYEE_DOCUMENT_TYPES, documents, docCtx)

  const stepValid = () => {
    if (step === 0) return personal.firstName.trim() && personal.lastName.trim() && personal.dob && personal.nationality && personal.gender
    if (step === 1) return qualifications.every((q) => q.program.trim() && q.year)
    if (step === 2) return missing.length === 0
    if (step === 3) return bank.bankName && bank.iban.trim()
    return true
  }

  const handleSubmit = () => {
    onSubmit({
      status: 'submitted',
      submittedDate: todayISO(),
      personal, qualifications, engineerLicense, documents, bank, dependents,
      positionTitle: null,
    })
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 text-center space-y-3">
        <CheckCircle size={40} className="text-green-600 mx-auto" />
        <div className="text-lg font-semibold text-gray-800">Profile sent to HR</div>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          HR will verify your documents and complete your employment record — you'll be contacted if anything is missing.
          Meanwhile, work through your onboarding checklist.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">Complete your employee profile</h2>
        <p className="text-xs text-gray-500">Four short steps — HR adds the employment details after reviewing.</p>
        <div className="flex gap-1 mt-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${i <= step ? 'bg-brand' : 'bg-gray-200'}`} />
              <div className={`text-[10px] mt-1 ${i === step ? 'text-brand font-semibold' : 'text-gray-400'}`}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {step === 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>First name *</label><input value={personal.firstName} onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Last name *</label><input value={personal.lastName} onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Gender *</label>
                <select value={personal.gender} onChange={(e) => setPersonal({ ...personal, gender: e.target.value })} className={inputCls}>
                  <option value="">Select…</option><option>Female</option><option>Male</option>
                </select>
              </div>
              <div><label className={labelCls}>Date of birth *</label><input type="date" value={personal.dob} onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Nationality *</label>
                <select value={personal.nationality} onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })} className={inputCls}>
                  <option value="">Select…</option>
                  {NATIONALITIES.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Marital status</label>
                <select value={personal.maritalStatus} onChange={(e) => setPersonal({ ...personal, maritalStatus: e.target.value })} className={inputCls}>
                  <option>Single</option><option>Married</option>
                </select>
              </div>
              <div><label className={labelCls}>Personal email</label><input type="email" value={personal.personalEmail} onChange={(e) => setPersonal({ ...personal, personalEmail: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>UAE phone</label><input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} placeholder="+971-5x-xxx-xxxx" className={inputCls} /></div>
              <div>
                <label className={labelCls}>Where you live (emirate)</label>
                <select value={personal.residentialEmirate} onChange={(e) => setPersonal({ ...personal, residentialEmirate: e.target.value })} className={inputCls}>
                  {EMIRATES.map((em) => <option key={em}>{em}</option>)}
                </select>
              </div>
              {!isUaeNational && personal.nationality && (
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={personal.inUae} onChange={(e) => setPersonal({ ...personal, inUae: e.target.checked })} className="rounded border-gray-300 text-brand focus:ring-brand" />
                    I'm currently in the UAE on a visa
                  </label>
                </div>
              )}
            </div>
            {isUaeNational && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 text-xs text-green-800">
                UAE national — no residence visa needed, so the visa document step is skipped automatically.
              </div>
            )}
            <div className="border-t border-gray-100 pt-4">
              <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Emergency contact</div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={labelCls}>Name</label><input value={personal.emergencyContact.name} onChange={(e) => setPersonal({ ...personal, emergencyContact: { ...personal.emergencyContact, name: e.target.value } })} className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Relationship</label>
                  <select value={personal.emergencyContact.relationship} onChange={(e) => setPersonal({ ...personal, emergencyContact: { ...personal.emergencyContact, relationship: e.target.value } })} className={inputCls}>
                    {RELATIONSHIP_TYPES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Phone</label><input value={personal.emergencyContact.phone} onChange={(e) => setPersonal({ ...personal, emergencyContact: { ...personal.emergencyContact, phone: e.target.value } })} className={inputCls} /></div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide font-semibold text-gray-500">Education</div>
              <button type="button" onClick={() => setQualifications([...qualifications, { certificate: "Bachelor's", program: '', year: '' }])} className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
                <Plus size={12} /> Add another
              </button>
            </div>
            {qualifications.map((q, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_100px_auto] gap-2 items-end">
                <div>
                  <label className={labelCls}>Certificate *</label>
                  <select value={q.certificate} onChange={(e) => setQualifications(qualifications.map((x, j) => (j === i ? { ...x, certificate: e.target.value } : x)))} className={inputCls}>
                    {CERT_LEVELS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Program / field *</label><input value={q.program} placeholder="e.g. Civil Engineering" onChange={(e) => setQualifications(qualifications.map((x, j) => (j === i ? { ...x, program: e.target.value } : x)))} className={inputCls} /></div>
                <div><label className={labelCls}>Year *</label><input value={q.year} placeholder="2018" onChange={(e) => setQualifications(qualifications.map((x, j) => (j === i ? { ...x, year: e.target.value } : x)))} className={inputCls} /></div>
                {qualifications.length > 1 ? (
                  <button type="button" onClick={() => setQualifications(qualifications.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 pb-2.5"><X size={14} /></button>
                ) : <span />}
              </div>
            ))}
            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={engineerLicense.held} onChange={(e) => setEngineerLicense({ ...engineerLicense, held: e.target.checked })} className="rounded border-gray-300 text-brand focus:ring-brand" />
                I hold an engineering license
              </label>
              {engineerLicense.held && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div><label className={labelCls}>Issuing organization</label><input value={engineerLicense.organization} placeholder="e.g. Society of Engineers UAE" onChange={(e) => setEngineerLicense({ ...engineerLicense, organization: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>Level</label><input value={engineerLicense.level} placeholder="e.g. Professional" onChange={(e) => setEngineerLicense({ ...engineerLicense, level: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>Expiry date</label><input type="date" value={engineerLicense.expiryDate} onChange={(e) => setEngineerLicense({ ...engineerLicense, expiryDate: e.target.value })} className={inputCls} /></div>
                </div>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs text-gray-500">
              Upload clear scans or photos. Required documents must be attached before you can continue
              {isUaeNational ? ' — as a UAE national you don’t need a visa page.' : needsVisaDoc ? '.' : ' — since you’re outside the UAE, the visa page isn’t needed yet.'}
            </p>
            <DocumentChecklist
              docTypes={EMPLOYEE_DOCUMENT_TYPES.filter((t) => t.key !== 'visa' || needsVisaDoc)}
              documents={documents}
              onChange={setDocuments}
              ctx={docCtx}
            />
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Bank *</label>
                <select value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} className={inputCls}>
                  <option value="">Select…</option>
                  {UAE_BANKS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>IBAN *</label><input value={bank.iban} placeholder="AE.. .... .... .... .... ..." onChange={(e) => setBank({ ...bank, iban: e.target.value })} className={inputCls} /></div>
            </div>
            <p className="text-xs text-gray-500">Your salary is paid to this account via WPS. It must be in your own name.</p>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide font-semibold text-gray-500">Family / dependents (optional)</div>
                <button type="button" onClick={() => setDependents([...dependents, { name: '', relationship: 'Spouse', dob: '' }])} className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add dependent
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Only if ALSUWEIDI will sponsor or insure them — HR collects their documents later.</p>
              {dependents.map((d, i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end mb-2">
                  <div><label className={labelCls}>Name</label><input value={d.name} onChange={(e) => setDependents(dependents.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={inputCls} /></div>
                  <div>
                    <label className={labelCls}>Relationship</label>
                    <select value={d.relationship} onChange={(e) => setDependents(dependents.map((x, j) => (j === i ? { ...x, relationship: e.target.value } : x)))} className={inputCls}>
                      {RELATIONSHIP_TYPES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Date of birth</label><input type="date" value={d.dob} onChange={(e) => setDependents(dependents.map((x, j) => (j === i ? { ...x, dob: e.target.value } : x)))} className={inputCls} /></div>
                  <button type="button" onClick={() => setDependents(dependents.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 pb-2.5"><X size={14} /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Back
        </button>
        {step === 2 && missing.length > 0 && (
          <span className="text-xs text-red-600">{missing.length} required document{missing.length > 1 ? 's' : ''} missing</span>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!stepValid()}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark disabled:opacity-40"
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!stepValid()}
            className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark disabled:opacity-40"
          >
            Send to HR
          </button>
        )}
      </div>
    </div>
  )
}
