import mongoose from 'mongoose'
import User from '../models/User.js'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import SavedPost from '../models/SavedPost.js'
import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import Notification from '../models/Notification.js'
import { AppError } from '../utils/AppError.js'
import { getMediaPayload } from '../middleware/uploadMiddleware.js'
import { escapeRegex, normalizeUsername } from '../utils/normalizers.js'
import { serializePost, serializeUser } from '../utils/serializers.js'
import { createNotification } from '../services/notificationService.js'
import { cleanText } from '../utils/validation.js'

async function hydratePosts(posts, viewerId) {
  const ids = posts.map((post) => post._id)
  const [comments, saved] = await Promise.all([
    Comment.aggregate([{ $match: { post: { $in: ids } } }, { $group: { _id: '$post', count: { $sum: 1 } } }]),
    SavedPost.find({ user: viewerId, post: { $in: ids } }).select('post').lean(),
  ])
  const commentCounts = new Map(comments.map((item) => [item._id.toString(), item.count]))
  const savedIds = new Set(saved.map((item) => item.post.toString()))
  return posts.map((post) => serializePost({ ...post.toObject(), commentsCount: commentCounts.get(post._id.toString()) || 0 }, viewerId, savedIds))
}

export async function searchUsers(req, res) {
  const query = String(req.query.q || '').trim()
  if (!query) {
    res.json({ success: true, data: [], meta: { hasMore: false, nextCursor: null } })
    return
  }
  const regex = new RegExp(escapeRegex(query), 'i')
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [{ username: regex }, { fullName: regex }],
  }).sort({ username: 1 }).limit(30)
  res.json({ success: true, data: users.map((user) => serializeUser(user, req.user._id)), meta: { hasMore: false, nextCursor: null } })
}

export async function getProfile(req, res) {
  const user = await User.findOne({ username: normalizeUsername(req.params.username) })
  if (!user) throw new AppError('Profile not found', 404, 'NOT_FOUND')
  if (user.accountVisibility === 'private' && user._id.toString() !== req.user._id.toString() && !user.followers.some((id) => id.equals(req.user._id))) {
    const postsCount = await Post.countDocuments({ author: user._id })
    res.json({ success: true, data: { user: serializeUser({ ...user.toObject(), postsCount }, req.user._id), posts: [], isPrivate: true } })
    return
  }
  const [posts, postsCount] = await Promise.all([
    Post.find({ author: user._id }).populate('author').sort({ createdAt: -1 }).limit(30),
    Post.countDocuments({ author: user._id }),
  ])
  const userPayload = serializeUser({ ...user.toObject(), postsCount }, req.user._id)
  res.json({ success: true, data: { user: userPayload, posts: await hydratePosts(posts, req.user._id), isPrivate: false } })
}

export async function updateProfile(req, res) {
  const updates = {}
  if (req.body.fullName !== undefined) {
    const fullName = String(req.body.fullName).trim()
    if (fullName.length < 2 || fullName.length > 80) throw new AppError('Full name must be 2–80 characters', 400, 'VALIDATION_ERROR', { fullName: 'Full name must be 2–80 characters' })
    updates.fullName = fullName
  }
  if (req.body.username !== undefined) {
    const username = normalizeUsername(req.body.username)
    if (!/^[a-z0-9_]{3,24}$/.test(username)) throw new AppError('Use 3–24 lowercase letters, numbers, or underscores', 400, 'VALIDATION_ERROR', { username: 'Use 3–24 lowercase letters, numbers, or underscores' })
    updates.username = username
  }
  if (req.body.phoneNumber !== undefined) updates.phoneNumber = String(req.body.phoneNumber).trim()
  if (req.body.bio !== undefined) updates.bio = cleanText(req.body.bio, 280)
  if (req.file) updates.profilePicture = getMediaPayload(req.file).url
  const user = await User.findByIdAndUpdate(req.user._id, updates, { returnDocument: 'after', runValidators: true })
  res.json({ success: true, data: { user: serializeUser(user, user._id) }, message: 'Profile updated' })
}

export async function followUser(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Invalid user id', 400, 'INVALID_ID')
  if (req.params.id === req.user._id.toString()) throw new AppError('You cannot follow yourself', 400, 'SELF_FOLLOW')
  const target = await User.findById(req.params.id)
  if (!target) throw new AppError('User not found', 404, 'NOT_FOUND')
  await Promise.all([
    User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target._id } }),
    User.findByIdAndUpdate(target._id, { $addToSet: { followers: req.user._id } }),
  ])
  await createNotification({ recipientId: target._id, actorId: req.user._id, type: 'follow', io: req.app.get('io') })
  const updated = await User.findById(target._id)
  res.json({ success: true, data: { relationship: 'following', followersCount: updated.followers.length } })
}

export async function unfollowUser(req, res) {
  const target = await User.findById(req.params.id)
  if (!target) throw new AppError('User not found', 404, 'NOT_FOUND')
  await Promise.all([
    User.findByIdAndUpdate(req.user._id, { $pull: { following: target._id } }),
    User.findByIdAndUpdate(target._id, { $pull: { followers: req.user._id } }),
  ])
  const updated = await User.findById(target._id)
  res.json({ success: true, data: { relationship: 'not-following', followersCount: updated.followers.length } })
}

export async function updateSettings(req, res) {
  const allowed = ['accountVisibility', 'messagePermission', 'themePreference']
  const updates = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]))
  const user = await User.findByIdAndUpdate(req.user._id, updates, { returnDocument: 'after', runValidators: true })
  res.json({ success: true, data: { user: serializeUser(user, user._id) }, message: 'Settings updated' })
}

export async function deleteAccount(req, res) {
  if (String(req.body.username || '').trim().toLowerCase() !== req.user.username) throw new AppError('Enter your username to confirm account deletion', 400, 'CONFIRMATION_REQUIRED')
  const posts = await Post.find({ author: req.user._id }).select('_id')
  const postIds = posts.map((post) => post._id)
  await Promise.all([
    Post.deleteMany({ author: req.user._id }),
    Comment.deleteMany({ $or: [{ user: req.user._id }, { post: { $in: postIds } }] }),
    SavedPost.deleteMany({ $or: [{ user: req.user._id }, { post: { $in: postIds } }] }),
    Message.deleteMany({ $or: [{ sender: req.user._id }, { recipient: req.user._id }] }),
    Conversation.deleteMany({ participants: req.user._id }),
    Notification.deleteMany({ $or: [{ recipient: req.user._id }, { actor: req.user._id }] }),
    User.updateMany({ followers: req.user._id }, { $pull: { followers: req.user._id } }),
    User.updateMany({ following: req.user._id }, { $pull: { following: req.user._id } }),
    User.deleteOne({ _id: req.user._id }),
  ])
  res.status(204).send()
}
