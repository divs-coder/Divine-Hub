import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext.jsx'
import { getAccessToken } from '../services/storage.js'

const SocketContext = createContext(null)
const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '')

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [status, setStatus] = useState('disconnected')
  const [onlineUsers, setOnlineUsers] = useState(() => new Set())
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)

  useEffect(() => {
    if (!user || !getAccessToken()) {
      setSocket(null)
      setStatus('disconnected')
      return undefined
    }
    const connection = io(socketUrl, { auth: { token: getAccessToken() }, transports: ['websocket', 'polling'] })
    setSocket(connection)
    setStatus('connecting')
    const onConnect = () => setStatus('connected')
    const onDisconnect = () => setStatus('reconnecting')
    const onConnectError = () => setStatus('unavailable')
    const onPresence = ({ userId, isOnline }) => setOnlineUsers((current) => {
      const next = new Set(current)
      if (isOnline) next.add(userId)
      else next.delete(userId)
      return next
    })
    const onMessage = ({ senderId }) => {
      if (senderId !== user.id) setUnreadMessageCount((count) => count + 1)
    }
    const onNotification = () => setUnreadNotificationCount((count) => count + 1)
    connection.on('connect', onConnect)
    connection.on('disconnect', onDisconnect)
    connection.on('connect_error', onConnectError)
    connection.on('presence:update', onPresence)
    connection.on('message:new', onMessage)
    connection.on('notification:new', onNotification)
    return () => {
      connection.off('connect', onConnect)
      connection.off('disconnect', onDisconnect)
      connection.off('connect_error', onConnectError)
      connection.off('presence:update', onPresence)
      connection.off('message:new', onMessage)
      connection.off('notification:new', onNotification)
      connection.disconnect()
    }
  }, [user])

  const value = useMemo(() => ({
    socket,
    status,
    onlineUsers,
    unreadMessageCount,
    unreadNotificationCount,
    setUnreadMessageCount,
    setUnreadNotificationCount,
  }), [socket, status, onlineUsers, unreadMessageCount, unreadNotificationCount])

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const value = useContext(SocketContext)
  if (!value) throw new Error('useSocket must be used within SocketProvider')
  return value
}
