import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CRM from './pages/CRM'
import HR from './pages/HR'
import Projects from './pages/Projects'
import ComingSoon from './pages/ComingSoon'
import { PUBLIC_HOLIDAYS } from './data/hrData'

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('erp_demo_user')
    return saved ? JSON.parse(saved) : null
  })
  // Lifted here (not HR-page state) so an HR approval shows up on the Home dashboard tile in the same session
  const [holidays, setHolidays] = useState(PUBLIC_HOLIDAYS)
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
      <Route path="/" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} />} />
      <Route path="/home" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} />} />
      <Route path="/crm" element={<CRM user={user} onLogout={handleLogout} />} />
      <Route path="/projects" element={<Projects user={user} onLogout={handleLogout} />} />
      <Route path="/hr" element={<HR user={user} onLogout={handleLogout} holidays={holidays} onUpdateHolidays={setHolidays} />} />
      <Route path="/marketing" element={<ComingSoon user={user} onLogout={handleLogout} moduleKey="marketing" />} />
      <Route path="/content" element={<ComingSoon user={user} onLogout={handleLogout} moduleKey="content" />} />
      <Route path="/admin" element={<ComingSoon user={user} onLogout={handleLogout} moduleKey="admin" />} />
      <Route path="*" element={<HomePage user={user} onLogout={handleLogout} holidays={holidays} />} />
    </Routes>
  )
}
