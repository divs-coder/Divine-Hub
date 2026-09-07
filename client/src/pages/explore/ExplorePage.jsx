import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SearchField from '../../components/search/SearchField.jsx'
import UserRow from '../../components/search/UserRow.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { UserSearch } from 'lucide-react'
import { searchPeople, followUser, unfollowUser } from '../../services/userService.js'
import { useSocket } from '../../context/SocketContext.jsx'
import { useToast } from '../../components/ui/ToastProvider.jsx'
import { getErrorMessage } from '../../utils/errors.js'

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [followLoading, setFollowLoading] = useState('')
  const { onlineUsers } = useSocket()
  const { push } = useToast()
  const navigate = useNavigate()
  useEffect(() => { const controller = new AbortController(); if (!query.trim()) { setUsers([]); setLoading(false); setError(''); return () => controller.abort() } const timeout = window.setTimeout(() => { setLoading(true); searchPeople(query.trim(), controller.signal).then(setUsers).catch((requestError) => { if (requestError.name !== 'CanceledError') setError(getErrorMessage(requestError, 'Search is unavailable right now. Try again.')) }).finally(() => setLoading(false)) }, 260); return () => { window.clearTimeout(timeout); controller.abort() } }, [query])
  const toggleFollow = async (user) => { setFollowLoading(user.id); try { const data = user.relationship === 'following' ? await unfollowUser(user.id) : await followUser(user.id); setUsers((current) => current.map((item) => item.id === user.id ? { ...item, relationship: data.relationship, followersCount: data.followersCount } : item)) } catch (requestError) { push({ tone: 'error', message: getErrorMessage(requestError, 'Could not update that follow.') }) } finally { setFollowLoading('') } }
  return <><PageHeader eyebrow="Explore" title="Find your people" description="Search by name or username, then choose who you want to keep close." /><div className="mx-auto max-w-3xl px-5 py-6 sm:px-8"><SearchField value={query} onChange={(value) => { setQuery(value); setError('') }} onClear={() => setQuery('')} autoFocus />{loading && <div className="mt-5 space-y-2">{[1, 2, 3].map((item) => <div className="flex items-center gap-4 border-b border-[var(--dh-border)] py-4" key={item}><Skeleton className="h-12 w-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div>)}</div>}{!query.trim() && !loading && <EmptyState icon={UserSearch} title="Search by name or username." description="Start with someone you already know, or explore a new corner of DivineHub." />}{query.trim() && !loading && error && <ErrorState message={error} onRetry={() => setQuery((value) => `${value} `).trim()} />}{query.trim() && !loading && !error && users.length === 0 && <EmptyState icon={UserSearch} title={`No people match “${query}”.`} description="Try a different spelling or a shorter search." />}{users.length > 0 && <div className="mt-4">{users.map((user) => <UserRow key={user.id} user={user} online={onlineUsers.has(user.id)} loading={followLoading === user.id} onFollow={toggleFollow} onMessage={() => navigate(`/messages/${user.id}`)} />)}</div>}</div></>
}
