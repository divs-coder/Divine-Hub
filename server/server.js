import http from 'node:http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { config } from './config.js'
import { isDatabaseReady, monitorDatabase } from './db.js'
import { configureSockets } from './sockets/index.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import savedRoutes from './routes/savedRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import { requireDatabase } from './middleware/databaseMiddleware.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()
const httpServer = http.createServer(app)
const io = configureSockets(httpServer)
app.set('io', io)

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Try again later.', code: 'RATE_LIMITED' },
})

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: config.clientUrl, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'))
app.use('/uploads', express.static(config.uploadDir, { maxAge: '1d' }))

app.get('/', (_req, res) => res.json({
  success: true,
  data: {
    service: 'divinehub-server',
    status: isDatabaseReady() ? 'ok' : 'degraded',
    api: '/api',
    health: '/api/health',
  },
}))
app.get('/favicon.ico', (_req, res) => res.status(204).end())
app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: isDatabaseReady() ? 'ok' : 'degraded', database: isDatabaseReady() ? 'connected' : 'unavailable', service: 'divinehub-server' } }))
app.use('/api/auth', requireDatabase, authRoutes)
app.use('/api/users', requireDatabase, apiLimiter, userRoutes)
app.use('/api/posts', requireDatabase, apiLimiter, postRoutes)
app.use('/api/comments', requireDatabase, apiLimiter, commentRoutes)
app.use('/api/saved', requireDatabase, apiLimiter, savedRoutes)
app.use('/api/notifications', requireDatabase, apiLimiter, notificationRoutes)
app.use('/api/messages', requireDatabase, apiLimiter, messageRoutes)
app.use(notFound)
app.use(errorHandler)

const start = async () => {
  monitorDatabase()
  httpServer.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`DivineHub API could not start because port ${config.port} is already in use. Stop the other server or set a different PORT.`)
      process.exit(1)
    }
    throw error
  })
  httpServer.listen(config.port, () => console.log(`DivineHub API listening on http://localhost:${config.port}`))
}

if (process.env.NODE_ENV !== 'test') start()

export { app, httpServer }
