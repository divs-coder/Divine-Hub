import express from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { listSaved, savePost, unsavePost } from '../controllers/savedController.js'

const router = express.Router()
router.use(requireAuth)
router.get('/', asyncHandler(listSaved))
router.post('/:postId', asyncHandler(savePost))
router.delete('/:postId', asyncHandler(unsavePost))

export default router
