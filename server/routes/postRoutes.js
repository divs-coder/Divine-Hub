import express from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'
import { createPost, deletePost, getPost, likePost, listPosts, unlikePost } from '../controllers/postController.js'

const router = express.Router()
router.use(requireAuth)
router.get('/', asyncHandler(listPosts))
router.post('/', upload.single('media'), asyncHandler(createPost))
router.get('/:id', asyncHandler(getPost))
router.delete('/:id', asyncHandler(deletePost))
router.post('/:id/like', asyncHandler(likePost))
router.delete('/:id/like', asyncHandler(unlikePost))

export default router
