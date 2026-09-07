import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { config } from '../config.js'
import { AppError } from '../utils/AppError.js'
import { signAccessToken } from '../utils/jwt.js'
import { normalizeEmail, normalizeUsername } from '../utils/normalizers.js'
import { serializeUser } from '../utils/serializers.js'
import { validateRegistration } from '../utils/validation.js'

export async function register(req, res) {
  const values = validateRegistration(req.body)
  const passwordHash = await bcrypt.hash(values.password, 12)
  const user = await User.create({
    fullName: values.fullName,
    username: values.username,
    email: values.email,
    phoneNumber: values.phoneNumber,
    passwordHash,
  })
  const token = signAccessToken(user._id)
  res.status(201).json({ success: true, data: { user: serializeUser(user, user._id), token } })
}

export async function login(req, res) {
  const identifier = String(req.body.identifier || '').trim()
  const password = String(req.body.password || '')
  if (!identifier || !password) {
    throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR', {
      ...(identifier ? {} : { identifier: 'Email or username is required' }),
      ...(password ? {} : { password: 'Password is required' }),
    })
  }
  const normalizedIdentifier = identifier.includes('@') ? normalizeEmail(identifier) : normalizeUsername(identifier)
  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
  }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }
  const token = signAccessToken(user._id)
  res.json({ success: true, data: { user: serializeUser(user, user._id), token } })
}

export async function getCurrentUser(req, res) {
  res.json({ success: true, data: { user: serializeUser(req.user, req.user._id) } })
}

export async function changePassword(req, res) {
  const currentPassword = String(req.body.currentPassword || '')
  const newPassword = String(req.body.newPassword || '')
  if (!currentPassword || !newPassword) {
    throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR', {
      ...(currentPassword ? {} : { currentPassword: 'Current password is required' }),
      ...(newPassword ? {} : { newPassword: 'New password is required' }),
    })
  }
  if (newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400, 'VALIDATION_ERROR', { newPassword: 'Use at least 8 characters' })
  const user = await User.findById(req.user._id).select('+passwordHash')
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD')
  user.passwordHash = await bcrypt.hash(newPassword, 12)
  await user.save()
  res.json({ success: true, message: 'Password changed' })
}

export async function logout(_req, res) {
  res.status(204).send()
}

export function authConfig(_req, res) {
  res.json({ success: true, data: { clientUrl: config.clientUrl } })
}
