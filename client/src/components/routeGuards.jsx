import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingSpinner from './ui/LoadingSpinner.jsx'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="min-h-screen grid place-items-center bg-[var(--dh-page)]"><LoadingSpinner label="Restoring your session" /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="min-h-screen grid place-items-center bg-[var(--dh-page)]"><LoadingSpinner label="Loading DivineHub" /></div>
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
