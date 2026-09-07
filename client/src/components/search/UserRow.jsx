import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'
import PresenceIndicator from '../ui/PresenceIndicator.jsx'

export default function UserRow({ user, onFollow, onMessage, loading = false, online = false }) {
  const following = user.relationship === 'following'
  return <div className="flex items-center gap-3 border-b border-[var(--dh-border)] px-1 py-4 sm:gap-4"><Link to={`/profile/${user.username}`} className="shrink-0"><Avatar user={user} size="md" showPresence isOnline={online} /></Link><div className="min-w-0 flex-1"><Link to={`/profile/${user.username}`} className="block truncate font-semibold hover:text-[var(--dh-primary)]">{user.fullName}</Link><Link to={`/profile/${user.username}`} className="block truncate text-sm text-[var(--dh-muted)]">@{user.username}</Link>{user.bio && <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--dh-muted)]">{user.bio}</p>}<PresenceIndicator isOnline={online} label={false} /></div><div className="flex shrink-0 items-center gap-1.5">{user.messagePermission !== 'nobody' && <Button variant="quiet" className="hidden sm:inline-flex" onClick={() => onMessage?.(user)} aria-label={`Message ${user.fullName}`}><MessageCircle size={16} /></Button>}{onFollow && <Button variant={following ? 'secondary' : 'primary'} className="min-w-[92px] px-3 text-xs" onClick={() => onFollow(user)} loading={loading}>{following ? 'Following' : 'Follow'}</Button>}</div></div>
}
