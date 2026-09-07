import { useEffect, useMemo, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { MessageCircle } from 'lucide-react'

export default function MessageThread({ messages, currentUserId, typing, onDelete }) {
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages.length, typing])
  const grouped = useMemo(() => messages.map((message, index) => { const next = messages[index + 1]; const isMine = message.senderId === currentUserId; const nextMine = next?.senderId === message.senderId; const nextClose = next && (new Date(next.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5 * 60 * 1000; return { message, isMine, showTimestamp: !(nextMine && nextClose) } }), [messages, currentUserId])
  return <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6">{messages.length ? <div className="mt-auto space-y-2">{grouped.map(({ message, isMine, showTimestamp }) => <MessageBubble key={message.id} message={message} isMine={isMine} showTimestamp={showTimestamp} onDelete={onDelete} />)}<div className="pt-1"><TypingIndicator visible={typing} /></div><div ref={endRef} /></div> : <div className="flex flex-1 items-center justify-center"><EmptyState icon={MessageCircle} title="No messages yet." description="Say hello when you are ready." /></div>}</div>
}
