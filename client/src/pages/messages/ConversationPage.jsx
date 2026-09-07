import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, MoreHorizontal } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar.jsx'
import IconButton from '../../components/ui/IconButton.jsx'
import PresenceIndicator from '../../components/ui/PresenceIndicator.jsx'
import ConversationList from '../../components/messaging/ConversationList.jsx'
import MessageThread from '../../components/messaging/MessageThread.jsx'
import MessageComposer from '../../components/messaging/MessageComposer.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { listConversations, listMessages, sendMessage, deleteMessage, markMessageRead } from '../../services/messageService.js'
import { useSocket } from '../../context/SocketContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage } from '../../utils/errors.js'
import { useToast } from '../../components/ui/ToastProvider.jsx'

export default function ConversationPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { socket, onlineUsers, setUnreadMessageCount } = useSocket()
  const { push } = useToast()
  const [conversations, setConversations] = useState([])
  const [participant, setParticipant] = useState(null)
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState('')
  const loadConversations = useCallback(() => listConversations().then(setConversations).catch(() => {}).finally(() => setListLoading(false)), [])
  const loadThread = useCallback(() => { setLoading(true); setError(''); listMessages(userId).then((response) => { setMessages(response.data); setParticipant(response.meta?.participant || null); response.data.filter((message) => message.recipientId === currentUser.id && !message.isRead).forEach((message) => markMessageRead(message.id).catch(() => {})); setUnreadMessageCount(0) }).catch((requestError) => setError(getErrorMessage(requestError, 'This conversation could not be loaded.'))).finally(() => setLoading(false)) }, [userId, currentUser.id, setUnreadMessageCount])
  useEffect(() => { loadConversations(); loadThread() }, [loadConversations, loadThread])
  useEffect(() => { if (!socket) return undefined; const addIncoming = (message) => { if (message.senderId !== userId && message.recipientId !== userId) return; setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]); if (message.senderId === userId) { markMessageRead(message.id).catch(() => {}); setUnreadMessageCount(0) } loadConversations() }; const onStart = ({ userId: typingUserId }) => { if (typingUserId === userId) setTyping(true) }; const onStop = ({ userId: typingUserId }) => { if (typingUserId === userId) setTyping(false) }; const onRead = ({ messageId }) => setMessages((current) => current.map((message) => message.id === messageId ? { ...message, isRead: true } : message)); const onDeleted = ({ messageId }) => setMessages((current) => current.map((message) => message.id === messageId ? { ...message, text: 'Message deleted', deletedAt: new Date().toISOString() } : message)); socket.on('message:new', addIncoming); socket.on('typing:start', onStart); socket.on('typing:stop', onStop); socket.on('message:read', onRead); socket.on('message:deleted', onDeleted); return () => { socket.off('message:new', addIncoming); socket.off('typing:start', onStart); socket.off('typing:stop', onStop); socket.off('message:read', onRead); socket.off('message:deleted', onDeleted) } }, [socket, userId, loadConversations, setUnreadMessageCount])
  const handleSend = async (text) => { try { const message = await sendMessage({ recipientId: userId, text }); setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]); loadConversations() } catch (requestError) { push({ tone: 'error', message: getErrorMessage(requestError, 'Message could not be sent.') }); throw requestError } }
  const handleTyping = (isTyping) => { if (!socket) return; socket.emit(isTyping ? 'typing:start' : 'typing:stop', { recipientId: userId }) }
  const handleDelete = async (message) => { try { const next = await deleteMessage(message.id); setMessages((current) => current.map((item) => item.id === next.id ? next : item)) } catch (requestError) { push({ tone: 'error', message: getErrorMessage(requestError, 'Message could not be deleted.') }) } }
  return <div className="flex min-h-[calc(100vh-60px)] flex-col md:min-h-screen"><div className="hidden border-b border-[var(--dh-border)] px-5 py-5 md:block"><h1 className="text-xl font-semibold">Messages</h1></div><div className="surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-x-0 border-b-0 md:mx-5 md:mb-5 md:flex-row md:rounded-card md:border-x md:border-b"><ConversationList conversations={conversations} activeUserId={userId} onlineUsers={onlineUsers} loading={listLoading} /><section className="flex min-h-[calc(100vh-60px)] min-w-0 flex-1 flex-col md:min-h-0">{loading ? <div className="flex flex-1 flex-col gap-4 p-6"><Skeleton className="h-12 w-1/3" /><Skeleton className="mt-auto h-16 w-2/3 self-end" /></div> : error ? <ErrorState message={error} onRetry={loadThread} /> : <>{participant && <header className="flex min-h-[72px] items-center gap-3 border-b border-[var(--dh-border)] px-4 sm:px-6"><IconButton label="Back to messages" className="md:hidden" onClick={() => navigate('/messages')}><ArrowLeft size={19} /></IconButton><Avatar user={participant} size="sm" showPresence isOnline={onlineUsers.has(participant.id)} /><div className="min-w-0 flex-1"><Link to={`/profile/${participant.username}`} className="block truncate font-semibold hover:text-[var(--dh-primary)]">{participant.fullName}</Link><PresenceIndicator isOnline={onlineUsers.has(participant.id)} /></div><IconButton label="Conversation options"><MoreHorizontal size={19} /></IconButton></header>}<MessageThread messages={messages} currentUserId={currentUser.id} typing={typing} onDelete={handleDelete} /><MessageComposer onSend={handleSend} onTyping={handleTyping} disabled={!participant || participant.messagePermission === 'nobody'} /></>}</section></div></div>
}
