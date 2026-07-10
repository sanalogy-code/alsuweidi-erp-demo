import { useState, useMemo } from 'react'
import { FileBarChart } from 'lucide-react'
import {
  dmrTotals, dmrProfitability, SALARY_COST_PER_HOUR, phaseProgress,
  riskStatusMeta, authorityStageMeta, claimDeadlines, daysUntil,
} from '../../../data/pmData'
import { INVOICES, EXPENSES, fmtAED } from '../../../data/financeData'
import { scopeOf } from '../../../data/projectsData'

// DMR — the weekly Design Management Report (Batch 13), modeled directly on the
// company's existing DMR screen: pick a PM, walk their design/study projects one
// by one — discipline hours vs the R0 estimate (overruns in red), profitability
// (salary cost from hours + sub-consultant accruals vs earned), the financial
// waterfall (fee → earned → invoiced → received), and the structured notes
// composed live from the registers (weekly update, permitting, risks, payments).

const pct = (n) => `${Math.round(n * 100)}%`

function HoursTable({ rows }) {
  const totals = dmrTotals(rows)
  const ratio = (d) => (d.estim > 0 ? d.toDate / d.estim : null)
  return (
    <table className="w-full text-xs">
      <thead className="bg-gray-50 border-b border-gray-200 text-[10px] text-gray-500 uppercase">
        <tr>
          <th className="text-left px-3 py-1.5">Discipline</th>
          <th className="text-right px-3 py-1.5">Estim R0</th>
          <th className="text-right px-3 py-1.5">2 weeks</th>
          <th className="text-right px-3 py-1.5">To date</th>
          <th className="text-right px-3 py-1.5">Hours / R0</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((d) => {
          const r = ratio(d)
          return (
            <tr key={d.discipline}>
              <td className="px-3 py-1.5 text-gray-700">{d.discipline}</td>
              <td className="px-3 py-1.5 text-right text-gray-500">{d.estim ? d.estim.toLocaleString() : '—'}</td>
              <td className="px-3 py-1.5 text-right text-gray-500">{d.twoWeeks || '—'}</td>
              <td className="px-3 py-1.5 text-right text-gray-700 font-medium">{d.toDate.toLocaleString()}</td>
              <td className={`px-3 py-1.5 text-right font-semibold ${r == null ? 'text-gray-300' : r > 1.05 ? 'text-red-600' : r > 0.95 ? 'text-amber-600' : 'text-green-600'}`}>
                {r == null ? '—' : pct(r)}
              </td>
            </tr>
          )
        })}
      </tbody>
      <tfoot className="border-t border-gray-200 bg-gray-50 font-semibold text-gray-700">
        <tr>
          <td className="px-3 py-1.5">Total hours</td>
          <td className="px-3 py-1.5 text-right">{totals.estim.toLocaleString()}</td>
          <td className="px-3 py-1.5 text-right">{totals.twoWeeks.toLocaleString()}</td>
          <td className="px-3 py-1.5 text-right">{totals.toDate.toLocaleString()}</td>
          <td className={`px-3 py-1.5 text-right ${totals.estim && totals.toDate / totals.estim > 1.05 ? 'text-red-600' : ''}`}>
            {totals.estim ? pct(totals.toDate / totals.estim) : '—'}
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

function FinancialBars({ fee, earned, invoiced, received }) {
  const max = Math.max(fee, earned, invoiced, received, 1)
  const bars = [
    { label: 'Fee', v: fee, cls: 'bg-gray-300' },
    { label: 'Earned', v: earned, cls: 'bg-blue-400' },
    { label: 'Invoiced', v: invoiced, cls: 'bg-purple-400' },
    { label: 'Received', v: received, cls: 'bg-green-500' },
  ]
  return (
    <div className="space-y-1.5">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-2 text-xs">
          <span className="w-16 shrink-0 text-gray-500">{b.label}</span>
          <div className="flex-1 h-3.5 bg-gray-50 rounded">
            <div className={`h-full rounded ${b.cls}`} style={{ width: `${(b.v / max) * 100}%` }} />
          </div>
          <span className="w-20 shrink-0 text-right text-gray-600">{fmtAED(b.v, { compact: true })}</span>
        </div>
      ))}
    </div>
  )
}

function NoteBlock({ n, title, children }) {
  return (
    <div className="border-b border-gray-100 pb-2.5 last:border-0">
      <div className="text-[11px] font-semibold text-gray-500 mb-1">{n} · {title}</div>
      <div className="text-xs text-gray-600 space-y-0.5">{children}</div>
    </div>
  )
}

export default function DmrView({ projects, pmRecords, onOpenWorkspace, invoices = INVOICES, expenses = EXPENSES }) {
  // "PM" = anyone leading a design/study phase (DPM / Study Lead).
  const leads = useMemo(() => {
    const set = new Map()
    projects.forEach((p) => {
      const pm = pmRecords[p.id]
      pm?.phases.filter((ph) => ph.key !== 'supervision').forEach((ph) => {
        ph.team.filter((m) => m.role.includes('PM') || m.role.includes('Lead')).slice(0, 1)
          .forEach((m) => set.set(m.name, m.name))
      })
    })
    return [...set.keys()]
  }, [projects, pmRecords])

  const [lead, setLead] = useState(leads[0] || '')
  const [selId, setSelId] = useState(null)

  // The lead's design/study phases across active projects.
  const entries = projects
    .filter((p) => p.generalStatus !== 'Completed')
    .flatMap((p) => (pmRecords[p.id]?.phases || [])
      .filter((ph) => ph.key !== 'supervision' && (!lead || ph.team.some((m) => m.name === lead)))
      .map((ph) => ({ project: p, pm: pmRecords[p.id], phase: ph })))

  const sel = entries.find((e) => e.project.id === selId) || entries[0]

  if (!entries.length) {
    return <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No design/study phases for this selection.</div>
  }

  const { project, pm, phase } = sel
  const subCost = expenses.filter((e) => e.projectId === project.id && e.category === 'Subconsultant Fees' && e.status !== 'rejected').reduce((s, e) => s + e.amount, 0)
  const prof = dmrProfitability(phase, subCost)
  const fee = phase.fees.stages.reduce((s, st) => s + st.fee, 0)
  const projInvoices = invoices.filter((i) => i.projectId === project.id && i.status !== 'draft')
  const invoiced = projInvoices.reduce((s, i) => s + i.amount, 0)
  const received = projInvoices.reduce((s, i) => s + Math.min(i.amountPaid ?? 0, i.amount + (i.vatAmount ?? 0)), 0)
  const latest = phase.weeklyUpdates[0]
  const openRisks = (pm.risks || []).filter((r) => r.status === 'open' || r.status === 'mitigating' || r.status === 'realized')
  const progress = phaseProgress(phase)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileBarChart size={16} className="text-brand" />
          <h2 className="text-sm font-semibold text-gray-700">Design Management Report — weekly</h2>
        </div>
        <select value={lead} onChange={(e) => { setLead(e.target.value); setSelId(null) }} className="border border-gray-200 rounded-md px-2.5 py-1.5 text-sm bg-white">
          <option value="">All design leads</option>
          {leads.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-start">
        {/* Project rail */}
        <div className="w-full lg:w-60 shrink-0 bg-white rounded-lg border border-gray-200 divide-y divide-gray-50">
          {entries.map((e) => {
            const pr = phaseProgress(e.phase)
            const t = dmrTotals(e.phase.hoursByDiscipline || [])
            const over = t.estim > 0 && t.toDate / t.estim > 1.05
            const active = e.project.id === (sel?.project.id)
            return (
              <button key={`${e.project.id}-${e.phase.key}`} onClick={() => setSelId(e.project.id)}
                className={`w-full px-3 py-2.5 text-left transition ${active ? 'bg-brand/5 border-l-2 border-brand' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-400">{e.project.projectNo}</span>
                  <span className="flex-1 min-w-0 text-xs text-gray-800 truncate">{e.project.name}</span>
                  {over && <span className="text-[9px] px-1 py-0.5 rounded bg-red-100 text-red-700 font-semibold shrink-0">HRS</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden"><span className="block h-full bg-brand rounded-full" style={{ width: `${pr ?? 0}%` }} /></span>
                  <span className="text-[10px] text-gray-400">{pr != null ? `${pr}%` : '—'}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Report body */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-400">{project.projectNo}</span>
                <button onClick={() => onOpenWorkspace(project)} className="text-sm font-semibold text-brand hover:underline">{project.name}</button>
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {project.location}{project.sector ? ` · ${project.sector}` : ''}{project.plot ? ` · Plot ${project.plot}` : ''} · {scopeOf(project)} · Fee {fmtAED(fee, { compact: true })}
              </div>
            </div>
            {progress != null && <span className="text-[11px] px-2 py-1 rounded-full bg-brand/10 text-brand font-semibold">{progress}% complete</span>}
          </div>

          <div className="grid lg:grid-cols-2 gap-3 items-start">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-600">Hours by discipline — estimate R0 vs to date</div>
              <HoursTable rows={phase.hoursByDiscipline || []} />
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">Financial</div>
                <FinancialBars fee={fee} earned={prof.earned} invoiced={invoiced} received={received} />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">Profitability</div>
                <div className="text-xs space-y-1">
                  <Row a="(A) Hours to date" b={`${prof.hours.toLocaleString()}h`} />
                  <Row a={`(B) Salary cost (A × AED ${SALARY_COST_PER_HOUR}/h)`} b={fmtAED(prof.salaryCost, { compact: true })} />
                  <Row a="(C) Accrued sub-consultants" b={fmtAED(prof.subCost, { compact: true })} red={prof.subCost > 0} />
                  <Row a="(E) Earned (fee × % complete)" b={fmtAED(prof.earned, { compact: true })} />
                  <div className={`flex justify-between border-t border-gray-100 pt-1 font-semibold ${prof.pnl < 0 ? 'text-red-600' : 'text-green-700'}`}>
                    <span>(F) P&L = E − B − C</span><span>{fmtAED(prof.pnl, { compact: true })}</span>
                  </div>
                  <div className={`flex justify-between font-semibold ${prof.pnl < 0 ? 'text-red-600' : 'text-green-700'}`}>
                    <span>(G) Margin</span><span>{prof.margin != null ? pct(prof.margin) : '—'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Blended cost rate is illustrative — the real DMR uses contract salary ÷ 196 per person; that needs the Phase 2 payroll link.</p>
              </div>
            </div>
          </div>

          {/* Structured notes — composed live from the registers */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2.5">
            <NoteBlock n={1} title="General / this week">
              {latest ? <p>{latest.summary}{latest.blockers !== 'None.' && <span className="text-amber-700"> Blockers: {latest.blockers}</span>}</p> : <p className="text-gray-400">No weekly update posted.</p>}
            </NoteBlock>
            <NoteBlock n={2} title="Design — deliverables in flight">
              {(phase.deliverables || []).filter((d) => d.status !== 'approved' && d.status !== 'approved_as_noted').map((d) => (
                <p key={d.id}><span className="font-mono text-gray-400">{d.docNo}</span> {d.title} — rev {d.rev}</p>
              ))}
              {!(phase.deliverables || []).some((d) => d.status !== 'approved' && d.status !== 'approved_as_noted') && <p className="text-gray-400">Nothing outstanding.</p>}
            </NoteBlock>
            <NoteBlock n={3} title="Permitting">
              {pm.authorities.length === 0 && <p className="text-gray-400">No authority workflows tracked.</p>}
              {pm.authorities.map((a) => {
                const current = a.stages.find((s) => s.status !== 'approved')
                return <p key={a.id}>{a.authority} ({a.type}): {current ? `${current.key} — ${authorityStageMeta(current.status).label.toLowerCase()}` : 'complete'}</p>
              })}
            </NoteBlock>
            <NoteBlock n={4} title="Risks / issues">
              {openRisks.length === 0 && <p className="text-gray-400">None open.</p>}
              {openRisks.map((r) => <p key={r.id}><span className="font-mono text-gray-400">{r.ref}</span> {r.description} <span className={`px-1 py-0.5 rounded text-[10px] ${riskStatusMeta(r.status).chip}`}>{riskStatusMeta(r.status).label}</span></p>)}
              {pm.claims.map((c) => {
                const { noticeDue } = claimDeadlines(c, pm.fidicEdition)
                return c.status === 'event_logged' && noticeDue ? (
                  <p key={`c${c.id}`} className="text-red-600 font-medium">{c.ref} notice due {noticeDue} ({daysUntil(noticeDue)}d)</p>
                ) : null
              })}
            </NoteBlock>
            <NoteBlock n={5} title="Payment — stages & invoices">
              {phase.fees.stages.map((st) => <p key={st.id}>{st.stage}: {fmtAED(st.fee, { compact: true })} — {st.pctComplete}% complete</p>)}
              <p className="text-gray-500 pt-0.5">Invoiced {fmtAED(invoiced, { compact: true })} · received {fmtAED(received, { compact: true })} · outstanding {fmtAED(Math.max(0, invoiced - received), { compact: true })}</p>
            </NoteBlock>
          </div>
        </div>
      </div>
    </div>
  )
}

const Row = ({ a, b, red }) => (
  <div className={`flex justify-between ${red ? 'text-red-600' : 'text-gray-600'}`}><span>{a}</span><span className="font-medium">{b}</span></div>
)
