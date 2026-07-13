import { useState } from 'react'
import {
  FolderKanban, AlarmClock, Users2, Diamond, FileWarning, CalendarClock, ListTodo, User,
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

// PMO dashboard v2 (Batch 23, Sana: "less words, more show — it doesn't FEEL
// like a dashboard"). Show-first: RAG donut, project tiles with bars and badges,
// a resource heatmap, and a 30-day timeline strip. Words are the hover/footnote
// layer, not the surface. "Mine / All" scope: a PM/director filters to projects
// where they are DPM/CPM or on a phase team.
//
// Colour discipline (dataviz pass): red/amber/green are STATUS — always paired
// with a label or count, never colour-alone. Magnitude bars are single-hue
// (brand). No dual axes, thin marks, text in gray ink.

const RADAR_KIND = {
  Claim: { chip: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: FileWarning },
  Report: { chip: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', icon: CalendarClock },
  Milestone: { chip: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', icon: Diamond },
}
const RAG_META = {
  red: { label: 'At risk', text: 'text-red-600', bg: 'bg-red-500', ring: 'border-red-300' },
  amber: { label: 'Watch', text: 'text-amber-600', bg: 'bg-amber-500', ring: 'border-amber-300' },
  green: { label: 'On track', text: 'text-green-600', bg: 'bg-green-500', ring: 'border-gray-200' },
}
const RAG_STROKE = { red: '#ef4444', amber: '#f59e0b', green: '#22c55e' }

function RagDonut({ counts, size = 92 }) {
  const total = counts.red + counts.amber + counts.green || 1
  const r = size / 2 - 7
  const c = 2 * Math.PI * r
  let offset = 0
  const segs = ['red', 'amber', 'green'].map((k) => {
    const frac = counts[k] / total
    const seg = { k, dash: `${Math.max(frac * c - 3, 0)} ${c}`, offset: -offset * c }
    offset += frac
    return seg
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
      {segs.map((s) => (
        <circle key={s.k} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={RAG_STROKE[s.k]}
          strokeWidth="12" strokeDasharray={s.dash} strokeDashoffset={s.offset} strokeLinecap="round" />
      ))}
    </svg>
  )
}

const initials = (name = '') => name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

export default function PmoView({ projects, pmRecords, timesheets = [], allocations = [], invoices = [], canViewSensitive = false, onOpenWorkspace, onJumpView, user }) {
  const [ragFilter, setRagFilter] = useState('') // '' | 'red' | 'amber' | 'green'
  const [scope, setScope] = useState('all') // 'all' | 'mine'
  const me = (user?.username || '').toLowerCase()

  const isMine = (p, pm) => {
    const emp = (id) => EMPLOYEES.find((e) => e.id === id)?.name?.toLowerCase()
    if (emp(p.dpmId) === me || emp(p.cpmId) === me) return true
    return pm.phases.some((ph) => (ph.team || []).some((m) => (m.name || '').toLowerCase() === me))
  }

  // --- Per-project rollup -----------------------------------------------------
  const allRows = projects
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
      const claimSoon = pm.claims.some((c) => {
        const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
        const due = c.status === 'event_logged' ? noticeDue : c.status === 'notice_served' ? detailedDue : null
        return due && daysUntil(due) <= 7
      })
      const owner = EMPLOYEES.find((e) => e.id === (p.dpmId || p.cpmId))?.name
      return { p, pm, health, late, spi, ms, hours, fee, invoiced, progress, claimSoon, owner, mine: isMine(p, pm) }
    })

  const rows = allRows.filter((r) => scope === 'all' || r.mine)
  const byRag = { red: 0, amber: 0, green: 0 }
  rows.forEach((r) => { byRag[r.health.key] += 1 })
  const tiles = rows.filter((r) => !ragFilter || r.health.key === ragFilter)
    .sort((a, b) => ({ red: 0, amber: 1, green: 2 })[a.health.key] - ({ red: 0, amber: 1, green: 2 })[b.health.key])

  const money = {
    fee: rows.reduce((s, r) => s + r.fee, 0),
    invoiced: rows.reduce((s, r) => s + r.invoiced, 0),
    cost: rows.reduce((s, r) => s + r.hours, 0) * SALARY_COST_PER_HOUR,
  }

  // --- Forward radar (30 days) -------------------------------------------------
  const radar = []
  rows.forEach(({ p, pm }) => {
    pm.claims.forEach((c) => {
      const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
      const due = c.status === 'event_logged' ? noticeDue : c.status === 'notice_served' ? detailedDue : null
      if (due && daysUntil(due) <= 30) radar.push({ project: p, kind: 'Claim', title: c.status === 'event_logged' ? `28-day notice — ${c.ref}` : `Detailed claim — ${c.ref}`, due })
    })
    pm.reports.filter((r) => !r.submittedDate && daysUntil(r.dueDate) <= 30).forEach((r) => {
      radar.push({ project: p, kind: 'Report', title: `4.21 report — ${r.month}`, due: r.dueDate })
    })
    pm.phases.forEach((ph) => {
      ph.milestones.filter((m) => !m.actual).forEach((m) => {
        const due = m.forecast || m.baseline
        if (daysUntil(due) >= -7 && daysUntil(due) <= 30) radar.push({ project: p, kind: 'Milestone', title: `${m.label}`, due, atRisk: !!(m.forecast && m.baseline && m.forecast > m.baseline) })
      })
    })
  })
  radar.sort((a, b) => a.due.localeCompare(b.due))
  const overdueDeadlines = radar.filter((e) => e.kind !== 'Milestone' && daysUntil(e.due) < 0).length

  // --- Resource heatmap (4 weeks, everyone allocated) ---------------------------
  const weeks = Array.from({ length: 4 }, (_, i) => toLocalISO(addDays(weekStartOf(new Date()), i * 7)))
  const projectIds = new Set(rows.map((r) => r.p.id))
  const scopedAllocs = allocations.filter((a) => projectIds.has(a.projectId))
  const people = [...new Set(scopedAllocs.map((a) => a.name))]
  const heat = people.map((name) => ({
    name,
    cells: weeks.map((w) => scopedAllocs.filter((a) => a.name === name && a.weekStart === w).reduce((s, a) => s + a.hours, 0)),
  })).sort((a, b) => Math.max(...b.cells) - Math.max(...a.cells)).slice(0, 8)
  const overloaded = heat.filter((r) => r.cells.some((h) => h > CAPACITY_HOURS_PER_WEEK)).length
  const heatCell = (h) => h === 0 ? 'bg-gray-50 text-gray-300'
    : h > CAPACITY_HOURS_PER_WEEK ? 'bg-red-500 text-white font-semibold'
    : h >= CAPACITY_HOURS_PER_WEEK * 0.9 ? 'bg-amber-300 text-amber-900'
    : 'bg-green-100 text-green-800'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">PMO</h2>
          <p className="text-xs text-gray-500">Portfolio at a glance — click a colour to filter, a tile to open.</p>
        </div>
        <div className="flex text-xs border border-gray-200 rounded-md overflow-hidden">
          <button onClick={() => setScope('all')} className={`px-3 py-1.5 font-medium ${scope === 'all' ? 'bg-brand text-white' : 'bg-white text-gray-500'}`}>All projects</button>
          <button onClick={() => setScope('mine')} className={`px-3 py-1.5 font-medium flex items-center gap-1 ${scope === 'mine' ? 'bg-brand text-white' : 'bg-white text-gray-500'}`}><User size={11} /> Mine</button>
        </div>
      </div>

      {/* Band 1 — the 30-second read: donut + big numbers */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-center gap-6">
        <div className="relative">
          <RagDonut counts={byRag} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-800 leading-none">{rows.length}</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wide">active</div>
          </div>
        </div>
        <div className="flex gap-2">
          {['red', 'amber', 'green'].map((k) => (
            <button key={k} onClick={() => setRagFilter(ragFilter === k ? '' : k)}
              className={`rounded-lg border px-4 py-2.5 text-center transition ${ragFilter === k ? 'border-brand ring-1 ring-brand/30 bg-brand/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className={`text-2xl font-bold leading-none ${RAG_META[k].text}`}>{byRag[k]}</div>
              <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${RAG_META[k].bg}`} />{RAG_META[k].label}</div>
            </button>
          ))}
        </div>
        <div className="h-12 w-px bg-gray-100 hidden sm:block" />
        <div className="flex gap-6 flex-wrap">
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide flex items-center gap-1"><AlarmClock size={10} /> Deadlines overdue</div>
            <div className={`text-2xl font-bold leading-tight ${overdueDeadlines ? 'text-red-600' : 'text-gray-800'}`}>{overdueDeadlines}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide flex items-center gap-1"><Users2 size={10} /> Over-allocated</div>
            <div className={`text-2xl font-bold leading-tight ${overloaded ? 'text-red-600' : 'text-gray-800'}`}>{overloaded}</div>
          </div>
          {canViewSensitive && (
            <div className="min-w-[180px]">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Invoiced vs fee</div>
              <div className="text-sm font-bold text-gray-800 mt-0.5">{fmtAED(money.invoiced, { compact: true })} <span className="text-gray-400 font-medium">/ {fmtAED(money.fee, { compact: true })}</span></div>
              <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${money.fee ? Math.min((money.invoiced / money.fee) * 100, 100) : 0}%` }} />
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{money.fee ? Math.round((money.invoiced / money.fee) * 100) : 0}% billed · labour {fmtAED(money.cost, { compact: true })} est.</div>
            </div>
          )}
        </div>
      </div>

      {/* Band 2 — project tiles */}
      {tiles.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
          {scope === 'mine' ? 'No active projects under your name.' : 'No projects in this filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {tiles.map(({ p, health, late, spi, ms, fee, invoiced, progress, claimSoon, owner }) => (
            <button key={p.id} onClick={() => onOpenWorkspace(p)}
              className={`bg-white rounded-lg border-2 ${RAG_META[health.key].ring} p-3.5 text-left hover:shadow transition group`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-gray-800 truncate group-hover:text-brand">{p.name}</div>
                  <div className="text-[10px] text-gray-400">{p.projectNo} · {scopeOf(p)}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${health.chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />{RAG_META[health.key].label}
                  </span>
                  {owner && <span title={owner} className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-[9px] font-bold flex items-center justify-center">{initials(owner)}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${progress ?? 0}%` }} />
                </div>
                <span className="text-[11px] font-semibold text-gray-600 tabular-nums w-8 text-right">{progress != null ? `${progress}%` : '—'}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className={`font-bold tabular-nums ${spi == null ? 'text-gray-300' : spi >= 1 ? 'text-green-600' : spi >= 0.9 ? 'text-amber-600' : 'text-red-600'}`}>
                  SPI {spi != null ? spi.toFixed(2) : '—'}
                </span>
                <span className={`flex items-center gap-1 ${late ? 'text-red-600 font-semibold' : 'text-gray-300'}`}><ListTodo size={11} />{late}</span>
                {claimSoon && <span className="flex items-center gap-1 text-red-600 font-semibold"><FileWarning size={11} />claim</span>}
                {ms && (
                  <span className={`flex items-center gap-1 ml-auto ${ms.atRisk ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                    <Diamond size={9} />{fmtShortDate(ms.forecast || ms.baseline)}
                  </span>
                )}
              </div>

              {canViewSensitive && fee > 0 && (
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: `${Math.min((invoiced / fee) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">{Math.round((invoiced / fee) * 100)}% billed</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        {/* Band 3 — resource heatmap */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5"><Users2 size={12} className="text-gray-400" /> Resource load — 4 weeks</h3>
            {onJumpView && <button onClick={() => onJumpView('resources')} className="text-[11px] text-brand font-medium hover:underline">Planner</button>}
          </div>
          {heat.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-gray-400">No allocations planned.</div>
          ) : (
            <div className="p-3">
              <div className="grid" style={{ gridTemplateColumns: 'minmax(90px,1.4fr) repeat(4, 1fr)', gap: '3px' }}>
                <div />
                {weeks.map((w) => <div key={w} className="text-[9px] text-gray-400 text-center">{fmtShortDate(w)}</div>)}
                {heat.map((r) => (
                  [<div key={r.name} className="text-[11px] text-gray-700 font-medium truncate pr-1 self-center">{r.name}</div>,
                    ...r.cells.map((h, i) => (
                      <div key={`${r.name}-${i}`} className={`rounded text-center text-[10px] py-1.5 tabular-nums ${heatCell(h)}`}>{h > 0 ? `${h}h` : '·'}</div>
                    ))]
                ))}
              </div>
              <div className="flex gap-3 mt-2.5 text-[9px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-100 inline-block" />OK</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-300 inline-block" />≥90%</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" />Over {CAPACITY_HOURS_PER_WEEK}h</span>
              </div>
            </div>
          )}
        </div>

        {/* Band 4 — 30-day timeline */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5"><CalendarClock size={12} className="text-gray-400" /> Next 30 days</h3>
          </div>
          {radar.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-gray-400">Nothing due.</div>
          ) : (
            <div className="p-3">
              {/* timeline strip: today → +30d */}
              <div className="relative h-7 mx-1 mb-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 rounded" />
                <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300" />
                {radar.map((e, i) => {
                  const d = Math.max(daysUntil(e.due), 0)
                  return (
                    <span key={i} title={`${e.title} — ${e.project.projectNo}`}
                      className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ring-2 ring-white ${RADAR_KIND[e.kind].dot}`}
                      style={{ left: `${(d / 30) * 96}%` }} />
                  )
                })}
                <span className="absolute -bottom-1 left-0 text-[9px] text-gray-400">today</span>
                <span className="absolute -bottom-1 right-0 text-[9px] text-gray-400">+30d</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
                {radar.map((e, i) => {
                  const d = daysUntil(e.due)
                  return (
                    <div key={i} className="py-1.5 flex items-center gap-2 text-[11px]">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${RADAR_KIND[e.kind].dot}`} />
                      <span className="flex-1 min-w-0 truncate text-gray-700">{e.title}{e.atRisk && <span className="text-amber-600 ml-1">(slipping)</span>}</span>
                      <button onClick={() => onOpenWorkspace(e.project)} className="text-gray-400 hover:text-brand hover:underline shrink-0">{e.project.projectNo}</button>
                      <span className={`tabular-nums w-16 text-right shrink-0 ${d < 0 ? 'text-red-600 font-bold' : d <= 7 ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                        {d < 0 ? `${-d}d over` : d === 0 ? 'today' : `${d}d`}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-2 text-[9px] text-gray-400">
                {Object.entries(RADAR_KIND).map(([k, m]) => <span key={k} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${m.dot}`} />{k}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Health rules match Active projects. "Mine" = projects where you are DPM/CPM or on a phase team. Capacity {CAPACITY_HOURS_PER_WEEK}h/week flat for the demo. Demo data.
      </p>
    </div>
  )
}
