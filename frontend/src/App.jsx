import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CRM from './pages/CRM'
import HR from './pages/HR'
import ComingSoon from './pages/ComingSoon'

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('erp_demo_user')
    return saved ? JSON.parse(saved) : null
  })
  const navigate = useNavigate()

  const handleLogin = (data) => {
    setUser(data)
    localStorage.setItem('erp_demo_user', JSON.stringify(data))
    navigate('/home')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('erp_demo_user')
    navigate('/')
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
      <Route path="/home" element={<HomePage user={user} onLogout={handleLogout} />} />
      <Route path="/crm" element={<CRM user={user} onLogout={handleLogout} />} />
      <Route path="/projects" element={<ComingSoon user={user} onLogout={handleLogout} moduleKey="projects" />} />
      <Route path="/hr" element={<HR user={user} onLogout={handleLogout} />} />
      <Route path="/marketing" element={<ComingSoon user={user} onLogout={handleLogout} moduleKey="marketing" />} />
      <Route path="/content" element={<ComingSoon user={user} onLogout={handleLogout} moduleKey="content" />} />
      <Route path="/admin" element={<ComingSoon user={user} onLogout={handleLogout} moduleKey="admin" />} />
      <Route path="*" element={<HomePage user={user} onLogout={handleLogout} />} />
    </Routes>
  )
}
