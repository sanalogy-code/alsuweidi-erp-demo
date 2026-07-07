import { useState } from 'react'
import { Inbox, CalendarDays, FolderKanban, Palette, LineChart, FileUser, Megaphone, BadgeCheck, Ticket, Trophy } from 'lucide-react'
import Navbar from '../components/Navbar'
import MarketingInbox from '../components/marketing/MarketingInbox'
import ContentCalendar from '../components/marketing/ContentCalendar'
import PortfolioView from '../components/marketing/PortfolioView'
import BrandAssetsView from '../components/marketing/BrandAssetsView'
import MarketingAnalytics from '../components/marketing/MarketingAnalytics'
import CampaignsView from '../components/marketing/CampaignsView'
import ContentApprovals from '../components/marketing/ContentApprovals'
import EventsView from '../components/marketing/EventsView'
import AwardsView from '../components/marketing/AwardsView'
import CvSearch from '../components/hr/CvSearch'
import EmployeeDetailModal from '../components/hr/EmployeeDetailModal'
import { CONTENT_ITEMS, CAMPAIGNS, MARKETING_EVENTS, AWARD_SUBMISSIONS, PACK_USAGE_LOG } from '../data/marketingData'
import { EMPLOYEES } from '../data/hrData'
import { MARKETING_VIEW_ROLES, HR_STAFF_ROLES, SENSITIVE_VIEW_ROLES } from '../data/dashboardData'

// Marketing module — content calendar, portfolio, CVs, and analytics
// are for marketing + top management only. Branding materials are the exception:
// visible to every employee (that's the whole point of a brand library).
export default function Marketing({ user, onLogout, projects = [], onUpdateProject, deals = [], marketingTasks = [], onCompleteTask }) {
  const canManage = MARKETING_VIEW_ROLES.includes(user?.role)
  const [view, setView] = useState(canManage ? 'inbox' : 'branding')
  const [contentItems, setContentItems] = useState(CONTENT_ITEMS)
  const [campaigns, setCampaigns] = useState(CAMPAIGNS)
  const [events, setEvents] = useState(MARKETING_EVENTS)
  const [awards, setAwards] = useState(AWARD_SUBMISSIONS)
  const [packUsage, setPackUsage] = useState(PACK_USAGE_LOG)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const openTasks = marketingTasks.filter((t) => t.status === 'pending').length
  const missingDesc = projects.filter((p) => !p.marketingDescription && !p.confidential).length
  const pendingApprovals = contentItems.filter((c) => c.status === 'pending_approval').length

  const updateContentItem = (c) => setContentItems(contentItems.map((x) => (x.id === c.id ? c : x)))

  const NAV_MAIN = [
    { key: 'branding', label: 'Branding', icon: Palette },
  ]
  const NAV_WORKSPACE = canManage ? [
    { key: 'inbox', label: 'Inbox', icon: Inbox, badge: openTasks },
    { key: 'calendar', label: 'Content calendar', icon: CalendarDays },
    { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { key: 'approvals', label: 'Approvals', icon: BadgeCheck, badge: pendingApprovals },
    { key: 'portfolio', label: 'Portfolio', icon: FolderKanban, badge: missingDesc },
    { key: 'events', label: 'Events', icon: Ticket },
    { key: 'awards', label: 'Awards', icon: Trophy },
    { key: 'cvs', label: 'CV search', icon: FileUser },
    { key: 'analytics', label: 'Analytics', icon: LineChart },
  ] : []

  // When Marketing writes a description from the Portfolio view (not via the inbox),
  // any open description task for that project completes automatically.
  const completeDescriptionTask = (projectId) => {
    const task = marketingTasks.find((t) => t.type === 'marketing_description' && t.relatedId === projectId && t.status === 'pending')
    if (task) onCompleteTask(task.id, 'Description written from the Portfolio view.')
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="Marketing" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <aside className="w-full sm:w-44 shrink-0 sm:sticky sm:top-6">
          <div className="flex sm:flex-col flex-wrap gap-1">
            {NAV_MAIN.map(navButton)}
          </div>
          {NAV_WORKSPACE.length > 0 && (
            <>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1 hidden sm:block">Marketing Workspace</div>
              <div className="flex sm:flex-col flex-wrap gap-1 mt-1 sm:mt-0">
                {NAV_WORKSPACE.map(navButton)}
              </div>
            </>
          )}
        </aside>

        <main className="flex-1 min-w-0 w-full">
          {view === 'branding' && <BrandAssetsView />}

          {view === 'inbox' && canManage && (
            <MarketingInbox
              tasks={marketingTasks}
              projects={projects}
              onCompleteTask={onCompleteTask}
              onUpdateProject={onUpdateProject}
            />
          )}

          {view === 'calendar' && canManage && (
            <ContentCalendar
              items={contentItems}
              projects={projects}
              user={user}
              onAdd={(c) => setContentItems([...contentItems, { ...c, id: Math.max(...contentItems.map((x) => x.id), 0) + 1 }])}
              onUpdate={(c) => setContentItems(contentItems.map((x) => (x.id === c.id ? c : x)))}
            />
          )}

          {view === 'campaigns' && canManage && (
            <CampaignsView
              campaigns={campaigns}
              onUpdate={setCampaigns}
              items={contentItems}
              onUpdateItem={updateContentItem}
            />
          )}

          {view === 'approvals' && canManage && (
            <ContentApprovals items={contentItems} user={user} onUpdateItem={updateContentItem} />
          )}

          {view === 'portfolio' && canManage && (
            <PortfolioView
              projects={projects}
              onUpdateProject={onUpdateProject}
              onCompleteDescriptionTask={completeDescriptionTask}
              packUsage={packUsage}
              onLogPackUsage={(entry) => setPackUsage([...packUsage, entry])}
            />
          )}

          {view === 'events' && canManage && (
            <EventsView events={events} onUpdate={setEvents} />
          )}

          {view === 'awards' && canManage && (
            <AwardsView awards={awards} onUpdate={setAwards} projects={projects} />
          )}

          {view === 'cvs' && canManage && (
            <CvSearch employees={EMPLOYEES} onViewEmployee={setSelectedEmployee} />
          )}

          {view === 'analytics' && canManage && (
            <MarketingAnalytics deals={deals} contentItems={contentItems} projects={projects} />
          )}
        </main>
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          employees={EMPLOYEES}
          user={user}
          isHrStaff={HR_STAFF_ROLES.includes(user?.role)}
          canViewSensitive={SENSITIVE_VIEW_ROLES.includes(user?.role)}
          onClose={() => setSelectedEmployee(null)}
          onViewEmployee={setSelectedEmployee}
          readOnly
        />
      )}
    </div>
  )
}
