import { useState } from 'react'
import { Search, Award } from 'lucide-react'
import { ACCOMPLISHMENT_TYPES } from '../../data/hrData'

export default function AccomplishmentsSearch({ employees }) {
  const [selectedType, setSelectedType] = useState('')
  const [searchText, setSearchText] = useState('')

  const results = employees
    .flatMap((emp) =>
      emp.accomplishments
        ?.filter((acc) => {
          const typeMatch = !selectedType || acc.type === selectedType
          const textMatch =
            !searchText ||
            acc.type.toLowerCase().includes(searchText.toLowerCase()) ||
            emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
            acc.issuer.toLowerCase().includes(searchText.toLowerCase())
          return typeMatch && textMatch
        })
        .map((acc) => ({ ...acc, employeeName: emp.name, employeeId: emp.id }))
    )
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Award size={18} className="text-brand" />
          <h2 className="text-sm font-semibold text-gray-800">Accomplishments Directory</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">All Types</option>
              {ACCOMPLISHMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name, accomplishment, issuer..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-400">No accomplishments found</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {results.map((result, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-800">{result.type}</div>
                  <div className="text-sm text-brand font-medium">{result.employeeName}</div>
                </div>
                <div className="text-xs text-gray-500">{new Date(result.date).toLocaleDateString('en-AE')}</div>
              </div>
              <div className="text-xs text-gray-600">Issuer: {result.issuer}</div>
              {result.expiryDate && (
                <div className="text-xs text-gray-600 mt-1">
                  Expires: {new Date(result.expiryDate).toLocaleDateString('en-AE')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-600">
        Showing {results.length} accomplishment{results.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
