import { useState } from 'react'
import { ClipboardList, Inbox, Laptop, KeyRound } from 'lucide-react'
import Navbar from '../components/Navbar'
import ItRequestsView from '../components/it/ItRequestsView'
import AssetRegistry from '../components/it/AssetRegistry'
import LicensesView from '../components/it/LicensesView'
import { IT_ASSETS, SOFTWARE_LICENSES, IT_REQUESTS } from '../data/itData'
import { EMPLOYEES } from '../data/hrData'
import { IT_VIEW_ROLES } from '../data/dashboardData'
import { parseLocalDate, todayLocal } from '../utils/date'

// IT & Assets — every employee can raise hardware/software requests; the
// workspace (requests queue, asset registry, license radar) is owned by the IT
// role, with admin + management retaining access (see IT_VIEW_ROLES). Links
// both ways with HR: new joiners need kit, and offboarding's equipment-return
// step checks the registry.

export default function IT({ user, onLogout }) {
  const canManage = IT_VIEW_ROLES.includes(user?.role)
  const [view, setView] = useState(canManage ? 'queue' : 'mine')
  const [requests, setRequests] = useState(IT_REQUESTS)
  const [assets, setAssets] = useState(IT_ASSETS)
  const [licenses, setLicenses] = useState(SOFTWARE_LICENSES)

  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const licensesDue = licenses.filter(
    (l) => (parseLocalDate(l.renewalDate) - todayLocal()) / (1000 * 60 * 60 * 24) <= 60
  ).length

  const NAV_MAIN = [
    { key: 'mine', label: 'My requests', icon: ClipboardList },
  ]
  const NAV_WORKSPACE = canManage ? [
    { key: 'queue', label: 'Request queue', icon: Inbox, badge: pendingCount },
    { key: 'assets', label: 'Assets', icon: Laptop },
    { key: 'licenses', label: 'Licenses', icon: KeyRound, badge: licensesDue },
  ] : []

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
      <Navbar user={user} onLogout={onLogout} title="IT & Assets" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <aside className="w-full sm:w-44 shrink-0 sm:sticky sm:top-6">
          <div className="flex sm:flex-col flex-wrap gap-1">
            {NAV_MAIN.map(navButton)}
          </div>
          {NAV_WORKSPACE.length > 0 && (
            <>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1 hidden sm:block">IT Workspace</div>
              <div className="flex sm:flex-col flex-wrap gap-1 mt-1 sm:mt-0">
                {NAV_WORKSPACE.map(navButton)}
              </div>
            </>
          )}
        </aside>

        <main className="flex-1 min-w-0 w-full">
          {view === 'mine' && (
            <ItRequestsView
              requests={requests}
              user={user}
              mode="mine"
              onSubmit={(r) => setRequests([...requests, { ...r, id: Math.max(...requests.map((x) => x.id), 0) + 1 }])}
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
              onAdd={(a) => setAssets([...assets, { ...a, id: Math.max(...assets.map((x) => x.id), 0) + 1 }])}
              onUpdate={(a) => setAssets(assets.map((x) => (x.id === a.id ? a : x)))}
            />
          )}

          {view === 'licenses' && canManage && (
            <LicensesView
              licenses={licenses}
              onAdd={(l) => setLicenses([...licenses, { ...l, id: Math.max(...licenses.map((x) => x.id), 0) + 1 }])}
            />
          )}
        </main>
      </div>
    </div>
  )
}
