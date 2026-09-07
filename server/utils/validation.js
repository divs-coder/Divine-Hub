import mongoose from 'mongoose'
import { AppError } from './AppError.js'
import { normalizeEmail, normalizeUsername } from './normalizers.js'

export function requireFields(values, fields) {
  const fieldErrors = {}
  for (const field of fields) {
    if (!values[field] || !String(values[field]).trim()) {
      fieldErrors[field] = `${field} is required`
    }
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR', fieldErrors)
  }
}

export function validateRegistration(values) {
  requireFields(values, ['fullName', 'username', 'email', 'phoneNumber', 'password'])
  const username = normalizeUsername(values.username)
  const email = normalizeEmail(values.email)
  const fieldErrors = {}

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    fieldErrors.username = 'Use 3–24 lowercase letters, numbers, or underscores'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Enter a valid email address'
  }
  if (!/^\+?[0-9 ()-]{7,20}$/.test(values.phoneNumber.trim())) {
    fieldErrors.phoneNumber = 'Enter a valid phone number'
  }
  if (values.password.length < 8) {
    fieldErrors.password = 'Use at least 8 characters'
  }
  if (values.fullName.trim().length < 2 || values.fullName.trim().length > 80) {
    fieldErrors.fullName = 'Full name must be 2–80 characters'
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError('Please check the highlighted fields', 400, 'VALIDATION_ERROR', fieldErrors)
  }
  return { ...values, username, email, fullName: values.fullName.trim(), phoneNumber: values.phoneNumber.trim() }
}

export function assertObjectId(value, field = 'id') {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(`Invalid ${field}`, 400, 'INVALID_ID')
  }
}

export function cleanText(value, maxLength = 5000) {
  const text = String(value ?? '').trim()
  if (text.length > maxLength) {
    throw new AppError(`Text must be ${maxLength} characters or fewer`, 400, 'VALIDATION_ERROR')
  }
  return text
}
