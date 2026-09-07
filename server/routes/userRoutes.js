import express from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'
import { deleteAccount, followUser, getProfile, searchUsers, unfollowUser, updateProfile, updateSettings } from '../controllers/userController.js'

const router = express.Router()
router.use(requireAuth)
router.get('/search', asyncHandler(searchUsers))
router.get('/:username', asyncHandler(getProfile))
router.put('/profile', upload.single('profilePicture'), asyncHandler(updateProfile))
router.post('/:id/follow', asyncHandler(followUser))
router.delete('/:id/follow', asyncHandler(unfollowUser))
router.put('/settings', asyncHandler(updateSettings))
router.delete('/account', asyncHandler(deleteAccount))

export default router
