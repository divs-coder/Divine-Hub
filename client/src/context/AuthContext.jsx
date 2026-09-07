import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiError, setUnauthorizedHandler } from '../services/api.js'
import { getCurrentUser, loginAccount, logoutAccount, registerAccount } from '../services/authService.js'
import { getAccessToken, setAccessToken } from '../services/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    async function loadUser() {
      if (!getAccessToken()) {
        if (mounted) setIsLoading(false)
        return
      }
      try {
        const current = await getCurrentUser()
        if (mounted) setUser(current)
      } catch {
        setAccessToken(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadUser()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null)
      setUser(null)
      navigate('/login', { replace: true, state: { from: location.pathname, message: 'Your session has expired. Log in again to continue.' } })
    })
    return () => setUnauthorizedHandler(null)
  }, [location.pathname, navigate])

  const finishAuth = (data) => {
    setAccessToken(data.token)
    setUser(data.user)
    return data.user
  }

  const login = async (payload) => finishAuth(await loginAccount(payload))
  const register = async (payload) => finishAuth(await registerAccount(payload))
  const logout = async () => {
    try { await logoutAccount() } catch { /* local logout still succeeds */ }
    setAccessToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }
  const refreshUser = async () => {
    const current = await getCurrentUser()
    setUser(current)
    return current
  }

  const value = useMemo(() => ({ user, setUser, isLoading, login, register, logout, refreshUser, getError: getApiError }), [user, isLoading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
