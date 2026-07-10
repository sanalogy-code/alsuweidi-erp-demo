import { TrendingUp } from 'lucide-react'
import { HEADCOUNT_MONTHLY_2026 } from '../../data/hrTalentData'
import { parseLocalDate, todayLocal } from '../../utils/date'

// Headcount & attrition — computed from the live EMPLOYEES records plus the
// exit-interview log; the monthly joiners/leavers series is deterministic mock
// (the seed only carries current staff) and labelled as such on screen.

// Count rows per key → sorted {label, value} bars.
const countBy = (rows, keyFn) => [...rows.reduce((m, r) => m.set(keyFn(r), (m.get(keyFn(r)) || 0) + 1), new Map()).entries()]
  .map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)

function BarList({ rows, color = 'bg-brand/70' }) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 text-xs">
          <div className="w-28 shrink-0 text-gray-600 truncate" title={r.label}>{r.label}</div>
          <div className="flex-1 h-3.5 bg-gray-50 rounded"><div className={`h-3.5 rounded ${color}`} style={{ width: `${(r.value / max) * 100}%` }} /></div>
          <div className="w-6 text-right font-medium text-gray-700">{r.value}</div>
        </div>
      ))}
    </div>
  )
}

export default function HeadcountDashboard({ employees, exits }) {
  const active = employees.filter((e) => e.status === 'active')

  // Headcount by department
  const byDept = countBy(active, (e) => e.dept)

  // Tenure distribution (from startDate — real data)
  const now = todayLocal()
  const tenures = active.map((e) => (now - parseLocalDate(e.startDate)) / (1000 * 60 * 60 * 24 * 365.25))
  const tenureBuckets = [
    { label: '< 1 yr', test: (t) => t < 1 },
    { label: '1–3 yrs', test: (t) => t >= 1 && t < 3 },
    { label: '3–5 yrs', test: (t) => t >= 3 && t < 5 },
    { label: '5–8 yrs', test: (t) => t >= 5 && t < 8 },
    { label: '8+ yrs', test: (t) => t >= 8 },
  ].map((b) => ({ label: b.label, value: tenures.filter(b.test).length }))
  const avgTenure = tenures.length ? tenures.reduce((s, t) => s + t, 0) / tenures.length : 0

  // Nationality & employment-type mix (EMPLOYEES carries both)
  const byNat = countBy(active, (e) => e.nationality)
  const byType = countBy(active, (e) => e.employmentType)

  // Attrition: leavers YTD (2026 exit records) annualized over average headcount
  const leavers2026 = exits.filter((e) => e.lastWorkingDay.startsWith('2026')).length
  const monthsElapsed = now.getMonth() + 1
  const annualizedAttrition = active.length ? ((leavers2026 / monthsElapsed) * 12) / active.length * 100 : 0

  const maxMonthly = Math.max(...HEADCOUNT_MONTHLY_2026.map((m) => Math.max(m.joiners, m.leavers)), 1)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><TrendingUp size={15} className="text-brand" /> Headcount &amp; attrition</h2>
        <p className="text-xs text-gray-500">Computed from live employee records and the exit-interview log. Monthly joiners/leavers are illustrative until Phase 2 keeps real history.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active headcount', value: active.length },
          { label: 'Leavers 2026 YTD', value: leavers2026 },
          { label: 'Annualized attrition', value: `${annualizedAttrition.toFixed(1)}%` },
          { label: 'Average tenure', value: `${avgTenure.toFixed(1)} yrs` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-2xl font-bold text-gray-800">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Headcount by department</div>
          <BarList rows={byDept} />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Joiners vs leavers — 2026</div>
            <span className="text-[10px] font-medium bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Illustrative</span>
          </div>
          <div className="flex items-end gap-2 h-28">
            {HEADCOUNT_MONTHLY_2026.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 h-20 w-full justify-center">
                  <div className="w-3 bg-brand/70 rounded-t" style={{ height: `${(m.joiners / maxMonthly) * 100}%` }} title={`${m.joiners} joiners`} />
                  <div className="w-3 bg-gray-300 rounded-t" style={{ height: `${(m.leavers / maxMonthly) * 100}%` }} title={`${m.leavers} leavers`} />
                </div>
                <div className="text-[10px] text-gray-400">{m.month}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-brand/70 rounded-sm inline-block" /> Joiners</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gray-300 rounded-sm inline-block" /> Leavers</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tenure distribution</div>
          <BarList rows={tenureBuckets} color="bg-blue-400" />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Nationality mix</div>
            <BarList rows={byNat} color="bg-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Employment type</div>
            <BarList rows={byType} color="bg-purple-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
