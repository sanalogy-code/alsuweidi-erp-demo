import { useState } from 'react'
import { Search, FileUser, Camera, CheckSquare, Square } from 'lucide-react'
import { ACCOMPLISHMENT_TYPES, DEPARTMENTS } from '../../data/hrData'

const tenure = (startDate) => {
  const years = (new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24 * 365.25)
  return years >= 1 ? `${Math.floor(years)} yr${Math.floor(years) > 1 ? 's' : ''}` : '< 1 yr'
}

export const filterCvs = (employees, { text = '', dept = '', accType = '' }) =>
  employees.filter((emp) => {
    if (emp.status !== 'active') return false
    if (dept && emp.dept !== dept) return false
    if (accType && !emp.accomplishments?.some((a) => a.type === accType)) return false
    if (text) {
      const q = text.toLowerCase()
      const haystack = [
        emp.name, emp.title, emp.dept, emp.location,
        ...(emp.accomplishments || []).flatMap((a) => [a.type, a.issuer]),
      ].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

// Shared HR + Marketing feature: find people by role, achievements, or keywords.
// HR uses it for staffing questions; Marketing uses it to assemble proposal CVs
// and org-chart exports. Pass `selectable` + selection props to use it as a picker.
export default function CvSearch({ employees, onViewEmployee, selectable = false, selectedIds = [], onToggleSelect }) {
  const [text, setText] = useState('')
  const [dept, setDept] = useState('')
  const [accType, setAccType] = useState('')

  const results = filterCvs(employees, { text, dept, accType })

  const hasHeadshot = (emp) => emp.documents?.some((d) => d.type === 'photo')

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <FileUser size={16} className="text-brand" />
          <h2 className="text-sm font-semibold text-gray-800">CV search</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative sm:col-span-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Keyword — name, role, license…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand">
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={accType} onChange={(e) => setAccType(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand">
            <option value="">Any accomplishment</option>
            {ACCOMPLISHMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">Nobody matches these filters.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {results.map((emp) => {
            const selected = selectedIds.includes(emp.id)
            return (
              <div key={emp.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {selectable && (
                    <button onClick={() => onToggleSelect?.(emp.id)} className={selected ? 'text-brand' : 'text-gray-300 hover:text-gray-400'}>
                      {selected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  )}
                  <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {emp.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {onViewEmployee ? (
                        <button onClick={() => onViewEmployee(emp)} className="text-sm font-medium text-brand hover:underline truncate">{emp.name}</button>
                      ) : (
                        <span className="text-sm font-medium text-gray-800 truncate">{emp.name}</span>
                      )}
                      <span className={`text-[10px] flex items-center gap-0.5 shrink-0 ${hasHeadshot(emp) ? 'text-green-600' : 'text-gray-400'}`} title={hasHeadshot(emp) ? 'Professional headshot on file' : 'No headshot on file'}>
                        <Camera size={10} /> {hasHeadshot(emp) ? 'headshot' : 'no headshot'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {emp.title} • {emp.dept} • {emp.location} • {tenure(emp.startDate)}
                    </div>
                    {emp.accomplishments?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {emp.accomplishments.map((a, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[10px]">{a.type}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 text-xs text-gray-600 rounded-b-lg">
        {results.length} of {employees.filter((e) => e.status === 'active').length} active employees
      </div>
    </div>
  )
}
