import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId.toString() }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret)
}
