import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar.jsx'
import IconButton from '../ui/IconButton.jsx'
import { formatRelativeTime } from '../../utils/formatters.js'

const copy = { follow: 'followed you', like: 'liked your post', comment: 'commented on your post', message: 'sent you a message' }
const icons = { follow: UserPlus, like: Heart, comment: MessageCircle, message: Bell }

export default function NotificationRow({ notification, onRead }) {
  const Icon = icons[notification.type] || Bell
  const target = notification.type === 'message' ? `/messages` : notification.actor?.username ? `/profile/${notification.actor.username}` : '#'
  return <div className={`flex gap-3 border-b border-[var(--dh-border)] px-1 py-4 ${notification.isRead ? '' : 'bg-[color-mix(in_srgb,var(--dh-primary)_5%,transparent)]'}`}><Link to={notification.actor?.username ? `/profile/${notification.actor.username}` : '#'} className="shrink-0"><Avatar user={notification.actor} size="md" /></Link><div className="min-w-0 flex-1"><Link to={target} onClick={() => !notification.isRead && onRead(notification)} className="block text-sm leading-6 hover:text-[var(--dh-primary)]"><strong>{notification.actor?.fullName || 'Someone'}</strong> <span className="text-[var(--dh-muted)]">{copy[notification.type] || 'interacted with you'}</span></Link><div className="mt-1 flex items-center gap-2"><span className="meta">{formatRelativeTime(notification.createdAt)}</span>{!notification.isRead && <span className="inline-flex items-center gap-1 text-xs text-[var(--dh-primary)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--dh-primary)]" /> New</span>}</div></div>{!notification.isRead && <IconButton label="Mark as read" onClick={() => onRead(notification)}><Icon size={17} /></IconButton>}</div>
}
