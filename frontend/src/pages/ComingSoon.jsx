import Navbar from '../components/Navbar'
import { MODULES } from '../data/dashboardData'

export default function ComingSoon({ user, onLogout, moduleKey }) {
  const mod = MODULES.find((m) => m.key === moduleKey) || MODULES[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title={mod.label} showBack />
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-4">{mod.icon}</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{mod.label} — Coming Soon</h1>
        <p className="text-gray-500">{mod.description}. This module is planned for a future build — CRM is first up.</p>
      </div>
    </div>
  )
}
