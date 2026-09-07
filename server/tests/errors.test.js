import { describe, it, expect } from 'vitest'
import { getApi, createTestUser, authHeaders } from './helpers.js'

const api = getApi()

describe('Error handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await api.get('/api/nonexistent')
    expect(res.status).toBe(404)
    expect(res.body.code).toBe('NOT_FOUND')
  })

  it('returns 401 for protected routes without a token', async () => {
    const res = await api.get('/api/posts')
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })

  it('returns 401 for an invalid token', async () => {
    const user = await createTestUser()
    const res = await api
      .get('/api/posts')
      .set({ Authorization: 'Bearer not-a-valid-token' })
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('INVALID_TOKEN')
  })

  it('returns 400 for invalid comment id (CastError)', async () => {
    const user = await createTestUser()
    const res = await api.delete('/api/comments/bad-id').set(authHeaders(user))
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('INVALID_ID')
  })

  it('returns 400 for invalid user id in follow route', async () => {
    const user = await createTestUser()
    const res = await api.post('/api/users/not-a-valid-id/follow').set(authHeaders(user))
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('INVALID_ID')
  })

  it('returns 400 for invalid post id in saved route', async () => {
    const user = await createTestUser()
    const res = await api.post('/api/saved/bad-id').set(authHeaders(user))
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('INVALID_ID')
  })

  it('normalizes email and username on registration', async () => {
    const res = await api.post('/api/auth/register').send({
      fullName: '  Norm User  ',
      username: '  NORM_USER  ',
      email: '  Norm.User@Example.COM  ',
      phoneNumber: '+15550100200',
      password: 'password123',
    })
    expect(res.status).toBe(201)
    expect(res.body.data.user.username).toBe('norm_user')
    expect(res.body.data.user.email).toBe('norm.user@example.com')
  })
})
