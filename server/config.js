import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceDirectory = path.resolve(serverDirectory, '..')

if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: path.join(workspaceDirectory, '.env') })
}

const configuredUploadDir = process.env.UPLOAD_DIR || 'server/uploads'

export const config = {
  port: Number(process.env.PORT) || 4000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/divinehub',
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  uploadDir: path.isAbsolute(configuredUploadDir)
    ? configuredUploadDir
    : path.resolve(workspaceDirectory, configuredUploadDir),
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024,
  nodeEnv: process.env.NODE_ENV || 'development',
}
