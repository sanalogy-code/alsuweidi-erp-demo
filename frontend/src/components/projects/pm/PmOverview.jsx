import { AlertTriangle, FileText, ClipboardCheck, TrendingUp, Scale, Landmark, ListTodo } from 'lucide-react'
import { spiOf, claimDeadlines, daysUntil, claimStatusMeta } from '../../../data/pmData'
import { fmtAED } from '../../../data/financeData'

// Project-controls health summary: one card per register with the number that
// matters and a jump link. Claims deadlines get top billing — missing a FIDIC
// notice extinguishes the claim.

function StatCard({ icon: Icon, label, value, sub, tone = 'gray', onClick }) {
  const tones = {
    gray: 'text-gray-700', green: 'text-green-600', amber: 'text-amber-600', red: 'text-red-600',
  }
  return (
    <button onClick={onClick} className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-brand/40 transition w-full">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
        <Icon size={14} /> {label}
      </div>
      <div className={`text-xl font-semibold ${tones[tone]}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </button>
  )
}

export default function PmOverview({ pm, project, invoices, onJump }) {
  const spi = spiOf(pm.progressCurve)
  const openWirs = pm.wirs.filter((w) => w.status === 'pending_re' || w.status === 'pending_trade' || w.status === 'resubmit').length
  const openNcrs = pm.ncrs.filter((n) => n.status !== 'closed').length
  const pendingDeliverables = pm.deliverables.filter((d) => d.status !== 'approved' && d.status !== 'approved_as_noted').length
  const openTasks = pm.tasks.filter((t) => t.status === 'open')
  const overdueTasks = openTasks.filter((t) => t.due && daysUntil(t.due) < 0).length

  const totalFee = pm.fees.stages.reduce((s, x) => s + x.fee, 0)
  const projInvoices = invoices.filter((i) => i.projectId === project.id && i.status !== 'draft')
  const invoiced = projInvoices.reduce((s, i) => s + i.amount, 0)

  // Claim deadline alerts — the module's reason to exist.
  const claimAlerts = pm.claims.flatMap((c) => {
    const { noticeDue, detailedDue } = claimDeadlines(c, pm.fidicEdition)
    const alerts = []
    if (c.status === 'event_logged' && noticeDue) {
      const d = daysUntil(noticeDue)
      alerts.push({ claim: c, kind: '28-day notice', due: noticeDue, days: d })
    }
    if (c.status === 'notice_served' && detailedDue) {
      const d = daysUntil(detailedDue)
      alerts.push({ claim: c, kind: 'Fully detailed claim', due: detailedDue, days: d })
    }
    return alerts
  }).sort((a, b) => a.days - b.days)

  const pendingReports = pm.reports.filter((r) => !r.submittedDate)

  return (
    <div className="space-y-4">
      {claimAlerts.length > 0 && (
        <div className="space-y-2">
          {claimAlerts.map((a, i) => (
            <button key={i} onClick={() => onJump('claims')} className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm ${a.days < 0 ? 'bg-red-50 border-red-200' : a.days <= 10 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
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
        </div>
      )}

      {pendingReports.map((r) => {
        const d = daysUntil(r.dueDate)
        return (
          <button key={r.id} onClick={() => onJump('reports')} className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm ${d < 0 ? 'bg-red-50 border-red-200' : d <= 3 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
          <FileText size={17} className={d < 0 ? 'text-red-500' : d <= 3 ? 'text-amber-500' : 'text-gray-400'} />
          <span className="flex-1 text-gray-700">
            <span className="font-medium text-gray-800">Monthly progress report ({r.month}) </span>
            {d < 0 ? `was due ${r.dueDate} — non-submission can block the Payment Certificate` : `due ${r.dueDate} (${d} day${d === 1 ? '' : 's'} left — FIDIC 4.21: within 7 days of month end)`}
          </span>
        </button>
        )
      })}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Schedule (SPI)" onClick={() => onJump('schedule')}
          value={spi == null ? '—' : spi.toFixed(2)}
          sub={spi == null ? 'No progress curve' : spi >= 1 ? 'On / ahead of plan' : spi >= 0.9 ? 'Slightly behind plan' : 'Behind plan'}
          tone={spi == null ? 'gray' : spi >= 1 ? 'green' : spi >= 0.9 ? 'amber' : 'red'} />
        <StatCard icon={ClipboardCheck} label="Open inspections" onClick={() => onJump('site')}
          value={openWirs + openNcrs === 0 ? '0' : `${openWirs + openNcrs}`}
          sub={`${openWirs} WIR${openWirs === 1 ? '' : 's'} in review · ${openNcrs} open NCR${openNcrs === 1 ? '' : 's'}`}
          tone={openNcrs > 0 ? 'amber' : 'gray'} />
        <StatCard icon={FileText} label="Deliverables in flight" onClick={() => onJump('deliverables')}
          value={pendingDeliverables} sub={`${pm.deliverables.length} in register`} />
        <StatCard icon={ListTodo} label="Open tasks" onClick={() => onJump('tasks')}
          value={openTasks.length} sub={overdueTasks ? `${overdueTasks} overdue` : 'None overdue'}
          tone={overdueTasks ? 'red' : 'gray'} />
        <StatCard icon={Scale} label="Claims / EOT" onClick={() => onJump('claims')}
          value={pm.claims.length} sub={pm.claims.length ? `${pm.claims.filter((c) => c.status !== 'determined' && c.status !== 'time_barred').length} active` : 'None registered'} />
        <StatCard icon={TrendingUp} label="Fee invoiced" onClick={() => onJump('fees')}
          value={totalFee ? `${Math.round((invoiced / totalFee) * 100)}%` : '—'}
          sub={totalFee ? `${fmtAED(invoiced, { compact: true })} of ${fmtAED(totalFee, { compact: true })}` : 'No fee breakdown'} />
        <StatCard icon={Landmark} label="Authority workflows" onClick={() => onJump('authorities')}
          value={pm.authorities.length}
          sub={(() => {
            const waiting = pm.authorities.filter((a) => a.stages.some((s) => s.status === 'submitted' || s.status === 'comments')).length
            return waiting ? `${waiting} awaiting a response` : 'Nothing pending'
          })()} />
        <StatCard icon={FileText} label="FIDIC edition" onClick={() => onJump('claims')}
          value={pm.fidicEdition} sub="Per-project setting (claims cadence)" />
      </div>
    </div>
  )
}
