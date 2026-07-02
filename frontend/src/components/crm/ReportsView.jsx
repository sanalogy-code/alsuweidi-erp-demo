import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '../../data/crmData'

export default function ReportsView({ deals, companies }) {
  const monthlyData = {}

  deals.forEach((deal) => {
    const dateObj = new Date(deal.closeDate)
    if (isNaN(dateObj)) return

    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { pipelineValue: 0, expectedValue: 0, closed: 0, won: 0, dealsCount: 0 }
    }

    monthlyData[monthKey].dealsCount += 1
    if (deal.stage === 'Won') {
      monthlyData[monthKey].won += 1
      monthlyData[monthKey].closed += deal.value
    } else if (deal.stage === 'Lost') {
      monthlyData[monthKey].closed += deal.value
    } else {
      monthlyData[monthKey].pipelineValue += deal.value
      monthlyData[monthKey].expectedValue += deal.value * (deal.probability / 100)
    }
  })

  const sortedMonths = Object.keys(monthlyData).sort()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-brand" />
          <h2 className="text-lg font-semibold text-gray-800">Pipeline by Month</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Month</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Pipeline Value</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Expected (Weighted)</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Won Value</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Deal Count</th>
              </tr>
            </thead>
            <tbody>
              {sortedMonths.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-400">
                    No deals with valid close dates
                  </td>
                </tr>
              ) : (
                sortedMonths.map((month) => {
                  const data = monthlyData[month]
                  const [year, monthNum] = month.split('-')
                  const monthName = new Date(year, parseInt(monthNum) - 1).toLocaleDateString('en-AE', { month: 'short', year: 'numeric' })

                  return (
                    <tr key={month} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{monthName}</td>
                      <td className="px-4 py-3 text-right text-brand font-semibold">{formatCurrency(data.pipelineValue)}</td>
                      <td className="px-4 py-3 text-right text-gray-700 font-medium">{formatCurrency(data.expectedValue)}</td>
                      <td className="px-4 py-3 text-right text-green-700 font-medium">{formatCurrency(data.closed)}</td>
                      <td className="px-4 py-3 text-center text-gray-700 font-medium">{data.dealsCount}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary card */}
      {sortedMonths.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Total Pipeline</div>
            <div className="text-2xl font-bold text-brand">
              {formatCurrency(
                Object.values(monthlyData).reduce((s, m) => s + m.pipelineValue, 0)
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Total Expected (Weighted)</div>
            <div className="text-2xl font-bold text-gray-800">
              {formatCurrency(
                Object.values(monthlyData).reduce((s, m) => s + m.expectedValue, 0)
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Total Won</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(
                Object.values(monthlyData).reduce((s, m) => s + m.closed, 0)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
