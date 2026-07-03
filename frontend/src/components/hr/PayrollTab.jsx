import { useState } from 'react'
import { Banknote, Users, FileDown, CheckCircle, Clock, Gift } from 'lucide-react'
import Modal from '../crm/Modal'
import { PAYROLL_MONTHS, PAYROLL_ADJUSTMENTS } from '../../data/hrData'

const fmt = (n) => n.toLocaleString()

const STATUS_META = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'WPS Submitted', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
}

// UAE end-of-service gratuity: 21 days of basic pay per year for the first 5 years,
// 30 days per year beyond that. Shown as an estimate on the payslip; the same
// estimate (as of the last working day) becomes the end-of-service settlement line
// folded into the final month's run.
function gratuityEstimate(employee, asOf = new Date()) {
  const years = (new Date(asOf) - new Date(employee.startDate)) / (1000 * 60 * 60 * 24 * 365.25)
  const daily = employee.compensation.basicSalary / 30
  const first = Math.min(years, 5) * 21 * daily
  const rest = Math.max(years - 5, 0) * 30 * daily
  return Math.round(first + rest)
}

const prevMonthOf = (month) => {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
const daysInMonthOf = (month) => {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}
const fmtDay = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

// Payroll cutoff & catch-up rules (decisions 3 Jul):
//  - Last working day set (offboarding): the final month is pro-rated to that day
//    and the end-of-service settlement folds into the same run ("Final settlement").
//    After that month the employee drops off the run entirely.
//  - Mid-month hire: the joining month pays nothing (deferred), and the pro-rated
//    "late pay" for the partial joining month lands on the NEXT month's run.
function buildRows(employees, month, offboardings = []) {
  const adjustments = PAYROLL_ADJUSTMENTS[month] || []
  const daysInMonth = daysInMonthOf(month)
  const prevMonth = prevMonthOf(month)
  const rows = []
  const deferredJoiners = []

  employees.filter((e) => e.compensation).forEach((e) => {
    const { basicSalary, housingAllowance, transportAllowance } = e.compensation
    const gross = basicSalary + housingAllowance + transportAllowance
    const joinMonth = e.startDate.slice(0, 7)
    const joinDay = Number(e.startDate.slice(8, 10))

    // Not employed yet this month
    if (joinMonth > month) return
    // Mid-month hire: joining month is deferred to the next cycle
    if (joinMonth === month && joinDay > 1) {
      deferredJoiners.push(e)
      return
    }

    const ob = offboardings.find((o) => o.employeeId === e.id && o.lastWorkingDay)
    // Payroll stops after the last working day — off the run entirely
    if (ob && ob.lastWorkingDay.slice(0, 7) < month) return

    const flags = []
    let factor = 1
    let settlement = 0
    if (ob && ob.lastWorkingDay.slice(0, 7) === month) {
      const lwdDay = Number(ob.lastWorkingDay.slice(8, 10))
      factor = lwdDay / daysInMonth
      settlement = gratuityEstimate(e, ob.lastWorkingDay)
      flags.push({ label: 'Final settlement', chip: 'bg-red-100 text-red-700', detail: `Pro-rated to last working day ${fmtDay(ob.lastWorkingDay)} + end-of-service settlement` })
    }

    let catchup = 0
    if (joinMonth === prevMonth && joinDay > 1) {
      const daysPrev = daysInMonthOf(prevMonth)
      catchup = Math.round(gross * (daysPrev - joinDay + 1) / daysPrev)
      flags.push({ label: 'Late pay catch-up', chip: 'bg-blue-100 text-blue-700', detail: `Joining month (${fmtDay(e.startDate)}) pro-rated pay, deferred one cycle` })
    }

    const adj = adjustments.find((a) => a.employeeId === e.id)
    const overtime = adj?.overtime || 0
    const deduction = adj?.deduction || 0
    const basic = Math.round(basicSalary * factor)
    const allowances = Math.round((housingAllowance + transportAllowance) * factor)
    rows.push({
      employee: e,
      basicSalary: basic,
      allowances,
      overtime,
      deduction,
      catchup,
      settlement,
      flags,
      lastWorkingDay: settlement ? ob.lastWorkingDay : null,
      note: adj?.note || '',
      net: basic + allowances + overtime + catchup + settlement - deduction,
    })
  })

  return { rows: rows.sort((a, b) => b.net - a.net), deferredJoiners }
}

function PayslipModal({ row, month, onClose }) {
  const { employee } = row
  const monthLabel = PAYROLL_MONTHS.find((m) => m.value === month)?.label || month
  const prorated = !!row.lastWorkingDay
  return (
    <Modal title={`Payslip — ${employee.name}${row.settlement > 0 ? ' (Final settlement)' : ''}`} onClose={onClose}>
      <div className="space-y-5 text-sm">
        <div className="flex justify-between text-xs text-gray-500">
          <div>
            <div className="font-medium text-gray-800 text-sm">{employee.name}</div>
            <div>{employee.title} • {employee.dept}</div>
          </div>
          <div className="text-right">
            <div className="font-medium text-gray-800 text-sm">{monthLabel}</div>
            <div>Paid via WPS transfer</div>
          </div>
        </div>

        {prorated && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800">
            <span className="font-semibold">Final settlement:</span> payroll stops after the last working day
            ({fmtDay(row.lastWorkingDay)}) — salary and allowances are pro-rated to that date, and the
            end-of-service settlement is folded into this run.
          </div>
        )}

        <div>
          <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Earnings (AED)</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-600">Basic Salary{prorated && ` (pro-rated to ${fmtDay(row.lastWorkingDay)})`}</span><span className="font-medium">{fmt(row.basicSalary)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Housing + Transport Allowances{prorated && ' (pro-rated)'}</span><span className="font-medium">{fmt(row.allowances)}</span></div>
            {row.overtime > 0 && (
              <div className="flex justify-between"><span className="text-gray-600">Overtime</span><span className="font-medium text-green-700">+{fmt(row.overtime)}</span></div>
            )}
            {row.catchup > 0 && (
              <div className="flex justify-between"><span className="text-gray-600">Late pay catch-up (joining month, from {fmtDay(employee.startDate)})</span><span className="font-medium text-green-700">+{fmt(row.catchup)}</span></div>
            )}
            {row.settlement > 0 && (
              <div className="flex justify-between"><span className="text-gray-600">End-of-service settlement (gratuity, est.)</span><span className="font-medium text-green-700">+{fmt(row.settlement)}</span></div>
            )}
          </div>
        </div>

        {row.deduction > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Deductions (AED)</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">{row.note}</span>
              <span className="font-medium text-red-600">−{fmt(row.deduction)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-3 border-t border-gray-200">
          <span className="font-semibold text-gray-800">Net Pay</span>
          <span className="font-semibold text-brand text-base">{fmt(row.net)}</span>
        </div>

        <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 space-y-1">
          <div className="flex justify-between"><span>Gratuity accrued to date (est.)</span><span className="font-medium">{fmt(gratuityEstimate(employee))} AED</span></div>
          <div className="flex justify-between"><span>Notice period</span><span className="font-medium">{employee.compensation.noticePeriodDays} days</span></div>
        </div>
      </div>
    </Modal>
  )
}

export default function PayrollTab({ employees, offboardings = [], referralBonuses = [], timesheetHold = 0, onViewTimesheets }) {
  const [month, setMonth] = useState(PAYROLL_MONTHS[0].value)
  const [statusByMonth, setStatusByMonth] = useState(
    Object.fromEntries(PAYROLL_MONTHS.map((m) => [m.value, m.status]))
  )
  const [payslipRow, setPayslipRow] = useState(null)

  const { rows, deferredJoiners } = buildRows(employees, month, offboardings)
  const totalNet = rows.reduce((s, r) => s + r.net, 0)
  const totalOvertime = rows.reduce((s, r) => s + r.overtime + r.catchup + r.settlement, 0)
  const totalDeductions = rows.reduce((s, r) => s + r.deduction, 0)
  const status = statusByMonth[month]
  const statusMeta = STATUS_META[status]

  const advanceStatus = () => {
    const next = status === 'draft' ? 'submitted' : 'paid'
    setStatusByMonth({ ...statusByMonth, [month]: next })
  }

  return (
    <div className="space-y-6">
      {timesheetHold > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-amber-800">
            <span className="font-semibold">{timesheetHold} employee{timesheetHold > 1 ? 's have' : ' has'} unsubmitted timesheets for last week</span>
            {' '}— per policy, unsubmitted timesheets block payroll processing for those employees.
          </span>
          {onViewTimesheets && (
            <button onClick={onViewTimesheets} className="text-xs font-medium text-brand hover:underline shrink-0">View timesheets</button>
          )}
        </div>
      )}
      {deferredJoiners.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          {deferredJoiners.map((e) => (
            <div key={e.id}>
              <span className="font-semibold">{e.name}</span> joined mid-month ({fmtDay(e.startDate)}) —
              the pro-rated joining-month pay is deferred and lands on the <span className="font-semibold">next</span> month's
              run as a "Late pay catch-up" line.
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-1">Payroll</h2>
          <p className="text-xs text-gray-500">Monthly WPS salary run — basic + allowances, overtime, and deductions.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {PAYROLL_MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          {status !== 'paid' && (
            <button
              onClick={advanceStatus}
              className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1"
            >
              {status === 'draft' ? (<><FileDown size={13} /> Generate WPS SIF</>) : (<><CheckCircle size={13} /> Mark as Paid</>)}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Banknote size={16} className="text-brand mb-1" />
          <div className="text-xs text-gray-500">Total Net Payroll</div>
          <div className="text-xl font-bold text-gray-800">{fmt(totalNet)} <span className="text-xs font-normal text-gray-400">AED</span></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Users size={16} className="text-brand mb-1" />
          <div className="text-xs text-gray-500">Employees on Run</div>
          <div className="text-xl font-bold text-gray-800">{rows.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Clock size={16} className="text-green-600 mb-1" />
          <div className="text-xs text-gray-500">Extras / Deductions</div>
          <div className="text-xl font-bold text-gray-800">
            <span className="text-green-700">+{fmt(totalOvertime)}</span> <span className="text-red-600">−{fmt(totalDeductions)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500 mb-2">Run Status</div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusMeta.color}`}>{statusMeta.label}</span>
        </div>
      </div>

      {referralBonuses.filter((b) => b.status === 'pending_payroll').length > 0 && (
        <div className="bg-white border border-green-200 rounded-lg shadow-sm p-4">
          <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Gift size={15} className="text-green-600" /> Referral gifts to add to this run
          </div>
          {referralBonuses.filter((b) => b.status === 'pending_payroll').map((b) => (
            <div key={b.id} className="flex justify-between items-center text-sm py-1">
              <span className="text-gray-700">{b.referrer} — referred {b.candidate} (hired {b.awardedDate})</span>
              <span className="font-semibold text-green-700">+AED {b.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Employee</th>
              <th className="text-right px-4 py-2">Basic</th>
              <th className="text-right px-4 py-2">Allowances</th>
              <th className="text-right px-4 py-2">Overtime / extras</th>
              <th className="text-right px-4 py-2">Deductions</th>
              <th className="text-right px-4 py-2">Net Pay (AED)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.employee.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => setPayslipRow(row)}>
                <td className="px-4 py-2.5">
                  <div className="font-medium text-brand hover:underline flex items-center gap-2">
                    {row.employee.name}
                    {row.flags.map((f) => (
                      <span key={f.label} title={f.detail} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${f.chip}`}>{f.label}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">{row.employee.title}</div>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.basicSalary)}</td>
                <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.allowances)}</td>
                <td className="px-4 py-2.5 text-right">
                  {row.overtime + row.catchup + row.settlement > 0
                    ? <span className="text-green-700" title={[row.overtime > 0 && `Overtime +${fmt(row.overtime)}`, row.catchup > 0 && `Late pay catch-up +${fmt(row.catchup)}`, row.settlement > 0 && `End-of-service settlement +${fmt(row.settlement)}`].filter(Boolean).join(' • ')}>
                        +{fmt(row.overtime + row.catchup + row.settlement)}
                      </span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {row.deduction > 0 ? (
                    <span className="text-red-600" title={row.note}>−{fmt(row.deduction)}</span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{fmt(row.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Click a row for the full payslip. WPS: salaries transfer through the Wage Protection System — the SIF file goes to the bank and MOHRE each cycle.
        </div>
      </div>

      {payslipRow && <PayslipModal row={payslipRow} month={month} onClose={() => setPayslipRow(null)} />}
    </div>
  )
}
