import SavedPost from '../models/SavedPost.js'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import { AppError } from '../utils/AppError.js'
import { assertObjectId } from '../utils/validation.js'
import { serializePost } from '../utils/serializers.js'

async function serializeSavedPosts(savedPosts, viewerId) {
  const ids = savedPosts.map((saved) => saved.post._id)
  const counts = await Comment.aggregate([{ $match: { post: { $in: ids } } }, { $group: { _id: '$post', count: { $sum: 1 } } }])
  const countMap = new Map(counts.map((entry) => [entry._id.toString(), entry.count]))
  const savedIds = new Set(ids.map((id) => id.toString()))
  return savedPosts.map((saved) => serializePost({ ...saved.post.toObject(), commentsCount: countMap.get(saved.post._id.toString()) || 0 }, viewerId, savedIds))
}

export async function listSaved(req, res) {
  const savedPosts = await SavedPost.find({ user: req.user._id }).populate({ path: 'post', populate: { path: 'author' } }).sort({ createdAt: -1 }).limit(50)
  const available = savedPosts.filter((saved) => saved.post)
  res.json({ success: true, data: await serializeSavedPosts(available, req.user._id), meta: { hasMore: false, nextCursor: null } })
}

export async function savePost(req, res) {
  assertObjectId(req.params.postId, 'post id')
  const post = await Post.findById(req.params.postId)
  if (!post) throw new AppError('This post is no longer available.', 404, 'NOT_FOUND')
  await SavedPost.updateOne({ user: req.user._id, post: post._id }, { $setOnInsert: { user: req.user._id, post: post._id } }, { upsert: true })
  res.json({ success: true, data: { isSaved: true } })
}

export async function unsavePost(req, res) {
  assertObjectId(req.params.postId, 'post id')
  await SavedPost.deleteOne({ user: req.user._id, post: req.params.postId })
  res.json({ success: true, data: { isSaved: false } })
}
