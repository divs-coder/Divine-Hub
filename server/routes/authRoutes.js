import express from 'express'
import rateLimit from 'express-rate-limit'
import { asyncHandler } from '../utils/asyncHandler.js'
import { authConfig, changePassword, getCurrentUser, login, logout, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many authentication attempts. Try again later.', code: 'RATE_LIMITED' } })

router.post('/register', authLimiter, asyncHandler(register))
router.post('/login', authLimiter, asyncHandler(login))
router.get('/config', asyncHandler(authConfig))
router.get('/me', requireAuth, asyncHandler(getCurrentUser))
router.put('/password', requireAuth, asyncHandler(changePassword))
router.post('/logout', requireAuth, asyncHandler(logout))

export default router
