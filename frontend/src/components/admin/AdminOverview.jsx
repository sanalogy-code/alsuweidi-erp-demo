import { Users, ShieldAlert, KeyRound, Activity } from 'lucide-react'
import { ROLES } from '../../data/dashboardData'
import { MODULE_USAGE_30D, auditKindMeta, userStatusMeta } from '../../data/adminData'

const roleLabel = (value) => ROLES.find((r) => r.value === value)?.label || value

export default function AdminOverview({ users, log, onJump }) {
  const active = users.filter((u) => u.status === 'active')
  const invited = users.filter((u) => u.status === 'invited')
  const disabled = users.filter((u) => u.status === 'disabled')
  const denied = log.filter((e) => e.kind === 'access_denied')

  const byRole = ROLES
    .map((r) => ({ ...r, count: active.filter((u) => u.role === r.value).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
  const maxRole = Math.max(1, ...byRole.map((r) => r.count))

  const maxUsage = Math.max(1, ...MODULE_USAGE_30D.map((m) => m.sessions))
  const recent = [...log].sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 8)

  const stat = (label, value, tone = 'text-gray-900', onClick) => (
    <button onClick={onClick} className="bg-white rounded-lg border border-gray-200 p-3 text-left hover:border-brand/40 transition">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${tone}`}>{value}</div>
    </button>
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Admin overview</h2>
        <p className="text-sm text-gray-500">Accounts, access and usage at a glance. Everything here is demo data.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stat('Active users', active.length, 'text-gray-900', () => onJump('users'))}
        {stat('Awaiting setup', invited.length, invited.length > 0 ? 'text-blue-700' : 'text-gray-900', () => onJump('users'))}
        {stat('Disabled', disabled.length, 'text-gray-500', () => onJump('users'))}
        {stat('Access denied (log)', denied.length, denied.length > 0 ? 'text-amber-700' : 'text-gray-900', () => onJump('log'))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-brand" />
            <h3 className="text-sm font-semibold text-gray-800">Active users by role</h3>
          </div>
          <div className="space-y-2">
            {byRole.map((r) => (
              <div key={r.value} className="flex items-center gap-2">
                <div className="w-40 text-xs text-gray-600 truncate shrink-0">{roleLabel(r.value)}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-brand/70 h-full rounded-full" style={{ width: `${(r.count / maxRole) * 100}%` }} />
                </div>
                <div className="w-6 text-right text-xs text-gray-700 tabular-nums shrink-0">{r.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={15} className="text-brand" />
            <h3 className="text-sm font-semibold text-gray-800">Module usage — last 30 days</h3>
            <span className="text-[10px] text-gray-400 ml-auto">mock sessions</span>
          </div>
          <div className="space-y-2">
            {MODULE_USAGE_30D.map((m) => (
              <div key={m.module} className="flex items-center gap-2">
                <div className="w-40 text-xs text-gray-600 truncate shrink-0">{m.module}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-400/70 h-full rounded-full" style={{ width: `${(m.sessions / maxUsage) * 100}%` }} />
                </div>
                <div className="w-9 text-right text-xs text-gray-700 tabular-nums shrink-0">{m.sessions}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={15} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-gray-800">Needs attention</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {invited.map((u) => (
              <li key={u.id} className="flex items-start gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 shrink-0 ${userStatusMeta('invited').chip}`}>Invited</span>
                <span className="text-gray-700">{u.name} hasn&apos;t set a password yet (invited {u.createdDate})</span>
              </li>
            ))}
            {denied.map((e) => (
              <li key={e.id} className="flex items-start gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 shrink-0 ${auditKindMeta('access_denied').chip}`}>Denied</span>
                <span className="text-gray-700">{e.user} — {e.detail} ({e.ts})</span>
              </li>
            ))}
            {disabled.map((u) => (
              <li key={u.id} className="flex items-start gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 shrink-0 ${userStatusMeta('disabled').chip}`}>Disabled</span>
                <span className="text-gray-700">{u.name}{u.disabledReason ? ` — ${u.disabledReason}` : ''}</span>
              </li>
            ))}
            {invited.length + denied.length + disabled.length === 0 && (
              <li className="text-gray-400 text-sm">Nothing pending.</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound size={15} className="text-brand" />
            <h3 className="text-sm font-semibold text-gray-800">Recent activity</h3>
            <button onClick={() => onJump('log')} className="text-xs text-brand hover:underline ml-auto">Full log →</button>
          </div>
          <ul className="space-y-2">
            {recent.map((e) => {
              const meta = auditKindMeta(e.kind)
              return (
                <li key={e.id} className="flex items-start gap-2 text-sm">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 shrink-0 ${meta.chip}`}>{meta.label}</span>
                  <span className="text-gray-700 min-w-0">
                    <span className="font-medium">{e.user}</span> — {e.detail}
                    <span className="text-[11px] text-gray-400 whitespace-nowrap"> · {e.ts}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
