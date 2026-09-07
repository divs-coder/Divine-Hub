import mongoose from 'mongoose'
import { AppError } from '../utils/AppError.js'

export function requireDatabase(_req, _res, next) {
  if (mongoose.connection.readyState !== 1) {
    next(new AppError('Database is unavailable. Start MongoDB or check MONGODB_URI, then try again.', 503, 'DATABASE_UNAVAILABLE'))
    return
  }
  next()
}
