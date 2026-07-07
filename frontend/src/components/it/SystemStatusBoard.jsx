import { Activity, CheckCircle2, AlertTriangle } from 'lucide-react'
import { SYSTEM_STATUS } from '../../data/itData'

// Backup / system-status board — ALL FIGURES ARE MOCK. There is no monitoring
// or backup agent feeding this yet; the board shows the shape of what Phase 2
// will render from real feeds (uptime probes, backup-job logs, restore tests).

export default function SystemStatusBoard() {
  const degraded = SYSTEM_STATUS.filter((s) => s.status !== 'ok').length

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">System status &amp; backups</h2>
        <p className="text-xs text-gray-500">{degraded === 0 ? 'All services nominal.' : `${degraded} service(s) need attention.`}</p>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-700 flex items-start gap-2">
        <Activity size={13} className="shrink-0 mt-0.5" />
        <span>Mock data — no monitoring or backup feed is connected yet. Phase 2 wires this board to real uptime probes and backup-job logs.</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {SYSTEM_STATUS.map((s) => {
          const ok = s.status === 'ok'
          return (
            <div key={s.id} className={`bg-white rounded-lg border p-4 ${ok ? 'border-gray-200' : 'border-amber-300'}`}>
              <div className="flex items-center gap-2">
                {ok
                  ? <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                  : <AlertTriangle size={15} className="text-amber-500 shrink-0" />}
                <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">{s.service}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {ok ? 'Operational' : 'Degraded'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div>
                  <div className={`text-sm font-semibold ${s.uptimePct >= 99 ? 'text-gray-800' : 'text-amber-600'}`}>{s.uptimePct}%</div>
                  <div className="text-[10px] text-gray-400">Uptime (30d)</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{s.lastBackup.slice(5, 10)} {s.lastBackup.slice(11)}</div>
                  <div className="text-[10px] text-gray-400">Last backup</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{s.restoreTest}</div>
                  <div className="text-[10px] text-gray-400">Restore test</div>
                </div>
              </div>
              {s.note && <p className={`text-[11px] mt-2 ${ok ? 'text-gray-400' : 'text-amber-700'}`}>{s.note}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
