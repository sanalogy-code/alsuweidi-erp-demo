import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { STAGES, STAGE_COLOR, formatCurrencyShort } from '../../data/crmData'

export default function PipelineView({ deals, companies, contacts, onMoveStage, onAddDeal, onJumpToCompany, onEditDeal }) {
  const [dragId, setDragId] = useState(null)
  const [timeRange, setTimeRange] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  const thisYear = new Date(now.getFullYear(), 0, 1)

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

  function isInTimeRange(dateStr) {
    const dealDate = new Date(dateStr)

    if (timeRange === 'custom') {
      const start = customStart ? new Date(customStart) : null
      const end = customEnd ? new Date(customEnd) : null
      if (start && dealDate < start) return false
      if (end && dealDate > end) return false
      return true
    }

    const { start, end } = getPresetRange(timeRange)
    if (start && dealDate < start) return false
    if (end && dealDate > end) return false
    return true
  }

  const displayRange = timeRange === 'custom' && (customStart || customEnd)
    ? `${customStart || '?'} to ${customEnd || '?'}`
    : timeRange === 'month' ? 'This Month'
    : timeRange === 'quarter' ? 'This Quarter'
    : timeRange === 'year' ? 'This Year'
    : 'All Time'

  const filteredDeals = deals.filter((d) => isInTimeRange(d.closeDate))
  const openDeals = filteredDeals.filter((d) => d.stage !== 'Lost')
  const openValue = openDeals.filter((d) => d.stage !== 'Won').reduce((s, d) => s + d.value, 0)
  const weightedValue = openDeals.filter((d) => d.stage !== 'Won').reduce((s, d) => s + d.value * (d.probability / 100), 0)
  const wonValue = filteredDeals.filter((d) => d.stage === 'Won').reduce((s, d) => s + d.value, 0)
  const closedCount = filteredDeals.filter((d) => d.stage === 'Won' || d.stage === 'Lost').length
  const winRate = closedCount ? Math.round((filteredDeals.filter((d) => d.stage === 'Won').length / closedCount) * 100) : 0

  function handleDrop(stage) {
    if (dragId != null) onMoveStage(dragId, stage)
    setDragId(null)
  }

  return (
    <div className="space-y-6">
      {/* Time filter */}
      <div className="flex gap-3 items-end flex-wrap">
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
            {(customStart || customEnd) && (
              <button
                onClick={() => {
                  setCustomStart('')
                  setCustomEnd('')
                  setTimeRange('all')
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear
              </button>
            )}
          </>
        )}
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Open Pipeline</div>
          <div className="text-xl font-bold text-brand">{formatCurrencyShort(openValue)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Expected (weighted)</div>
          <div className="text-xl font-bold text-gray-800">{formatCurrencyShort(weightedValue)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Won (all time)</div>
          <div className="text-xl font-bold text-green-600">{formatCurrencyShort(wonValue)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Win Rate</div>
          <div className="text-xl font-bold text-gray-800">{winRate}%</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-800">Pipeline Board</h2>
        <button
          onClick={onAddDeal}
          className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1"
        >
          <Plus size={14} /> New Deal
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage)
          const stageValue = stageDeals.reduce((s, d) => s + d.value, 0)
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage)}
              className="bg-gray-50 rounded-lg border border-gray-200 flex flex-col min-h-[20rem]"
            >
              <div className={`px-3 py-2 rounded-t-lg border-b ${STAGE_COLOR[stage]}`}>
                <div className="text-xs font-bold uppercase tracking-wide">{stage}</div>
                <div className="text-[11px] opacity-80">{stageDeals.length} deal{stageDeals.length !== 1 ? 's' : ''} • {formatCurrencyShort(stageValue)}</div>
              </div>
              <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {stageDeals.map((deal) => {
                  const company = companies.find((c) => c.id === deal.companyId)
                  const contact = contacts.find((c) => c.id === deal.contactId)
                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDragId(deal.id)}
                      className="bg-white rounded-md border border-gray-200 shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-sm font-semibold text-gray-800">{deal.title}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditDeal(deal.id)
                          }}
                          className="text-gray-400 hover:text-brand transition"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => onJumpToCompany(deal.companyId)}
                        className="text-xs text-brand font-medium hover:underline"
                      >
                        {company?.name}
                      </button>
                      <div className="text-xs text-gray-500 mt-1">{contact?.name}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-bold text-gray-800">{formatCurrencyShort(deal.value)}</span>
                        <span className="text-[11px] text-gray-500">{deal.probability}%</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">Expected {deal.closeDate}</div>
                      <select
                        value={deal.stage}
                        onChange={(e) => onMoveStage(deal.id, e.target.value)}
                        className="mt-2 w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand"
                      >
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )
                })}
                {stageDeals.length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-6">Drop a deal here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
