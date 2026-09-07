import { beforeAll, afterAll, beforeEach, vi } from 'vitest'
import mongoose from 'mongoose'

vi.mock('../db.js', () => ({
  isDatabaseReady: () => mongoose.connection.readyState === 1,
  monitorDatabase: vi.fn(),
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn().mockResolvedValue(undefined),
}))

let mongod

beforeAll(async () => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
  } catch (err) {
    console.warn('MongoDB memory server unavailable, tests requiring database may fail:', err.message)
    throw err
  }
}, 600000)

afterAll(async () => {
  await mongoose.disconnect()
  if (mongod) await mongod.stop()
}, 30000)

beforeEach(async () => {
  if (mongoose.connection.readyState !== 1) return
  const collections = Object.keys(mongoose.connection.collections)
  await Promise.all(collections.map((key) => mongoose.connection.collections[key].deleteMany({})))
}, 10000)
