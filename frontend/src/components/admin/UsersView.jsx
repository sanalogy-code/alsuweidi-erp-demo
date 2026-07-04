import { useState } from 'react'
import { UserPlus, KeyRound, Ban, RotateCcw, Trash2, Pencil, Users } from 'lucide-react'
import Modal from '../crm/Modal'
import { ROLES } from '../../data/dashboardData'
import { userStatusMeta } from '../../data/adminData'

const roleLabel = (value) => ROLES.find((r) => r.value === value)?.label || value

export default function UsersView({ users, onChange }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // user being edited, or 'new'
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [flash, setFlash] = useState(null) // one-line feedback for mock actions

  const shown = users
    .filter((u) => statusFilter === 'all' || u.status === statusFilter)
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => {
      const q = search.trim().toLowerCase()
      return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })

  const active = users.filter((u) => u.status === 'active').length
  const invited = users.filter((u) => u.status === 'invited').length
  const disabled = users.filter((u) => u.status === 'disabled').length

  const update = (user) => onChange(users.map((u) => (u.id === user.id ? user : u)))

  const toggleDisabled = (u) => {
    update({ ...u, status: u.status === 'disabled' ? 'active' : 'disabled' })
    setFlash(u.status === 'disabled' ? `${u.name} re-enabled.` : `${u.name} disabled — they can no longer sign in.`)
  }

  const resetPassword = (u) => {
    setFlash(`Password reset link sent to ${u.email} (mock — email sending is Phase 2).`)
  }

  const remove = (u) => {
    onChange(users.filter((x) => x.id !== u.id))
    setConfirmDelete(null)
    setFlash(`${u.name} deleted. (Demo only — real deletions should archive, not erase, for the audit trail.)`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">Everyone with a login. Accounts link to the HR employee record where one exists.</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-medium px-3 py-1.5 rounded-md hover:opacity-90"
        >
          <UserPlus size={14} /> Add user
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Active</div>
          <div className="text-lg font-bold text-emerald-700 tabular-nums">{active}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Invited (awaiting setup)</div>
          <div className="text-lg font-bold text-blue-700 tabular-nums">{invited}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Disabled</div>
          <div className="text-lg font-bold text-gray-500 tabular-nums">{disabled}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white w-56"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
          <option value="all">All roles</option>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="disabled">Disabled</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{shown.length} of {users.length}</span>
      </div>

      {flash && (
        <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700 flex items-center justify-between gap-3">
          <span>{flash}</span>
          <button onClick={() => setFlash(null)} className="text-blue-400 hover:text-blue-600 shrink-0">✕</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Last login</th>
                <th className="px-4 py-2.5 font-medium text-right">Logins (30d)</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shown.map((u) => {
                const meta = userStatusMeta(u.status)
                return (
                  <tr key={u.id} className={`hover:bg-gray-50 ${u.status === 'disabled' ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 align-top">
                      <div className="text-gray-800 font-medium">{u.name}</div>
                      <div className="text-[11px] text-gray-400">{u.email}</div>
                      {u.note && <div className="text-[11px] text-amber-600 mt-0.5">{u.note}</div>}
                      {u.disabledReason && <div className="text-[11px] text-gray-400 mt-0.5">{u.disabledReason}</div>}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700 whitespace-nowrap">{roleLabel(u.role)}</td>
                    <td className="px-4 py-3 align-top">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.chip}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-600 tabular-nums whitespace-nowrap">{u.lastLogin || '—'}</td>
                    <td className="px-4 py-3 align-top text-right tabular-nums text-gray-700">{u.logins30d}</td>
                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => setEditing(u)} title="Edit" className="text-gray-400 hover:text-brand"><Pencil size={14} /></button>
                        <button onClick={() => resetPassword(u)} title="Send password reset" className="text-gray-400 hover:text-brand"><KeyRound size={14} /></button>
                        <button
                          onClick={() => toggleDisabled(u)}
                          title={u.status === 'disabled' ? 'Re-enable' : 'Disable sign-in'}
                          className="text-gray-400 hover:text-amber-600"
                        >
                          {u.status === 'disabled' ? <RotateCcw size={14} /> : <Ban size={14} />}
                        </button>
                        <button onClick={() => setConfirmDelete(u)} title="Delete" className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <Users size={20} className="mx-auto mb-2 opacity-40" />
                    No users match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Demo state only — there is no real authentication yet, so these accounts don&apos;t gate the login page.
        Phase 2 wires this to real auth (invitation email → set password → mandatory onboarding, per the 3 Jul decision).
      </p>

      {editing && (
        <UserEditModal
          user={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            if (editing === 'new') {
              const created = {
                ...data,
                id: Math.max(0, ...users.map((u) => u.id)) + 1,
                status: 'invited',
                employeeId: null,
                createdDate: new Date().toISOString().slice(0, 10),
                lastLogin: null,
                logins30d: 0,
                note: 'Invitation email sent — awaiting password setup (mock)',
              }
              onChange([...users, created])
              setFlash(`${created.name} invited as ${roleLabel(created.role)} (mock — email sending is Phase 2).`)
            } else {
              update({ ...editing, ...data })
              setFlash(`${data.name} updated.`)
            }
            setEditing(null)
          }}
        />
      )}

      {confirmDelete && (
        <Modal title="Delete user?" onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Delete <span className="font-medium text-gray-900">{confirmDelete.name}</span> ({confirmDelete.email})?
              They will lose access immediately. If they&apos;re leaving the company, consider <span className="font-medium">disabling</span> instead — it keeps the account history.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => remove(confirmDelete)} className="text-sm px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">Delete user</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function UserEditModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState(user?.role || 'sales')
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email)

  return (
    <Modal title={user ? 'Edit user' : 'Add user'} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2" placeholder="e.g. Reem Al Falasi" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2" placeholder="name@alsuweidi.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white">
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">The role decides module access — see Roles &amp; permissions.</p>
        </div>
        {!user && (
          <p className="text-[11px] text-gray-400">
            Saving sends an invitation email with a set-password link (mocked — real email is Phase 2).
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            disabled={!valid}
            onClick={() => onSave({ name: name.trim(), email: email.trim(), role })}
            className="text-sm px-3 py-1.5 rounded-md bg-brand text-white disabled:opacity-40"
          >
            {user ? 'Save changes' : 'Send invite'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
