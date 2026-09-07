import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar.jsx'
import { formatRelativeTime } from '../../utils/formatters.js'

export default function ConversationRow({ conversation, active = false, online = false }) {
  return <Link to={`/messages/${conversation.participant.id}`} className={`flex items-center gap-3 border-b border-[var(--dh-border)] px-4 py-3.5 transition ${active ? 'bg-[color-mix(in_srgb,var(--dh-primary)_9%,transparent)]' : 'hover:bg-[color-mix(in_srgb,var(--dh-primary)_5%,transparent)]'}`}><Avatar user={conversation.participant} size="md" showPresence isOnline={online} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{conversation.participant.fullName}</strong><span className="meta shrink-0">{conversation.lastMessage?.createdAt ? formatRelativeTime(conversation.lastMessage.createdAt) : ''}</span></span><span className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-xs text-[var(--dh-muted)]">{conversation.lastMessage?.text || 'Start a conversation'}</span>{conversation.unreadCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--dh-primary)] px-1 text-[10px] font-semibold text-white">{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}</span>}</span></span></Link>
}
