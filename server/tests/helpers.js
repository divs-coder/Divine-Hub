import { hash } from 'bcryptjs'
import request from 'supertest'
import User from '../models/User.js'
import { signAccessToken } from '../utils/jwt.js'
import { app } from '../server.js'

const api = request(app)

export function getApi() {
  return api
}

export async function createTestUser(overrides = {}) {
  const data = {
    fullName: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    phoneNumber: '+15550100200',
    passwordHash: await hash('password123', 12),
    ...overrides,
  }
  if (data.password) {
    data.passwordHash = await hash(data.password, 12)
    delete data.password
  }
  const doc = new User(data)
  await doc.save()
  return doc
}

export function signToken(user) {
  return signAccessToken(user._id)
}

export function authHeaders(user) {
  return { Authorization: `Bearer ${signToken(user)}` }
}
