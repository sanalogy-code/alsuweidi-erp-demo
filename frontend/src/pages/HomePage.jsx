import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight, GitCommit, CalendarDays } from 'lucide-react'
import Navbar from '../components/Navbar'
import { MyWeekPanel, KpiPanel } from '../components/HomeWidgets'
import {
  ANNOUNCEMENTS, COMPANY_UPDATES, RECENT_PROJECTS, TEAM_MEMBERS,
  QUICK_LINKS, QUICK_ACTIONS, MODULES,
} from '../data/dashboardData'
import { parseLocalDate, todayLocal } from '../utils/date'

const buildDateLabel = __BUILD_DATE__
  ? new Date(__BUILD_DATE__).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })
  : 'unknown'

const STATUS_COLOR = {
  'In Progress': 'bg-blue-100 text-blue-700',
  Planning: 'bg-gray-100 text-gray-700',
  Won: 'bg-green-100 text-green-700',
  Negotiation: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage({ user, onLogout, holidays = [], projects = [], pmRecords = {}, timesheets = [] }) {
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)

  // Only HR-approved holidays reach employees; pending ones (awaiting moon sighting) stay hidden
  const upcomingHolidays = holidays
    .filter((h) => h.status === 'approved' && parseLocalDate(h.endDate || h.date) >= todayLocal())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const fmtHoliday = (h) => {
    const opts = { day: 'numeric', month: 'short' }
    const start = parseLocalDate(h.date).toLocaleDateString('en-GB', opts)
    return h.endDate ? `${start} – ${parseLocalDate(h.endDate).toLocaleDateString('en-GB', opts)}` : start
  }

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % ANNOUNCEMENTS.length), 6000)
    return () => clearInterval(id)
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Hero carousel */}
        <div className="relative h-64 rounded-xl overflow-hidden shadow-lg mb-6 bg-gradient-to-br from-brand to-brand-dark">
          {ANNOUNCEMENTS.map((a, i) => (
            <div
              key={a.title}
              className={`absolute inset-0 flex flex-col justify-center px-10 text-white transition-opacity duration-500 ${i === slide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <h2 className="text-2xl font-bold mb-2">{a.title}</h2>
              <p className="text-sm text-white/90 max-w-md">{a.body}</p>
            </div>
          ))}
          <button
            onClick={() => setSlide((slide - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-lg p-2 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setSlide((slide + 1) % ANNOUNCEMENTS.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-lg p-2 transition"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {ANNOUNCEMENTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Welcome banner */}
        <div className="bg-white border-l-4 border-brand rounded-lg shadow-sm px-6 py-4 mb-6">
          <div className="text-xl font-semibold text-brand">{greeting()}, {user?.username}</div>
          <div className="text-sm text-gray-500">{today}</div>
        </div>

        {/* My week — the personal cross-module strip; KPIs for management */}
        <MyWeekPanel user={user} projects={projects} pmRecords={pmRecords} timesheets={timesheets} />
        {(user?.role === 'management' || user?.role === 'admin') && (
          <KpiPanel projects={projects} pmRecords={pmRecords} timesheets={timesheets} />
        )}

        {/* Deployment info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
          <GitCommit size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-gray-700">{buildDateLabel}</span>
            {__BUILD_MESSAGE__ && <div className="text-gray-600 mt-0.5">Latest: {__BUILD_MESSAGE__}</div>}
          </div>
        </div>

        {/* Quick actions — deep-link into the right module view */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((a) => {
              const target = {
                'Fill Timesheet': ['/hr', { view: 'mytimesheet' }],
                'Request Leave': ['/hr', { view: 'requests' }],
                'Request Certificate': ['/hr', { view: 'requests' }],
                'Hardware Request': ['/it', null],
              }[a.label]
              return (
                <button
                  key={a.label}
                  onClick={() => target && navigate(target[0], target[1] ? { state: target[1] } : undefined)}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-brand hover:shadow-md transition"
                >
                  <div className="text-2xl mb-2">{a.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{a.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Module launcher */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Modules</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MODULES.filter((m) => !m.roles || m.roles.includes(user?.role)).map((m) => (
              <button
                key={m.key}
                onClick={() => navigate(m.path)}
                className="relative bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-brand hover:shadow-md transition"
              >
                {m.status === 'soon' && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    SOON
                  </span>
                )}
                <div className="text-2xl mb-2">{m.icon}</div>
                <div className="text-sm font-semibold text-gray-800">{m.label}</div>
                <div className="text-xs text-gray-500 mt-1">{m.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand rounded" /> Company Updates
              </h3>
              <div className="divide-y divide-gray-100">
                {COMPANY_UPDATES.map((n) => (
                  <div key={n.title} className="py-3 first:pt-0 last:pb-0">
                    <div className="text-sm font-medium text-gray-800">{n.title}</div>
                    <div className="text-xs text-gray-500">Posted by {n.by} • <span className="text-brand font-medium">{n.when}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand rounded" /> Recent Projects
              </h3>
              <div className="divide-y divide-gray-100">
                {RECENT_PROJECTS.map((p) => (
                  <div key={p.name} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[p.status] || 'bg-gray-100 text-gray-700'}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand to-brand-dark rounded-lg shadow-md p-5 text-white">
              <div className="text-xs uppercase tracking-wide text-white/80 mb-1">Current week</div>
              <div className="text-3xl font-bold mb-3">38.5h</div>
              <button
                onClick={() => navigate('/hr', { state: { view: 'mytimesheet' } })}
                className="w-full bg-white text-brand font-semibold text-sm py-2 rounded-lg hover:scale-[1.02] transition"
              >
                Fill this week →
              </button>
            </div>

            {upcomingHolidays.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CalendarDays size={15} className="text-brand" /> Public Holidays
                </h3>
                <div className="space-y-2.5">
                  {upcomingHolidays.map((h) => (
                    <div key={h.id} className="flex justify-between items-baseline gap-2 text-sm">
                      <span className="text-gray-700 min-w-0 truncate">{h.name}</span>
                      <span className="text-xs font-semibold text-brand whitespace-nowrap">{fmtHoliday(h)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-gray-400 mt-3">Approved by HR — Islamic dates confirmed on moon sighting.</div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Team Members</h3>
              <div className="grid grid-cols-2 gap-3">
                {TEAM_MEMBERS.map((t) => (
                  <div key={t.name} className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
                      {t.initials}
                    </div>
                    <div className="text-xs font-semibold text-gray-800">{t.name}</div>
                    <div className="text-[11px] text-gray-500">{t.role}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Links</h3>
              <div className="space-y-2">
                {QUICK_LINKS.map((l) => (
                  <button key={l.label} className="flex items-center gap-1 text-sm text-brand font-medium hover:underline">
                    {l.label} <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
