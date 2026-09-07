import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { verifyAccessToken } from '../utils/jwt.js'

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    if (!header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED')
    }
    const token = header.slice(7)
    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.sub)
    if (!user) throw new AppError('Invalid token', 401, 'INVALID_TOKEN')
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401, 'INVALID_TOKEN'))
      return
    }
    next(error)
  }
}
