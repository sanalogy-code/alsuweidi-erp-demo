import { useState } from 'react'
import { LayoutDashboard, Users, ShieldCheck, ScrollText, Lock, BadgeCheck, MessageSquareWarning } from 'lucide-react'
import Navbar from '../components/Navbar'
import AdminOverview from '../components/admin/AdminOverview'
import UsersView from '../components/admin/UsersView'
import RolesPermissionsView from '../components/admin/RolesPermissionsView'
import AuditLogView from '../components/admin/AuditLogView'
import LicensesView, { OFFICE_LICENSES } from '../components/admin/LicensesView'
import { FeedbackQueue } from '../components/SystemFeedback'
import {
  ADMIN_VIEW_ROLES, USER_ACCOUNTS, DEFAULT_PERMISSIONS, AUDIT_LOG,
} from '../data/adminData'

// Admin Center — user accounts, role → module permissions, and an activity/usage
// log. Demo-grade like Financials: in-memory state, no real auth behind it (the
// login page stays password-less). The permissions matrix mirrors the app's
// actual client-side gates and doubles as the Phase 2 RBAC spec.

export default function Admin({ user, onLogout, feedback = [], onUpdateFeedback }) {
  const canView = ADMIN_VIEW_ROLES.includes(user?.role)
  const [view, setView] = useState('overview')
  const [users, setUsers] = useState(USER_ACCOUNTS)
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS)
  // Owned here (not in the view) so added registrations survive tab switches — SPEC §4.
  const [licenses, setLicenses] = useState(OFFICE_LICENSES)

  const invitedCount = users.filter((u) => u.status === 'invited').length

  const NAV = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users, badge: invitedCount },
    { key: 'roles', label: 'Roles & permissions', icon: ShieldCheck },
    { key: 'licenses', label: 'Registrations & licenses', icon: BadgeCheck },
    { key: 'feedback', label: 'System feedback', icon: MessageSquareWarning, badge: feedback.filter((f) => f.status === 'new').length },
    { key: 'log', label: 'Activity log', icon: ScrollText },
  ]

  const navButton = (item) => {
    const Icon = item.icon
    const active = view === item.key
    return (
      <button
        key={item.key}
        onClick={() => setView(item.key)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition text-left ${active ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
      >
        <Icon size={15} className="shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shrink-0">
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} title="Admin Center" showBack />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
            <Lock size={22} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Restricted module</h2>
          <p className="text-sm text-gray-500 mt-2">
            The Admin Center is limited to system admin and management. Your role
            doesn&apos;t have access. (RBAC is client-side in this demo — Phase 2 enforces it server-side.)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="Admin Center" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <aside className="w-full sm:w-44 shrink-0 sm:sticky sm:top-6">
          <div className="flex sm:flex-col flex-wrap gap-1">
            {NAV.map(navButton)}
          </div>
          <div className="hidden sm:block mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
            Demo data — no real auth behind this yet. Real user management and RBAC are Phase 2.
          </div>
        </aside>

        <main className="flex-1 min-w-0 w-full">
          {view === 'overview' && (
            <AdminOverview users={users} log={AUDIT_LOG} onJump={setView} />
          )}
          {view === 'users' && (
            <UsersView users={users} onChange={setUsers} />
          )}
          {view === 'roles' && (
            <RolesPermissionsView permissions={permissions} onChange={setPermissions} users={users} />
          )}
          {view === 'licenses' && <LicensesView items={licenses} onChange={setLicenses} />}
          {view === 'feedback' && <FeedbackQueue items={feedback} onUpdate={onUpdateFeedback} />}
          {view === 'log' && (
            <AuditLogView log={AUDIT_LOG} users={users} />
          )}
        </main>
      </div>
    </div>
  )
}
