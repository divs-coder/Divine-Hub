import Notification from '../models/Notification.js'
import { serializeNotification } from '../utils/serializers.js'
import { getLimit } from '../utils/pagination.js'
import { AppError } from '../utils/AppError.js'

export async function listNotifications(req, res) {
  const limit = getLimit(req.query.limit, 30, 50)
  const notifications = await Notification.find({ recipient: req.user._id }).populate('actor').sort({ createdAt: -1 }).limit(limit + 1)
  const hasMore = notifications.length > limit
  const visible = hasMore ? notifications.slice(0, limit) : notifications
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false })
  res.json({ success: true, data: visible.map(serializeNotification), meta: { hasMore, nextCursor: visible.at(-1)?.createdAt || null, unreadCount } })
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true }, { returnDocument: 'after' }).populate('actor')
  if (!notification) throw new AppError('Notification not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: { notification: serializeNotification(notification) } })
}

export async function markAllNotificationsRead(req, res) {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { $set: { isRead: true } })
  res.status(204).send()
}
