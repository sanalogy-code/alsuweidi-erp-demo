import { createContext, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X } from 'lucide-react'
import { EMPLOYEES } from '../data/hrData'
import { myWorkFor, daysUntil } from '../data/pmData'
import { weekStartOf, toLocalISO } from '../data/timesheetData'

// Notifications center (Phase 1 = in-app inbox UI only). The feed is COMPOSED
// live from the same lifted App state the modules already render — approvals
// waiting on you, deadlines, rejected timesheets, queues your role owns. Nothing
// is pushed or stored; real delivery (email/mobile, per-event persistence) is
// the Phase 2 notifications backend. Read-state persists per user in
// localStorage so the badge doesn't nag across a demo session.

const NotificationsContext = createContext(null)
export const useNotifications = () => useContext(NotificationsContext)

const MODULE_COLORS = {
  Projects: 'bg-indigo-100 text-indigo-700',
  HR: 'bg-emerald-100 text-emerald-700',
  Timesheet: 'bg-amber-100 text-amber-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Admin: 'bg-gray-200 text-gray-700',
}

// Compose the feed for the logged-in user from lifted state. Every item gets a
// STABLE id (source + ref) so read-state survives recomputation.
export const notificationsFor = (user, { projects, pmRecords, timesheets, marketingTasks, staffingRequests, systemFeedback }) => {
  const items = []
  const name = user?.username || ''
  const emp = EMPLOYEES.find((e) => e.name.toLowerCase() === name.toLowerCase())

  // Projects: my tasks due/overdue soon, approvals waiting on me, contract deadlines
  const work = myWorkFor(name, projects, pmRecords)
  work.tasks.forEach(({ project, task }) => {
    if (!task.due) return
    const d = daysUntil(task.due)
    if (d > 3) return
    items.push({
      id: `task:${project.id}:${task.id ?? task.title}`, module: 'Projects', date: task.due, to: `/projects/${project.id}`,
      text: d < 0 ? `Task overdue — ${task.title}` : `Task due ${d === 0 ? 'today' : `in ${d}d`} — ${task.title}`,
      sub: project.name, urgent: d < 0,
    })
  })
  work.approvals.forEach(({ project, kind, ref, title }) => {
    items.push({
      id: `appr:${project.id}:${ref}`, module: 'Projects', date: null, to: `/projects/${project.id}`,
      text: `${kind} waiting on you — ${ref}`, sub: `${title} · ${project.name}`,
    })
  })
  work.deadlines.forEach(({ project, kind, ref, title, due }) => {
    const d = daysUntil(due)
    items.push({
      id: `dl:${project.id}:${kind}:${ref}`, module: 'Projects', date: due, to: `/projects/${project.id}`,
      text: `${title} — due ${d < 0 ? `${-d}d ago` : d === 0 ? 'today' : `in ${d}d`}`, sub: `${ref} · ${project.name}`, urgent: d <= 3,
    })
  })

  if (emp) {
    // My own timesheet: last week unsubmitted, or rejected
    const lastWeek = toLocalISO(weekStartOf(new Date(Date.now() - 7 * 864e5)))
    const lastTs = timesheets.find((t) => t.employeeId === emp.id && t.weekStart === lastWeek)
    if (!lastTs || lastTs.status === 'draft') {
      items.push({ id: `ts:due:${lastWeek}`, module: 'Timesheet', date: null, to: '/hr', text: 'Last week’s timesheet is not submitted', sub: 'Payroll needs it — fill it in under My timesheet', urgent: true })
    }
    timesheets.filter((t) => t.employeeId === emp.id && t.status === 'rejected').forEach((t) => {
      items.push({ id: `ts:rej:${t.weekStart}`, module: 'Timesheet', date: t.weekStart, to: '/hr', text: `Timesheet rejected — week of ${t.weekStart}`, sub: t.rejectReason || 'See My timesheet for the reason', urgent: true })
    })
    // Team timesheets awaiting my approval (line manager)
    const reports = EMPLOYEES.filter((e) => e.managerId === emp.id).map((e) => e.id)
    timesheets.filter((t) => reports.includes(t.employeeId) && t.status === 'submitted').forEach((t) => {
      items.push({ id: `ts:appr:${t.employeeId}:${t.weekStart}`, module: 'Timesheet', date: t.submittedDate, to: '/hr', text: `Timesheet awaiting your approval — ${t.employeeName}`, sub: `Week of ${t.weekStart}` })
    })
  }

  // Role-owned queues
  if (user?.role === 'hr') {
    (staffingRequests || []).filter((r) => r.status === 'requested').forEach((r) => {
      items.push({ id: `staff:${r.id}`, module: 'HR', date: r.date, to: '/hr', text: `Pipeline staffing request — ${r.role} × ${r.count}`, sub: `${r.rfpName || 'RFP'} · needed by ${r.neededBy || 'TBC'}` })
    })
  }
  if (user?.role === 'marketing') {
    (marketingTasks || []).filter((t) => t.status === 'pending').forEach((t) => {
      items.push({ id: `mkt:${t.id}`, module: 'Marketing', date: t.createdDate, to: '/marketing', text: `Marketing task — ${(t.type || '').replaceAll('_', ' ')}`, sub: t.relatedName })
    })
  }
  if (user?.role === 'admin' || user?.role === 'management') {
    (systemFeedback || []).filter((f) => f.status === 'new').forEach((f) => {
      items.push({ id: `fb:${f.id}`, module: 'Admin', date: f.date, to: '/admin', text: `System feedback — ${f.type === 'bug' ? 'something broken' : f.type === 'feature' ? 'feature request' : 'question'}`, sub: `${f.module || 'General'} · ${f.by || 'anonymous'}` })
    })
  }

  // Urgent first, then dated items newest-deadline-first, undated last in source order
  return items.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || (a.date && b.date ? a.date.localeCompare(b.date) : a.date ? -1 : b.date ? 1 : 0))
}

const readKey = (user) => `erp_notif_read_${user?.username || 'anon'}`

export function NotificationsProvider({ user, sources, children }) {
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(readKey(user)) || '[]')) } catch { return new Set() }
  })
  const items = useMemo(() => notificationsFor(user, sources), [user, sources])
  const persist = (next) => {
    setReadIds(next)
    localStorage.setItem(readKey(user), JSON.stringify([...next]))
  }
  const markRead = (id) => persist(new Set([...readIds, id]))
  const markAllRead = () => persist(new Set([...readIds, ...items.map((i) => i.id)]))
  const unread = items.filter((i) => !readIds.has(i.id)).length
  const value = useMemo(() => ({ items, readIds, unread, markRead, markAllRead }), [items, readIds]) // eslint-disable-line react-hooks/exhaustive-deps
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export default function NotificationsBell() {
  const ctx = useNotifications()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()
  if (!ctx) return null
  const { items, readIds, unread, markRead, markAllRead } = ctx
  const modules = [...new Set(items.map((i) => i.module))]
  const shown = items.filter((i) => filter === 'all' || i.module === filter)

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative text-gray-400 hover:text-brand transition p-2 rounded-lg hover:bg-brand-light" title="Notifications">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-[380px] max-w-[90vw] bg-white rounded-lg border border-gray-200 shadow-lg z-40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-800">Notifications</div>
              <div className="flex items-center gap-2">
                {unread > 0 && <button onClick={markAllRead} className="text-[11px] text-brand hover:underline">Mark all read</button>}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
            </div>
            {modules.length > 1 && (
              <div className="flex gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto">
                {['all', ...modules].map((m) => (
                  <button key={m} onClick={() => setFilter(m)} className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${filter === m ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {m === 'all' ? 'All' : m}
                  </button>
                ))}
              </div>
            )}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
              {shown.length === 0 && <div className="px-4 py-8 text-center text-xs text-gray-400">Nothing needs your attention. 🎉</div>}
              {shown.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { markRead(n.id); setOpen(false); navigate(n.to) }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition flex gap-2.5 ${readIds.has(n.id) ? 'opacity-55' : ''}`}
                >
                  <span className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${readIds.has(n.id) ? 'bg-gray-200' : n.urgent ? 'bg-red-500' : 'bg-brand'}`} />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-gray-800 truncate">{n.text}</span>
                    <span className="block text-[11px] text-gray-500 truncate">{n.sub}</span>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${MODULE_COLORS[n.module] || 'bg-gray-100 text-gray-600'}`}>{n.module}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400">
              Composed live from your queues and deadlines. Email/mobile delivery arrives with the Phase 2 backend.
            </div>
          </div>
        </>
      )}
    </div>
  )
}
