import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Mails, BadgeCheck, Lock, CalendarClock } from 'lucide-react'
import Navbar from '../components/Navbar'
import SidebarNav from '../components/SidebarNav'
import SubViewTabs from '../components/SubViewTabs'
import CorrespondenceView from '../components/office/CorrespondenceView'
import RoomBookingsView from '../components/office/RoomBookingsView'
import SuppliesView from '../components/office/SuppliesView'
import CourierLogView from '../components/office/CourierLogView'
import VehiclesView from '../components/office/VehiclesView'
import DocNumberingView from '../components/office/DocNumberingView'
import LicensesView, { OFFICE_LICENSES } from '../components/admin/LicensesView'
import {
  CORRESPONDENCE, OFFICE_VIEW_ROLES, ROOM_BOOKINGS, SUPPLY_REQUESTS,
  COURIER_LOG, VEHICLE_BOOKINGS, SALIK_FINES,
} from '../data/officeData'

// Office Administration — the ADMIN STAFF workspace (7 Jul, Sana: office admin
// and system admin are different jobs and don't share a module). Document
// control lives here: the correspondence register and the company
// registrations/licenses radar. The Admin Center stays pure system admin.

export default function Office({ user, onLogout }) {
  const canView = OFFICE_VIEW_ROLES.includes(user?.role)
  const location = useLocation()
  const [view, setView] = useState(location.state?.view || 'correspondence')
  const [letters, setLetters] = useState(CORRESPONDENCE)
  const [licenses, setLicenses] = useState(OFFICE_LICENSES)
  const [roomBookings, setRoomBookings] = useState(ROOM_BOOKINGS)
  const [supplies, setSupplies] = useState(SUPPLY_REQUESTS)
  const [couriers, setCouriers] = useState(COURIER_LOG)
  const [vehicleBookings, setVehicleBookings] = useState(VEHICLE_BOOKINGS)
  const [salik, setSalik] = useState(SALIK_FINES)

  useEffect(() => {
    if (location.state?.view) setView(location.state.view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const awaiting = letters.filter((l) => l.status === 'action_required').length
  const suppliesOpen = supplies.filter((s) => s.status === 'requested').length

  // Grouped by intent (same IA pattern as Finance/HR: sidebar groups → sub-view
  // tabs). Old view keys unchanged so HelpHub deep-links still land.
  const GROUPS = [
    {
      key: 'g-docs', label: 'Documents & mail', icon: Mails, badge: awaiting,
      views: [
        { key: 'correspondence', label: 'Correspondence', badge: awaiting },
        { key: 'couriers', label: 'Courier & dispatch' },
        { key: 'numbering', label: 'Document numbering' },
      ],
    },
    {
      key: 'g-facilities', label: 'Facilities', icon: CalendarClock, badge: suppliesOpen,
      views: [
        { key: 'rooms', label: 'Meeting rooms' },
        { key: 'supplies', label: 'Office supplies', badge: suppliesOpen },
        { key: 'vehicles', label: 'Vehicles & Salik' },
      ],
    },
    {
      key: 'g-licenses', label: 'Registrations & licenses', icon: BadgeCheck,
      views: [{ key: 'licenses' }],
    },
  ]
  const activeGroup = GROUPS.find((g) => g.views.some((v) => v.key === view)) || GROUPS[0]

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
        <SidebarNav
          groups={[{ items: GROUPS.map(({ key, label, icon, badge }) => ({ key, label, icon, badge })) }]}
          active={activeGroup.key}
          onSelect={(key) => setView(GROUPS.find((g) => g.key === key).views[0].key)}
          width="sm:w-48"
          footer={(
            <div className="hidden sm:block mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-snug text-amber-700">
              Demo data. Room bookings + supply requests open to all employees with the notifications/home phase (Phase 2).
            </div>
          )}
        />

        <main className="flex-1 min-w-0 w-full">
          <SubViewTabs views={activeGroup.views} active={view} onSelect={setView} />
          {view === 'correspondence' && <CorrespondenceView letters={letters} onChange={setLetters} />}
          {view === 'licenses' && <LicensesView items={licenses} onChange={setLicenses} />}
          {view === 'rooms' && <RoomBookingsView bookings={roomBookings} onChange={setRoomBookings} user={user} />}
          {view === 'supplies' && <SuppliesView requests={supplies} onChange={setSupplies} user={user} />}
          {view === 'couriers' && <CourierLogView entries={couriers} onChange={setCouriers} />}
          {view === 'vehicles' && (
            <VehiclesView bookings={vehicleBookings} onChangeBookings={setVehicleBookings} salik={salik} onChangeSalik={setSalik} user={user} />
          )}
          {view === 'numbering' && <DocNumberingView letters={letters} />}
        </main>
      </div>
    </div>
  )
}
