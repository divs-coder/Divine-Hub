import { Server } from 'socket.io'
import User from '../models/User.js'
import { config } from '../config.js'
import { verifyAccessToken } from '../utils/jwt.js'

const connectionCounts = new Map()

export function configureSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: config.clientUrl, credentials: true },
  })

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) throw new Error('Missing token')
      const payload = verifyAccessToken(token)
      socket.userId = payload.sub
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.userId
    const count = (connectionCounts.get(userId) || 0) + 1
    connectionCounts.set(userId, count)
    socket.join(`user:${userId}`)
    if (count === 1) {
      await User.findByIdAndUpdate(userId, { lastSeen: null })
      io.emit('presence:update', { userId, isOnline: true, lastSeen: null })
    }

    socket.on('typing:start', ({ recipientId, conversationId } = {}) => {
      if (recipientId) io.to(`user:${recipientId}`).emit('typing:start', { userId, conversationId })
    })
    socket.on('typing:stop', ({ recipientId, conversationId } = {}) => {
      if (recipientId) io.to(`user:${recipientId}`).emit('typing:stop', { userId, conversationId })
    })
    socket.on('message:read', ({ senderId, messageId, conversationId } = {}) => {
      if (senderId) io.to(`user:${senderId}`).emit('message:read', { messageId, conversationId })
    })

    socket.on('disconnect', async () => {
      const nextCount = Math.max((connectionCounts.get(userId) || 1) - 1, 0)
      if (nextCount === 0) {
        connectionCounts.delete(userId)
        const lastSeen = new Date()
        await User.findByIdAndUpdate(userId, { lastSeen })
        io.emit('presence:update', { userId, isOnline: false, lastSeen })
      } else {
        connectionCounts.set(userId, nextCount)
      }
    })
  })

  return io
}
