import { useState } from 'react'
import { Search } from 'lucide-react'

export default function EmployeeList({ employees, onViewEmployee }) {
  const [search, setSearch] = useState('')

  const rows = employees
    .filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase()) ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Employee Directory ({rows.length})</h2>
          <p className="text-xs text-gray-500">All ALSUWEIDI staff. Click a name for details.</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, dept, title..."
            className="pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand w-64"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-400">No employees found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Name</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Title</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Department</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Phone</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition" onClick={() => onViewEmployee?.(emp)}>
                  <td className="px-4 py-2 font-medium text-brand hover:underline">{emp.name}</td>
                  <td className="px-4 py-2 text-gray-700">{emp.title}</td>
                  <td className="px-4 py-2 text-gray-600">{emp.dept}</td>
                  <td className="px-4 py-2 text-gray-600 text-xs">{emp.email}</td>
                  <td className="px-4 py-2 text-gray-600 text-xs">{emp.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
