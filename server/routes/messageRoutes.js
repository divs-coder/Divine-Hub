import express from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { deleteMessage, listConversations, listMessages, markMessageRead, sendMessage } from '../controllers/messageController.js'

const router = express.Router()
router.use(requireAuth)
router.get('/conversations', asyncHandler(listConversations))
router.get('/:userId', asyncHandler(listMessages))
router.post('/', asyncHandler(sendMessage))
router.put('/:id/read', asyncHandler(markMessageRead))
router.delete('/:id', asyncHandler(deleteMessage))

export default router
