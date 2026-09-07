import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import { normalizeUsername, normalizeEmail, escapeRegex } from '../utils/normalizers.js'
import { getLimit, getCursorDate, getPageMeta } from '../utils/pagination.js'
import { AppError } from '../utils/AppError.js'
import { signAccessToken, verifyAccessToken } from '../utils/jwt.js'
import { cleanText, assertObjectId } from '../utils/validation.js'
import { serializeUser, serializePost, serializeMessage } from '../utils/serializers.js'

describe('normalizers', () => {
  describe('normalizeUsername', () => {
    it('lowercases and trims', () => {
      expect(normalizeUsername('  Ada_Lovelace  ')).toBe('ada_lovelace')
    })
    it('removes leading @', () => {
      expect(normalizeUsername('@ada_lovelace')).toBe('ada_lovelace')
    })
    it('handles empty string', () => {
      expect(normalizeUsername('')).toBe('')
    })
  })

  describe('normalizeEmail', () => {
    it('lowercases and trims', () => {
      expect(normalizeEmail('  Ada.Lovelace@EXAMPLE.COM  ')).toBe('ada.lovelace@example.com')
    })
    it('handles empty string', () => {
      expect(normalizeEmail('')).toBe('')
    })
  })

  describe('escapeRegex', () => {
    it('escapes special regex characters', () => {
      expect(escapeRegex('hello.world*')).toBe('hello\\.world\\*')
    })
    it('handles empty string', () => {
      expect(escapeRegex('')).toBe('')
    })
    it('escapes brackets and parentheses', () => {
      expect(escapeRegex('a[b]c(d)e')).toBe('a\\[b\\]c\\(d\\)e')
    })
  })
})

describe('pagination', () => {
  describe('getLimit', () => {
    it('returns default for missing value', () => {
      expect(getLimit()).toBe(20)
    })
    it('returns default for invalid value', () => {
      expect(getLimit('abc')).toBe(20)
      expect(getLimit(-1)).toBe(20)
      expect(getLimit(0)).toBe(20)
    })
    it('caps at maximum', () => {
      expect(getLimit(1000)).toBe(50)
      expect(getLimit(100, 20, 50)).toBe(50)
    })
    it('returns the value when within range', () => {
      expect(getLimit(10)).toBe(10)
      expect(getLimit(30, 20, 50)).toBe(30)
    })
  })

  describe('getCursorDate', () => {
    it('returns null for missing cursor', () => {
      expect(getCursorDate()).toBe(null)
    })
    it('parses ISO date string', () => {
      const date = getCursorDate('2024-01-01T00:00:00.000Z')
      expect(date).toBeInstanceOf(Date)
    })
    it('returns null for invalid date', () => {
      expect(getCursorDate('not-a-date')).toBe(null)
    })
  })

  describe('getPageMeta', () => {
    it('returns all items when fewer than limit', () => {
      const items = [{ a: 1 }, { b: 2 }]
      const result = getPageMeta(items, 20)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBe(null)
      expect(result.items).toHaveLength(2)
    })
    it('sets hasMore and nextCursor when truncated', () => {
      const items = [
        { a: 1, createdAt: new Date('2024-01-01') },
        { b: 2, createdAt: new Date('2024-01-02') },
        { c: 3, createdAt: new Date('2024-01-03') },
      ]
      const result = getPageMeta(items, 2)
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBeTruthy()
      expect(result.items).toHaveLength(2)
    })
  })
})

describe('AppError', () => {
  it('creates error with all properties', () => {
    const err = new AppError('Test error', 400, 'TEST_ERROR', { field: 'error message' })
    expect(err.message).toBe('Test error')
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('TEST_ERROR')
    expect(err.fieldErrors).toEqual({ field: 'error message' })
    expect(err.isOperational).toBe(true)
    expect(err.name).toBe('AppError')
  })

  it('uses defaults for missing arguments', () => {
    const err = new AppError('Test')
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('SERVER_ERROR')
    expect(err.fieldErrors).toBeUndefined()
  })
})

describe('JWT', () => {
  it('signs and verifies a token', async () => {
    const token = signAccessToken('user123')
    const payload = verifyAccessToken(token)
    expect(payload.sub).toBe('user123')
  })

  it('throws for invalid token', async () => {
    expect(() => verifyAccessToken('not.a.token')).toThrow()
  })

  it('throws for expired token', async () => {
    const expired = jwt.sign({ sub: 'user123' }, 'test-secret', { expiresIn: '-1s' })
    expect(() => verifyAccessToken(expired)).toThrow()
  })
})

describe('validation', () => {
  describe('cleanText', () => {
    it('trims and returns text', () => {
      expect(cleanText('  hello  ')).toBe('hello')
    })
    it('returns empty string for null/undefined', () => {
      expect(cleanText(null)).toBe('')
      expect(cleanText(undefined)).toBe('')
    })
    it('throws for text exceeding maxLength', () => {
      expect(() => cleanText('hello world', 5)).toThrow()
    })
  })

  describe('assertObjectId', () => {
    it('does not throw for valid id', () => {
      expect(() => assertObjectId('507f1f77bcf86cd799439011')).not.toThrow()
    })
    it('throws for invalid id', () => {
      expect(() => assertObjectId('not-valid')).toThrow(AppError)
      expect(() => assertObjectId('not-valid')).toThrow('Invalid id')
    })
    it('uses custom field name in error', () => {
      expect(() => assertObjectId('bad', 'post id')).toThrow('Invalid post id')
    })
  })
})

describe('serializers', () => {
  describe('serializeUser', () => {
    it('returns null for null user', () => {
      expect(serializeUser(null)).toBe(null)
    })
    it('marks self relationship correctly', () => {
      const user = { _id: '1', username: 'test', fullName: 'Test', followers: [], following: [] }
      expect(serializeUser(user, '1').relationship).toBe('self')
    })
    it('marks following relationship', () => {
      const user = { _id: '2', username: 'test', fullName: 'Test', followers: ['1'], following: [] }
      expect(serializeUser(user, '1').relationship).toBe('following')
    })
    it('marks not-following relationship', () => {
      const user = { _id: '3', username: 'test', fullName: 'Test', followers: [], following: [] }
      expect(serializeUser(user, '1').relationship).toBe('not-following')
    })
    it('excludes sensitive fields for non-self', () => {
      const user = { _id: '2', username: 'test', fullName: 'Test', email: 'a@b.com', phoneNumber: '123', followers: [], following: [] }
      const result = serializeUser(user, '1')
      expect(result).not.toHaveProperty('email')
      expect(result).not.toHaveProperty('phoneNumber')
    })
    it('includes sensitive fields for self', () => {
      const user = { _id: '1', username: 'test', fullName: 'Test', email: 'a@b.com', phoneNumber: '123', followers: [], following: [] }
      const result = serializeUser(user, '1')
      expect(result.email).toBe('a@b.com')
      expect(result.phoneNumber).toBe('123')
    })
  })

  describe('serializePost', () => {
    it('returns null for null post', () => {
      expect(serializePost(null)).toBe(null)
    })
    it('marks liked state correctly', () => {
      const post = {
        _id: 'p1',
        likes: ['user1', 'user2'],
        author: { _id: 'a1', username: 'auth', fullName: 'Author', followers: [], following: [] },
      }
      expect(serializePost(post, 'user1').isLiked).toBe(true)
      expect(serializePost(post, 'user3').isLiked).toBe(false)
    })
    it('marks saved state', () => {
      const post = {
        _id: 'p1',
        likes: [],
        author: { _id: 'a1', username: 'auth', fullName: 'Author', followers: [], following: [] },
      }
      expect(serializePost(post, 'user1', new Set(['p1'])).isSaved).toBe(true)
      expect(serializePost(post, 'user1', new Set()).isSaved).toBe(false)
    })
  })

  describe('serializeMessage', () => {
    it('shows "Message deleted" for deleted messages', () => {
      const msg = {
        _id: 'm1',
        text: 'hello',
        deletedAt: new Date(),
        conversation: 'c1',
        sender: 's1',
        recipient: 'r1',
        isRead: false,
      }
      const result = serializeMessage(msg)
      expect(result.text).toBe('Message deleted')
      expect(result.deliveryState).toBe('deleted')
    })
  })
})
