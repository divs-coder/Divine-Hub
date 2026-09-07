import Comment from '../models/Comment.js'
import Post from '../models/Post.js'
import { AppError } from '../utils/AppError.js'
import { serializeUser } from '../utils/serializers.js'
import { createNotification } from '../services/notificationService.js'
import { assertObjectId, cleanText } from '../utils/validation.js'

function serializeComment(comment, viewerId) {
  return {
    id: comment._id.toString(),
    postId: comment.post.toString(),
    user: serializeUser(comment.user, viewerId),
    text: comment.text,
    canDelete: comment.user._id.toString() === viewerId.toString(),
    createdAt: comment.createdAt,
  }
}

export async function listComments(req, res) {
  assertObjectId(req.params.postId, 'post id')
  const comments = await Comment.find({ post: req.params.postId }).populate('user').sort({ createdAt: 1 }).limit(100)
  res.json({ success: true, data: comments.map((comment) => serializeComment(comment, req.user._id)) })
}

export async function createComment(req, res) {
  assertObjectId(req.params.postId, 'post id')
  const text = cleanText(req.body.text, 1000)
  if (!text) throw new AppError('Comment cannot be empty', 400, 'VALIDATION_ERROR', { text: 'Comment cannot be empty' })
  const post = await Post.findById(req.params.postId)
  if (!post) throw new AppError('This post is no longer available.', 404, 'NOT_FOUND')
  const comment = await Comment.create({ post: post._id, user: req.user._id, text })
  const hydrated = await Comment.findById(comment._id).populate('user')
  await createNotification({ recipientId: post.author, actorId: req.user._id, type: 'comment', postId: post._id, io: req.app.get('io') })
  res.status(201).json({ success: true, data: { comment: serializeComment(hydrated, req.user._id) } })
}

export async function deleteComment(req, res) {
  assertObjectId(req.params.id, 'comment id')
  const comment = await Comment.findById(req.params.id)
  if (!comment) throw new AppError('Comment not found', 404, 'NOT_FOUND')
  if (comment.user.toString() !== req.user._id.toString()) throw new AppError('You can only delete your own comments', 403, 'FORBIDDEN')
  await comment.deleteOne()
  res.status(204).send()
}
