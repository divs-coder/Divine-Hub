import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ConversationList from '../../components/messaging/ConversationList.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { listConversations } from '../../services/messageService.js'
import { useSocket } from '../../context/SocketContext.jsx'
import { getErrorMessage } from '../../utils/errors.js'

export default function MessagesPage() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { onlineUsers } = useSocket()
  const load = useCallback(() => { setLoading(true); setError(''); listConversations().then(setConversations).catch((requestError) => setError(getErrorMessage(requestError, 'Messages could not be loaded.'))).finally(() => setLoading(false)) }, [])
  useEffect(() => { load() }, [load])
  return <><PageHeader eyebrow="Messages" title="Keep the thread open" description="Private conversations with the people you choose." action={<Link to="/explore" className="btn-secondary"><ArrowRight size={16} /> Find people</Link>} /><div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">{error ? <ErrorState message={error} onRetry={load} /> : <div className="surface flex min-h-[520px] overflow-hidden rounded-card"><ConversationList conversations={conversations} onlineUsers={onlineUsers} loading={loading} /><div className="hidden min-w-0 flex-1 place-items-center md:grid"><EmptyState icon={MessageCircle} title="Choose a conversation" description="Select a conversation from the left, or find someone new to message." /></div></div>}</div></>
}
