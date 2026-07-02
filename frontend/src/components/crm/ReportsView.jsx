import { useState } from 'react'
import { TrendingUp, Download } from 'lucide-react'
import { formatCurrency } from '../../data/crmData'

export default function ReportsView({ deals, companies }) {
  const [reportType, setReportType] = useState('monthly')
  const [filterCompany, setFilterCompany] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterDateStart, setFilterDateStart] = useState('')
  const [filterDateEnd, setFilterDateEnd] = useState('')

  const stages = ['Prospecting', 'Proposal', 'Negotiation', 'Won', 'Lost']
  const uniqueCompanies = [...new Set(deals.map(d => companies.find(c => c.id === d.companyId)?.name).filter(Boolean))].sort()

  function applyFilters(dealsToFilter) {
    return dealsToFilter.filter(deal => {
      if (filterCompany) {
        const company = companies.find(c => c.id === deal.companyId)
        if (company?.name !== filterCompany) return false
      }
      if (filterStage && deal.stage !== filterStage) return false
      if (filterDateStart) {
        const dealDate = new Date(deal.closeDate)
        if (isNaN(dealDate) || dealDate < new Date(filterDateStart)) return false
      }
      if (filterDateEnd) {
        const dealDate = new Date(deal.closeDate)
        if (isNaN(dealDate) || dealDate > new Date(filterDateEnd)) return false
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
    if (reportType === 'monthly') {
      downloadMonthlyExcel()
    } else if (reportType === 'deals') {
      downloadDealsExcel()
    }
  }

  function downloadMonthlyExcel() {
    const monthlyData = generateMonthlyReport()
    const sortedMonths = Object.keys(monthlyData).sort()

    const data = [
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
    ]

    exportToExcel(data, 'Pipeline-Monthly-Report')
  }

  function downloadDealsExcel() {
    const filtered = applyFilters(deals)
    const data = [
      ['Company', 'Deal Title', 'Value (AED)', 'Stage', 'Probability %', 'Close Date'],
      ...filtered.map(deal => {
        const company = companies.find(c => c.id === deal.companyId)
        return [company?.name || 'N/A', deal.title, deal.value, deal.stage, deal.probability, deal.closeDate]
      })
    ]

    exportToExcel(data, 'Deals-Report')
  }

  function exportToExcel(data, filename) {
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
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
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
      {/* Report Type & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="monthly">Pipeline by Month</option>
              <option value="deals">Individual Deals</option>
            </select>
          </div>
          <button
            onClick={downloadExcel}
            className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center gap-2 self-end"
          >
            <Download size={16} />
            Download Excel
          </button>
        </div>

        {/* Filters */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-xs font-semibold text-gray-600 uppercase">Filters</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">All Companies</option>
                {uniqueCompanies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">All Stages</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
              <input
                type="date"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
              <input
                type="date"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          {(filterCompany || filterStage || filterDateStart || filterDateEnd) && (
            <button
              onClick={() => {
                setFilterCompany('')
                setFilterStage('')
                setFilterDateStart('')
                setFilterDateEnd('')
              }}
              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Report Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-brand" />
          <h2 className="text-lg font-semibold text-gray-800">
            {reportType === 'monthly' ? 'Pipeline by Month' : 'All Deals'}
          </h2>
        </div>

        {reportType === 'monthly' ? (
          <>
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
                        No deals matching filters
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
          </>
        ) : (
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
                      No deals matching filters
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
        )}
      </div>
    </div>
  )
}
