import Notification from '../models/Notification.js'
import { serializeNotification } from '../utils/serializers.js'

export async function createNotification({ recipientId, actorId, type, postId = null, messageId = null, io }) {
  if (!recipientId || recipientId.toString() === actorId?.toString()) return null
  const notification = await Notification.create({
    recipient: recipientId,
    actor: actorId,
    type,
    post: postId,
    message: messageId,
  })
  const hydrated = await Notification.findById(notification._id).populate('actor')
  const payload = serializeNotification(hydrated)
  io?.to(`user:${recipientId.toString()}`).emit('notification:new', payload)
  return payload
}
