import { NavLink } from 'react-router-dom'
import { Compass, Home, MessageCircle, SquarePen, UserRound } from 'lucide-react'

const items = [{ label: 'Home', to: '/', icon: Home, end: true }, { label: 'Explore', to: '/explore', icon: Compass }, { label: 'Create', to: '/create', icon: SquarePen }, { label: 'Messages', to: '/messages', icon: MessageCircle }, { label: 'Profile', to: '/profile/me', icon: UserRound }]

export default function MobileBottomDock({ unreadMessageCount }) {
  return <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--dh-border)] bg-[var(--dh-surface)]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden" aria-label="Mobile navigation">{items.map(({ label, to, icon: Icon, end }) => <NavLink key={label} to={to} end={end} className={({ isActive }) => `relative flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] ${isActive ? 'text-[var(--dh-primary)]' : 'text-[var(--dh-muted)]'}`}><Icon size={19} strokeWidth={2} aria-hidden="true" />{label === 'Messages' && unreadMessageCount > 0 && <span className="absolute right-5 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--dh-liked)] px-1 text-[9px] font-semibold text-white">{unreadMessageCount > 9 ? '9+' : unreadMessageCount}</span>}<span>{label}</span></NavLink>)}</nav>
}
