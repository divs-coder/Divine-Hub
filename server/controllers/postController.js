import fs from 'node:fs/promises'
import path from 'node:path'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import SavedPost from '../models/SavedPost.js'
import Notification from '../models/Notification.js'
import { config } from '../config.js'
import { AppError } from '../utils/AppError.js'
import { getMediaPayload } from '../middleware/uploadMiddleware.js'
import { serializePost } from '../utils/serializers.js'
import { getCursorDate, getLimit } from '../utils/pagination.js'
import { cleanText, assertObjectId } from '../utils/validation.js'
import { createNotification } from '../services/notificationService.js'

async function serializePosts(posts, viewerId) {
  const ids = posts.map((post) => post._id)
  if (ids.length === 0) return []
  const [comments, saved] = await Promise.all([
    Comment.aggregate([{ $match: { post: { $in: ids } } }, { $group: { _id: '$post', count: { $sum: 1 } } }]),
    SavedPost.find({ user: viewerId, post: { $in: ids } }).select('post').lean(),
  ])
  const counts = new Map(comments.map((entry) => [entry._id.toString(), entry.count]))
  const savedIds = new Set(saved.map((entry) => entry.post.toString()))
  return posts.map((post) => serializePost({ ...post.toObject(), commentsCount: counts.get(post._id.toString()) || 0 }, viewerId, savedIds))
}

export async function listPosts(req, res) {
  const limit = getLimit(req.query.limit)
  const cursorDate = getCursorDate(req.query.cursor)
  const filter = cursorDate ? { createdAt: { $lt: cursorDate } } : {}
  const posts = await Post.find(filter).populate('author').sort({ createdAt: -1 }).limit(limit + 1)
  const hasMore = posts.length > limit
  const visible = hasMore ? posts.slice(0, limit) : posts
  res.json({ success: true, data: await serializePosts(visible, req.user._id), meta: { hasMore, nextCursor: hasMore ? visible.at(-1)?.createdAt : null } })
}

export async function createPost(req, res) {
  const text = cleanText(req.body.text, 5000)
  if (!text && !req.file) throw new AppError('Add text or media before publishing', 400, 'EMPTY_POST')
  const post = await Post.create({ author: req.user._id, text, media: getMediaPayload(req.file) })
  const hydrated = await Post.findById(post._id).populate('author')
  res.status(201).json({ success: true, data: { post: serializePost(hydrated, req.user._id) } })
}

export async function getPost(req, res) {
  assertObjectId(req.params.id)
  const post = await Post.findById(req.params.id).populate('author')
  if (!post) throw new AppError('This post is no longer available.', 404, 'NOT_FOUND')
  const [payload] = await serializePosts([post], req.user._id)
  res.json({ success: true, data: { post: payload } })
}

export async function deletePost(req, res) {
  assertObjectId(req.params.id)
  const post = await Post.findById(req.params.id)
  if (!post) throw new AppError('This post is no longer available.', 404, 'NOT_FOUND')
  if (post.author.toString() !== req.user._id.toString()) throw new AppError('You can only delete your own posts', 403, 'FORBIDDEN')
  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    SavedPost.deleteMany({ post: post._id }),
    Notification.deleteMany({ post: post._id }),
    post.deleteOne(),
  ])
  if (post.media?.url) {
    await fs.unlink(path.join(config.uploadDir, path.basename(post.media.url))).catch(() => {})
  }
  res.status(204).send()
}

export async function likePost(req, res) {
  assertObjectId(req.params.id)
  const post = await Post.findById(req.params.id)
  if (!post) throw new AppError('This post is no longer available.', 404, 'NOT_FOUND')
  const alreadyLiked = post.likes.some((id) => id.equals(req.user._id))
  if (!alreadyLiked) {
    post.likes.addToSet(req.user._id)
    await post.save()
    await createNotification({ recipientId: post.author, actorId: req.user._id, type: 'like', postId: post._id, io: req.app.get('io') })
  }
  const hydrated = await Post.findById(post._id).populate('author')
  const [payload] = await serializePosts([hydrated], req.user._id)
  res.json({ success: true, data: { post: payload } })
}

export async function unlikePost(req, res) {
  assertObjectId(req.params.id)
  const post = await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } }, { returnDocument: 'after' }).populate('author')
  if (!post) throw new AppError('This post is no longer available.', 404, 'NOT_FOUND')
  const [payload] = await serializePosts([post], req.user._id)
  res.json({ success: true, data: { post: payload } })
}
