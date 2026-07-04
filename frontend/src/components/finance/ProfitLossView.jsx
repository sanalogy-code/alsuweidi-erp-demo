import { TrendingUp, TrendingDown } from 'lucide-react'
import { MONTHLY_PL, fmtAED } from '../../data/financeData'

const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}

const netOf = (r) => r.revenue - r.directCosts - r.payroll - r.overhead

export default function ProfitLossView({ invoices, expenses }) {
  const rows = MONTHLY_PL.map((r) => ({ ...r, net: netOf(r) }))
  const totals = rows.reduce(
    (t, r) => ({
      revenue: t.revenue + r.revenue,
      directCosts: t.directCosts + r.directCosts,
      payroll: t.payroll + r.payroll,
      overhead: t.overhead + r.overhead,
      net: t.net + r.net,
    }),
    { revenue: 0, directCosts: 0, payroll: 0, overhead: 0, net: 0 }
  )
  const margin = totals.revenue ? (totals.net / totals.revenue) * 100 : 0
  const grossProfit = totals.revenue - totals.directCosts
  const netMax = Math.max(1, ...rows.map((r) => Math.abs(r.net)))

  const Line = ({ label, value, tint = 'text-gray-900', bold }) => (
    <div className="flex justify-between items-baseline py-1.5">
      <span className={`text-sm ${bold ? 'font-semibold text-gray-700' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-sm tabular-nums ${tint} ${bold ? 'font-bold' : 'font-medium'}`}>{value}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Profit &amp; loss — H1 2026</h2>
        <p className="text-sm text-gray-500">Summary income statement. Illustrative figures — Phase 2 generates this from the ledger.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Revenue (H1)</div>
          <div className="text-xl font-bold text-gray-900 tabular-nums">{fmtAED(totals.revenue, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Gross profit</div>
          <div className="text-xl font-bold text-gray-900 tabular-nums">{fmtAED(grossProfit, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Net profit</div>
          <div className={`text-xl font-bold tabular-nums ${totals.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{fmtAED(totals.net, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Net margin</div>
          <div className={`text-xl font-bold tabular-nums flex items-center gap-1 ${margin >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {margin >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}{margin.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Monthly table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Monthly breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-2 text-left font-medium">Month</th>
                  <th className="px-4 py-2 text-right font-medium">Revenue</th>
                  <th className="px-4 py-2 text-right font-medium">Direct</th>
                  <th className="px-4 py-2 text-right font-medium">Payroll</th>
                  <th className="px-4 py-2 text-right font-medium">Overhead</th>
                  <th className="px-4 py-2 text-right font-medium">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r) => (
                  <tr key={r.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{monthLabel(r.month)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-800">{fmtAED(r.revenue, { compact: true })}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-500">{fmtAED(r.directCosts, { compact: true })}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-500">{fmtAED(r.payroll, { compact: true })}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-500">{fmtAED(r.overhead, { compact: true })}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums font-semibold ${r.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{fmtAED(r.net, { compact: true })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50 font-semibold">
                  <td className="px-4 py-2.5 text-gray-700">H1 total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-900">{fmtAED(totals.revenue, { compact: true })}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{fmtAED(totals.directCosts, { compact: true })}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{fmtAED(totals.payroll, { compact: true })}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{fmtAED(totals.overhead, { compact: true })}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${totals.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{fmtAED(totals.net, { compact: true })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Income statement + net trend */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Income statement (H1)</h3>
            <Line label="Revenue (fees earned)" value={fmtAED(totals.revenue)} />
            <Line label="Less: direct costs" value={`(${fmtAED(totals.directCosts)})`} tint="text-gray-500" />
            <div className="border-t border-gray-100" />
            <Line label="Gross profit" value={fmtAED(grossProfit)} bold />
            <Line label="Less: payroll" value={`(${fmtAED(totals.payroll)})`} tint="text-gray-500" />
            <Line label="Less: overhead" value={`(${fmtAED(totals.overhead)})`} tint="text-gray-500" />
            <div className="border-t border-gray-200 mt-1" />
            <Line label="Net profit" value={fmtAED(totals.net)} tint={totals.net >= 0 ? 'text-emerald-700' : 'text-red-600'} bold />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Net profit trend</h3>
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.month} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 w-12 shrink-0">{monthLabel(r.month)}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full ${r.net >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${(Math.abs(r.net) / netMax) * 100}%` }} />
                  </div>
                  <span className="text-[11px] tabular-nums text-gray-600 w-14 text-right shrink-0">{fmtAED(r.net, { compact: true })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Illustrative income statement — payroll ties to the HR/WPS run in a real build, direct costs to the expense ledger, revenue to recognised fees. VAT, accruals, WIP and cost-of-sales allocation are Phase 2.
      </p>
    </div>
  )
}
