import { useState, useEffect } from 'react'
import { isSessionValid } from './utils/auth'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import './App.css'

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    isSessionValid().then((valid) => {
      setAuthenticated(valid)
      setChecking(false)
    })
  }, [])

  if (checking) {
    return (
      <div className="login-overlay">
        <div className="login-card">
          <div className="login-logo">🔐</div>
          <h2>Cargando...</h2>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />
  }

  return <AdminPanel onLogout={() => setAuthenticated(false)} />
}

export default App