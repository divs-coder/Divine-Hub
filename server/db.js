import mongoose from 'mongoose'
import { config } from './config.js'

let connecting = false
let retryTimer = null

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1
}

export async function connectDatabase() {
  if (isDatabaseReady() || connecting) return isDatabaseReady()
  connecting = true
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    })
    console.log('MongoDB connected')
    return true
  } catch (error) {
    console.error(`MongoDB unavailable at ${config.mongodbUri}: ${error.message}`)
    return false
  } finally {
    connecting = false
  }
}

export function monitorDatabase() {
  const attempt = async () => {
    if (await connectDatabase()) return
    retryTimer = setTimeout(attempt, 10000)
  }
  attempt()
  return () => {
    if (retryTimer) clearTimeout(retryTimer)
  }
}

export async function disconnectDatabase() {
  if (retryTimer) clearTimeout(retryTimer)
  await mongoose.disconnect()
}
