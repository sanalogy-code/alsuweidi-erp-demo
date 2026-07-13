import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Inbox, CalendarDays, FolderKanban, Palette, LineChart } from 'lucide-react'
import Navbar from '../components/Navbar'
import SidebarNav from '../components/SidebarNav'
import SubViewTabs from '../components/SubViewTabs'
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
import { nextId } from '../utils/id'

// Marketing module — content calendar, portfolio, CVs, and analytics
// are for marketing + top management only. Branding materials are the exception:
// visible to every employee (that's the whole point of a brand library).
export default function Marketing({ user, onLogout, projects = [], onUpdateProject, deals = [], marketingTasks = [], onCompleteTask }) {
  const canManage = MARKETING_VIEW_ROLES.includes(user?.role)
  const location = useLocation()
  const [view, setView] = useState(location.state?.view || (canManage ? 'inbox' : 'branding'))
  const [contentItems, setContentItems] = useState(CONTENT_ITEMS)
  const [campaigns, setCampaigns] = useState(CAMPAIGNS)
  const [events, setEvents] = useState(MARKETING_EVENTS)
  const [awards, setAwards] = useState(AWARD_SUBMISSIONS)
  const [packUsage, setPackUsage] = useState(PACK_USAGE_LOG)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  useEffect(() => {
    if (location.state?.view) setView(location.state.view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const openTasks = marketingTasks.filter((t) => t.status === 'pending').length
  const missingDesc = projects.filter((p) => !p.marketingDescription && !p.confidential).length
  const pendingApprovals = contentItems.filter((c) => c.status === 'pending_approval').length

  const updateContentItem = (c) => setContentItems(contentItems.map((x) => (x.id === c.id ? c : x)))

  const NAV_MAIN = [
    { key: 'branding', label: 'Branding', icon: Palette },
  ]
  // Workspace grouped by intent (Batch 22 IA pattern: sidebar groups → sub-view
  // tabs, see SPEC §4). Old view keys unchanged so HelpHub deep-links still land.
  const WS_GROUPS = canManage ? [
    {
      key: 'g-inbox', label: 'Inbox', icon: Inbox, badge: openTasks,
      views: [{ key: 'inbox' }],
    },
    {
      key: 'g-content', label: 'Content', icon: CalendarDays, badge: pendingApprovals,
      views: [
        { key: 'calendar', label: 'Calendar' },
        { key: 'campaigns', label: 'Campaigns' },
        { key: 'approvals', label: 'Approvals', badge: pendingApprovals },
      ],
    },
    {
      key: 'g-showcase', label: 'Showcase', icon: FolderKanban, badge: missingDesc,
      views: [
        { key: 'portfolio', label: 'Portfolio', badge: missingDesc },
        { key: 'events', label: 'Events' },
        { key: 'awards', label: 'Awards' },
      ],
    },
    {
      key: 'g-tools', label: 'Tools & insights', icon: LineChart,
      views: [
        { key: 'cvs', label: 'CV search' },
        { key: 'analytics', label: 'Analytics' },
      ],
    },
  ] : []
  const activeWsGroup = WS_GROUPS.find((g) => g.views.some((v) => v.key === view))

  // When Marketing writes a description from the Portfolio view (not via the inbox),
  // any open description task for that project completes automatically.
  const completeDescriptionTask = (projectId) => {
    const task = marketingTasks.find((t) => t.type === 'marketing_description' && t.relatedId === projectId && t.status === 'pending')
    if (task) onCompleteTask(task.id, 'Description written from the Portfolio view.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="Marketing" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <SidebarNav
          groups={[
            { items: NAV_MAIN },
            { label: 'Marketing Workspace', items: WS_GROUPS.map(({ key, label, icon, badge }) => ({ key, label, icon, badge })) },
          ]}
          active={activeWsGroup ? activeWsGroup.key : view}
          onSelect={(key) => {
            const group = WS_GROUPS.find((g) => g.key === key)
            setView(group ? group.views[0].key : key)
          }}
        />

        <main className="flex-1 min-w-0 w-full">
          <SubViewTabs views={activeWsGroup?.views} active={view} onSelect={setView} />
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
              onAdd={(c) => setContentItems([...contentItems, { ...c, id: nextId(contentItems) }])}
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
