import { Landmark } from 'lucide-react'
import { SALARY_BANDS } from '../../data/hrTalentData'

// Grades & salary bands — the standing "ask management" decision. The grade
// field on employee records is optional until grades are confirmed; this view
// shows the proposed reference table and where current employees would sit.

export default function GradesBands({ employees }) {
  const active = employees.filter((e) => e.status === 'active')
  const graded = active.filter((e) => e.grade)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Landmark size={15} className="text-brand" /> Grades &amp; salary bands</h2>
        <p className="text-xs text-gray-500">Proposed grading structure — bands refer to basic salary (AED/month), excluding allowances.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-800">
        Pending management decision — the grade field on employee records is optional until grades are confirmed.
        {' '}{graded.length} of {active.length} active employees have a provisional grade assigned (visible in the HR-only Compensation tab).
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
              <th className="px-4 py-2.5">Grade</th>
              <th className="px-4 py-2.5">Level</th>
              <th className="px-4 py-2.5 text-right">Basic band (AED/month)</th>
              <th className="px-4 py-2.5 text-right">Provisionally assigned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {SALARY_BANDS.map((b) => {
              const inGrade = graded.filter((e) => e.grade === b.grade)
              return (
                <tr key={b.grade}>
                  <td className="px-4 py-2.5 font-semibold text-gray-800">{b.grade}</td>
                  <td className="px-4 py-2.5 text-gray-600">{b.label}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{b.minBasic.toLocaleString()} – {b.maxBasic.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-500">
                    {inGrade.length > 0 ? inGrade.map((e) => e.name).join(', ') : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-gray-400">
        Once management confirms the structure, grades become required on new employee records and payroll can flag out-of-band salaries — Phase 2.
      </p>
    </div>
  )
}
