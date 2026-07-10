import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldCheck, ScrollText, Lock, MessageSquareWarning, Landmark } from 'lucide-react'
import Navbar from '../components/Navbar'
import SidebarNav from '../components/SidebarNav'
import AdminOverview from '../components/admin/AdminOverview'
import UsersView from '../components/admin/UsersView'
import RolesPermissionsView from '../components/admin/RolesPermissionsView'
import AuditLogView from '../components/admin/AuditLogView'
import GovernanceView from '../components/admin/GovernanceView'
import { FeedbackQueue } from '../components/SystemFeedback'
import {
  ADMIN_VIEW_ROLES, USER_ACCOUNTS, DEFAULT_PERMISSIONS, AUDIT_LOG as AUDIT_SEED,
} from '../data/adminData'

// Admin Center — user accounts, role → module permissions, and an activity/usage
// log. Demo-grade like Financials: in-memory state, no real auth behind it (the
// login page stays password-less). The permissions matrix mirrors the app's
// actual client-side gates and doubles as the Phase 2 RBAC spec.

export default function Admin({ user, onLogout, feedback = [], onUpdateFeedback, auditLog = AUDIT_SEED }) {
  const canView = ADMIN_VIEW_ROLES.includes(user?.role)
  const location = useLocation()
  const [view, setView] = useState(location.state?.view || 'overview')
  const [users, setUsers] = useState(USER_ACCOUNTS)
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS)

  useEffect(() => {
    if (location.state?.view) setView(location.state.view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const invitedCount = users.filter((u) => u.status === 'invited').length

  const NAV = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users, badge: invitedCount },
    { key: 'roles', label: 'Roles & permissions', icon: ShieldCheck },
    { key: 'governance', label: 'Authority & access', icon: Landmark },
    { key: 'feedback', label: 'System feedback', icon: MessageSquareWarning, badge: feedback.filter((f) => f.status === 'new').length },
    { key: 'log', label: 'Activity log', icon: ScrollText },
  ]

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
        <SidebarNav
          groups={[{ items: NAV }]} active={view} onSelect={setView}
          footer={(
            <div className="hidden sm:block mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
              Demo data — no real auth behind this yet. Real user management and RBAC are Phase 2.
            </div>
          )}
        />

        <main className="flex-1 min-w-0 w-full">
          {view === 'overview' && (
            <AdminOverview users={users} log={auditLog} onJump={setView} />
          )}
          {view === 'users' && (
            <UsersView users={users} onChange={setUsers} />
          )}
          {view === 'roles' && (
            <RolesPermissionsView permissions={permissions} onChange={setPermissions} users={users} />
          )}
          {view === 'governance' && <GovernanceView />}
          {view === 'feedback' && <FeedbackQueue items={feedback} onUpdate={onUpdateFeedback} />}
          {view === 'log' && (
            <AuditLogView log={auditLog} users={users} />
          )}
        </main>
      </div>
    </div>
  )
}
