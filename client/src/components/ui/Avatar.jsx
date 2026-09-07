import { useMemo } from 'react'

const palette = ['#6f60b8', '#76947b', '#bc824b', '#b85665', '#52718b']

export default function Avatar({ user, size = 'md', className = '', showPresence = false, isOnline = false, alt }) {
  const initials = useMemo(() => (user?.fullName || user?.username || '?').split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase(), [user])
  const color = palette[(user?.username?.charCodeAt(0) || 0) % palette.length]
  const sizes = { xs: 'h-8 w-8 text-[10px]', sm: 'h-10 w-10 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-20 w-20 text-xl', xl: 'h-32 w-32 text-3xl' }
  return <span className={`relative inline-flex shrink-0 ${sizes[size] || sizes.md} ${className}`}>
    {user?.profilePicture ? <img src={user.profilePicture} alt={alt || `${user.fullName || user.username} profile`} className="h-full w-full rounded-full object-cover" /> : <span className="grid h-full w-full place-items-center rounded-full font-semibold text-white" style={{ backgroundColor: color }} aria-label={alt || `${user?.fullName || user?.username || 'User'} initials`}>{initials}</span>}
    {showPresence && <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--dh-surface)] ${isOnline ? 'bg-[var(--dh-presence)]' : 'bg-[var(--dh-muted)]'}`} aria-label={isOnline ? 'Online' : 'Offline'} />}
  </span>
}
