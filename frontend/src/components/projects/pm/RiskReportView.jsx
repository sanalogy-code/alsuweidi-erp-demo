import { ShieldAlert, ArrowRight } from 'lucide-react'
import { riskLevelMeta, riskStatusMeta, daysUntil } from '../../../data/pmData'

// Portfolio risk report (Sana, 7 Jul: "on the top a risks report / dashboard —
// what's going on, what's bad — sort by project, by seriousness"). Reads every
// project's risk register; worst project first, worst risk first.

const sevOf = (r) => riskLevelMeta(r.probability).score * riskLevelMeta(r.impact).score
const SEVERITIES = [
  { min: 9, label: 'Critical', chip: 'bg-red-600 text-white' },
  { min: 6, label: 'High', chip: 'bg-red-100 text-red-700' },
  { min: 3, label: 'Medium', chip: 'bg-amber-100 text-amber-700' },
  { min: 0, label: 'Low', chip: 'bg-green-100 text-green-700' },
]
const sevMeta = (score) => SEVERITIES.find((s) => score >= s.min)

export default function RiskReportView({ projects, pmRecords, onOpenWorkspace }) {
  const isLive = (r) => r.status === 'open' || r.status === 'mitigating'

  const perProject = projects
    .map((p) => {
      const risks = pmRecords[p.id]?.risks || []
      return { project: p, risks, live: risks.filter(isLive), worst: Math.max(0, ...risks.filter(isLive).map(sevOf)) }
    })
    .filter((x) => x.risks.length > 0)
    .sort((a, b) => b.worst - a.worst || b.live.length - a.live.length)

  const allLive = perProject.flatMap((x) => x.live)
  const critical = allLive.filter((r) => sevOf(r) >= 6)
  const realized = perProject.flatMap((x) => x.risks).filter((r) => r.status === 'realized')
  const overdueReviews = allLive.filter((r) => r.reviewDate && daysUntil(r.reviewDate) < 0)

  const stat = (label, value, tone = 'text-gray-800') => (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
      <div className={`text-xl font-semibold ${tone}`}>{value}</div>
      <div className="text-[11px] text-gray-500">{label}</div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><ShieldAlert size={15} /> Risk report — all projects</h2>
        <p className="text-xs text-gray-500">Live risks across every register, worst first. Click a project to work its register.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stat('Live risks (open + mitigating)', allLive.length)}
        {stat('High / critical severity', critical.length, critical.length ? 'text-red-600' : 'text-gray-800')}
        {stat('Realized (became real)', realized.length, realized.length ? 'text-purple-600' : 'text-gray-800')}
        {stat('Reviews overdue', overdueReviews.length, overdueReviews.length ? 'text-amber-600' : 'text-gray-800')}
      </div>

      {perProject.length === 0 && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No risks logged on any project.</div>
      )}

      {perProject.map(({ project, risks, live, worst }) => (
        <div key={project.id} className="bg-slate-100 rounded-lg border border-slate-200 p-2">
          <button onClick={() => onOpenWorkspace(project, { view: 'risks' })} className="w-full flex items-center gap-2 px-2 py-1.5 text-left group">
            <span className="font-mono text-[11px] text-gray-500">{project.projectNo}</span>
            <span className="text-sm font-semibold text-gray-800 group-hover:text-brand flex-1 min-w-0 truncate">{project.name}</span>
            {worst > 0 && <span className={`text-[11px] px-2 py-0.5 rounded-full ${sevMeta(worst).chip}`}>worst: {sevMeta(worst).label}</span>}
            <span className="text-[11px] text-gray-500">{live.length} live / {risks.length} logged</span>
            <ArrowRight size={13} className="text-gray-400 group-hover:text-brand" />
          </button>
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-left">
                  {['Ref', 'Risk', 'Severity', 'P', 'I', 'Status', 'Owner', 'Mitigation'].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold text-[11px] uppercase tracking-wide text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...risks].sort((a, b) => (isLive(b) - isLive(a)) || sevOf(b) - sevOf(a)).map((r) => {
                  const sev = sevMeta(sevOf(r))
                  const closed = r.status === 'closed'
                  return (
                    <tr key={r.id} className={`border-t border-gray-100 ${closed ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}>
                      <td className="px-3 py-2 font-mono text-gray-500 whitespace-nowrap">{r.ref}</td>
                      <td className="px-3 py-2 text-gray-800" style={{ width: '45%', minWidth: 220 }}>{r.description}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className={`text-[11px] px-2 py-0.5 rounded-full ${closed ? 'bg-gray-100 text-gray-400' : sev.chip}`}>{sev.label}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className={`text-[11px] px-1.5 py-0.5 rounded-full ${riskLevelMeta(r.probability).chip}`}>{riskLevelMeta(r.probability).label}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className={`text-[11px] px-1.5 py-0.5 rounded-full ${riskLevelMeta(r.impact).chip}`}>{riskLevelMeta(r.impact).label}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className={`text-[11px] px-2 py-0.5 rounded-full ${riskStatusMeta(r.status).chip}`}>{riskStatusMeta(r.status).label}</span></td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[140px] truncate">{r.owner || '—'}</td>
                      <td className="px-3 py-2 text-gray-500" style={{ width: '30%', minWidth: 180 }}>{r.mitigation || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-gray-400">Severity = probability × impact. Closed risks are greyed; realized risks usually point at a claim on the project.</p>
    </div>
  )
}
