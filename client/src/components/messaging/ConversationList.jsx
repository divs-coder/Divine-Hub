import { MessageCircle } from 'lucide-react'
import ConversationRow from './ConversationRow.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'

export default function ConversationList({ conversations, activeUserId, onlineUsers, loading }) {
  return <aside className="w-full shrink-0 border-b border-[var(--dh-border)] md:w-[320px] md:border-b-0 md:border-r"><div className="border-b border-[var(--dh-border)] px-4 py-5"><h2 className="text-lg font-semibold">Messages</h2><p className="mt-1 text-sm text-[var(--dh-muted)]">Private conversations, kept close.</p></div>{loading ? <div className="space-y-4 p-4">{[1, 2, 3].map((item) => <div className="flex items-center gap-3" key={item}><Skeleton className="h-11 w-11 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-1/2" /><Skeleton className="h-2.5 w-3/4" /></div></div>)}</div> : conversations.length ? <div className="max-h-[calc(100vh-160px)] overflow-y-auto">{conversations.map((conversation) => <ConversationRow key={conversation.id} conversation={conversation} active={activeUserId === conversation.participant.id} online={onlineUsers.has(conversation.participant.id)} />)}</div> : <EmptyState icon={MessageCircle} title="No messages yet." description="Find someone in Explore and start a conversation." />}</aside>
}
