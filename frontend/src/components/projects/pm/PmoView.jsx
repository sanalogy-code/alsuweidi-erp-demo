import { useState } from 'react'
import {
  FolderKanban, AlertTriangle, TrendingDown, Banknote, AlarmClock, Users2, Diamond,
  FileWarning, ArrowRight, CalendarClock,
} from 'lucide-react'
import {
  projectHealth, projectProgress, lateTasksOf, nextMilestoneOf, worstSpiOf,
  hoursUsedOn, claimDeadlines, daysUntil, SALARY_COST_PER_HOUR, CAPACITY_HOURS_PER_WEEK,
} from '../../../data/pmData'
import { scopeOf } from '../../../data/projectsData'
import { EMPLOYEES } from '../../../data/hrData'
import { fmtAED } from '../../../data/financeData'
import { toLocalISO, weekStartOf, addDays } from '../../../data/timesheetData'
import { fmtShortDate } from '../../../utils/date'

// PMO dashboard (Batch 23, Sana: "what we have isn't enough for managing
// multiple projects"). One screen, four bands, top-down, portfolio-first:
//   1. Health strip — the 30-second read (RAG counts filter the bands below).
//   2. Exceptions — only red/amber projects, each with WHY and who owns it.
//      Management-by-exception: a healthy project earns the right to not appear.
//   3. Resource pressure — cross-project over-allocation (the thing no
//      single-project view can show).
//   4. Forward radar — every contractual/schedule event in the next 30 days.
// Composed entirely from existing data (pmRecords, timesheets, allocations,
// live finance state) — no new data model.

const RADAR_KIND = {
  Claim: { chip: 'bg-red-100 text-red-700', icon: FileWarning },
  Report: { chip: 'bg-amber-100 text-amber-700', icon: CalendarClock },
  Milestone: { chip: 'bg-blue-100 text-blue-700', icon: Diamond },
}

export default function PmoView({ projects, pmRecords, timesheets = [], allocations = [], invoices = [], canViewSensitive = false, onOpenWorkspace, onJumpView }) {
  const [ragFilter, setRagFilter] = useState('') // '' | 'red' | 'amber' | 'green'

  // --- Per-project rollup (active projects with a PM record) -----------------
  const rows = projects
    .filter((p) => p.generalStatus === 'In Progress' && pmRecords[p.id])
    .map((p) => {
      const pm = pmRecords[p.id]
      const health = projectHealth(pm)
      const late = lateTasksOf(pm).length
      const spi = worstSpiOf(pm)
      const ms = nextMilestoneOf(pm)
      const hours = hoursUsedOn(timesheets, p.id)
      const fee = pm.phases.reduce((s, ph) => s + ph.fees.stages.reduce((t, st) => t + st.fee, 0), 0)
      const invoiced = invoices.filter((i) => i.projectId === p.id && i.status !== 'draft').reduce((s, i) => s + i.amount, 0)
      const progress = projectProgress(pm)
      const claimOverdue = pm.claims.some((c) => {
        const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
        const due = c.status === 'event_logged' ? noticeDue : c.status === 'notice_served' ? detailedDue : null
        return due && daysUntil(due) < 0
      })
      const reportOverdue = pm.reports.some((r) => !r.submittedDate && daysUntil(r.dueDate) < 0)
      // Billing behind plan: earned value well ahead of what's been invoiced.
      const billingBehind = canViewSensitive && fee > 0 && progress != null && progress - (invoiced / fee) * 100 > 20
      const reasons = []
      if (claimOverdue) reasons.push({ label: 'Claim deadline overdue', tone: 'red' })
      if (spi != null && spi < 0.85) reasons.push({ label: `SPI ${spi.toFixed(2)}`, tone: 'red' })
      else if (spi != null && spi < 0.95) reasons.push({ label: `SPI ${spi.toFixed(2)}`, tone: 'amber' })
      if (late >= 3) reasons.push({ label: `${late} late tasks`, tone: 'red' })
      else if (late > 0) reasons.push({ label: `${late} late task${late > 1 ? 's' : ''}`, tone: 'amber' })
      if (reportOverdue) reasons.push({ label: '4.21 report overdue', tone: 'amber' })
      if (ms?.atRisk) reasons.push({ label: `Milestone slipping — ${ms.label}`, tone: 'amber' })
      if (billingBehind) reasons.push({ label: `Billing behind (${Math.round((invoiced / fee) * 100)}% invoiced vs ${progress}% done)`, tone: 'amber' })
      return { p, pm, health, late, spi, ms, hours, fee, invoiced, progress, reasons }
    })

  const byRag = { red: rows.filter((r) => r.health.key === 'red'), amber: rows.filter((r) => r.health.key === 'amber'), green: rows.filter((r) => r.health.key === 'green') }
  const exceptions = rows.filter((r) => r.health.key !== 'green' && (!ragFilter || r.health.key === ragFilter))
    .sort((a, b) => ({ red: 0, amber: 1 })[a.health.key] - ({ red: 0, amber: 1 })[b.health.key])

  // Portfolio money (sensitive roles)
  const money = {
    fee: rows.reduce((s, r) => s + r.fee, 0),
    invoiced: rows.reduce((s, r) => s + r.invoiced, 0),
    cost: rows.reduce((s, r) => s + r.hours, 0) * SALARY_COST_PER_HOUR,
  }
  const worstSpi = rows.map((r) => r.spi).filter((v) => v != null)
  const portfolioSpi = worstSpi.length ? Math.min(...worstSpi) : null

  // --- Forward radar: every dated event in the next 30 days ------------------
  const radar = []
  rows.forEach(({ p, pm }) => {
    pm.claims.forEach((c) => {
      const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
      const due = c.status === 'event_logged' ? noticeDue : c.status === 'notice_served' ? detailedDue : null
      if (due && daysUntil(due) <= 30) radar.push({ project: p, kind: 'Claim', title: c.status === 'event_logged' ? `28-day notice — ${c.ref}` : `Detailed claim — ${c.ref}`, due })
    })
    pm.reports.filter((r) => !r.submittedDate && daysUntil(r.dueDate) <= 30).forEach((r) => {
      radar.push({ project: p, kind: 'Report', title: `4.21 progress report — ${r.month}`, due: r.dueDate })
    })
    pm.phases.forEach((ph) => {
      ph.milestones.filter((m) => !m.actual).forEach((m) => {
        const due = m.forecast || m.baseline
        if (daysUntil(due) >= -7 && daysUntil(due) <= 30) radar.push({ project: p, kind: 'Milestone', title: `${m.label} (${ph.label})`, due, atRisk: !!(m.forecast && m.baseline && m.forecast > m.baseline) })
      })
    })
  })
  radar.sort((a, b) => a.due.localeCompare(b.due))
  const overdueDeadlines = radar.filter((e) => e.kind !== 'Milestone' && daysUntil(e.due) < 0).length

  // --- Resource pressure: allocated vs capacity over the next 4 weeks --------
  const weeks = Array.from({ length: 4 }, (_, i) => toLocalISO(addDays(weekStartOf(new Date()), i * 7)))
  const people = [...new Set(allocations.map((a) => a.name))]
  const pressure = people.map((name) => {
    const perWeek = weeks.map((w) => {
      const allocs = allocations.filter((a) => a.name === name && a.weekStart === w)
      return { week: w, hours: allocs.reduce((s, a) => s + a.hours, 0), projects: allocs.map((a) => projects.find((p) => p.id === a.projectId)?.projectNo).filter(Boolean) }
    })
    const worst = perWeek.reduce((m, w) => (w.hours > m.hours ? w : m), perWeek[0])
    return { name, perWeek, worst }
  }).filter((r) => r.worst.hours > CAPACITY_HOURS_PER_WEEK)
    .sort((a, b) => b.worst.hours - a.worst.hours)

  const reasonChip = { red: 'bg-red-50 text-red-700 border border-red-200', amber: 'bg-amber-50 text-amber-700 border border-amber-200' }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">PMO — portfolio dashboard</h2>
        <p className="text-sm text-gray-500">Manage by exception: the strip is the 30-second read; everything below is only what needs attention.</p>
      </div>

      {/* Band 1 — health strip */}
      <div className={`grid grid-cols-2 ${canViewSensitive ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-3`}>
        <button onClick={() => setRagFilter('')} className={`bg-white rounded-lg border p-4 text-left transition ${!ragFilter ? 'border-brand ring-1 ring-brand/30' : 'border-gray-200 hover:border-gray-300'}`}>
          <FolderKanban size={15} className="text-gray-400 mb-1" />
          <div className="text-xs text-gray-500">Active projects</div>
          <div className="text-xl font-bold text-gray-800">{rows.length}</div>
        </button>
        {['red', 'amber', 'green'].map((k) => (
          <button key={k} onClick={() => setRagFilter(ragFilter === k ? '' : k)}
            className={`bg-white rounded-lg border p-4 text-left transition ${ragFilter === k ? 'border-brand ring-1 ring-brand/30' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className={`w-2.5 h-2.5 rounded-full inline-block mb-1 ${{ red: 'bg-red-500', amber: 'bg-amber-500', green: 'bg-green-500' }[k]}`} />
            <div className="text-xs text-gray-500">{{ red: 'At risk', amber: 'Watch', green: 'On track' }[k]}</div>
            <div className={`text-xl font-bold ${{ red: 'text-red-600', amber: 'text-amber-600', green: 'text-green-600' }[k]}`}>{byRag[k].length}</div>
          </button>
        ))}
        {canViewSensitive && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <Banknote size={15} className="text-gray-400 mb-1" />
            <div className="text-xs text-gray-500">Invoiced / fee</div>
            <div className="text-sm font-bold text-gray-800 mt-1">{fmtAED(money.invoiced, { compact: true })} <span className="text-gray-400 font-medium">/ {fmtAED(money.fee, { compact: true })}</span></div>
            <div className="text-[11px] text-gray-400">labour cost {fmtAED(money.cost, { compact: true })} (est.)</div>
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <AlarmClock size={15} className={overdueDeadlines ? 'text-red-500 mb-1' : 'text-gray-400 mb-1'} />
          <div className="text-xs text-gray-500">Contract deadlines overdue</div>
          <div className={`text-xl font-bold ${overdueDeadlines ? 'text-red-600' : 'text-gray-800'}`}>{overdueDeadlines}</div>
          {portfolioSpi != null && <div className="text-[11px] text-gray-400">worst SPI {portfolioSpi.toFixed(2)}</div>}
        </div>
      </div>

      {/* Band 2 — exceptions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /> Needs attention {ragFilter && <span className="text-xs font-normal text-gray-400">(filtered: {ragFilter})</span>}</h3>
          <span className="text-[11px] text-gray-400">{exceptions.length} of {rows.length} projects</span>
        </div>
        {exceptions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Nothing needs attention{ragFilter ? ' in this filter' : ' — the portfolio is tracking'}.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {exceptions.map(({ p, pm, health, reasons }) => (
              <div key={p.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="w-64 shrink-0">
                  <button onClick={() => onOpenWorkspace(p)} className="font-medium text-brand text-sm hover:underline text-left">{p.name}</button>
                  <div className="text-[11px] text-gray-400">{p.projectNo} · {scopeOf(p)} · {EMPLOYEES.find((e) => e.id === (p.dpmId || p.cpmId))?.name || '—'}</div>
                </div>
                <div className="flex-1 flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full ${health.chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} /> {health.label}
                  </span>
                  {reasons.map((r) => (
                    <span key={r.label} className={`text-[11px] px-2 py-0.5 rounded-full ${reasonChip[r.tone]}`}>{r.label}</span>
                  ))}
                </div>
                <div className="flex gap-3 shrink-0 text-xs">
                  <button onClick={() => onOpenWorkspace(p)} className="text-brand font-medium hover:underline flex items-center gap-1">Workspace <ArrowRight size={11} /></button>
                  {onJumpView && <button onClick={() => onJumpView('reviews')} className="text-gray-500 hover:text-gray-700 hover:underline">Review</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Band 3 — cross-project resource pressure */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Users2 size={14} className="text-gray-400" /> Resource pressure — next 4 weeks</h3>
          {onJumpView && <button onClick={() => onJumpView('resources')} className="text-xs text-brand font-medium hover:underline">Open planner</button>}
        </div>
        {pressure.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">Nobody is planned over {CAPACITY_HOURS_PER_WEEK}h/week in the next 4 weeks.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pressure.map((r) => (
              <div key={r.name} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <div className="w-48 shrink-0 font-medium text-gray-800">{r.name}</div>
                <div className="flex-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {r.perWeek.map((w) => (
                    <span key={w.week} className={`px-2 py-0.5 rounded-md tabular-nums ${w.hours > CAPACITY_HOURS_PER_WEEK ? 'bg-red-50 text-red-700 border border-red-200 font-semibold' : w.hours >= CAPACITY_HOURS_PER_WEEK * 0.9 ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>
                      wk {fmtShortDate(w.week)}: {w.hours}h
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-gray-400 shrink-0">competing: {[...new Set(r.perWeek.flatMap((w) => w.projects))].join(', ') || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Band 4 — forward radar */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><TrendingDown size={14} className="text-gray-400" /> Forward radar — next 30 days</h3>
        </div>
        {radar.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">No contractual or schedule events in the next 30 days.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {radar.map((e, i) => {
              const meta = RADAR_KIND[e.kind]
              const Icon = meta.icon
              const d = daysUntil(e.due)
              return (
                <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium w-20 text-center shrink-0 ${meta.chip}`}><Icon size={9} className="inline mr-0.5 -mt-px" />{e.kind}</span>
                  <span className="flex-1 min-w-0 truncate text-gray-800">{e.title}{e.atRisk && <span className="text-amber-600 text-[11px] ml-1.5">(slipping)</span>}</span>
                  <button onClick={() => onOpenWorkspace(e.project)} className="text-[11px] text-gray-400 hover:text-brand hover:underline shrink-0 w-40 truncate text-left">{e.project.projectNo} · {e.project.name}</button>
                  <span className={`text-xs tabular-nums w-28 text-right shrink-0 ${d < 0 ? 'text-red-600 font-semibold' : d <= 7 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                    {fmtShortDate(e.due)} {d < 0 ? `(${-d}d over)` : `(${d}d)`}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400">
        Health rules match the Active projects view (red = overdue claim / 3+ late tasks / SPI &lt; 0.85). Billing-behind flags projects invoiced 20+ points below earned progress{canViewSensitive ? '' : ' (visible to sensitive roles)'}. Resource capacity is a flat {CAPACITY_HOURS_PER_WEEK}h/week for the demo. Demo data.
      </p>
    </div>
  )
}
