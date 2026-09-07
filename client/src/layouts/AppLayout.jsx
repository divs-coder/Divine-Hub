import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DesktopRail from '../components/navigation/DesktopRail.jsx'
import MobileTopBar from '../components/navigation/MobileTopBar.jsx'
import MobileBottomDock from '../components/navigation/MobileBottomDock.jsx'
import ContextRail from '../components/navigation/ContextRail.jsx'
import OfflineBar from '../components/ui/OfflineBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import { listConversations } from '../services/messageService.js'

export default function AppLayout() {
  const { user } = useAuth()
  const { unreadMessageCount, unreadNotificationCount, status } = useSocket()
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const isConversation = location.pathname.startsWith('/messages/')

  useEffect(() => {
    let active = true
    listConversations().then((data) => { if (active) setConversations(data) }).catch(() => {})
    return () => { active = false }
  }, [location.pathname, unreadMessageCount])

  return <div className="app-shell md:flex"><DesktopRail user={user} unreadMessageCount={unreadMessageCount} unreadNotificationCount={unreadNotificationCount} /><div className="min-w-0 flex-1"><MobileTopBar unreadNotificationCount={unreadNotificationCount} /><OfflineBar socketStatus={status} /><div className="md:grid md:min-h-screen md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_300px]"><main className={`courtyard min-h-[calc(100vh-60px)] min-w-0 pb-20 md:min-h-screen md:pb-8 ${isConversation ? 'pb-0 md:pb-0' : ''}`}><Outlet /></main><ContextRail conversations={conversations} /></div></div>{!isConversation && <MobileBottomDock unreadMessageCount={unreadMessageCount} />}</div>
}
