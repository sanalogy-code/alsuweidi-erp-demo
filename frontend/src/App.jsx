import { useState } from 'react'

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('sales')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok) {
        onLogin(data)
      } else {
        setError('Invalid credentials')
      }
    } catch (err) {
      setError('Connection error: ' + err.message)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-bold text-red-700">ALSUWEIDI</h1>
        <h2 className="mb-8 text-center text-xl text-gray-600">ERP System</h2>
        {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="sales, marketing, pm, management, admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="password123"
            />
          </div>
          <button type="submit" className="w-full rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

function HomePage({ user, onLogout, onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-700 text-white p-4 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ALSUWEIDI ERP</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm">{user.role}</span>
            <button onClick={onLogout} className="bg-red-900 px-3 py-1 rounded text-sm hover:bg-red-800">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Modules</h2>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => onNavigate('crm')}
            className="bg-white p-8 rounded shadow hover:shadow-lg hover:border-red-700 border-2 border-transparent transition text-left"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-gray-800">CRM</h3>
            <p className="text-gray-600 text-sm mt-2">Companies, Contacts, Deals</p>
          </button>

          <button
            onClick={() => onNavigate('marketing')}
            className="bg-white p-8 rounded shadow hover:shadow-lg hover:border-red-700 border-2 border-transparent transition text-left"
          >
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-xl font-bold text-gray-800">Marketing</h3>
            <p className="text-gray-600 text-sm mt-2">LinkedIn, Website, Analytics</p>
          </button>

          <button
            onClick={() => onNavigate('content')}
            className="bg-white p-8 rounded shadow hover:shadow-lg hover:border-red-700 border-2 border-transparent transition text-left"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-bold text-gray-800">Content</h3>
            <p className="text-gray-600 text-sm mt-2">Calendar & Collaboration</p>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">Active Deals Pipeline</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Prospecting</span>
                <span className="font-bold">4 deals</span>
              </div>
              <div className="flex justify-between">
                <span>Proposal</span>
                <span className="font-bold">2 deals</span>
              </div>
              <div className="flex justify-between">
                <span>Negotiation</span>
                <span className="font-bold">1 deal</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-red-700">
                <span>Total Value</span>
                <span>AED 3.2M</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">LinkedIn Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Followers</span>
                <span className="font-bold">180.5K</span>
              </div>
              <div className="flex justify-between">
                <span>New This Month</span>
                <span className="font-bold">2.5K</span>
              </div>
              <div className="flex justify-between">
                <span>Quality Score</span>
                <span className="font-bold">10.9%</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-sm text-gray-600">
                <span>Decision Makers</span>
                <span className="font-bold">33%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarketingPage({ user, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-700 text-white p-4 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={onBack} className="text-white hover:text-red-100 text-lg">← Back</button>
          <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
          <span className="text-sm">{user.role}</span>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">LinkedIn Followers</p>
            <p className="text-3xl font-bold text-red-700">180.5K</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">New This Month</p>
            <p className="text-3xl font-bold">2.5K</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Quality Score</p>
            <p className="text-3xl font-bold">10.9%</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Growth Rate</p>
            <p className="text-3xl font-bold">1.4%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Seniority Breakdown</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Entry Level</span><span>61,652 (34%)</span></div>
            <div className="flex justify-between"><span>Senior</span><span>49,644 (27%)</span></div>
            <div className="flex justify-between"><span>Manager</span><span>10,841 (6%)</span></div>
            <div className="flex justify-between"><span>Director+</span><span>58,363 (33%)</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CRMPage({ user, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-700 text-white p-4 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={onBack} className="text-white hover:text-red-100 text-lg">← Back</button>
          <h1 className="text-2xl font-bold">CRM Module</h1>
          <span className="text-sm">{user.role}</span>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Total Companies</p>
            <p className="text-3xl font-bold text-red-700">24</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Active Deals</p>
            <p className="text-3xl font-bold">7</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Pipeline Value</p>
            <p className="text-3xl font-bold">AED 2.4M</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Recent Companies</h2>
          <div className="space-y-3">
            <div className="border-b pb-3">
              <p className="font-semibold">TechCorp UAE</p>
              <p className="text-sm text-gray-600">Dubai • IT Services</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold">BuildCo Consulting</p>
              <p className="text-sm text-gray-600">Abu Dhabi • Construction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('home')

  const handleLogin = (data) => {
    setUser(data)
    setPage('home')
  }

  const handleLogout = () => {
    setUser(null)
    setPage('home')
  }

  const handleNavigate = (newPage) => {
    setPage(newPage)
  }

  const handleBack = () => {
    setPage('home')
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (page === 'home') {
    return <HomePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
  }

  if (page === 'marketing') {
    return <MarketingPage user={user} onBack={handleBack} />
  }

  if (page === 'crm') {
    return <CRMPage user={user} onBack={handleBack} />
  }
}
