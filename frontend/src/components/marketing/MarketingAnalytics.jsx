import { TrendingUp, Linkedin, Globe, Trophy, FileStack } from 'lucide-react'
import { LINKEDIN_STATS, WEBSITE_STATS, CONTENT_STATUSES } from '../../data/marketingData'

// Marketing metrics: proposal win/loss computed live from the CRM pipeline;
// LinkedIn / website figures are mock feeds until Phase 2 integrations.
export default function MarketingAnalytics({ deals = [], contentItems = [], projects = [] }) {
  const won = deals.filter((d) => d.stage === 'Won').length
  const lost = deals.filter((d) => d.stage === 'Lost').length
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : null

  const published = contentItems.filter((c) => c.status === 'published').length
  const inFlight = contentItems.filter((c) => c.status !== 'published').length
  const portfolioReady = projects.filter((p) => p.marketingDescription && p.photosApproved && !p.confidential).length

  const byStatus = Object.entries(CONTENT_STATUSES).map(([key, meta]) => ({
    key, label: meta.label, chip: meta.chip,
    count: contentItems.filter((c) => c.status === key).length,
  }))
  const maxStatus = Math.max(1, ...byStatus.map((s) => s.count))

  const maxPage = Math.max(1, ...WEBSITE_STATS.topPages.map((p) => p.views))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Trophy size={16} className="text-brand mb-1.5" />
          <div className="text-xs text-gray-500">Proposal win rate</div>
          <div className="text-2xl font-bold text-gray-800">{winRate !== null ? `${winRate}%` : '—'}</div>
          <div className="text-[11px] text-gray-400">{won} won / {lost} lost — live from CRM</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <FileStack size={16} className="text-brand mb-1.5" />
          <div className="text-xs text-gray-500">Portfolio-ready projects</div>
          <div className="text-2xl font-bold text-gray-800">{portfolioReady} <span className="text-sm font-normal text-gray-400">/ {projects.length}</span></div>
          <div className="text-[11px] text-gray-400">description + photos, not confidential</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Linkedin size={16} className="text-brand mb-1.5" />
          <div className="text-xs text-gray-500">LinkedIn followers</div>
          <div className="text-2xl font-bold text-gray-800">{LINKEDIN_STATS.followers.toLocaleString()}</div>
          <div className="text-[11px] text-green-600">+{LINKEDIN_STATS.followersDelta30d} in 30 days</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <TrendingUp size={16} className="text-brand mb-1.5" />
          <div className="text-xs text-gray-500">Content published</div>
          <div className="text-2xl font-bold text-gray-800">{published}</div>
          <div className="text-[11px] text-gray-400">{inFlight} in the pipeline</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Content pipeline</h3>
          <div className="space-y-2">
            {byStatus.map((s) => (
              <div key={s.key}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-medium text-gray-800">{s.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-brand rounded-full" style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5"><Linkedin size={13} className="text-brand" /> Follower seniority</h3>
          <p className="text-[11px] text-gray-400 mb-3">Same tiers as the CRM contact taxonomy — mock feed until the LinkedIn integration.</p>
          <div className="space-y-2">
            {LINKEDIN_STATS.followerSeniority.map((s) => (
              <div key={s.tier}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600">{s.tier}</span>
                  <span className="font-medium text-gray-800">{s.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-gray-400 mt-3">
            {LINKEDIN_STATS.impressions30d.toLocaleString()} impressions • {LINKEDIN_STATS.engagementRate}% engagement (30 days)
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5"><Globe size={13} className="text-brand" /> Website — top pages (30 days)</h3>
          <p className="text-[11px] text-gray-400 mb-3">{WEBSITE_STATS.visits30d.toLocaleString()} visits, {WEBSITE_STATS.portfolioViews30d.toLocaleString()} portfolio views — mock feed until analytics integration.</p>
          <div className="space-y-2">
            {WEBSITE_STATS.topPages.map((p) => (
              <div key={p.page}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600">{p.page}</span>
                  <span className="font-medium text-gray-800">{p.views.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${(p.views / maxPage) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
