import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import DivineHubMark from '../brand/DivineHubMark.jsx'
import IconButton from '../ui/IconButton.jsx'

export default function MobileTopBar({ unreadNotificationCount }) {
  return <header className="ink-rail flex h-[60px] items-center justify-between px-4 md:hidden"><Link to="/" aria-label="DivineHub home"><DivineHubMark compact light /></Link><Link to="/notifications" className="relative"><IconButton label="Notifications" variant="dark"><Bell size={20} />{unreadNotificationCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--dh-primary-soft)] px-1 text-[9px] font-bold text-[var(--dh-ink-950)]">{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</span>}</IconButton></Link></header>
}
