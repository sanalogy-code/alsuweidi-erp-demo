import { useState } from 'react'
import { Banknote, Users, FileDown, CheckCircle, Clock } from 'lucide-react'
import Modal from '../crm/Modal'
import { PAYROLL_MONTHS, PAYROLL_ADJUSTMENTS } from '../../data/hrData'

const fmt = (n) => n.toLocaleString()

const STATUS_META = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'WPS Submitted', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
}

function buildRows(employees, month) {
  const adjustments = PAYROLL_ADJUSTMENTS[month] || []
  return employees
    .filter((e) => e.compensation)
    .map((e) => {
      const adj = adjustments.find((a) => a.employeeId === e.id)
      const { basicSalary, housingAllowance, transportAllowance } = e.compensation
      const gross = basicSalary + housingAllowance + transportAllowance
      const overtime = adj?.overtime || 0
      const deduction = adj?.deduction || 0
      return {
        employee: e,
        basicSalary,
        allowances: housingAllowance + transportAllowance,
        overtime,
        deduction,
        note: adj?.note || '',
        net: gross + overtime - deduction,
      }
    })
    .sort((a, b) => b.net - a.net)
}

// UAE end-of-service gratuity: 21 days of basic pay per year for the first 5 years,
// 30 days per year beyond that. Shown as an estimate on the payslip.
function gratuityEstimate(employee) {
  const years = (new Date() - new Date(employee.startDate)) / (1000 * 60 * 60 * 24 * 365.25)
  const daily = employee.compensation.basicSalary / 30
  const first = Math.min(years, 5) * 21 * daily
  const rest = Math.max(years - 5, 0) * 30 * daily
  return Math.round(first + rest)
}

function PayslipModal({ row, month, onClose }) {
  const { employee } = row
  const monthLabel = PAYROLL_MONTHS.find((m) => m.value === month)?.label || month
  return (
    <Modal title={`Payslip — ${employee.name}`} onClose={onClose}>
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

        <div>
          <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Earnings (AED)</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-600">Basic Salary</span><span className="font-medium">{fmt(row.basicSalary)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Housing Allowance</span><span className="font-medium">{fmt(employee.compensation.housingAllowance)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Transport Allowance</span><span className="font-medium">{fmt(employee.compensation.transportAllowance)}</span></div>
            {row.overtime > 0 && (
              <div className="flex justify-between"><span className="text-gray-600">Overtime</span><span className="font-medium text-green-700">+{fmt(row.overtime)}</span></div>
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

export default function PayrollTab({ employees }) {
  const [month, setMonth] = useState(PAYROLL_MONTHS[0].value)
  const [statusByMonth, setStatusByMonth] = useState(
    Object.fromEntries(PAYROLL_MONTHS.map((m) => [m.value, m.status]))
  )
  const [payslipRow, setPayslipRow] = useState(null)

  const rows = buildRows(employees, month)
  const totalNet = rows.reduce((s, r) => s + r.net, 0)
  const totalOvertime = rows.reduce((s, r) => s + r.overtime, 0)
  const totalDeductions = rows.reduce((s, r) => s + r.deduction, 0)
  const status = statusByMonth[month]
  const statusMeta = STATUS_META[status]

  const advanceStatus = () => {
    const next = status === 'draft' ? 'submitted' : 'paid'
    setStatusByMonth({ ...statusByMonth, [month]: next })
  }

  return (
    <div className="space-y-6">
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
          <div className="text-xs text-gray-500">Overtime / Deductions</div>
          <div className="text-xl font-bold text-gray-800">
            <span className="text-green-700">+{fmt(totalOvertime)}</span> <span className="text-red-600">−{fmt(totalDeductions)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500 mb-2">Run Status</div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusMeta.color}`}>{statusMeta.label}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Employee</th>
              <th className="text-right px-4 py-2">Basic</th>
              <th className="text-right px-4 py-2">Allowances</th>
              <th className="text-right px-4 py-2">Overtime</th>
              <th className="text-right px-4 py-2">Deductions</th>
              <th className="text-right px-4 py-2">Net Pay (AED)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.employee.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => setPayslipRow(row)}>
                <td className="px-4 py-2.5">
                  <div className="font-medium text-brand hover:underline">{row.employee.name}</div>
                  <div className="text-xs text-gray-500">{row.employee.title}</div>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.basicSalary)}</td>
                <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.allowances)}</td>
                <td className="px-4 py-2.5 text-right">{row.overtime > 0 ? <span className="text-green-700">+{fmt(row.overtime)}</span> : <span className="text-gray-300">—</span>}</td>
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
