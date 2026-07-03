import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import Modal from '../crm/Modal'
import DocumentChecklist from '../DocumentChecklist'
import {
  DEPARTMENTS, DESIGNATIONS, EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_DEFAULTS,
  SCHEDULE_PRESETS, PAYROLL_CATEGORIES, EMPLOYEE_DOCUMENT_TYPES,
} from '../../data/hrData'

// HR's half of the new-joiner flow: verify what the employee submitted, then
// complete the employment record. Designation and employment type auto-fill the
// policy fields the old form asked one by one — HR only overrides exceptions.

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

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

  const [form, setForm] = useState({
    designation: joiner.positionTitle || '',
    dept: '', seniority: '',
    workPermitTitle: joiner.positionTitle || '',
    joiningDate: '', managerId: '',
    employmentType: 'Full-time',
    schedule: SCHEDULE_PRESETS[0],
    probationMonths: EMPLOYMENT_TYPE_DEFAULTS['Full-time'].probationMonths,
    noticePeriodDays: EMPLOYMENT_TYPE_DEFAULTS['Full-time'].noticePeriodDays,
    guaranteedIncrement: false, incrementAmount: '',
    basicSalary: '', housingAllowance: '', transportAllowance: '',
    payrollCategory: 'Staff (WPS)',
  })
  const [autoFilled, setAutoFilled] = useState([])

  const pickDesignation = (title) => {
    const d = DESIGNATIONS.find((x) => x.title === title)
    setForm({ ...form, designation: title, workPermitTitle: title, dept: d?.dept || form.dept, seniority: d?.seniority || form.seniority })
    setAutoFilled(d ? ['dept', 'seniority', 'workPermitTitle'] : [])
  }

  const pickEmploymentType = (t) => {
    const d = EMPLOYMENT_TYPE_DEFAULTS[t]
    setForm({ ...form, employmentType: t, probationMonths: d.probationMonths, noticePeriodDays: d.noticePeriodDays })
    setAutoFilled([...new Set([...autoFilled, 'probationMonths', 'noticePeriodDays'])])
  }

  const netMonthly = (Number(form.basicSalary) || 0) + (Number(form.housingAllowance) || 0) + (Number(form.transportAllowance) || 0)
  const typeDefaults = EMPLOYMENT_TYPE_DEFAULTS[form.employmentType]

  const canApprove = form.designation && form.dept && form.joiningDate && form.basicSalary &&
    (!form.guaranteedIncrement || form.incrementAmount)

  const probationEnd = () => {
    if (!form.joiningDate || !Number(form.probationMonths)) return null
    const d = new Date(form.joiningDate)
    d.setMonth(d.getMonth() + Number(form.probationMonths))
    return d.toISOString().slice(0, 10)
  }

  const handleApprove = () => {
    onApprove(joiner.id, {
      name: fullName,
      title: form.designation,
      dept: form.dept,
      location: 'Abu Dhabi HQ',
      employmentType: form.employmentType,
      email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@alsuweidi.com`,
      phone: p.phone, mobilePhone: p.phone,
      startDate: form.joiningDate,
      status: 'active',
      managerId: form.managerId ? Number(form.managerId) : null,
      contractEndDate: null,
      nationality: p.nationality,
      passport: null, visa: null, emiratesId: null,
      dependents: joiner.dependents.map((d) => ({ ...d, nationality: p.nationality, passport: null, visa: null, emiratesId: null, insurance: null })),
      accomplishments: joiner.engineerLicense?.held
        ? [{ type: 'PE License', issuer: joiner.engineerLicense.organization || 'License body', date: new Date().toISOString().slice(0, 10), expiryDate: joiner.engineerLicense.expiryDate || null, verified: true }]
        : [],
      emergencyContact: p.emergencyContact,
      compensation: {
        basicSalary: Number(form.basicSalary) || 0,
        housingAllowance: Number(form.housingAllowance) || 0,
        transportAllowance: Number(form.transportAllowance) || 0,
        otherBenefits: 'Health insurance (individual)',
        noticePeriodDays: Number(form.noticePeriodDays) || 30,
      },
      probation: Number(form.probationMonths) > 0 ? {
        months: Number(form.probationMonths),
        endDate: probationEnd(),
        guaranteedIncrement: form.guaranteedIncrement
          ? { amount: Number(form.incrementAmount), note: 'Agreed at offer — applies to basic salary', applied: false }
          : null,
      } : null,
      documents: joiner.documents,
      bank: joiner.bank,
      schedule: form.schedule,
      payrollCategory: form.payrollCategory,
    })
    onClose()
  }

  const auto = (key) => autoFilled.includes(key) && (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 ml-1"><Sparkles size={9} /> auto</span>
  )

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
          <div>
            <label className={labelCls}>Designation *</label>
            <select value={form.designation} onChange={(e) => pickDesignation(e.target.value)} className={inputCls}>
              <option value="">Select…</option>
              {DESIGNATIONS.map((d) => <option key={d.title} value={d.title}>{d.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Department * {auto('dept')}</label>
              <select value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} className={inputCls}>
                <option value="">Select…</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Seniority {auto('seniority')}</label>
              <input value={form.seniority} onChange={(e) => setForm({ ...form, seniority: e.target.value })} className={inputCls} />
            </div>
            <div><label className={labelCls}>Joining date *</label><input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Manager</label>
              <select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })} className={inputCls}>
                <option value="">Not assigned</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Employment type</label>
              <select value={form.employmentType} onChange={(e) => pickEmploymentType(e.target.value)} className={inputCls}>
                {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Schedule</label>
              <select value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className={inputCls}>
                {SCHEDULE_PRESETS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Probation (months) {auto('probationMonths')}</label><input type="number" min="0" value={form.probationMonths} onChange={(e) => setForm({ ...form, probationMonths: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Notice period (days) {auto('noticePeriodDays')}</label><input type="number" min="0" value={form.noticePeriodDays} onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })} className={inputCls} /></div>
          </div>
          <div className="bg-gray-50 rounded-md p-2.5 text-xs text-gray-500">
            {form.employmentType} policy defaults applied: severance {typeDefaults.severancePay.toLowerCase()}, leave on {typeDefaults.leaveBasis.toLowerCase()}, timesheet {typeDefaults.timesheetRequired ? 'required' : 'not required'}. Override above only for exceptions.
          </div>
          <div>
            <label className={labelCls}>Title on work permit {auto('workPermitTitle')}</label>
            <input value={form.workPermitTitle} onChange={(e) => setForm({ ...form, workPermitTitle: e.target.value })} className={inputCls} />
            <div className="text-[10px] text-gray-400 mt-0.5">Defaults to the designation — change only if MOHRE requires different wording.</div>
          </div>

          {Number(form.probationMonths) > 0 && (
            <div className="border border-gray-200 rounded-md p-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.guaranteedIncrement} onChange={(e) => setForm({ ...form, guaranteedIncrement: e.target.checked })} className="rounded border-gray-300 text-brand focus:ring-brand" />
                Guaranteed salary increment after probation
              </label>
              {form.guaranteedIncrement && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div><label className={labelCls}>Increment (AED / month) *</label><input type="number" min="0" value={form.incrementAmount} onChange={(e) => setForm({ ...form, incrementAmount: e.target.value })} className={inputCls} /></div>
                  <div className="text-xs text-gray-500 self-end pb-2">
                    {probationEnd() ? `Applies from ${probationEnd()}` : 'Set the joining date to compute the due date'}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelCls}>Basic salary *</label><input type="number" min="0" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Housing</label><input type="number" min="0" value={form.housingAllowance} onChange={(e) => setForm({ ...form, housingAllowance: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Transport</label><input type="number" min="0" value={form.transportAllowance} onChange={(e) => setForm({ ...form, transportAllowance: e.target.value })} className={inputCls} /></div>
          </div>
          <div className="flex items-center justify-between bg-gray-800 text-white rounded-md px-3 py-2 text-sm">
            <span>Net monthly</span><span className="font-semibold">AED {netMonthly.toLocaleString()}</span>
          </div>
          <div>
            <label className={labelCls}>Payroll category</label>
            <select value={form.payrollCategory} onChange={(e) => setForm({ ...form, payrollCategory: e.target.value })} className={inputCls}>
              {PAYROLL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="text-[10px] text-gray-400 mt-0.5">WPS goes to {joiner.bank?.bankName || 'the bank'} account above. Work permit & visa are tracked as PRO tasks once created.</div>
          </div>

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
