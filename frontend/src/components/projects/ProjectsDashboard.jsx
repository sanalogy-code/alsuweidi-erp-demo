import { FolderKanban, PauseCircle, CheckCircle2, AlertTriangle, Banknote, HardHat } from 'lucide-react'
import { PROJECT_STAGES } from '../../data/projectsData'
import { claimDeadlines, daysUntil } from '../../data/pmData'

const fmtM = (n) => `${(n / 1000000).toFixed(1)}M`

function BarBreakdown({ title, rows }) {
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-xs">
            <div className="w-28 shrink-0 text-gray-600 truncate" title={r.label}>{r.label}</div>
            <div className="flex-1 h-4 bg-gray-100 rounded">
              <div className="h-4 bg-brand/70 rounded" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
            <div className="w-6 text-right font-semibold text-gray-700">{r.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProjectsDashboard({ projects, pmRecords = {}, canViewSensitive, onViewProject, onOpenWorkspace }) {
  const byStatus = (s) => projects.filter((p) => p.generalStatus === s)

  const behind = projects.filter((p) => p.supervision && p.supervision.approvedPct > 0 && p.supervision.actualPct < p.supervision.approvedPct)
  const disputes = projects.filter((p) =>
    p.design?.financialStatus?.startsWith('Open - Dispute') || p.supervision?.payStatus === 'Unsettled'
  )
  const onHold = byStatus('On Hold')

  const totalFees = projects.reduce((s, p) => s + (p.contractValue || 0), 0)
  const supervisedCost = projects.filter((p) => p.supervision).reduce((s, p) => s + (p.constructionCost || 0), 0)

  const typeRows = [...new Set(projects.map((p) => p.type))].map((t) => ({ label: t, count: projects.filter((p) => p.type === t).length })).sort((a, b) => b.count - a.count)
  const stageRows = PROJECT_STAGES.map((s) => ({ label: s, count: projects.filter((p) => p.currentStage === s).length })).filter((r) => r.count > 0)

  // Project-controls alerts from the PM registers (Batch 9): FIDIC claim
  // deadlines within 14 days and monthly progress reports due. These open the
  // project workspace directly — deadline misses are the costly kind.
  const pmAlerts = projects.flatMap((p) => {
    const pm = pmRecords[p.id]
    if (!pm) return []
    const claims = pm.claims.flatMap((c) => {
      const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
      const due = c.status === 'event_logged' ? noticeDue : c.status === 'notice_served' ? detailedDue : null
      if (!due) return []
      const d = daysUntil(due)
      if (d > 14) return []
      const what = c.status === 'event_logged' ? '28-day claim notice' : 'detailed claim'
      return [{ p, kind: 'claim', text: `${c.ref}: ${what} ${d < 0 ? `${-d}d OVERDUE` : `due in ${d}d`} (${due})` }]
    })
    const reports = pm.reports.filter((r) => !r.submittedDate).map((r) => {
      const d = daysUntil(r.dueDate)
      return { p, kind: 'report', text: `${r.month} progress report ${d < 0 ? `${-d}d overdue` : `due in ${d}d`} (FIDIC 4.21)` }
    })
    return [...claims, ...reports]
  })

  const attention = [
    ...pmAlerts,
    ...behind.map((p) => ({ p, kind: 'behind', text: `${p.supervision.approvedPct - p.supervision.actualPct} pts behind plan (${p.supervision.actualPct}% vs ${p.supervision.approvedPct}%)` })),
    ...(canViewSensitive ? disputes.map((p) => ({ p, kind: 'dispute', text: p.design?.financialStatus?.startsWith('Open - Dispute') ? 'Design fees in dispute — with Finance/Contracts' : 'Supervision invoices unsettled' })) : []),
    ...onHold.map((p) => ({ p, kind: 'hold', text: `On hold at ${p.currentStage} stage` })),
  ]

  const KIND_CHIP = {
    claim: { label: 'Claim', cls: 'bg-red-100 text-red-700' },
    report: { label: 'Report', cls: 'bg-blue-100 text-blue-700' },
    behind: { label: 'Behind', cls: 'bg-red-100 text-red-700' },
    dispute: { label: 'Fees', cls: 'bg-amber-100 text-amber-700' },
    hold: { label: 'On Hold', cls: 'bg-yellow-100 text-yellow-700' },
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <FolderKanban size={16} className="text-brand mb-1" />
          <div className="text-xs text-gray-500">Active Projects</div>
          <div className="text-xl font-bold text-gray-800">{byStatus('In Progress').length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <PauseCircle size={16} className="text-yellow-600 mb-1" />
          <div className="text-xs text-gray-500">On Hold</div>
          <div className="text-xl font-bold text-gray-800">{onHold.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <CheckCircle2 size={16} className="text-green-600 mb-1" />
          <div className="text-xs text-gray-500">Completed</div>
          <div className="text-xl font-bold text-gray-800">{byStatus('Completed').length}</div>
        </div>
        <div className={`bg-white rounded-lg border shadow-sm p-4 ${behind.length ? 'border-red-200' : 'border-gray-200'}`}>
          <AlertTriangle size={16} className={behind.length ? 'text-red-600 mb-1' : 'text-gray-300 mb-1'} />
          <div className="text-xs text-gray-500">Behind Schedule</div>
          <div className="text-xl font-bold text-gray-800">{behind.length}</div>
        </div>
      </div>

      {canViewSensitive && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <Banknote size={16} className="text-brand mb-1" />
            <div className="text-xs text-gray-500">Fees Under Contract</div>
            <div className="text-xl font-bold text-gray-800">{fmtM(totalFees)} <span className="text-xs font-normal text-gray-400">AED</span></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <HardHat size={16} className="text-brand mb-1" />
            <div className="text-xs text-gray-500">Construction Value Supervised</div>
            <div className="text-xl font-bold text-gray-800">{fmtM(supervisedCost)} <span className="text-xs font-normal text-gray-400">AED</span></div>
          </div>
          <div className={`bg-white rounded-lg border shadow-sm p-4 ${disputes.length ? 'border-amber-200' : 'border-gray-200'}`}>
            <AlertTriangle size={16} className={disputes.length ? 'text-amber-600 mb-1' : 'text-gray-300 mb-1'} />
            <div className="text-xs text-gray-500">Fee Disputes / Unsettled</div>
            <div className="text-xl font-bold text-gray-800">{disputes.length}</div>
          </div>
        </div>
      )}

      {attention.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Needs attention</h3>
            <p className="text-xs text-gray-500">Claim/report deadlines, behind-plan supervision, {canViewSensitive ? 'fee disputes, ' : ''}and projects on hold. Click to open.</p>
          </div>
          <div className="divide-y divide-gray-100">
            {attention.map(({ p, kind, text }, i) => (
              <button key={`${p.id}-${kind}-${i}`} onClick={() => ((kind === 'claim' || kind === 'report') && onOpenWorkspace ? onOpenWorkspace(p, { view: kind === 'claim' ? 'claims' : 'reports' }) : onViewProject(p))} className="w-full px-4 py-2.5 flex items-center justify-between gap-4 hover:bg-gray-50 text-left transition">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${KIND_CHIP[kind].cls}`}>{KIND_CHIP[kind].label}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{p.projectNo} — {p.name}</div>
                    <div className="text-xs text-gray-500 truncate">{text}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{p.employer}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <BarBreakdown title="By project type" rows={typeRows} />
        <BarBreakdown title="By current stage" rows={stageRows} />
      </div>
    </div>
  )
}
