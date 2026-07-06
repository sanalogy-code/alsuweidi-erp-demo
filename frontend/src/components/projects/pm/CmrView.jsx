import { useState } from 'react'
import { HardHat, Image as ImageIcon } from 'lucide-react'
import {
  phaseProgress, spiOf, claimDeadlines, daysUntil, riskStatusMeta,
  authorityStageMeta, ipcStatusMeta, wirStatusMeta, ncrStatusMeta,
} from '../../../data/pmData'
import { INVOICES, fmtAED } from '../../../data/financeData'

// Construction review (monthly) — the CMR equivalent, redesigned per Sana's
// instruction: keep the information (status, %s, contract values, key dates,
// deployment, retention, photos, notes), lose the wall-of-form-fields. Facts
// are DISPLAYED from the project record and registers, not re-entered; the few
// CMR-only facts live in phase.cmr.

const Fact = ({ label, value, warn }) => (
  <div>
    <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
    <div className={`text-sm font-medium ${warn ? 'text-red-600' : 'text-gray-800'}`}>{value ?? '—'}</div>
  </div>
)

export default function CmrView({ projects, pmRecords, onOpenWorkspace, canViewSensitive }) {
  const entries = projects
    .filter((p) => p.generalStatus !== 'Completed')
    .flatMap((p) => (pmRecords[p.id]?.phases || [])
      .filter((ph) => ph.key === 'supervision')
      .map((ph) => ({ project: p, pm: pmRecords[p.id], phase: ph })))
  const [selId, setSelId] = useState(null)
  const sel = entries.find((e) => e.project.id === selId) || entries[0]

  if (!sel) return <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No supervision phases in progress.</div>

  const { project, pm, phase } = sel
  const cmr = phase.cmr || {}
  const sup = project.supervision || {}
  const progress = phaseProgress(phase)
  const spi = spiOf(phase.progressCurve)
  const planned = [...phase.progressCurve].reverse().find((c) => c.actual != null)?.planned ?? null
  const projInvoices = INVOICES.filter((i) => i.projectId === project.id && i.status !== 'draft')
  const invoiced = projInvoices.reduce((s, i) => s + i.amount, 0)
  const received = projInvoices.reduce((s, i) => s + Math.min(i.amountPaid ?? 0, i.amount + (i.vatAmount ?? 0)), 0)
  const openWirs = (phase.wirs || []).filter((w) => w.status !== 'approved' && w.status !== 'approved_as_noted')
  const openNcrs = (phase.ncrs || []).filter((n) => n.status !== 'closed')
  const openRisks = (pm.risks || []).filter((r) => r.status !== 'closed')
  const latest = phase.weeklyUpdates[0]
  const lateDate = sup.estimatedCompletion && sup.contractualCompletion && sup.estimatedCompletion > sup.contractualCompletion

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-start">
      <div className="w-full lg:w-60 shrink-0 bg-white rounded-lg border border-gray-200 divide-y divide-gray-50">
        {entries.map((e) => {
          const pr = phaseProgress(e.phase)
          const active = e.project.id === sel.project.id
          return (
            <button key={e.project.id} onClick={() => setSelId(e.project.id)}
              className={`w-full px-3 py-2.5 text-left transition ${active ? 'bg-brand/5 border-l-2 border-brand' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-gray-400">{e.project.projectNo}</span>
                <span className="flex-1 min-w-0 text-xs text-gray-800 truncate">{e.project.name}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden"><span className="block h-full bg-brand rounded-full" style={{ width: `${pr ?? 0}%` }} /></span>
                <span className="text-[10px] text-gray-400">{pr != null ? `${pr}%` : '—'}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <HardHat size={14} className="text-gray-400" />
                <span className="font-mono text-xs text-gray-400">{project.projectNo}</span>
                <button onClick={() => onOpenWorkspace(project)} className="text-sm font-semibold text-brand hover:underline">{project.name}</button>
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{project.location} · Contractor: {project.contractorName || '—'} · {project.generalStatus}</div>
            </div>
            <div className="flex items-center gap-3">
              {spi != null && <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${spi >= 1 ? 'bg-green-100 text-green-700' : spi >= 0.9 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>SPI {spi.toFixed(2)}</span>}
              {progress != null && <span className="text-[11px] px-2 py-1 rounded-full bg-brand/10 text-brand font-semibold">{progress}% actual{planned != null ? ` / ${planned}% planned` : ''}</span>}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 bg-white rounded-lg border border-gray-200 p-4">
          {canViewSensitive && <Fact label="Construction contract" value={fmtAED(project.constructionCost, { compact: true })} />}
          {canViewSensitive && <Fact label="Approved (incl. VOs)" value={cmr.approvedContractValue ? fmtAED(cmr.approvedContractValue, { compact: true }) : '—'} />}
          {canViewSensitive && <Fact label="Expected at completion" value={cmr.expectedAtCompletion ? fmtAED(cmr.expectedAtCompletion, { compact: true }) : '—'} warn={cmr.expectedAtCompletion > cmr.approvedContractValue} />}
          <Fact label="Commencement" value={cmr.commencementDate} />
          <Fact label="Contractual completion" value={sup.contractualCompletion} />
          <Fact label={cmr.revisedCompletion ? 'Revised completion' : 'Estimated completion'} value={cmr.revisedCompletion || sup.estimatedCompletion} warn={lateDate} />
          <Fact label="Retention" value={cmr.retention} />
          <Fact label="Last safety report" value={cmr.lastSafetyReportDate} />
          <Fact label="Supervision pay status" value={sup.payStatus} warn={sup.payStatus === 'Unsettled'} />
        </div>

        <div className="grid lg:grid-cols-2 gap-3 items-start">
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-600">Team deployment (man-months)</div>
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                  <tr><th className="text-left px-3 py-1.5">Role</th><th className="text-right px-3 py-1.5">To date</th><th className="text-right px-3 py-1.5">Last month</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(cmr.deployment || []).map((d) => (
                    <tr key={d.role}><td className="px-3 py-1.5 text-gray-700">{d.role}</td><td className="px-3 py-1.5 text-right text-gray-700 font-medium">{d.toDate}</td><td className="px-3 py-1.5 text-right text-gray-500">{d.lastMonth}</td></tr>
                  ))}
                  {!(cmr.deployment || []).length && <tr><td colSpan={3} className="px-3 py-3 text-center text-gray-300">No deployment data</td></tr>}
                </tbody>
              </table>
            </div>

            {canViewSensitive && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">Supervision fees</div>
                <div className="text-xs space-y-1 text-gray-600">
                  {phase.fees.stages.map((st) => (
                    <div key={st.id} className="flex justify-between"><span>{st.stage}</span><span className="font-medium">{fmtAED(st.fee, { compact: true })} · {st.pctComplete}%</span></div>
                  ))}
                  <div className="flex justify-between border-t border-gray-100 pt-1"><span>Invoiced / received</span><span className="font-medium">{fmtAED(invoiced, { compact: true })} / {fmtAED(received, { compact: true })}</span></div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5"><ImageIcon size={12} /> Site photos (this month)</div>
              <div className="flex flex-wrap gap-1.5">
                {(cmr.sitePhotos || []).map((f) => (
                  <span key={f} className="text-[10px] font-mono px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-500">{f}</span>
                ))}
                {!(cmr.sitePhotos || []).length && <span className="text-xs text-gray-300">None uploaded.</span>}
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Real photo storage is Phase 2 — names only for now.</p>
            </div>
          </div>

          {/* Notes — composed from the registers, nobody retypes them */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2.5">
            <Note n={1} title="Progress / this week">
              {latest ? <p>{latest.summary}{latest.blockers !== 'None.' && <span className="text-amber-700"> Blockers: {latest.blockers}</span>}</p> : <p className="text-gray-400">No weekly update.</p>}
            </Note>
            <Note n={2} title="Inspections & quality">
              {openWirs.map((w) => <p key={w.id}><span className="font-mono text-gray-400">{w.ref}</span> {w.title} — {wirStatusMeta(w.status).label}</p>)}
              {openNcrs.map((n) => <p key={n.id} className="text-red-700"><span className="font-mono">{n.ref}</span> {n.description} — {ncrStatusMeta(n.status).label}</p>)}
              {!openWirs.length && !openNcrs.length && <p className="text-gray-400">Nothing open.</p>}
            </Note>
            <Note n={3} title="Claims & payments">
              {pm.claims.map((c) => {
                const { noticeDue } = claimDeadlines(c, pm.fidicEdition)
                return (
                  <p key={c.id}>
                    <span className="font-mono text-gray-400">{c.ref}</span> {c.title}
                    {c.status === 'event_logged' && noticeDue && <span className="text-red-600 font-medium"> — notice due {noticeDue} ({daysUntil(noticeDue)}d)</span>}
                  </p>
                )
              })}
              {(pm.ipcs || []).slice(-2).map((i) => (
                <p key={`i${i.id}`}>{i.ref} ({i.period}): claimed {fmtAED(i.amountClaimed, { compact: true })}{i.amountCertified != null && `, certified ${fmtAED(i.amountCertified, { compact: true })}`} — {ipcStatusMeta(i.status).label.toLowerCase()}</p>
              ))}
              {!pm.claims.length && !(pm.ipcs || []).length && <p className="text-gray-400">Nothing active.</p>}
            </Note>
            <Note n={4} title="Risks / issues">
              {openRisks.map((r) => <p key={r.id}><span className="font-mono text-gray-400">{r.ref}</span> {r.description} <span className={`px-1 py-0.5 rounded text-[10px] ${riskStatusMeta(r.status).chip}`}>{riskStatusMeta(r.status).label}</span></p>)}
              {!openRisks.length && <p className="text-gray-400">None open.</p>}
            </Note>
            <Note n={5} title="Authorities / handover">
              {pm.authorities.map((a) => {
                const current = a.stages.find((s) => s.status !== 'approved')
                return <p key={a.id}>{a.authority} ({a.type}): {current ? `${current.key} — ${authorityStageMeta(current.status).label.toLowerCase()}` : 'complete'}</p>
              })}
              {pm.handover?.tocDate ? <p>TOC issued {pm.handover.tocDate}; DLP to {pm.handover.dlpEndDate}.</p> : <p className="text-gray-400">Handover not started.</p>}
            </Note>
          </div>
        </div>
      </div>
    </div>
  )
}

const Note = ({ n, title, children }) => (
  <div className="border-b border-gray-100 pb-2.5 last:border-0">
    <div className="text-[11px] font-semibold text-gray-500 mb-1">{n} · {title}</div>
    <div className="text-xs text-gray-600 space-y-0.5">{children}</div>
  </div>
)
