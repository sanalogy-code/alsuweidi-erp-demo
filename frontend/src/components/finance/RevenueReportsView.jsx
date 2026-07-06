import { useState } from 'react'
import { fmtAED } from '../../data/financeData'
import { PROJECTS } from '../../data/projectsData'

// Revenue reports (Batch 15) — the current ERP's management-report menu
// (Revenue Earned / Forecast / Comparison) as one view with a lens toggle
// instead of four separate pages. Earned = invoiced per project per month
// (from the Financials invoices); forecast = remaining fee spread over the
// months to year end. Illustrative until real billing milestones exist.

const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12']
const CURRENT = '2026-07'
const fmtK = (n) => (n ? `${Math.round(n / 1000)}k` : '—')

export default function RevenueReportsView({ invoices }) {
  const [lens, setLens] = useState('earned') // earned | forecast | comparison

  // Earned (invoiced, ex-VAT) per project per month.
  const rows = PROJECTS.map((p) => {
    const monthly = Object.fromEntries(MONTHS.map((m) => [m, 0]))
    invoices.filter((i) => i.projectId === p.id && i.status !== 'draft' && i.issueDate?.startsWith('2026'))
      .forEach((i) => { const m = i.issueDate.slice(0, 7); if (monthly[m] != null) monthly[m] += i.amount })
    const earnedTotal = Object.values(monthly).reduce((s, v) => s + v, 0)
    // Forecast: remaining fee spread evenly over the months left in the year.
    const remaining = Math.max(0, (p.contractValue || 0) - invoices.filter((i) => i.projectId === p.id && i.status !== 'draft').reduce((s, i) => s + i.amount, 0))
    const futureMonths = MONTHS.filter((m) => m > CURRENT)
    const forecast = Object.fromEntries(MONTHS.map((m) => [m, m <= CURRENT ? monthly[m] : (p.generalStatus === 'In Progress' ? remaining / futureMonths.length : 0)]))
    const forecastTotal = Object.values(forecast).reduce((s, v) => s + v, 0)
    return { p, monthly, earnedTotal, forecast, forecastTotal }
  }).filter((r) => r.earnedTotal > 0 || r.forecastTotal > 0)
    .sort((a, b) => b.earnedTotal - a.earnedTotal)

  const grand = (key) => MONTHS.map((m) => rows.reduce((s, r) => s + (key === 'earned' ? r.monthly[m] : r.forecast[m]), 0))

  const LENSES = [
    { key: 'earned', label: 'Earned (invoiced)' },
    { key: 'forecast', label: 'Forecast' },
    { key: 'comparison', label: 'Forecast vs earned' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Revenue reports — 2026</h2>
          <p className="text-xs text-gray-500">Per project per month, AED thousands ex-VAT. Earned = invoiced; forecast spreads the remaining fee to year end.</p>
        </div>
        <div className="flex text-xs rounded-md border border-gray-200 overflow-hidden">
          {LENSES.map((l) => (
            <button key={l.key} onClick={() => setLens(l.key)} className={`px-2.5 py-1.5 font-medium ${lens === l.key ? 'bg-brand text-white' : 'bg-white text-gray-500'}`}>{l.label}</button>
          ))}
        </div>
      </div>

      {lens !== 'comparison' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-[10px] text-gray-500 uppercase">
              <tr>
                <th className="text-left px-3 py-2 sticky left-0 bg-gray-50">Project</th>
                {MONTHS.map((m) => <th key={m} className={`text-right px-2 py-2 ${m === CURRENT ? 'text-brand' : ''}`}>{m.slice(5)}/26</th>)}
                <th className="text-right px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(({ p, monthly, forecast, earnedTotal, forecastTotal }) => {
                const data = lens === 'earned' ? monthly : forecast
                const total = lens === 'earned' ? earnedTotal : forecastTotal
                return (
                  <tr key={p.id} className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 sticky left-0 bg-white">
                      <div className="text-gray-800 font-medium truncate max-w-[180px]" title={p.name}>{p.name}</div>
                      <div className="text-[10px] text-gray-400">{p.projectNo}</div>
                    </td>
                    {MONTHS.map((m) => (
                      <td key={m} className={`px-2 py-2 text-right ${data[m] ? 'text-gray-700' : 'text-gray-300'} ${lens === 'forecast' && m > CURRENT && data[m] ? 'italic text-blue-600' : ''}`}>{fmtK(data[m])}</td>
                    ))}
                    <td className="px-3 py-2 text-right font-semibold text-gray-800">{fmtK(total)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50 font-semibold text-gray-700">
              <tr>
                <td className="px-3 py-2 sticky left-0 bg-gray-50">Grand total</td>
                {grand(lens).map((v, i) => <td key={i} className="px-2 py-2 text-right">{fmtK(v)}</td>)}
                <td className="px-3 py-2 text-right">{fmtK(grand(lens).reduce((s, v) => s + v, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
          {rows.map(({ p, earnedTotal, forecastTotal }) => {
            const max = Math.max(...rows.map((r) => Math.max(r.earnedTotal, r.forecastTotal)), 1)
            return (
              <div key={p.id} className="text-xs">
                <div className="flex justify-between text-gray-600 mb-0.5">
                  <span className="font-medium text-gray-800 truncate max-w-[300px]">{p.projectNo} — {p.name}</span>
                  <span>{fmtAED(earnedTotal, { compact: true })} earned · {fmtAED(forecastTotal, { compact: true })} full-year forecast</span>
                </div>
                <div className="space-y-0.5">
                  <div className="h-2.5 bg-gray-50 rounded"><div className="h-full bg-green-500 rounded" style={{ width: `${(earnedTotal / max) * 100}%` }} /></div>
                  <div className="h-2.5 bg-gray-50 rounded"><div className="h-full bg-blue-300 rounded" style={{ width: `${(forecastTotal / max) * 100}%` }} /></div>
                </div>
              </div>
            )
          })}
          <div className="flex gap-4 text-[10px] text-gray-400 pt-1">
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green-500 rounded-sm inline-block" /> Earned to date</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-blue-300 rounded-sm inline-block" /> Full-year forecast</span>
          </div>
        </div>
      )}
      <p className="text-[11px] text-gray-400">Real forecasting needs billing milestones per project (Phase 2 — see the auto-draft-invoices backlog idea); the even spread is a placeholder to agree the report shape.</p>
    </div>
  )
}
