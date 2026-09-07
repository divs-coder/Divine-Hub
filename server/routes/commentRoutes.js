import express from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { createComment, deleteComment, listComments } from '../controllers/commentController.js'

const router = express.Router()
router.use(requireAuth)
router.get('/post/:postId', asyncHandler(listComments))
router.post('/post/:postId', asyncHandler(createComment))
router.delete('/:id', asyncHandler(deleteComment))

export default router
