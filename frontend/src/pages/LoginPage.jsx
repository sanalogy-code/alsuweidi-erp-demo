import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import logo from '../assets/alsuweidi-logo.svg'
import { ROLES } from '../data/dashboardData'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('Sarah')
  const [role, setRole] = useState('sales')
  const [isNewHire, setIsNewHire] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    if (!username.trim()) return
    onLogin({ username: username.trim(), role, isNewHire })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        <img src={logo} alt="ALSUWEIDI" className="h-14 w-auto mx-auto mb-6 rounded" />
        <h2 className="mb-6 text-center text-lg text-gray-500">ERP — Proof of Concept</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="e.g. Sarah"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role (demo)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={isNewHire} onChange={(e) => setIsNewHire(e.target.checked)} className="rounded border-gray-300 text-brand focus:ring-brand" />
            I'm a new hire (show onboarding checklist)
          </label>
          <button type="submit" className="w-full rounded-md bg-brand px-4 py-2 text-white text-sm font-medium hover:bg-brand-dark">
            Enter
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-4">Demo login — no password needed, nothing is stored remotely.</p>
        <div className="text-center mt-5 pt-4 border-t border-gray-100">
          <Link to="/dev" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand transition-colors">
            <Sparkles size={12} /> How this was built — Developer Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
