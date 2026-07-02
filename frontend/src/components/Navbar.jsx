import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import logo from '../assets/alsuweidi-logo.svg'

const ROLE_LABELS = {
  sales: 'Sales / Business Dev',
  pm: 'Project Manager',
  marketing: 'Marketing',
  management: 'Management',
  admin: 'Admin',
}

export default function Navbar({ user, onLogout, title, showBack }) {
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-1 text-gray-500 hover:text-brand transition text-sm font-medium"
            >
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <button onClick={() => navigate('/home')} className="flex items-center gap-3">
            <img src={logo} alt="ALSUWEIDI" className="h-9 w-auto rounded" />
            {title && <span className="text-lg font-semibold text-gray-800 hidden sm:block">{title}</span>}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-800">{user?.username}</div>
            <div className="text-xs text-gray-500">{ROLE_LABELS[user?.role] || user?.role}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
            {user?.username?.slice(0, 2).toUpperCase()}
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-brand transition p-2 rounded-lg hover:bg-brand-light"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}
