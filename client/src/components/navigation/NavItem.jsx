import { NavLink } from 'react-router-dom'

export default function NavItem({ item, badgeCount = 0, compact = false, onNavigate }) {
  const Icon = item.icon
  return <NavLink to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => `nav-bracketed flex min-h-11 items-center gap-3 px-3 text-sm transition-colors xl:px-4 ${isActive ? 'is-active text-[var(--dh-surface)]' : 'text-white/60 hover:text-[var(--dh-surface)]'}`}>
    {({ isActive }) => <><Icon size={19} strokeWidth={isActive ? 2.1 : 1.8} aria-hidden="true" /><span className={`${compact ? 'sr-only xl:not-sr-only' : ''} min-w-0 flex-1 truncate`}>{item.label}</span>{badgeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--dh-primary-soft)] px-1 text-[10px] font-semibold text-[var(--dh-ink-950)]">{badgeCount > 99 ? '99+' : badgeCount}</span>}</>}
  </NavLink>
}
