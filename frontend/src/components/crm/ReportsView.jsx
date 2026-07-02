import { useState } from 'react'
import { TrendingUp, Download } from 'lucide-react'
import { formatCurrency } from '../../data/crmData'

export default function ReportsView({ deals, companies }) {
  const [timeRange, setTimeRange] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [filterStage, setFilterStage] = useState('')

  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  const thisYear = new Date(now.getFullYear(), 0, 1)

  const stages = ['Prospecting', 'Proposal', 'Negotiation', 'Won', 'Lost']
  const uniqueCompanies = [...new Set(deals.map(d => companies.find(c => c.id === d.companyId)?.name).filter(Boolean))].sort()

  function getPresetRange(preset) {
    switch (preset) {
      case 'month':
        return { start: thisMonth, end: null }
      case 'quarter':
        return { start: thisQuarter, end: null }
      case 'year':
        return { start: thisYear, end: null }
      default:
        return { start: null, end: null }
    }
  }

  function applyFilters(dealsToFilter) {
    return dealsToFilter.filter(deal => {
      if (filterCompany) {
        const company = companies.find(c => c.id === deal.companyId)
        if (company?.name !== filterCompany) return false
      }
      if (filterStage && deal.stage !== filterStage) return false

      const dealDate = new Date(deal.closeDate)
      if (isNaN(dealDate)) return false

      if (timeRange === 'custom') {
        const start = customStart ? new Date(customStart) : null
        const end = customEnd ? new Date(customEnd) : null
        if (start && dealDate < start) return false
        if (end && dealDate > end) return false
      } else {
        const { start, end } = getPresetRange(timeRange)
        if (start && dealDate < start) return false
        if (end && dealDate > end) return false
      }

      return true
    })
  }

  function generateMonthlyReport() {
    const filtered = applyFilters(deals)
    const monthlyData = {}

    filtered.forEach((deal) => {
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

    return monthlyData
  }

  function downloadExcel() {
    const filtered = applyFilters(deals)
    const monthlyData = generateMonthlyReport()
    const sortedMonths = Object.keys(monthlyData).sort()

    const data = [
      ['Pipeline Report', `Date Range: ${timeRange === 'custom' ? `${customStart || '?'} to ${customEnd || '?'}` : timeRange === 'month' ? 'This Month' : timeRange === 'quarter' ? 'This Quarter' : timeRange === 'year' ? 'This Year' : 'All Time'}`],
      [],
      ['Monthly Breakdown', '', '', '', ''],
      ['Month', 'Pipeline Value', 'Expected (Weighted)', 'Won Value', 'Deal Count'],
      ...sortedMonths.map(month => {
        const m = monthlyData[month]
        const [year, monthNum] = month.split('-')
        const monthName = new Date(year, parseInt(monthNum) - 1).toLocaleDateString('en-AE', { month: 'short', year: 'numeric' })
        return [monthName, m.pipelineValue, m.expectedValue, m.closed, m.dealsCount]
      }),
      [],
      ['Summary', '', '', '', ''],
      ['Total Pipeline', Object.values(monthlyData).reduce((s, m) => s + m.pipelineValue, 0), '', '', ''],
      ['Total Expected (Weighted)', Object.values(monthlyData).reduce((s, m) => s + m.expectedValue, 0), '', '', ''],
      ['Total Won', Object.values(monthlyData).reduce((s, m) => s + m.closed, 0), '', '', ''],
      [],
      ['All Deals', '', '', '', ''],
      ['Company', 'Deal Title', 'Value (AED)', 'Stage', 'Probability %', 'Close Date'],
      ...filtered.map(deal => {
        const company = companies.find(c => c.id === deal.companyId)
        return [company?.name || 'N/A', deal.title, deal.value, deal.stage, deal.probability, deal.closeDate]
      })
    ]

    const csv = data.map(row =>
      row.map(cell =>
        typeof cell === 'string' && cell.includes(',')
          ? `"${cell}"`
          : cell
      ).join(',')
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Pipeline-Report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const monthlyData = generateMonthlyReport()
  const sortedMonths = Object.keys(monthlyData).sort()
  const filtered = applyFilters(deals)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Date Range</label>
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value)
                if (e.target.value !== 'custom') {
                  setCustomStart('')
                  setCustomEnd('')
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="all">All Time</option>
              <option value="year">This Year</option>
              <option value="quarter">This Quarter</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {timeRange === 'custom' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">From</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">To</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </>
          )}

          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">All Companies</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>

          <button
            onClick={downloadExcel}
            className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </button>

          {(filterCompany || filterStage || customStart || customEnd || timeRange !== 'all') && (
            <button
              onClick={() => {
                setTimeRange('all')
                setCustomStart('')
                setCustomEnd('')
                setFilterCompany('')
                setFilterStage('')
              }}
              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-brand" />
          <h2 className="text-lg font-semibold text-gray-800">Monthly Breakdown</h2>
        </div>

        <div className="overflow-x-auto mb-6">
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
                    No deals in selected range
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

        {sortedMonths.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded p-4">
              <div className="text-xs text-gray-600 mb-1">Total Pipeline</div>
              <div className="text-xl font-bold text-brand">
                {formatCurrency(Object.values(monthlyData).reduce((s, m) => s + m.pipelineValue, 0))}
              </div>
            </div>
            <div className="bg-gray-50 rounded p-4">
              <div className="text-xs text-gray-600 mb-1">Total Expected (Weighted)</div>
              <div className="text-xl font-bold text-gray-800">
                {formatCurrency(Object.values(monthlyData).reduce((s, m) => s + m.expectedValue, 0))}
              </div>
            </div>
            <div className="bg-gray-50 rounded p-4">
              <div className="text-xs text-gray-600 mb-1">Total Won</div>
              <div className="text-xl font-bold text-green-700">
                {formatCurrency(Object.values(monthlyData).reduce((s, m) => s + m.closed, 0))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Deals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">All Deals ({filtered.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Deal Title</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Value (AED)</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Stage</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Probability</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Close Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-400">
                    No deals in selected range
                  </td>
                </tr>
              ) : (
                filtered.map((deal) => {
                  const company = companies.find(c => c.id === deal.companyId)
                  return (
                    <tr key={deal.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-800">{company?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-800">{deal.title}</td>
                      <td className="px-4 py-3 text-right text-brand font-semibold">{formatCurrency(deal.value)}</td>
                      <td className="px-4 py-3 text-gray-700">{deal.stage}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{deal.probability}%</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{deal.closeDate}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
