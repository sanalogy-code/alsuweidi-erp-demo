import { RotateCcw } from 'lucide-react'
import { ROLES } from '../../data/dashboardData'
import { PERMISSION_MODULES, ACCESS_LEVELS, DEFAULT_PERMISSIONS } from '../../data/adminData'

const levelStyle = {
  none: 'bg-gray-50 text-gray-300 hover:bg-gray-100',
  view: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  full: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
}

export default function RolesPermissionsView({ permissions, onChange, users }) {
  // Derived, not local state — survives switching views and coming back
  const dirty = JSON.stringify(permissions) !== JSON.stringify(DEFAULT_PERMISSIONS)

  const usersInRole = (role) => users.filter((u) => u.role === role && u.status !== 'disabled').length

  const cycle = (role, moduleKey) => {
    const current = permissions[role]?.[moduleKey] || 'none'
    const idx = ACCESS_LEVELS.findIndex((l) => l.key === current)
    const next = ACCESS_LEVELS[(idx + 1) % ACCESS_LEVELS.length].key
    onChange({ ...permissions, [role]: { ...permissions[role], [moduleKey]: next } })
  }

  const reset = () => onChange(DEFAULT_PERMISSIONS)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Roles &amp; permissions</h2>
          <p className="text-sm text-gray-500">
            What each role can reach, module by module. Click a cell to cycle — (no access) → View → Full.
          </p>
        </div>
        {dirty && (
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-gray-500 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50">
            <RotateCcw size={13} /> Reset to current app gating
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium sticky left-0 bg-white">Role</th>
                {PERMISSION_MODULES.map((m) => (
                  <th key={m.key} className="px-2 py-2.5 font-medium text-center whitespace-nowrap">{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ROLES.map((r) => (
                <tr key={r.value} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 sticky left-0 bg-white">
                    <div className="text-gray-800 font-medium whitespace-nowrap">{r.label}</div>
                    <div className="text-[11px] text-gray-400">{usersInRole(r.value)} active user{usersInRole(r.value) === 1 ? '' : 's'}</div>
                  </td>
                  {PERMISSION_MODULES.map((m) => {
                    const level = permissions[r.value]?.[m.key] || 'none'
                    const label = ACCESS_LEVELS.find((l) => l.key === level)?.label || level
                    return (
                      <td key={m.key} className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => cycle(r.value, m.key)}
                          className={`text-[11px] font-medium rounded-md px-2 py-1 min-w-[44px] transition ${levelStyle[level]}`}
                          title={`${r.label} → ${m.label}: click to change`}
                        >
                          {label}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
        This matrix mirrors how the demo UI actually gates today and doubles as the Phase 2 access-control
        spec. Edits here are captured for that spec only — they don&apos;t re-gate the running demo, and real
        enforcement happens server-side in Phase 2.
      </div>
    </div>
  )
}
