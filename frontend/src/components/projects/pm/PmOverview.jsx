import { AlertTriangle, FileText, ClipboardCheck, TrendingUp, Scale, Landmark, ListTodo } from 'lucide-react'
import { spiOf, claimDeadlines, daysUntil, claimStatusMeta, PHASE_META } from '../../../data/pmData'
import { fmtAED } from '../../../data/financeData'

// Project overview: contract-level alerts (claim deadlines, monthly report due)
// on top, then a health card per phase — each phase is its own engagement with
// its own %, SPI, team, and open work.

export default function PmOverview({ pm, project, invoices, onJump, canViewSensitive = false }) {
  const claimAlerts = pm.claims.flatMap((c) => {
    const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
    const alerts = []
    if (c.status === 'event_logged' && noticeDue) alerts.push({ claim: c, kind: '28-day notice', due: noticeDue, days: daysUntil(noticeDue) })
    if (c.status === 'notice_served' && detailedDue) alerts.push({ claim: c, kind: 'Fully detailed claim', due: detailedDue, days: daysUntil(detailedDue) })
    return alerts
  }).sort((a, b) => a.days - b.days)

  const pendingReports = pm.reports.filter((r) => !r.submittedDate)

  const totalFee = pm.phases.reduce((s, ph) => s + ph.fees.stages.reduce((x, st) => x + st.fee, 0), 0)
  const projInvoices = invoices.filter((i) => i.projectId === project.id && i.status !== 'draft')
  const invoiced = projInvoices.reduce((s, i) => s + i.amount, 0)
  const authoritiesWaiting = pm.authorities.filter((a) => a.stages.some((s) => s.status === 'submitted' || s.status === 'comments')).length

  return (
    <div className="space-y-4">
      {claimAlerts.map((a, i) => (
        <button key={i} onClick={() => onJump({ view: 'claims' })} className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm ${a.days < 0 ? 'bg-red-50 border-red-200' : a.days <= 10 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
          <AlertTriangle size={17} className={a.days < 0 ? 'text-red-500' : a.days <= 10 ? 'text-amber-500' : 'text-gray-400'} />
          <span className="flex-1 min-w-0">
            <span className="font-medium text-gray-800">{a.claim.ref} — {a.kind} </span>
            <span className="text-gray-600">
              {a.days < 0 ? `was due ${a.due} (${-a.days}d overdue — claim may be time-barred)` : `due ${a.due} (${a.days} day${a.days === 1 ? '' : 's'} left)`}
            </span>
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${claimStatusMeta(a.claim.status).chip}`}>{claimStatusMeta(a.claim.status).label}</span>
        </button>
      ))}

      {pendingReports.map((r) => {
        const d = daysUntil(r.dueDate)
        return (
          <button key={r.id} onClick={() => onJump({ view: 'reports' })} className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm ${d < 0 ? 'bg-red-50 border-red-200' : d <= 3 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
            <FileText size={17} className={d < 0 ? 'text-red-500' : d <= 3 ? 'text-amber-500' : 'text-gray-400'} />
            <span className="flex-1 text-gray-700">
              <span className="font-medium text-gray-800">Monthly progress report ({r.month}) </span>
              {d < 0 ? `was due ${r.dueDate} — non-submission can block the Payment Certificate` : `due ${r.dueDate} (${d} day${d === 1 ? '' : 's'} left — FIDIC 4.21)`}
            </span>
          </button>
        )
      })}

      {/* One health card per phase — separate engagements, separate numbers. */}
      <div className="grid lg:grid-cols-2 gap-3">
        {pm.phases.map((ph) => {
          const spi = spiOf(ph.progressCurve)
          const latest = ph.weeklyUpdates[0]
          const openTasks = ph.tasks.filter((t) => t.status !== 'done')
          const overdue = openTasks.filter((t) => t.due && daysUntil(t.due) < 0).length
          const openSite = (ph.wirs || []).filter((w) => w.status !== 'approved' && w.status !== 'approved_as_noted').length
            + (ph.ncrs || []).filter((n) => n.status !== 'closed').length
          const pendingDeliv = (ph.deliverables || []).filter((d) => d.status !== 'approved' && d.status !== 'approved_as_noted').length
          const meta = PHASE_META[ph.key] || { label: ph.label, chip: 'bg-gray-100 text-gray-600' }
          return (
            <div key={ph.key} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${meta.chip}`}>{ph.label}{ph.studyType ? ` — ${ph.studyType}` : ''}</span>
                {latest && <span className="text-sm font-semibold text-gray-800">{latest.pctComplete}% complete</span>}
                {spi != null && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${spi >= 1 ? 'bg-green-100 text-green-700' : spi >= 0.9 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    SPI {spi.toFixed(2)}
                  </span>
                )}
              </div>
              {latest ? (
                <p className="text-xs text-gray-600">{latest.summary}</p>
              ) : (
                <p className="text-xs text-gray-400">No weekly update posted yet.</p>
              )}
              {latest && latest.blockers !== 'None.' && (
                <p className="text-xs text-amber-700"><span className="font-medium">Blockers:</span> {latest.blockers}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <PhaseStat icon={ListTodo} label={`${openTasks.length} tasks${overdue ? ` (${overdue} overdue)` : ''}`} warn={overdue > 0} onClick={() => onJump({ phase: ph.key, view: 'tasks' })} />
                {(ph.wirs || ph.ncrs) && <PhaseStat icon={ClipboardCheck} label={`${openSite} open inspections`} warn={openSite > 0} onClick={() => onJump({ phase: ph.key, view: 'site' })} />}
                {ph.deliverables && <PhaseStat icon={FileText} label={`${pendingDeliv} deliverables in flight`} onClick={() => onJump({ phase: ph.key, view: 'deliverables' })} />}
                <PhaseStat icon={TrendingUp} label="Schedule" onClick={() => onJump({ phase: ph.key, view: 'schedule' })} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card icon={Scale} label="Claims / EOT" value={pm.claims.length}
          sub={pm.claims.length ? `${pm.claims.filter((c) => c.status !== 'determined' && c.status !== 'time_barred').length} active · ${pm.fidicEdition} cadence` : `None registered · FIDIC ${pm.fidicEdition}`}
          onClick={() => onJump({ view: 'claims' })} />
        {canViewSensitive && (
          <Card icon={TrendingUp} label="Fee invoiced" value={totalFee ? `${Math.round((invoiced / totalFee) * 100)}%` : '—'}
            sub={totalFee ? `${fmtAED(invoiced, { compact: true })} of ${fmtAED(totalFee, { compact: true })}` : 'No fee breakdown'}
            onClick={() => onJump({ phase: pm.phases[0]?.key ?? null, view: pm.phases.length ? 'fees' : 'overview' })} />
        )}
        <Card icon={Landmark} label="Authority workflows" value={pm.authorities.length}
          sub={authoritiesWaiting ? `${authoritiesWaiting} awaiting a response` : 'Nothing pending'}
          onClick={() => onJump({ view: 'authorities' })} />
      </div>
    </div>
  )
}

const PhaseStat = ({ icon: Icon, label, warn, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border transition ${warn ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-gray-200 text-gray-600 hover:border-brand/40 hover:text-brand'}`}>
    <Icon size={12} /> {label}
  </button>
)

const Card = ({ icon: Icon, label, value, sub, onClick }) => (
  <button onClick={onClick} className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-brand/40 transition w-full">
    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5"><Icon size={14} /> {label}</div>
    <div className="text-xl font-semibold text-gray-700">{value}</div>
    {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
  </button>
)
