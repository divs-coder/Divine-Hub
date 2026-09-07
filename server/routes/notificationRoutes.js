import express from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../controllers/notificationController.js'

const router = express.Router()
router.use(requireAuth)
router.get('/', asyncHandler(listNotifications))
router.put('/read-all', asyncHandler(markAllNotificationsRead))
router.put('/:id/read', asyncHandler(markNotificationRead))

export default router
