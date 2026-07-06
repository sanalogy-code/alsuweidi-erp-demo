import { spiOf, daysUntil } from '../../../data/pmData'
import { parseLocalDate } from '../../../utils/date'

// Schedule: milestones with baseline vs forecast/actual + delay flags, and a
// planned-vs-actual S-curve with a simple SPI. Full CPM is deliberately not the
// anchor (per research) — Gantt-lite is enough for the demo.

function MilestoneBars({ milestones }) {
  const dates = milestones.flatMap((m) => [m.baseline, m.forecast, m.actual]).filter(Boolean).map((d) => parseLocalDate(d).getTime())
  if (!dates.length) return null
  const min = Math.min(...dates), max = Math.max(...dates)
  const span = Math.max(1, max - min)
  const pos = (iso) => ((parseLocalDate(iso).getTime() - min) / span) * 100

  return (
    <div className="space-y-3">
      {milestones.map((m) => {
        const late = m.actual
          ? parseLocalDate(m.actual) > parseLocalDate(m.baseline)
          : m.forecast && parseLocalDate(m.forecast) > parseLocalDate(m.baseline)
        const done = !!m.actual
        return (
          <div key={m.id}>
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="font-medium text-gray-700">{m.label}</span>
              {done
                ? <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${late ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{late ? 'Done — late' : 'Done — on time'}</span>
                : late && <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700">Forecast slip</span>}
            </div>
            <div className="relative h-5 bg-gray-100 rounded">
              <div className="absolute top-0 bottom-0 w-0.5 bg-gray-500" style={{ left: `${pos(m.baseline)}%` }} title={`Baseline ${m.baseline}`} />
              {(m.actual || m.forecast) && (
                <div className={`absolute top-1 bottom-1 w-2 rounded-sm ${done ? (late ? 'bg-amber-500' : 'bg-green-500') : late ? 'bg-red-400' : 'bg-blue-400'}`}
                  style={{ left: `calc(${pos(m.actual || m.forecast)}% - 4px)` }} title={done ? `Actual ${m.actual}` : `Forecast ${m.forecast}`} />
              )}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>Baseline {m.baseline}</span>
              <span>{done ? `Actual ${m.actual}` : m.forecast ? `Forecast ${m.forecast}` : ''}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SCurve({ curve }) {
  if (!curve.length) return null
  const W = 560, H = 180, PAD = 28
  const maxY = 100
  const x = (i) => PAD + (i / Math.max(1, curve.length - 1)) * (W - PAD * 2)
  const y = (v) => H - PAD - (v / maxY) * (H - PAD * 2)
  const path = (key) => curve.filter((c) => c[key] != null).map((c, i, arr) =>
    `${i === 0 ? 'M' : 'L'}${x(curve.indexOf(c))},${y(c[key])}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl">
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={PAD} x2={W - PAD} y1={y(v)} y2={y(v)} stroke="#f3f4f6" />
          <text x={PAD - 6} y={y(v) + 3} textAnchor="end" fontSize="8" fill="#9ca3af">{v}%</text>
        </g>
      ))}
      <path d={path('planned')} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={path('actual')} fill="none" stroke="#2563eb" strokeWidth="2" />
      {curve.map((c, i) => c.actual != null && <circle key={i} cx={x(i)} cy={y(c.actual)} r="2.5" fill="#2563eb" />)}
      {curve.map((c, i) => (
        <text key={i} x={x(i)} y={H - PAD + 12} textAnchor="middle" fontSize="8" fill="#9ca3af">{c.month.slice(5)}</text>
      ))}
    </svg>
  )
}

export default function ScheduleView({ pm }) {
  const spi = spiOf(pm.progressCurve)
  if (!pm.milestones.length && !pm.progressCurve.length) {
    return <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No schedule data — set milestones and a baseline first.</div>
  }
  return (
    <div className="space-y-4">
      {pm.progressCurve.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Planned vs actual (S-curve)</h3>
            {spi != null && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${spi >= 1 ? 'bg-green-100 text-green-700' : spi >= 0.9 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                SPI {spi.toFixed(2)} {spi >= 1 ? '— on/ahead' : '— behind plan'}
              </span>
            )}
          </div>
          <SCurve curve={pm.progressCurve} />
          <div className="flex gap-4 text-[11px] text-gray-500 mt-1">
            <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-gray-400" /> Planned</span>
            <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-blue-500" /> Actual</span>
            <span className="text-gray-400">SPI = EV/PV at the latest reported month.</span>
          </div>
        </div>
      )}
      {pm.milestones.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Milestones — baseline vs forecast/actual</h3>
          <MilestoneBars milestones={pm.milestones} />
        </div>
      )}
      <p className="text-[11px] text-gray-400">Baseline dates are fixed at plan approval; forecast slips flag red. A full CPM engine (dependencies, float) is deliberately out of scope — Phase 2 if ever needed.</p>
    </div>
  )
}
