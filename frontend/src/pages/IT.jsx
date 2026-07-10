import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ClipboardList, Inbox, Laptop, KeyRound, Timer, PackageCheck, Wrench, ShieldCheck, Activity } from 'lucide-react'
import Navbar from '../components/Navbar'
import SidebarNav from '../components/SidebarNav'
import ItRequestsView from '../components/it/ItRequestsView'
import AssetRegistry from '../components/it/AssetRegistry'
import LicensesView from '../components/it/LicensesView'
import ItSlaView from '../components/it/ItSlaView'
import InstalledSoftwareView from '../components/it/InstalledSoftwareView'
import MaintenanceView from '../components/it/MaintenanceView'
import AccessRequestsView from '../components/it/AccessRequestsView'
import SystemStatusBoard from '../components/it/SystemStatusBoard'
import {
  IT_ASSETS, SOFTWARE_LICENSES, IT_REQUESTS, SLA_TARGETS,
  INSTALLED_SOFTWARE, MAINTENANCE_ITEMS, ACCESS_REQUESTS,
} from '../data/itData'
import { EMPLOYEES } from '../data/hrData'
import { IT_VIEW_ROLES } from '../data/dashboardData'
import { parseLocalDate, todayLocal } from '../utils/date'
import { nextId } from '../utils/id'

// IT & Assets — every employee can raise hardware/software requests; the
// workspace (requests queue, asset registry, license radar) is owned by the IT
// role, with admin + management retaining access (see IT_VIEW_ROLES). Links
// both ways with HR: new joiners need kit, and offboarding's equipment-return
// step checks the registry.

export default function IT({ user, onLogout }) {
  const canManage = IT_VIEW_ROLES.includes(user?.role)
  const location = useLocation()
  const [view, setView] = useState(location.state?.view || (canManage ? 'queue' : 'mine'))
  const [requests, setRequests] = useState(IT_REQUESTS)
  const [assets, setAssets] = useState(IT_ASSETS)
  const [licenses, setLicenses] = useState(SOFTWARE_LICENSES)
  const [installs, setInstalls] = useState(INSTALLED_SOFTWARE)
  const [maintenance, setMaintenance] = useState(MAINTENANCE_ITEMS)
  const [accessRequests, setAccessRequests] = useState(ACCESS_REQUESTS)

  useEffect(() => {
    if (location.state?.view) setView(location.state.view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const licensesDue = licenses.filter(
    (l) => (parseLocalDate(l.renewalDate) - todayLocal()) / (1000 * 60 * 60 * 24) <= 60
  ).length
  const overSla = requests.filter((r) => {
    if (r.status !== 'pending' && r.status !== 'approved') return false
    const age = Math.round((todayLocal() - parseLocalDate(r.requestedDate)) / (1000 * 60 * 60 * 24))
    return age > (SLA_TARGETS[r.type] ?? 3)
  }).length
  const maintOverdue = maintenance.filter((m) => parseLocalDate(m.nextDue) < todayLocal()).length
  const accessPending = accessRequests.filter((r) => r.status === 'pending').length

  const NAV_MAIN = [
    { key: 'mine', label: 'My requests', icon: ClipboardList },
  ]
  const NAV_WORKSPACE = canManage ? [
    { key: 'queue', label: 'Request queue', icon: Inbox, badge: pendingCount },
    { key: 'sla', label: 'SLA timers', icon: Timer, badge: overSla },
    { key: 'assets', label: 'Assets', icon: Laptop },
    { key: 'licenses', label: 'Licenses', icon: KeyRound, badge: licensesDue },
    { key: 'software', label: 'Installed software', icon: PackageCheck },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench, badge: maintOverdue },
    { key: 'access', label: 'Access requests', icon: ShieldCheck, badge: accessPending },
    { key: 'status', label: 'System status', icon: Activity },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="IT & Assets" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <SidebarNav groups={[{ items: NAV_MAIN }, { label: 'IT Workspace', items: NAV_WORKSPACE }]} active={view} onSelect={setView} />

        <main className="flex-1 min-w-0 w-full">
          {view === 'mine' && (
            <ItRequestsView
              requests={requests}
              user={user}
              mode="mine"
              onSubmit={(r) => setRequests([...requests, { ...r, id: nextId(requests) }])}
            />
          )}

          {view === 'queue' && canManage && (
            <ItRequestsView
              requests={requests}
              user={user}
              mode="queue"
              onAction={(r) => setRequests(requests.map((x) => (x.id === r.id ? r : x)))}
            />
          )}

          {view === 'assets' && canManage && (
            <AssetRegistry
              assets={assets}
              employees={EMPLOYEES}
              onAdd={(a) => setAssets([...assets, { ...a, id: nextId(assets) }])}
              onUpdate={(a) => setAssets(assets.map((x) => (x.id === a.id ? a : x)))}
            />
          )}

          {view === 'licenses' && canManage && (
            <LicensesView
              licenses={licenses}
              onAdd={(l) => setLicenses([...licenses, { ...l, id: nextId(licenses) }])}
            />
          )}

          {view === 'sla' && canManage && <ItSlaView requests={requests} />}

          {view === 'software' && canManage && (
            <InstalledSoftwareView installs={installs} onChange={setInstalls} assets={assets} licenses={licenses} />
          )}

          {view === 'maintenance' && canManage && <MaintenanceView items={maintenance} onChange={setMaintenance} />}

          {view === 'access' && canManage && (
            <AccessRequestsView requests={accessRequests} onChange={setAccessRequests} user={user} />
          )}

          {view === 'status' && canManage && <SystemStatusBoard />}
        </main>
      </div>
    </div>
  )
}
