import { fmtAED, invoiceStatusMeta } from '../../../data/financeData'

// Consultancy fee & cost tracking (Deltek-model): fee breakdown by stage with
// % complete and EAC, manhour budget vs timesheet actuals (hooked to HR
// timesheets), invoiced-vs-fee (hooked to Financials), and a variations register.

export default function FeesView({ pm, project, invoices, timesheets, canViewSensitive, onUpdate }) {
  if (!canViewSensitive) {
    return <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">Fee and cost data is limited to HR/Admin/Management roles.</div>
  }

  const totalFee = pm.fees.stages.reduce((s, x) => s + x.fee, 0)
  const earned = pm.fees.stages.reduce((s, x) => s + x.fee * (x.pctComplete / 100), 0)
  const projInvoices = invoices.filter((i) => i.projectId === project.id)
  const invoiced = projInvoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.amount, 0)

  // Manhour actuals from approved/submitted timesheet entries coded to this project.
  const actualHours = timesheets.reduce((sum, ts) =>
    sum + ts.entries.filter((e) => e.code === project.id).reduce((s, e) => s + e.hours.reduce((a, b) => a + (Number(b) || 0), 0), 0), 0)

  const setPct = (stageId, pct) => onUpdate({
    ...pm,
    fees: { ...pm.fees, stages: pm.fees.stages.map((s) => s.id === stageId ? { ...s, pctComplete: Math.max(0, Math.min(100, Number(pct) || 0)) } : s) },
  })

  const approvedVars = pm.fees.variations.filter((v) => v.status === 'approved').reduce((s, v) => s + v.amount, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Contract fee" value={fmtAED(totalFee || project.contractValue, { compact: true })} sub={approvedVars ? `+ ${fmtAED(approvedVars, { compact: true })} approved VOs` : 'incl. stages below'} />
        <Stat label="Earned (% complete)" value={fmtAED(earned, { compact: true })} sub={totalFee ? `${Math.round((earned / totalFee) * 100)}% of fee` : ''} />
        <Stat label="Invoiced" value={fmtAED(invoiced, { compact: true })} sub={`${projInvoices.length} invoice${projInvoices.length === 1 ? '' : 's'} in Financials`} />
        <Stat label="Manhours" value={`${actualHours}h`} sub={pm.fees.manhourBudget ? `of ${pm.fees.manhourBudget.toLocaleString()}h budget (this session's timesheet seeds)` : 'no budget set'} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 text-sm font-semibold text-gray-700">Fee by stage</div>
        {pm.fees.stages.length === 0 && <div className="p-6 text-center text-sm text-gray-400">No fee breakdown defined.</div>}
        {pm.fees.stages.map((s) => {
          const eac = s.fee // fixed-fee stages: EAC = fee unless a VO changes it
          return (
            <div key={s.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center gap-3 text-sm">
              <span className="flex-1 min-w-0 text-gray-800 truncate">{s.stage}</span>
              <span className="w-24 text-right text-gray-600">{fmtAED(s.fee, { compact: true })}</span>
              <div className="w-40 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${s.pctComplete}%` }} />
                </div>
                <input type="number" min="0" max="100" value={s.pctComplete} onChange={(e) => setPct(s.id, e.target.value)}
                  className="w-14 border rounded-md px-1.5 py-0.5 text-xs text-right" />
                <span className="text-xs text-gray-400">%</span>
              </div>
              <span className="hidden lg:block w-24 text-right text-xs text-gray-400" title="Estimate at completion">EAC {fmtAED(eac, { compact: true })}</span>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 text-sm font-semibold text-gray-700">Variations register</div>
        {pm.fees.variations.length === 0 && <div className="p-6 text-center text-sm text-gray-400">No variations.</div>}
        {pm.fees.variations.map((v) => (
          <div key={v.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center gap-3 text-sm">
            <span className="font-mono text-xs text-gray-500 w-14 shrink-0">{v.ref}</span>
            <span className="flex-1 min-w-0 text-gray-800 truncate">{v.description}</span>
            <span className="text-xs text-gray-400 w-20 text-right">{v.date}</span>
            <span className="w-24 text-right text-gray-700">{fmtAED(v.amount, { compact: true })}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${v.status === 'approved' ? 'bg-green-100 text-green-700' : v.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{v.status}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 text-sm font-semibold text-gray-700">Invoices against this project (from Financials)</div>
        {projInvoices.length === 0 && <div className="p-6 text-center text-sm text-gray-400">No invoices yet.</div>}
        {projInvoices.map((i) => {
          const meta = invoiceStatusMeta(i.status)
          return (
            <div key={i.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center gap-3 text-sm">
              <span className="font-mono text-xs text-gray-500 w-28 shrink-0">{i.invoiceNo}</span>
              <span className="flex-1 min-w-0 text-gray-700 truncate">{i.description}</span>
              <span className="w-24 text-right text-gray-700">{fmtAED(i.amount, { compact: true })}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-400">
        Dual cost-rate vs billing-rate views, WIP write-up/down, and scheduled billing are Phase 2 — this validates fee-by-stage, % complete, EAC, and the hooks into HR timesheets and Financials invoices.
      </p>
    </div>
  )
}

const Stat = ({ label, value, sub }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
    <div className="text-xl font-semibold text-gray-800">{value}</div>
    {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
  </div>
)
