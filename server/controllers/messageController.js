import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { serializeMessage, serializeUser } from '../utils/serializers.js'
import { createNotification } from '../services/notificationService.js'
import { getLimit } from '../utils/pagination.js'
import { assertObjectId, cleanText } from '../utils/validation.js'

function canMessage(recipient, sender) {
  if (recipient.messagePermission === 'nobody') return false
  if (recipient.messagePermission === 'followers') return recipient.followers.some((id) => id.equals(sender._id))
  return true
}

async function findConversation(userId, otherUserId) {
  return Conversation.findOne({ participants: { $all: [userId, otherUserId], $size: 2 } })
}

export async function listConversations(req, res) {
  const conversations = await Conversation.find({ participants: req.user._id }).populate('participants').sort({ updatedAt: -1 })
  const data = conversations.map((conversation) => {
    const participant = conversation.participants.find((user) => user._id.toString() !== req.user._id.toString())
    return {
      id: conversation._id.toString(),
      participant: serializeUser(participant, req.user._id),
      lastMessage: conversation.lastMessageAt ? { text: conversation.lastMessageText, senderId: conversation.lastMessageSender?.toString(), createdAt: conversation.lastMessageAt } : null,
      unreadCount: conversation.unreadCounts.get(req.user._id.toString()) || 0,
      updatedAt: conversation.updatedAt,
    }
  })
  res.json({ success: true, data })
}

export async function listMessages(req, res) {
  assertObjectId(req.params.userId, 'user id')
  const otherUser = await User.findById(req.params.userId)
  if (!otherUser) throw new AppError('User not found', 404, 'NOT_FOUND')
  const conversation = await findConversation(req.user._id, otherUser._id)
  if (!conversation) {
    res.json({ success: true, data: [], meta: { hasMore: false, nextCursor: null, participant: serializeUser(otherUser, req.user._id) } })
    return
  }
  const limit = getLimit(req.query.limit, 50, 100)
  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(limit + 1)
  const hasMore = messages.length > limit
  const visible = (hasMore ? messages.slice(0, limit) : messages).reverse()
  await Message.updateMany({ conversation: conversation._id, recipient: req.user._id, isRead: false }, { isRead: true })
  conversation.unreadCounts.set(req.user._id.toString(), 0)
  await conversation.save()
  res.json({ success: true, data: visible.map(serializeMessage), meta: { hasMore, nextCursor: visible[0]?.createdAt || null, participant: serializeUser(otherUser, req.user._id) } })
}

export async function sendMessage(req, res) {
  assertObjectId(req.body.recipientId, 'recipient id')
  const recipient = await User.findById(req.body.recipientId)
  if (!recipient) throw new AppError('User not found', 404, 'NOT_FOUND')
  if (!canMessage(recipient, req.user)) throw new AppError('This user is not accepting messages from you', 403, 'MESSAGES_RESTRICTED')
  const text = cleanText(req.body.text, 5000)
  if (!text) throw new AppError('Message cannot be empty', 400, 'VALIDATION_ERROR', { text: 'Message cannot be empty' })
  let conversation = await findConversation(req.user._id, recipient._id)
  if (!conversation) conversation = await Conversation.create({ participants: [req.user._id, recipient._id] })
  const message = await Message.create({ conversation: conversation._id, sender: req.user._id, recipient: recipient._id, text })
  const unreadCount = (conversation.unreadCounts.get(recipient._id.toString()) || 0) + 1
  conversation.lastMessageText = text
  conversation.lastMessageSender = req.user._id
  conversation.lastMessageAt = message.createdAt
  conversation.unreadCounts.set(recipient._id.toString(), unreadCount)
  await conversation.save()
  const payload = serializeMessage(message)
  const io = req.app.get('io')
  io?.to(`user:${recipient._id.toString()}`).emit('message:new', payload)
  io?.to(`user:${req.user._id.toString()}`).emit('message:new', payload)
  await createNotification({ recipientId: recipient._id, actorId: req.user._id, type: 'message', messageId: message._id, io })
  res.status(201).json({ success: true, data: { message: payload } })
}

export async function markMessageRead(req, res) {
  const message = await Message.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true }, { returnDocument: 'after' })
  if (!message) throw new AppError('Message not found', 404, 'NOT_FOUND')
  const conversation = await Conversation.findById(message.conversation)
  if (conversation) {
    conversation.unreadCounts.set(req.user._id.toString(), 0)
    await conversation.save()
  }
  req.app.get('io')?.to(`user:${message.sender.toString()}`).emit('message:read', { messageId: message._id.toString(), conversationId: message.conversation.toString() })
  res.json({ success: true, data: { message: serializeMessage(message) } })
}

export async function deleteMessage(req, res) {
  const message = await Message.findOne({ _id: req.params.id, sender: req.user._id })
  if (!message) throw new AppError('Message not found', 404, 'NOT_FOUND')
  message.deletedAt = new Date()
  message.text = 'Message deleted'
  await message.save()
  req.app.get('io')?.to(`user:${message.recipient.toString()}`).emit('message:deleted', { messageId: message._id.toString() })
  res.json({ success: true, data: { message: serializeMessage(message) } })
}
