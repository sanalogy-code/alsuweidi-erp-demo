import { Sparkles } from 'lucide-react'
import {
  DEPARTMENTS, DESIGNATIONS, EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_DEFAULTS,
  SCHEDULE_PRESETS, PAYROLL_CATEGORIES,
  WORK_WEEK_PATTERNS, DEFAULT_WORK_WEEK, defaultWorkWeekFor,
} from '../../data/hrData'

// The HR half of an employee record — shared by the new-joiner review modal and
// HR's direct "Add employee" entry. Designation and employment type auto-fill the
// policy fields the old form asked one by one; HR only overrides exceptions.

export const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand'
export const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export const emptyEmploymentForm = (positionTitle = '') => ({
  designation: positionTitle,
  dept: '', seniority: '',
  workPermitTitle: positionTitle,
  joiningDate: '', managerId: '',
  employmentType: 'Full-time',
  schedule: SCHEDULE_PRESETS[0],
  workWeek: DEFAULT_WORK_WEEK,
  probationMonths: EMPLOYMENT_TYPE_DEFAULTS['Full-time'].probationMonths,
  noticePeriodDays: EMPLOYMENT_TYPE_DEFAULTS['Full-time'].noticePeriodDays,
  guaranteedIncrement: false, incrementAmount: '',
  basicSalary: '', housingAllowance: '', transportAllowance: '',
  payrollCategory: 'Staff (WPS)',
})

export const employmentFormComplete = (form) =>
  form.designation && form.dept && form.joiningDate && form.basicSalary &&
  (!form.guaranteedIncrement || form.incrementAmount)

export const probationEndDate = (form) => {
  if (!form.joiningDate || !Number(form.probationMonths)) return null
  const d = new Date(form.joiningDate)
  d.setMonth(d.getMonth() + Number(form.probationMonths))
  return d.toISOString().slice(0, 10)
}

// The employment-side fields of an employee record, built from the form.
// Callers add the person-side fields (name, contact, documents, bank…).
export const buildEmploymentRecord = (form) => ({
  title: form.designation,
  dept: form.dept,
  location: 'Abu Dhabi HQ',
  employmentType: form.employmentType,
  startDate: form.joiningDate,
  status: 'active',
  managerId: form.managerId ? Number(form.managerId) : null,
  workWeek: form.workWeek || DEFAULT_WORK_WEEK,
  contractEndDate: null,
  compensation: {
    basicSalary: Number(form.basicSalary) || 0,
    housingAllowance: Number(form.housingAllowance) || 0,
    transportAllowance: Number(form.transportAllowance) || 0,
    otherBenefits: 'Health insurance (individual)',
    noticePeriodDays: Number(form.noticePeriodDays) || 30,
  },
  probation: Number(form.probationMonths) > 0 ? {
    months: Number(form.probationMonths),
    endDate: probationEndDate(form),
    guaranteedIncrement: form.guaranteedIncrement
      ? { amount: Number(form.incrementAmount), note: 'Agreed at offer — applies to basic salary', applied: false }
      : null,
  } : null,
  schedule: form.schedule,
  payrollCategory: form.payrollCategory,
})

export default function EmploymentRecordFields({ form, setForm, autoFilled, setAutoFilled, employees, bankName }) {
  const pickDesignation = (title) => {
    const d = DESIGNATIONS.find((x) => x.title === title)
    setForm({ ...form, designation: title, workPermitTitle: title, dept: d?.dept || form.dept, seniority: d?.seniority || form.seniority })
    setAutoFilled(d ? ['dept', 'seniority', 'workPermitTitle'] : [])
  }

  const pickEmploymentType = (t) => {
    const d = EMPLOYMENT_TYPE_DEFAULTS[t]
    setForm({ ...form, employmentType: t, probationMonths: d.probationMonths, noticePeriodDays: d.noticePeriodDays, workWeek: defaultWorkWeekFor({ employmentType: t }) })
    setAutoFilled([...new Set([...autoFilled, 'probationMonths', 'noticePeriodDays', 'workWeek'])])
  }

  const netMonthly = (Number(form.basicSalary) || 0) + (Number(form.housingAllowance) || 0) + (Number(form.transportAllowance) || 0)
  const typeDefaults = EMPLOYMENT_TYPE_DEFAULTS[form.employmentType]

  const auto = (key) => autoFilled.includes(key) && (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 ml-1"><Sparkles size={9} /> auto</span>
  )

  return (
    <>
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
        <div>
          <label className={labelCls}>Work week {auto('workWeek')}</label>
          <select value={form.workWeek || DEFAULT_WORK_WEEK} onChange={(e) => setForm({ ...form, workWeek: e.target.value })} className={inputCls}>
            {Object.entries(WORK_WEEK_PATTERNS).map(([key, p]) => <option key={key} value={key}>{p.label}</option>)}
          </select>
          <div className="text-[10px] text-gray-400 mt-0.5">Drives timesheet & leave-calendar weekends — pick Sun–Thu for Jordan-based staff.</div>
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
                {probationEndDate(form) ? `Applies from ${probationEndDate(form)}` : 'Set the joining date to compute the due date'}
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
        <div className="text-[10px] text-gray-400 mt-0.5">WPS goes to {bankName || 'the bank'} account above. Work permit & visa are tracked as PRO tasks once created.</div>
      </div>
    </>
  )
}
