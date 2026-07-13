import { FileWarning, Timer, Banknote, TrendingUp, Database } from 'lucide-react'
import { projectProgress, dmrTotals, claimDeadlines, daysUntil } from '../../data/pmData'
import { PROJECT_TYPES, scopeOf } from '../../data/projectsData'
import { fmtAED } from '../../data/financeData'

// Portfolio analytics (Batch 23, replaces "Record stats" — Sana: "a true stats
// page should have interesting information… what kind of projects we always have
// problems with, what takes longer than we expect, what costed more — are we
// managing properly"). Learning from the record, not monitoring live work
// (that's the PMO's job).
//
// Two layers, honestly separated:
//   1. COMPUTED — real analysis over the seeded records (claims/NCR clusters,
//      hours vs estimate, supervision slip, billing lag).
//   2. ILLUSTRATIVE — the shapes that need the 140-project history import
//      (duration slip by type, margin trend) — explicitly labelled Phase 2.

// Fixed literal classes (Tailwind JIT) — same categorical order as FinanceOverview.
const TYPE_BAR = {
  Buildings: 'bg-brand',
  Infrastructure: 'bg-blue-500',
  Transportation: 'bg-amber-500',
  Secondment: 'bg-violet-500',
  'Study / Advisory': 'bg-violet-500',
}

const Bar = ({ pct, cls = 'bg-brand', h = 'h-2.5' }) => (
  <div className={`flex-1 ${h} bg-gray-100 rounded-full overflow-hidden`}>
    <div className={`h-full rounded-full ${cls}`} style={{ width: `${Math.min(pct, 100)}%` }} />
  </div>
)

function Tile({ icon: Icon, label, value, sub, tone = 'text-gray-800' }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Icon size={15} className="text-gray-400 mb-1" />
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-xl font-bold ${tone}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function Section({ title, sub, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-1 h-4 bg-brand rounded" /> {title}
      </h3>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5 mb-3">{sub}</p>}
      {children}
    </div>
  )
}

// Illustrative history (Phase 2 import placeholder) — deliberately obvious
// round-ish numbers; the SHAPE is what's being signed off.
const HISTORY_SLIP = [
  { type: 'Buildings', plannedMo: 14, actualMo: 17 },
  { type: 'Infrastructure', plannedMo: 18, actualMo: 20 },
  { type: 'Transportation', plannedMo: 12, actualMo: 16 },
  { type: 'Secondment', plannedMo: 12, actualMo: 12 },
]
const HISTORY_MARGIN = [
  { year: '2023', margin: 22 },
  { year: '2024', margin: 19 },
  { year: '2025', margin: 24 },
  { year: '2026 YTD', margin: 27 },
]

export default function PortfolioAnalyticsView({ projects, pmRecords = {}, invoices = [] }) {
  const withPm = projects.filter((p) => pmRecords[p.id])

  // --- Computed layer ---------------------------------------------------------
  const rows = withPm.map((p) => {
    const pm = pmRecords[p.id]
    const claims = pm.claims?.length || 0
    const ncrs = pm.phases.reduce((s, ph) => s + (ph.ncrs?.length || 0), 0)
    const hours = pm.phases.map((ph) => dmrTotals(ph.hoursByDiscipline || [])).reduce((a, t) => ({ estim: a.estim + t.estim, toDate: a.toDate + t.toDate }), { estim: 0, toDate: 0 })
    const fee = pm.phases.reduce((s, ph) => s + ph.fees.stages.reduce((t, st) => t + st.fee, 0), 0)
    const invoiced = invoices.filter((i) => i.projectId === p.id && i.status !== 'draft').reduce((s, i) => s + i.amount, 0)
    const progress = projectProgress(pm)
    return { p, pm, claims, ncrs, hours, fee, invoiced, progress }
  })

  const byType = PROJECT_TYPES.map((type) => {
    const tr = rows.filter((r) => r.p.type === type)
    return {
      type,
      projects: tr.length,
      claims: tr.reduce((s, r) => s + r.claims, 0),
      ncrs: tr.reduce((s, r) => s + r.ncrs, 0),
    }
  }).filter((t) => t.projects > 0)
  const maxProblems = Math.max(1, ...byType.map((t) => t.claims + t.ncrs))

  const overruns = rows
    .filter((r) => r.hours.estim > 0)
    .map((r) => ({ ...r, over: Math.round((r.hours.toDate / r.hours.estim) * 100) }))
    .sort((a, b) => b.over - a.over)

  const supSlip = withPm
    .filter((p) => p.supervision && p.supervision.approvedPct > 0)
    .map((p) => ({ p, planned: p.supervision.approvedPct, actual: p.supervision.actualPct, gap: p.supervision.approvedPct - p.supervision.actualPct }))
    .sort((a, b) => b.gap - a.gap)

  const billing = rows
    .filter((r) => r.fee > 0 && r.progress != null && r.p.generalStatus === 'In Progress')
    .map((r) => ({ ...r, billedPct: Math.round((r.invoiced / r.fee) * 100), lag: r.progress - Math.round((r.invoiced / r.fee) * 100) }))
    .sort((a, b) => b.lag - a.lag)
  const unbilled = billing.reduce((s, r) => s + Math.max(r.fee * (r.progress / 100) - r.invoiced, 0), 0)

  const claimProjects = rows.filter((r) => r.claims > 0).length
  const hoursOver = overruns.filter((r) => r.over > 100).length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Portfolio analytics</h2>
        <p className="text-sm text-gray-500">Are we managing properly? Patterns across the project record — not live monitoring (that&apos;s the PMO).</p>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-700 flex items-center gap-2">
        <Database size={12} className="shrink-0" />
        Demo-depth: computed from the {withPm.length} seeded project records. The real version of this page needs the full project history (~140 projects) imported in Phase 2 — then these patterns become true.
      </div>

      {/* Headline tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={FileWarning} label="Projects with claims" value={`${claimProjects} of ${rows.length}`} sub="FIDIC claims raised" tone={claimProjects ? 'text-red-600' : 'text-gray-800'} />
        <Tile icon={Timer} label="Running over estimated hours" value={hoursOver} sub={`of ${overruns.length} with an R0 estimate`} tone={hoursOver ? 'text-amber-600' : 'text-gray-800'} />
        <Tile icon={Banknote} label="Earned but unbilled" value={fmtAED(unbilled, { compact: true })} sub="progress ahead of invoicing" tone={unbilled > 0 ? 'text-amber-600' : 'text-gray-800'} />
        <Tile icon={TrendingUp} label="Supervision behind plan" value={supSlip.filter((s) => s.gap > 0).length} sub={`of ${supSlip.length} supervision projects`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Problem clusters by type — computed */}
        <Section title="Where the problems cluster" sub="Claims and NCRs by project type — which work always hurts us. Computed from the records.">
          <div className="space-y-2.5">
            {byType.map((t) => (
              <div key={t.type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{t.type} <span className="text-gray-300">· {t.projects} project{t.projects > 1 ? 's' : ''}</span></span>
                  <span className="font-semibold text-gray-800 tabular-nums">{t.claims} claim{t.claims === 1 ? '' : 's'} · {t.ncrs} NCR{t.ncrs === 1 ? '' : 's'}</span>
                </div>
                <div className="flex gap-0.5 h-2.5">
                  <div className={`${TYPE_BAR[t.type] || 'bg-gray-400'} rounded-l-full`} style={{ width: `${(t.claims / maxProblems) * 100}%` }} />
                  <div className="bg-gray-300 rounded-r-full" style={{ width: `${(t.ncrs / maxProblems) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-brand inline-block" />Claims (type colour)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gray-300 inline-block" />NCRs</span>
          </div>
        </Section>

        {/* Hours vs estimate — computed */}
        <Section title="Taking more effort than we estimated" sub="Logged discipline hours vs the R0 estimate — worst first. Computed from the records.">
          <div className="space-y-2.5">
            {overruns.slice(0, 6).map((r) => (
              <div key={r.p.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate pr-2">{r.p.projectNo} · {r.p.name}</span>
                  <span className={`font-bold tabular-nums ${r.over > 100 ? 'text-red-600' : 'text-gray-700'}`}>{r.over}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bar pct={(r.over / 170) * 100} cls={r.over > 100 ? 'bg-red-500' : 'bg-brand'} h="h-2" />
                  <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">{r.hours.toDate.toLocaleString()} / {r.hours.estim.toLocaleString()}h</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Billing lag — computed */}
        <Section title="Work done but not billed" sub="Earned progress vs invoiced % — the gap is cash sitting on the table. Computed live.">
          <div className="space-y-2.5">
            {billing.slice(0, 6).map((r) => (
              <div key={r.p.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate pr-2">{r.p.projectNo} · {r.p.name}</span>
                  <span className={`font-semibold tabular-nums ${r.lag > 20 ? 'text-amber-600' : 'text-gray-500'}`}>{r.lag > 0 ? `${r.lag} pts behind` : 'on pace'}</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2"><Bar pct={r.progress} cls="bg-gray-400" h="h-1.5" /><span className="text-[10px] text-gray-400 w-14 tabular-nums">{r.progress}% done</span></div>
                  <div className="flex items-center gap-2"><Bar pct={r.billedPct} cls="bg-brand" h="h-1.5" /><span className="text-[10px] text-gray-400 w-14 tabular-nums">{r.billedPct}% billed</span></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Supervision slip — computed */}
        <Section title="Site progress vs approved programme" sub="Supervision projects: contractor actual % vs approved plan %. Computed from the records.">
          <div className="space-y-2.5">
            {supSlip.map(({ p, planned, actual, gap }) => (
              <div key={p.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate pr-2">{p.projectNo} · {p.name}</span>
                  <span className={`font-semibold tabular-nums ${gap > 5 ? 'text-red-600' : gap > 0 ? 'text-amber-600' : 'text-green-600'}`}>{gap > 0 ? `−${gap} pts` : 'ahead'}</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2"><Bar pct={planned} cls="bg-gray-400" h="h-1.5" /><span className="text-[10px] text-gray-400 w-16 tabular-nums">{planned}% plan</span></div>
                  <div className="flex items-center gap-2"><Bar pct={actual} cls={gap > 5 ? 'bg-red-500' : 'bg-brand'} h="h-1.5" /><span className="text-[10px] text-gray-400 w-16 tabular-nums">{actual}% actual</span></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Illustrative: duration slip by type */}
        <Section title="Do projects take longer than we plan?" sub="ILLUSTRATIVE — needs the Phase 2 history import. Planned vs actual duration by type, months.">
          <div className="space-y-2.5">
            {HISTORY_SLIP.map((h) => (
              <div key={h.type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{h.type}</span>
                  <span className={`font-semibold tabular-nums ${h.actualMo > h.plannedMo ? 'text-amber-600' : 'text-green-600'}`}>
                    {h.actualMo > h.plannedMo ? `+${h.actualMo - h.plannedMo} mo` : 'on plan'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2"><Bar pct={(h.plannedMo / 22) * 100} cls="bg-gray-400" h="h-1.5" /><span className="text-[10px] text-gray-400 w-16 tabular-nums">{h.plannedMo} mo plan</span></div>
                  <div className="flex items-center gap-2"><Bar pct={(h.actualMo / 22) * 100} cls={TYPE_BAR[h.type] || 'bg-gray-400'} h="h-1.5" /><span className="text-[10px] text-gray-400 w-16 tabular-nums">{h.actualMo} mo actual</span></div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Illustrative: margin trend */}
        <Section title="Are we improving?" sub="ILLUSTRATIVE — needs the Phase 2 history import + real cost data. Net margin by delivery year.">
          <div className="flex items-end gap-3 h-32 px-2">
            {HISTORY_MARGIN.map((y) => (
              <div key={y.year} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-gray-700 tabular-nums">{y.margin}%</span>
                <div className="w-full bg-brand/80 rounded-t-md" style={{ height: `${(y.margin / 30) * 100}%` }} />
                <span className="text-[10px] text-gray-400">{y.year}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <p className="text-[11px] text-gray-400">
        Sections marked ILLUSTRATIVE are the Phase 2 shape, not real analysis — they turn on when the historical project data is imported. Everything else is computed live from the seeded records and session finance state.
      </p>
    </div>
  )
}
