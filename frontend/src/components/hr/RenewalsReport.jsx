import { AlertTriangle, Clock } from 'lucide-react'

const WINDOW_DAYS = 90
const MS_PER_DAY = 1000 * 60 * 60 * 24

function daysUntil(dateStr) {
  return Math.round((new Date(dateStr) - new Date()) / MS_PER_DAY)
}

export function buildRenewalItems(employees) {
  const items = []

  const pushIfDue = (employee, subjectName, relationship, docType, dateStr) => {
    if (!dateStr) return
    const days = daysUntil(dateStr)
    if (days > WINDOW_DAYS) return
    items.push({
      employeeId: employee.id,
      employeeName: employee.name,
      subjectName,
      relationship,
      docType,
      expiryDate: dateStr,
      days,
    })
  }

  employees.forEach((e) => {
    pushIfDue(e, e.name, 'Self', 'Passport', e.passport?.expiryDate)
    pushIfDue(e, e.name, 'Self', 'Visa', e.visa?.expiryDate)
    pushIfDue(e, e.name, 'Self', 'Contract', e.contractEndDate)
    ;(e.dependents || []).forEach((d) => {
      pushIfDue(e, d.name, d.relationship, 'Passport', d.passport?.expiryDate)
      pushIfDue(e, d.name, d.relationship, 'Visa', d.visa?.expiryDate)
      pushIfDue(e, d.name, d.relationship, 'Insurance', d.insurance?.expiryDate)
    })
  })

  return items.sort((a, b) => a.days - b.days)
}

const DOC_COLOR = {
  Passport: 'bg-purple-100 text-purple-700',
  Visa: 'bg-blue-100 text-blue-700',
  Contract: 'bg-amber-100 text-amber-700',
  Insurance: 'bg-teal-100 text-teal-700',
}

export default function RenewalsReport({ employees, onViewEmployee }) {
  const items = buildRenewalItems(employees)
  const overdue = items.filter((i) => i.days < 0)
  const dueSoon = items.filter((i) => i.days >= 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-1">Renewals — Visa, Passport, Contract & Insurance</h2>
        <p className="text-xs text-gray-500">Everyone (staff or dependents) with a document expiring within {WINDOW_DAYS} days, or already overdue.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-red-200 shadow-sm p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Overdue</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{overdue.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Due within {WINDOW_DAYS} days</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{dueSoon.length}</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-500 bg-white rounded-lg border border-gray-200 p-6 text-center">
          Nothing due — no visas, passports, or contracts expiring in the next {WINDOW_DAYS} days.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2">Employee</th>
                <th className="text-left px-4 py-2">Who</th>
                <th className="text-left px-4 py-2">Document</th>
                <th className="text-left px-4 py-2">Expiry</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((i, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <button onClick={() => onViewEmployee?.(employees.find((e) => e.id === i.employeeId))} className="font-medium text-brand hover:underline">
                      {i.employeeName}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {i.relationship === 'Self' ? 'Self' : `${i.subjectName} (${i.relationship})`}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${DOC_COLOR[i.docType]}`}>{i.docType}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{new Date(i.expiryDate).toLocaleDateString('en-AE')}</td>
                  <td className="px-4 py-2.5">
                    {i.days < 0 ? (
                      <span className="text-red-600 font-medium">Overdue by {Math.abs(i.days)}d</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Due in {i.days}d</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
