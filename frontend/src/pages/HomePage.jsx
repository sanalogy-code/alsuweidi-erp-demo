import { useNavigate } from 'react-router-dom'
import { Search, GitCommit, CalendarDays, AlertTriangle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { KpiPanel } from '../components/HomeWidgets'
import { NEWS, MODULES } from '../data/dashboardData'
import { EMPLOYEES } from '../data/hrData'
import { myWorkFor, daysUntil } from '../data/pmData'
import { weekStartOf, toLocalISO } from '../data/timesheetData'
import { fmtAED, invoiceOutstanding } from '../data/financeData'
import { SOFTWARE_LICENSES } from '../data/itData'
import { CORRESPONDENCE } from '../data/officeData'
import { parseLocalDate, todayLocal, todayISO } from '../utils/date'

// Home page, "launcher" redesign (Sana, 11 Jul 2026): search-first, big module
// tiles that each carry a LIVE one-line status, one attention line that only
// appears when something actually needs you, and news as media cards. The old
// auto-rotating carousel, static 38.5h card, mock team members and dead quick
// links are gone.

const buildDateLabel = __BUILD_DATE__
  ? new Date(__BUILD_DATE__).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })
  : 'unknown'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage({ user, onLogout, holidays = [], projects = [], pmRecords = {}, timesheets = [], invoices = [], deals = [], marketingTasks = [], systemFeedback = [] }) {
  const navigate = useNavigate()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // --- Personal load (drives the attention line + Projects/HR tile statuses) ---
  const work = myWorkFor(user?.username || '', projects, pmRecords)
  const overdueTasks = work.tasks.filter((t) => t.task.due && daysUntil(t.task.due) < 0).length
  const emp = EMPLOYEES.find((e) => e.name.toLowerCase() === (user?.username || '').toLowerCase())
  const thisWeek = toLocalISO(weekStartOf(new Date()))
  const ts = emp && timesheets.find((t) => t.employeeId === emp.id && t.weekStart === thisWeek)
  const timesheetDue = !!emp && (!ts || ts.status === 'draft')

  const attention = []
  if (overdueTasks) attention.push(`${overdueTasks} task${overdueTasks > 1 ? 's' : ''} overdue`)
  if (work.approvals.length) attention.push(`${work.approvals.length} approval${work.approvals.length > 1 ? 's' : ''} waiting on you`)
  if (work.deadlines.length) attention.push(`${work.deadlines.length} contract deadline${work.deadlines.length > 1 ? 's' : ''} ≤ 3 weeks`)
  if (timesheetDue) attention.push("this week's timesheet not submitted")

  // --- Live one-line status per module tile ---
  const openDeals = deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost').length
  const licensesDue = SOFTWARE_LICENSES.filter((l) => l.renewalDate && daysUntil(l.renewalDate) <= 60).length
  const marketingPending = marketingTasks.filter((t) => t.status === 'pending').length
  const receivables = invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + invoiceOutstanding(i), 0)
  const lettersOverdue = CORRESPONDENCE.filter((l) => l.dueBy && l.dueBy < todayISO() && l.status === 'action_required').length
  const feedbackNew = systemFeedback.filter((f) => f.status === 'new').length

  // { text, bad } per module key — falls back to the static description.
  const STATUS = {
    crm: openDeals ? { text: `${openDeals} open deals in the pipeline` } : null,
    projects: (work.tasks.length || work.approvals.length)
      ? { text: `${work.tasks.length} my tasks · ${work.approvals.length} approvals`, bad: overdueTasks > 0 }
      : null,
    hr: emp
      ? (timesheetDue ? { text: 'Timesheet due — fill this week', bad: true } : { text: `Timesheet ${ts?.status || 'submitted'} ✓` })
      : null,
    it: licensesDue ? { text: `${licensesDue} license renewal${licensesDue > 1 ? 's' : ''} ≤ 60 days`, bad: true } : null,
    marketing: marketingPending ? { text: `${marketingPending} inbox task${marketingPending > 1 ? 's' : ''} pending` } : null,
    finance: receivables ? { text: `${fmtAED(receivables, { compact: true })} receivables outstanding` } : null,
    office: lettersOverdue ? { text: `${lettersOverdue} letter repl${lettersOverdue > 1 ? 'ies' : 'y'} overdue`, bad: true } : null,
    admin: feedbackNew ? { text: `${feedbackNew} new system feedback` } : null,
  }

  const upcomingHolidays = holidays
    .filter((h) => h.status === 'approved' && parseLocalDate(h.endDate || h.date) >= todayLocal())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
  const fmtHoliday = (h) => {
    const opts = { day: 'numeric', month: 'short' }
    const start = parseLocalDate(h.date).toLocaleDateString('en-GB', opts)
    return h.endDate ? `${start} – ${parseLocalDate(h.endDate).toLocaleDateString('en-GB', opts)}` : start
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Greeting + search — the front door */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{greeting()}, {user?.username}</h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
            className="mt-5 w-full max-w-xl mx-auto flex items-center gap-3 bg-white border border-gray-300 rounded-full px-5 py-3 text-sm text-gray-400 shadow-sm hover:shadow-md hover:border-brand/40 transition text-left"
          >
            <Search size={16} className="text-gray-400 shrink-0" />
            <span className="flex-1 truncate">Search people, projects, companies, screens…</span>
            <kbd className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">Ctrl K</kbd>
          </button>

          {/* One attention line — only rendered when something needs you */}
          {attention.length > 0 && (
            <button
              onClick={() => navigate(timesheetDue && attention.length === 1 ? '/hr' : '/projects')}
              className="mt-4 w-full max-w-xl mx-auto flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5 hover:bg-amber-100 transition text-left"
            >
              <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
              <span className="flex-1 min-w-0 leading-snug">
                {attention.join(' · ')}{' '}
                <span className="font-semibold underline underline-offset-2 whitespace-nowrap">{timesheetDue && attention.length === 1 ? 'Fill timesheet →' : 'Go to My Work →'}</span>
              </span>
            </button>
          )}
        </div>

        {/* Module launcher — big tiles with live status lines */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {MODULES.filter((m) => !m.roles || m.roles.includes(user?.role)).map((m) => {
            const st = STATUS[m.key]
            return (
              <button
                key={m.key}
                onClick={() => navigate(m.path)}
                className="group bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-brand hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="text-3xl mb-2">{m.icon}</div>
                <div className="text-sm font-bold text-gray-800 group-hover:text-brand transition">{m.label}</div>
                <div className={`text-[11px] mt-1 leading-snug ${st ? (st.bad ? 'text-red-600 font-semibold' : 'text-gray-600 font-medium') : 'text-gray-400'}`}>
                  {st ? st.text : m.description}
                </div>
              </button>
            )
          })}
        </div>

        {/* Company KPIs — management only, unchanged panel */}
        {(user?.role === 'management' || user?.role === 'admin') && (
          <KpiPanel projects={projects} pmRecords={pmRecords} timesheets={timesheets} invoices={invoices} />
        )}

        {/* Company news (3 media cards) + upcoming holidays card in one row */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Company news</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NEWS.map((n) => (
              <div key={n.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="relative h-28 flex items-center justify-center overflow-hidden" style={{ background: n.media }}>
                  {/* Stock placeholder photo — Phase 2 storage swaps in real company shots; the gradient+emoji behind is the offline fallback */}
                  {n.image && (
                    <img src={n.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  )}
                  <span className="relative text-4xl drop-shadow-sm">{!n.image && n.emoji}</span>
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-white/90 text-gray-700 rounded-full px-2 py-0.5">{n.kicker}</span>
                </div>
                <div className="p-4">
                  <div className="text-sm font-semibold text-gray-800 leading-snug">{n.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{n.body}</div>
                  <div className="text-[11px] text-gray-400 mt-2">{n.by} · {n.when}</div>
                </div>
              </div>
            ))}

            {/* Upcoming holidays — promoted from the footer to a proper card in the news row */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <CalendarDays size={15} className="text-brand" />
                <span className="text-sm font-semibold text-gray-800">Upcoming holidays</span>
              </div>
              <div className="px-4 pb-4 space-y-2.5">
                {upcomingHolidays.map((h) => (
                  <div key={h.id} className="flex items-center gap-3">
                    <div className="w-11 shrink-0 text-center bg-brand-light rounded-lg py-1">
                      <div className="text-sm font-bold text-brand leading-tight">{parseLocalDate(h.date).getDate()}</div>
                      <div className="text-[9px] font-semibold uppercase text-brand/70">{parseLocalDate(h.date).toLocaleDateString('en-GB', { month: 'short' })}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{h.name}</div>
                      <div className="text-[10px] text-gray-400">{fmtHoliday(h)}</div>
                    </div>
                  </div>
                ))}
                {upcomingHolidays.length === 0 && <div className="text-xs text-gray-400">No approved holidays coming up.</div>}
                <div className="text-[10px] text-gray-400 pt-1">Islamic dates confirmed on moon sighting.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Slim footer: build info (Sana's deploy check) */}
        <div className="flex items-center gap-1.5 border-t border-gray-200 pt-4 text-xs text-gray-400">
          <GitCommit size={13} className="shrink-0" />
          <span>Build {buildDateLabel}{__BUILD_MESSAGE__ ? ` — ${__BUILD_MESSAGE__}` : ''}</span>
        </div>
      </div>
    </div>
  )
}
