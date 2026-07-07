import { useNavigate } from 'react-router-dom'
import { ListTodo, ClipboardCheck, AlarmClock, Clock, Printer, TrendingUp, Banknote, HeartPulse, Users } from 'lucide-react'
import { EMPLOYEES } from '../data/hrData'
import { myWorkFor, daysUntil, spiOf } from '../data/pmData'
import { weekStartOf, toLocalISO } from '../data/timesheetData'
import { INVOICES, invoiceOutstanding, fmtAED } from '../data/financeData'
import { INITIAL_RFPS } from '../data/rfpData'

// Home widgets (the "every employee" + Management items from THE EVERYTHING
// LIST): My Week — one personal strip across all modules; Company KPIs — the
// single management screen composed from the pieces that already exist, with a
// board-pack print action.

export function MyWeekPanel({ user, projects = [], pmRecords = {}, timesheets = [] }) {
  const navigate = useNavigate()
  const work = myWorkFor(user?.username || '', projects, pmRecords)
  const emp = EMPLOYEES.find((e) => e.name.toLowerCase() === (user?.username || '').toLowerCase())
  const thisWeek = toLocalISO(weekStartOf(new Date()))
  const ts = emp && timesheets.find((t) => t.employeeId === emp.id && t.weekStart === thisWeek)
  const tsHours = ts ? ts.entries.reduce((s, e) => s + e.hours.reduce((a, h) => a + (Number(h) || 0), 0), 0) : 0
  const overdue = work.tasks.filter((t) => t.task.due && daysUntil(t.task.due) < 0).length

  const cells = [
    { icon: ListTodo, label: 'Open tasks', value: work.tasks.length, sub: overdue ? `${overdue} overdue` : 'none overdue', bad: overdue > 0, to: '/projects' },
    { icon: ClipboardCheck, label: 'Waiting on me', value: work.approvals.length, sub: 'inspections & QA', to: '/projects' },
    { icon: AlarmClock, label: 'Deadlines ≤ 3 wks', value: work.deadlines.length, sub: 'claims & reports', bad: work.deadlines.some((d) => daysUntil(d.due) <= 3), to: '/projects' },
    { icon: Clock, label: 'Timesheet this week', value: `${tsHours}h`, sub: ts ? ts.status : emp ? 'not started' : 'no employee record', bad: emp && (!ts || ts.status === 'draft'), to: '/hr' },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-1 h-4 bg-brand rounded" /> My week
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cells.map((c) => (
          <button key={c.label} onClick={() => navigate(c.to)} className="text-left bg-gray-50 hover:bg-gray-100 transition rounded-lg p-3">
            <c.icon size={15} className={c.bad ? 'text-red-500' : 'text-brand'} />
            <div className={`text-xl font-bold mt-1 ${c.bad ? 'text-red-600' : 'text-gray-800'}`}>{c.value}</div>
            <div className="text-[11px] text-gray-500">{c.label}</div>
            <div className={`text-[10px] ${c.bad ? 'text-red-500 font-medium' : 'text-gray-400'}`}>{c.sub}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function KpiPanel({ projects = [], pmRecords = {}, timesheets = [] }) {
  const navigate = useNavigate()

  // Utilization: logged hours vs 40h capacity across employees with timesheets, last 4 weeks present in state
  const weeks = [...new Set(timesheets.map((t) => t.weekStart))].sort().slice(-4)
  const logged = timesheets.filter((t) => weeks.includes(t.weekStart))
    .reduce((s, t) => s + t.entries.reduce((a, e) => a + e.hours.reduce((x, h) => x + (Number(h) || 0), 0), 0), 0)
  const people = [...new Set(timesheets.filter((t) => weeks.includes(t.weekStart)).map((t) => t.employeeId))].length
  const utilization = people ? Math.round((logged / (people * weeks.length * 40)) * 100) : 0

  // Win rate from RFPs with an outcome
  const decided = INITIAL_RFPS.filter((r) => r.status === 'awarded' || r.status === 'lost')
  const winRate = decided.length ? Math.round((decided.filter((r) => r.status === 'awarded').length / decided.length) * 100) : 0

  // Receivables from the finance seed register (live finance state is module-local — Phase 2 lifts it)
  const receivables = INVOICES.filter((i) => i.status !== 'draft').reduce((s, i) => s + invoiceOutstanding(i), 0)

  // Project health: red if SPI < 0.85 or 3+ late tasks (mirrors the management dashboard rule)
  const active = projects.filter((p) => p.status !== 'Completed')
  const health = { green: 0, amber: 0, red: 0 }
  active.forEach((p) => {
    const pm = pmRecords[p.id]
    if (!pm) { health.green += 1; return }
    const late = pm.phases.flatMap((ph) => ph.tasks || []).filter((t) => t.status !== 'done' && t.due && daysUntil(t.due) < 0).length
    const spis = pm.phases.map((ph) => spiOf(ph.progressCurve)).filter((s) => s != null && !Number.isNaN(s))
    const spi = spis.length ? Math.min(...spis) : null
    if ((spi != null && spi < 0.85) || late >= 3) health.red += 1
    else if ((spi != null && spi < 0.95) || late > 0) health.amber += 1
    else health.green += 1
  })

  const kpis = [
    { icon: Users, label: 'Utilization (4 wks)', value: `${utilization}%`, sub: `${people} people logging`, to: '/hr' },
    { icon: TrendingUp, label: 'Bid win rate', value: `${winRate}%`, sub: `${decided.length} decided RFPs`, to: '/crm' },
    { icon: Banknote, label: 'Receivables outstanding', value: fmtAED(receivables, { compact: true }), sub: 'from the invoice register', to: '/finance' },
    { icon: HeartPulse, label: 'Project health', value: `${health.red} red · ${health.amber} amber`, sub: `${active.length} active projects`, bad: health.red > 0, to: '/projects' },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6 print:shadow-none print:border-0" id="kpi-board-pack">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1 h-4 bg-brand rounded" /> Company KPIs
          <span className="text-[10px] font-normal text-gray-400">management view</span>
        </h3>
        <button onClick={() => window.print()} className="flex items-center gap-1 text-xs text-brand font-medium hover:underline print:hidden" title="Print this month's board pack">
          <Printer size={13} /> Board pack (print)
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <button key={k.label} onClick={() => navigate(k.to)} className="text-left bg-gray-50 hover:bg-gray-100 transition rounded-lg p-3">
            <k.icon size={15} className={k.bad ? 'text-red-500' : 'text-brand'} />
            <div className={`text-lg font-bold mt-1 ${k.bad ? 'text-red-600' : 'text-gray-800'}`}>{k.value}</div>
            <div className="text-[11px] text-gray-500">{k.label}</div>
            <div className="text-[10px] text-gray-400">{k.sub}</div>
          </button>
        ))}
      </div>
      <div className="text-[10px] text-gray-400 mt-2">
        Composed from timesheets, RFPs, the invoice register and project SPI/late-task health. Receivables read the seed register until finance state is lifted (Phase 2). Board pack = your browser's print of this page.
      </div>
    </div>
  )
}
