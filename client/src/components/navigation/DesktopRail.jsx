import { Link } from 'react-router-dom'
import DivineHubMark from '../brand/DivineHubMark.jsx'
import Avatar from '../ui/Avatar.jsx'
import NavItem from './NavItem.jsx'
import { navItems } from './navConfig.js'

export default function DesktopRail({ user, unreadMessageCount, unreadNotificationCount }) {
  const counts = { messages: unreadMessageCount, notifications: unreadNotificationCount }
  return <aside className="ink-rail sticky top-0 hidden h-screen w-[84px] shrink-0 flex-col px-3 py-6 md:flex xl:w-[228px] xl:px-5"><Link to="/" className="mb-10 inline-flex" aria-label="DivineHub home"><DivineHubMark compact light /><span className="sr-only xl:not-sr-only xl:ml-2 xl:self-center xl:text-lg xl:font-semibold">DivineHub</span></Link><nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto" aria-label="Main navigation">{navItems.map((item) => <NavItem key={item.label} item={item} compact badgeCount={counts[item.badge] || 0} />)}</nav><Link to={`/profile/${user?.username || 'me'}`} className="mt-6 flex min-h-11 items-center gap-3 rounded-control px-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"><Avatar user={user} size="sm" /><span className="min-w-0 truncate sr-only xl:not-sr-only"><span className="block truncate font-medium text-white">{user?.fullName}</span><span className="block truncate text-xs text-white/50">@{user?.username}</span></span></Link></aside>
}
