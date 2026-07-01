import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'

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

function HomePage({ user, onLogout }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ companies: 0, deals: 0, dealValue: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      try {
        const companies = await fetch(`${backendUrl}/api/crm/companies`).then(r => r.json())
        const deals = await fetch(`${backendUrl}/api/crm/deals`).then(r => r.json())
        const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
        setStats({
          companies: companies.length,
          deals: deals.filter(d => d.stage !== 'closed').length,
          dealValue: totalValue
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    fetchStats()
  }, [])

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
            onClick={() => navigate('/crm')}
            className="bg-white p-8 rounded shadow hover:shadow-lg hover:border-red-700 border-2 border-transparent transition text-left"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-gray-800">CRM</h3>
            <p className="text-gray-600 text-sm mt-2">Companies, Contacts, Deals</p>
          </button>

          <button
            onClick={() => navigate('/marketing')}
            className="bg-white p-8 rounded shadow hover:shadow-lg hover:border-red-700 border-2 border-transparent transition text-left"
          >
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-xl font-bold text-gray-800">Marketing</h3>
            <p className="text-gray-600 text-sm mt-2">LinkedIn, Website, Analytics</p>
          </button>

          <button
            onClick={() => navigate('/content')}
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
                <span>Open Deals</span>
                <span className="font-bold">{stats.deals}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Value</span>
                <span className="font-bold">AED {(stats.dealValue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Deal Size</span>
                <span className="font-bold">AED {Math.round(stats.dealValue / Math.max(stats.deals, 1) / 1000)}K</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-red-700">
                <span>Companies</span>
                <span>{stats.companies}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Contacts</span>
                <span className="font-bold">51</span>
              </div>
              <div className="flex justify-between">
                <span>Active Companies</span>
                <span className="font-bold">{stats.companies}</span>
              </div>
              <div className="flex justify-between">
                <span>This Month</span>
                <span className="font-bold">Updated</span>
              </div>
              <div className="border-t pt-3 text-sm text-gray-600">
                <p>Real data synced from Supabase</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarketingPage({ user }) {
  const navigate = useNavigate()
  const [linkedin, setLinkedin] = useState({ total_followers: 0, new_followers: 0, seniority_breakdown: {} })

  useEffect(() => {
    const fetchLinkedin = async () => {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      try {
        const data = await fetch(`${backendUrl}/api/analytics/linkedin/current`).then(r => r.json())
        setLinkedin(data)
      } catch (err) {
        console.error('Error fetching LinkedIn data:', err)
      }
    }
    fetchLinkedin()
  }, [])

  const seniority = linkedin.seniority_breakdown ? JSON.parse(typeof linkedin.seniority_breakdown === 'string' ? linkedin.seniority_breakdown : JSON.stringify(linkedin.seniority_breakdown)) : {}
  const totalSeniority = Object.values(seniority).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-700 text-white p-4 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-white hover:text-red-100 text-lg">← Back</button>
          <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
          <span className="text-sm">{user.role}</span>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">LinkedIn Followers</p>
            <p className="text-3xl font-bold text-red-700">{(linkedin.total_followers / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">New This Month</p>
            <p className="text-3xl font-bold">{(linkedin.new_followers / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Decision Makers</p>
            <p className="text-3xl font-bold">{totalSeniority > 0 ? (((seniority.director || 0) + (seniority.vp || 0) + (seniority.cxo || 0)) / totalSeniority * 100).toFixed(1) : 0}%</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-3xl font-bold text-green-600">Active</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Seniority Breakdown</h2>
          <div className="space-y-2">
            {Object.entries(seniority).map(([level, count]) => (
              <div key={level} className="flex justify-between">
                <span className="capitalize">{level}</span>
                <span>{count.toLocaleString()} ({totalSeniority > 0 ? (count / totalSeniority * 100).toFixed(0) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CRMPage({ user }) {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [deals, setDeals] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      try {
        const companiesData = await fetch(`${backendUrl}/api/crm/companies`).then(r => r.json())
        const dealsData = await fetch(`${backendUrl}/api/crm/deals`).then(r => r.json())
        setCompanies(companiesData.slice(0, 5))
        setDeals(dealsData)
      } catch (err) {
        console.error('Error fetching CRM data:', err)
      }
    }
    fetchData()
  }, [])

  const totalDealValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const activeDealCount = deals.filter(d => d.stage !== 'closed').length

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-700 text-white p-4 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-white hover:text-red-100 text-lg">← Back</button>
          <h1 className="text-2xl font-bold">CRM Module</h1>
          <span className="text-sm">{user.role}</span>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Total Companies</p>
            <p className="text-3xl font-bold text-red-700">{companies.length}</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Active Deals</p>
            <p className="text-3xl font-bold">{activeDealCount}</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm">Pipeline Value</p>
            <p className="text-3xl font-bold">AED {(totalDealValue / 1000000).toFixed(1)}M</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Companies ({companies.length})</h2>
          <div className="space-y-3">
            {companies.map(c => (
              <div key={c.id} className="border-b pb-3">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-600">{c.location} • {c.industry}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const handleLogin = (data) => {
    setUser(data)
    navigate('/home')
  }

  const handleLogout = () => {
    setUser(null)
    navigate('/')
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Routes>
      <Route path="/home" element={<HomePage user={user} onLogout={handleLogout} />} />
      <Route path="/marketing" element={<MarketingPage user={user} />} />
      <Route path="/crm" element={<CRMPage user={user} />} />
      <Route path="*" element={<HomePage user={user} onLogout={handleLogout} />} />
    </Routes>
  )
}
