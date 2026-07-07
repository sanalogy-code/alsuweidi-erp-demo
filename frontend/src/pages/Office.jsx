import { useState } from 'react'
import { Mails, BadgeCheck, Lock } from 'lucide-react'
import Navbar from '../components/Navbar'
import CorrespondenceView from '../components/office/CorrespondenceView'
import LicensesView, { OFFICE_LICENSES } from '../components/admin/LicensesView'
import { CORRESPONDENCE, OFFICE_VIEW_ROLES } from '../data/officeData'

// Office Administration — the ADMIN STAFF workspace (7 Jul, Sana: office admin
// and system admin are different jobs and don't share a module). Document
// control lives here: the correspondence register and the company
// registrations/licenses radar. The Admin Center stays pure system admin.

export default function Office({ user, onLogout }) {
  const canView = OFFICE_VIEW_ROLES.includes(user?.role)
  const [view, setView] = useState('correspondence')
  const [letters, setLetters] = useState(CORRESPONDENCE)
  const [licenses, setLicenses] = useState(OFFICE_LICENSES)

  const awaiting = letters.filter((l) => l.status === 'action_required').length

  const NAV = [
    { key: 'correspondence', label: 'Correspondence', icon: Mails, badge: awaiting },
    { key: 'licenses', label: 'Registrations & licenses', icon: BadgeCheck },
  ]

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} title="Office Administration" showBack />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
            <Lock size={22} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Restricted module</h2>
          <p className="text-sm text-gray-500 mt-2">
            Office Administration is for admin staff and management. Your role doesn&apos;t have access.
            (RBAC is client-side in this demo — Phase 2 enforces it server-side.)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="Office Administration" showBack />

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <aside className="w-full sm:w-48 shrink-0 sm:sticky sm:top-6">
          <div className="flex sm:flex-col flex-wrap gap-1">
            {NAV.map((item) => {
              const Icon = item.icon
              const active = view === item.key
              return (
                <button key={item.key} onClick={() => setView(item.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition text-left ${active ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}>
                  <Icon size={15} className="shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shrink-0">{item.badge}</span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="hidden sm:block mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
            Demo data. Meeting rooms, supplies, couriers, and vehicle bookings are on the backlog (EVERYTHING list → Admin staff).
          </div>
        </aside>

        <main className="flex-1 min-w-0 w-full">
          {view === 'correspondence' && <CorrespondenceView letters={letters} onChange={setLetters} />}
          {view === 'licenses' && <LicensesView items={licenses} onChange={setLicenses} />}
        </main>
      </div>
    </div>
  )
}
