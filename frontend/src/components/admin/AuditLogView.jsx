import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import { AUDIT_KINDS, auditKindMeta } from '../../data/adminData'

export default function AuditLogView({ log, users }) {
  const [kindFilter, setKindFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')

  const modules = [...new Set(log.map((e) => e.module))].sort()
  const userNames = [...new Set(log.map((e) => e.user))].sort()

  const shown = log
    .filter((e) => kindFilter === 'all' || e.kind === kindFilter)
    .filter((e) => moduleFilter === 'all' || e.module === moduleFilter)
    .filter((e) => userFilter === 'all' || e.user === userFilter)
    .sort((a, b) => b.ts.localeCompare(a.ts))

  const denied = log.filter((e) => e.kind === 'access_denied').length
  const activeUsers = users.filter((u) => u.status === 'active').length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Activity log</h2>
          <p className="text-sm text-gray-500">Who did what, across every module. Mock trail — the Phase 2 backend records this for real.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
            <option value="all">All users</option>
            {userNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
            <option value="all">All modules</option>
            {modules.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
            <option value="all">All actions</option>
            {AUDIT_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Events shown</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{shown.length}<span className="text-xs font-normal text-gray-400"> of {log.length}</span></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Access denied (visible window)</div>
          <div className={`text-lg font-bold tabular-nums ${denied > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{denied}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Active users</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{activeUsers}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Module</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shown.map((e) => {
                const meta = auditKindMeta(e.kind)
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 align-top text-gray-500 tabular-nums whitespace-nowrap">{e.ts}</td>
                    <td className="px-4 py-2.5 align-top text-gray-800 whitespace-nowrap">{e.user}</td>
                    <td className="px-4 py-2.5 align-top text-gray-600 whitespace-nowrap">{e.module}</td>
                    <td className="px-4 py-2.5 align-top">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${meta.chip}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-2.5 align-top text-gray-700">{e.detail}</td>
                  </tr>
                )
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <ScrollText size={20} className="mx-auto mb-2 opacity-40" />
                    No events match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
