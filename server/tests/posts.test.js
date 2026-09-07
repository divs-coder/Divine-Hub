import { describe, it, expect } from 'vitest'
import { getApi, createTestUser, authHeaders } from './helpers.js'

const api = getApi()

describe('Posts', () => {
  it('creates a post with text', async () => {
    const user = await createTestUser()
    const res = await api.post('/api/posts').set(authHeaders(user)).send({ text: 'Hello world' })
    expect(res.status).toBe(201)
    expect(res.body.data.post.text).toBe('Hello world')
  })

  it('rejects a post with no text and no media', async () => {
    const user = await createTestUser()
    const res = await api.post('/api/posts').set(authHeaders(user)).send({})
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('EMPTY_POST')
  })

  it('lists posts with pagination', async () => {
    const user = await createTestUser()
    await Promise.all(
      Array.from({ length: 3 }, (_, i) =>
        api.post('/api/posts').set(authHeaders(user)).send({ text: `Post ${i}` }),
      ),
    )
    const res = await api.get('/api/posts').set(authHeaders(user))
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(3)
    expect(res.body.meta.hasMore).toBe(false)
  })

  it('gets a post by valid id', async () => {
    const user = await createTestUser()
    const createRes = await api.post('/api/posts').set(authHeaders(user)).send({ text: 'Find me' })
    const res = await api.get(`/api/posts/${createRes.body.data.post.id}`).set(authHeaders(user))
    expect(res.status).toBe(200)
    expect(res.body.data.post.text).toBe('Find me')
  })

  it('returns 400 for invalid post id', async () => {
    const user = await createTestUser()
    const res = await api.get('/api/posts/not-a-real-id').set(authHeaders(user))
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('INVALID_ID')
  })

  it('returns 404 for non-existent post', async () => {
    const user = await createTestUser()
    const res = await api.get('/api/posts/507f1f77bcf86cd799439011').set(authHeaders(user))
    expect(res.status).toBe(404)
  })

  it('deletes own post', async () => {
    const user = await createTestUser()
    const createRes = await api.post('/api/posts').set(authHeaders(user)).send({ text: 'Delete me' })
    const res = await api.delete(`/api/posts/${createRes.body.data.post.id}`).set(authHeaders(user))
    expect(res.status).toBe(204)
  })

  it('prevents deleting others posts', async () => {
    const owner = await createTestUser({ username: 'owner', email: 'owner@example.com' })
    const intruder = await createTestUser({ username: 'intruder', email: 'intruder@example.com' })
    const createRes = await api.post('/api/posts').set(authHeaders(owner)).send({ text: 'Mine' })
    const res = await api.delete(`/api/posts/${createRes.body.data.post.id}`).set(authHeaders(intruder))
    expect(res.status).toBe(403)
  })

  it('likes a post', async () => {
    const owner = await createTestUser({ username: 'owner1', email: 'owner1@example.com' })
    const liker = await createTestUser({ username: 'liker1', email: 'liker1@example.com' })
    const createRes = await api.post('/api/posts').set(authHeaders(owner)).send({ text: 'Like me' })
    const res = await api.post(`/api/posts/${createRes.body.data.post.id}/like`).set(authHeaders(liker))
    expect(res.status).toBe(200)
    expect(res.body.data.post.likesCount).toBe(1)
    expect(res.body.data.post.isLiked).toBe(true)
  })

  it('unlikes a post', async () => {
    const owner = await createTestUser({ username: 'owner2', email: 'owner2@example.com' })
    const liker = await createTestUser({ username: 'liker2', email: 'liker2@example.com' })
    const createRes = await api.post('/api/posts').set(authHeaders(owner)).send({ text: 'Like me' })
    const postId = createRes.body.data.post.id
    await api.post(`/api/posts/${postId}/like`).set(authHeaders(liker))
    const res = await api.delete(`/api/posts/${postId}/like`).set(authHeaders(liker))
    expect(res.status).toBe(200)
    expect(res.body.data.post.likesCount).toBe(0)
    expect(res.body.data.post.isLiked).toBe(false)
  })
})
