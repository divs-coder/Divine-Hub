import { describe, it, expect } from 'vitest'
import { getApi, createTestUser, authHeaders } from './helpers.js'

const api = getApi()

describe('Auth - registration', () => {
  it('registers with valid data and returns a token', async () => {
    const res = await api.post('/api/auth/register').send({
      fullName: 'Ada Lovelace',
      username: 'ada_lovelace',
      email: 'ada@example.com',
      phoneNumber: '+1 555 010 0200',
      password: 'a-long-password',
    })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeTypeOf('string')
    expect(res.body.data.user.username).toBe('ada_lovelace')
  })

  it('rejects missing fields with 400 and field errors', async () => {
    const res = await api.post('/api/auth/register').send({ fullName: 'A' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
    expect(res.body.fieldErrors).toHaveProperty('username')
    expect(res.body.fieldErrors).toHaveProperty('email')
    expect(res.body.fieldErrors).toHaveProperty('phoneNumber')
    expect(res.body.fieldErrors).toHaveProperty('password')
  })

  it('rejects invalid email', async () => {
    const res = await api.post('/api/auth/register').send({
      fullName: 'Ada Lovelace',
      username: 'ada',
      email: 'not-an-email',
      phoneNumber: '+15550100200',
      password: 'password123',
    })
    expect(res.status).toBe(400)
    expect(res.body.fieldErrors).toHaveProperty('email')
  })

  it('rejects short password', async () => {
    const res = await api.post('/api/auth/register').send({
      fullName: 'Ada Lovelace',
      username: 'ada',
      email: 'ada@example.com',
      phoneNumber: '+15550100200',
      password: 'short',
    })
    expect(res.status).toBe(400)
    expect(res.body.fieldErrors).toHaveProperty('password')
  })

  it('rejects duplicate email with 409', async () => {
    await api.post('/api/auth/register').send({
      fullName: 'Ada Lovelace',
      username: 'ada1',
      email: 'dup@example.com',
      phoneNumber: '+15550100200',
      password: 'password123',
    })
    const res = await api.post('/api/auth/register').send({
      fullName: 'Other Person',
      username: 'ada2',
      email: 'dup@example.com',
      phoneNumber: '+15550100211',
      password: 'password123',
    })
    expect(res.status).toBe(409)
    expect(res.body.code).toBe('EMAIL_EXISTS')
  })

  it('rejects duplicate username with 409', async () => {
    await api.post('/api/auth/register').send({
      fullName: 'Ada Lovelace',
      username: 'sameuser',
      email: 'one@example.com',
      phoneNumber: '+15550100200',
      password: 'password123',
    })
    const res = await api.post('/api/auth/register').send({
      fullName: 'Other Person',
      username: 'sameuser',
      email: 'two@example.com',
      phoneNumber: '+15550100211',
      password: 'password123',
    })
    expect(res.status).toBe(409)
    expect(res.body.code).toBe('USERNAME_EXISTS')
  })
})

describe('Auth - login', () => {
  it('logs in with email and returns a token', async () => {
    await api.post('/api/auth/register').send({
      fullName: 'Login User',
      username: 'loginuser',
      email: 'login@example.com',
      phoneNumber: '+15550100200',
      password: 'password123',
    })
    const res = await api.post('/api/auth/login').send({
      identifier: 'login@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeTypeOf('string')
  })

  it('logs in with username', async () => {
    await api.post('/api/auth/register').send({
      fullName: 'Login User',
      username: 'loginuser2',
      email: 'login2@example.com',
      phoneNumber: '+15550100200',
      password: 'password123',
    })
    const res = await api.post('/api/auth/login').send({
      identifier: 'loginuser2',
      password: 'password123',
    })
    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeTypeOf('string')
    expect(res.body.data.user.username).toBe('loginuser2')
  })

  it('rejects wrong password with 401', async () => {
    await api.post('/api/auth/register').send({
      fullName: 'Login User',
      username: 'loginuser3',
      email: 'login3@example.com',
      phoneNumber: '+15550100200',
      password: 'password123',
    })
    const res = await api.post('/api/auth/login').send({
      identifier: 'login3@example.com',
      password: 'wrong',
    })
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('INVALID_CREDENTIALS')
  })

  it('rejects unknown user with 401', async () => {
    const res = await api.post('/api/auth/login').send({
      identifier: 'nobody@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('INVALID_CREDENTIALS')
  })

  it('rejects missing identifier or password', async () => {
    const res = await api.post('/api/auth/login').send({ password: 'password123' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})

describe('Auth - authenticated', () => {
  it('GET /auth/config returns clientUrl', async () => {
    const res = await api.get('/api/auth/config')
    expect(res.status).toBe(200)
    expect(res.body.data.clientUrl).toBe('http://localhost:5173')
  })

  it('GET /me without token returns 401', async () => {
    const res = await api.get('/api/auth/me')
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })

  it('GET /me with valid token returns the user', async () => {
    const user = await createTestUser({ username: 'meuser', email: 'me@example.com' })
    const res = await api.get('/api/auth/me').set(authHeaders(user))
    expect(res.status).toBe(200)
    expect(res.body.data.user.username).toBe('meuser')
    expect(res.body.data.user).not.toHaveProperty('passwordHash')
  })
})

describe('Auth - password change', () => {
  it('changes password with correct current password', async () => {
    const user = await createTestUser()
    const res = await api
      .put('/api/auth/password')
      .set(authHeaders(user))
      .send({ currentPassword: 'password123', newPassword: 'newpass123' })
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Password changed')
  })

  it('rejects password change with wrong current password', async () => {
    const user = await createTestUser()
    const res = await api
      .put('/api/auth/password')
      .set(authHeaders(user))
      .send({ currentPassword: 'wrong', newPassword: 'newpass123' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('INVALID_PASSWORD')
  })

  it('rejects short new password', async () => {
    const user = await createTestUser()
    const res = await api
      .put('/api/auth/password')
      .set(authHeaders(user))
      .send({ currentPassword: 'password123', newPassword: 'short' })
    expect(res.status).toBe(400)
    expect(res.body.fieldErrors).toHaveProperty('newPassword')
  })
})
