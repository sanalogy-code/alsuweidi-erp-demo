import { STAGES, STAGE_COLOR, STAGE_BAR_COLOR, formatCurrencyShort, daysSince } from '../../data/crmData'

function daysSinceNumber(date) {
  if (!date) return Infinity
  return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
}

export default function OverviewView({ companies, contacts, deals, onLogInteraction, onJumpToCompany, setTab }) {
  const openDeals = deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost')
  const openValue = openDeals.reduce((s, d) => s + d.value, 0)
  const weightedValue = openDeals.reduce((s, d) => s + d.value * (d.probability / 100), 0)

  const needsFollowUp = [...contacts]
    .sort((a, b) => daysSinceNumber(b.lastContact) - daysSinceNumber(a.lastContact))
    .filter((c) => daysSinceNumber(c.lastContact) >= 14)
    .slice(0, 5)

  const closingSoon = [...openDeals]
    .sort((a, b) => a.closeDate.localeCompare(b.closeDate))
    .slice(0, 5)

  const topClients = companies
    .map((c) => ({ ...c, value: deals.filter((d) => d.companyId === c.id && d.stage !== 'Lost').reduce((s, d) => s + d.value, 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
  const maxClientValue = Math.max(1, ...topClients.map((c) => c.value))

  const stageBreakdown = STAGES.map((stage) => ({
    stage,
    value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + d.value, 0),
  }))
  const maxStageValue = Math.max(1, ...stageBreakdown.map((s) => s.value))

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Companies</div>
          <div className="text-xl font-bold text-gray-800">{companies.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Open Pipeline</div>
          <div className="text-xl font-bold text-brand">{formatCurrencyShort(openValue)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Expected (weighted)</div>
          <div className="text-xl font-bold text-gray-800">{formatCurrencyShort(weightedValue)}</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-red-200 bg-red-50/50 shadow-sm p-4">
          <div className="text-xs text-red-600 font-medium">Needs Follow-Up</div>
          <div className="text-xl font-bold text-red-700">{contacts.filter((c) => daysSinceNumber(c.lastContact) >= 14).length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs follow-up */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">Needs Follow-Up</h3>
            <button onClick={() => setTab('contacts')} className="text-xs text-brand font-medium hover:underline">View all →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {needsFollowUp.map((c) => {
              const company = companies.find((co) => co.id === c.companyId)
              return (
                <div key={c.id} className="px-5 py-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{c.name}</div>
                    <button onClick={() => onJumpToCompany(c.companyId)} className="text-xs text-gray-500 hover:text-brand hover:underline">
                      {company?.name}
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-1 rounded-full font-medium bg-red-100 text-red-700 block mb-1">
                      {daysSince(c.lastContact)}
                    </span>
                    <button onClick={() => onLogInteraction(c.id)} className="text-xs text-brand font-medium hover:underline">
                      Log Interaction
                    </button>
                  </div>
                </div>
              )
            })}
            {needsFollowUp.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Everyone's been contacted recently. Nice work.</div>
            )}
          </div>
        </div>

        {/* Closing soon */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">Closing Soon</h3>
            <button onClick={() => setTab('pipeline')} className="text-xs text-brand font-medium hover:underline">View pipeline →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {closingSoon.map((d) => {
              const company = companies.find((c) => c.id === d.companyId)
              return (
                <div key={d.id} className="px-5 py-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{d.title}</div>
                    <button onClick={() => onJumpToCompany(d.companyId)} className="text-xs text-gray-500 hover:text-brand hover:underline">
                      {company?.name} • {d.closeDate}
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">{formatCurrencyShort(d.value)}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STAGE_COLOR[d.stage]}`}>{d.stage}</span>
                  </div>
                </div>
              )
            })}
            {closingSoon.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No open deals right now.</div>
            )}
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Top Clients by Value</h3>
          </div>
          <div className="p-5 space-y-3">
            {topClients.map((c, i) => (
              <button key={c.id} onClick={() => onJumpToCompany(c.id)} className="w-full text-left group">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700 group-hover:text-brand">{i + 1}. {c.name}</span>
                  <span className="text-gray-500">{formatCurrencyShort(c.value)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${(c.value / maxClientValue) * 100}%` }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline by stage */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Pipeline by Stage</h3>
          </div>
          <div className="p-5 space-y-3">
            {stageBreakdown.map((s) => (
              <div key={s.stage}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{s.stage}</span>
                  <span className="text-gray-500">{formatCurrencyShort(s.value)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${STAGE_BAR_COLOR[s.stage]}`} style={{ width: `${(s.value / maxStageValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
