import { useState, useRef, useEffect } from 'react'
import { loginToBackend } from '../utils/auth'
import './Login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)
  const userRef = useRef(null)

  useEffect(() => {
    if (userRef.current) userRef.current.focus()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setLoading(true)
    try {
      await loginToBackend(username.trim(), password.trim())
      onLogin()
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Intenta de nuevo.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-overlay">
      <div className="login-card" style={shake ? { animation: 'shake 0.4s ease' } : {}}>
        <div className="login-logo">🔐</div>
        <h2>Panel Admin</h2>
        <p className="login-sub">Inicia sesión para acceder al panel de administración</p>
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="loginUser">Usuario</label>
            <input
              ref={userRef}
              id="loginUser"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="login-field">
            <label htmlFor="loginPass">Contraseña</label>
            <input
              id="loginPass"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
        {error && <div className="login-error show">{error}</div>}
        <p className="login-footer">Playdiom &copy; {new Date().getFullYear()} — Panel de Administración</p>
      </div>
    </div>
  )
}

export default Login