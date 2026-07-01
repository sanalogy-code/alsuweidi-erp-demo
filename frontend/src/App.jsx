import { useState } from 'react'

export default function App() {
  const [username, setUsername] = useState('sales')
  const [password, setPassword] = useState('password123')
  const [token, setToken] = useState(null)
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
        setToken(data.access_token)
        setError('')
      } else {
        setError('Invalid credentials')
      }
    } catch (err) {
      setError('Connection error: ' + err.message)
    }
  }

  if (token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-red-700 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">AL SUWEIDI ERP</h1>
            <button onClick={() => setToken(null)} className="bg-red-900 px-4 py-2 rounded">Logout</button>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto p-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded shadow">
              <p className="text-gray-600 text-sm">Total Followers</p>
              <p className="text-2xl font-bold text-red-700">180,500</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <p className="text-gray-600 text-sm">New This Month</p>
              <p className="text-2xl font-bold">2,500</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <p className="text-gray-600 text-sm">Quality Score</p>
              <p className="text-2xl font-bold">10.9%</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <p className="text-gray-600 text-sm">Growth</p>
              <p className="text-2xl font-bold">1.4%</p>
            </div>
          </div>
          <div className="mt-8 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Welcome to AL SUWEIDI ERP Phase 3</h2>
            <p>Backend: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-bold text-red-700">AL SUWEIDI</h1>
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
