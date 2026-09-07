import { useCallback, useEffect, useState } from 'react'
import { BellOff } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import NotificationRow from '../../components/notifications/NotificationRow.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import Button from '../../components/ui/Button.jsx'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService.js'
import { useSocket } from '../../context/SocketContext.jsx'
import { getErrorMessage } from '../../utils/errors.js'
import { useToast } from '../../components/ui/ToastProvider.jsx'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { setUnreadNotificationCount } = useSocket()
  const { push } = useToast()
  const load = useCallback(() => { setLoading(true); setError(''); listNotifications().then((response) => { setNotifications(response.data); setUnreadNotificationCount(response.meta?.unreadCount || 0) }).catch((requestError) => setError(getErrorMessage(requestError, 'Notifications could not be loaded.'))).finally(() => setLoading(false)) }, [setUnreadNotificationCount])
  useEffect(() => { load() }, [load])
  const markRead = async (notification) => { if (notification.isRead) return; try { await markNotificationRead(notification.id); setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item)); setUnreadNotificationCount((count) => Math.max(count - 1, 0)) } catch (requestError) { push({ tone: 'error', message: getErrorMessage(requestError) }) } }
  const markAll = async () => { try { await markAllNotificationsRead(); setNotifications((current) => current.map((item) => ({ ...item, isRead: true }))); setUnreadNotificationCount(0); push({ tone: 'success', message: 'Notifications marked as read' }) } catch (requestError) { push({ tone: 'error', message: getErrorMessage(requestError) }) } }
  return <><PageHeader eyebrow="Notifications" title="Stay in the loop" description="A chronological view of the people and posts that reached for you." action={<Button variant="secondary" onClick={markAll}>Mark all as read</Button>} /><div className="mx-auto max-w-2xl px-5 py-6 sm:px-8">{loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div className="flex items-center gap-3 border-b border-[var(--dh-border)] py-4" key={item}><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-4 w-2/3" /></div>)}</div> : error ? <ErrorState message={error} onRetry={load} /> : notifications.length ? <div>{notifications.map((notification) => <NotificationRow key={notification.id} notification={notification} onRead={markRead} />)}</div> : <EmptyState icon={BellOff} title="You have no notifications yet." description="When someone follows, likes, comments, or messages you, it will show up here." />}</div></>
}
