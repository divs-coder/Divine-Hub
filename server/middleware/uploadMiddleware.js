import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'
import { config } from '../config.js'
import { AppError } from '../utils/AppError.js'

fs.mkdirSync(config.uploadDir, { recursive: true })

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, config.uploadDir),
  filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
})

const fileFilter = (_req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new AppError('Only images and short videos are allowed.', 400, 'INVALID_FILE_TYPE'))
    return
  }
  callback(null, true)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSize, files: 1 },
})

export function getMediaPayload(file) {
  if (!file) return null
  return {
    url: `/uploads/${file.filename}`,
    type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
  }
}
