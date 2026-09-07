# DivineHub

DivineHub is a full-stack social platform for sharing posts, finding people, saving moments, and having private real-time conversations. It uses a dark ink surround with a warm reading surface, responsive navigation, accessible states, and a database-backed API rather than seeded or hardcoded interactions.

## Features

- Registration and login with bcrypt password hashing and JWT access tokens
- Persistent client sessions, protected routes, one-shot 401/session-expired recovery
- Profile editing with safe avatar uploads, bio, username, phone, and relationship counts
- Public/private account visibility and message permissions
- Cursor-paginated home feed with text, image, and short-video posts
- Upload validation, generated filenames, size limits, previews, progress, and media cleanup on post deletion
- Like/unlike, comments, delete-own-comment, save/unsave, share-link fallback, and delete-own-post
- Indexed people search by username or full name with follow/unfollow actions
- Private conversations persisted in MongoDB
- Socket.IO delivery, authenticated user rooms, online/offline presence, typing indicators, read state, and message deletion
- Notifications for follows, likes, comments, and messages with unread counts
- Saved posts view reusing the canonical post surface
- Light, dark, and system themes persisted locally and to the user profile
- Responsive desktop rail, context rail, mobile top bar, mobile bottom navigation, and split-pane messaging
- Loading skeletons, empty states, retryable errors, upload errors, toasts, confirmation dialogs, and offline/realtime status messaging
- Security middleware: Helmet, restricted CORS, authentication rate limiting, request validation, ownership checks, generated upload names, and centralized errors

## Technology

- Client: React 19, Vite 8, React Router 7, Axios, Socket.IO client, Tailwind CSS v4, Lucide React
- Server: Node.js, Express 5, Socket.IO, JWT, bcryptjs, Multer, Helmet, CORS, express-rate-limit, Mongoose
- Database: MongoDB
- Package manager: npm

## Project structure

```text
DivineHub/
├── client/
│   ├── src/
│   │   ├── components/       # navigation, forms, posts, messaging, feedback, settings
│   │   ├── context/           # auth, theme, socket state
│   │   ├── layouts/           # authenticated and auth shells
│   │   ├── pages/             # route-level screens
│   │   ├── services/          # Axios client and API modules
│   │   ├── utils/             # formatting, validation, error helpers
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

## Requirements

- Node.js 22.12+ (Vite requires Node 20.19+ or Node 22.12+)
- npm
- Docker Desktop with Compose, or MongoDB 6+ locally, or a MongoDB Atlas connection string

## Installation

From the repository root:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

The dependency installation has already been split into client and server package manifests. `npm run install:all` is also available for a clean setup:

```bash
npm run install:all
```

## Environment variables

Copy the root example file:

```bash
copy .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Set values appropriate for your environment:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/divinehub
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=server/uploads
MAX_FILE_SIZE=52428800
```

Optional client variables can be placed in `client/.env`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SERVER_URL=http://localhost:4000
```

Never put `JWT_SECRET`, MongoDB credentials, or other server-only secrets in `client/.env` or any `VITE_` variable.

## MongoDB setup

### Docker Compose — recommended for local development

Docker Desktop must be running first. From the repository root:

```bash
npm run db:up
npm run db:status
npm run dev
```

The Compose service publishes MongoDB at `127.0.0.1:27017`, which matches the default `MONGODB_URI` in `.env.example`. The data is stored in the named Docker volume `divinehub-mongodb-data`, so restarting the container does not remove your local database.

Useful commands:

```bash
npm run db:logs
npm run db:down
```

To remove the database volume as well, use the destructive command below only when you intentionally want a clean database:

```bash
docker compose down -v
```

### Local MongoDB

1. Install MongoDB Community Server.
2. Start the MongoDB service.
3. Keep `MONGODB_URI=mongodb://127.0.0.1:27017/divinehub` in `.env`.
4. Start the API; Mongoose creates the collections and indexes on first use.

### MongoDB Atlas

1. Create a cluster and database user.
2. Add the development machine IP to the Atlas network access list.
3. Replace `MONGODB_URI` with the Atlas connection string.
4. Keep credentials only in the server environment.

## Run the application

Start the local database first when using Docker Compose:

```bash
npm run db:up
```

Run both applications together:

```bash
npm run dev
```

Run them independently:

```bash
npm run dev:server
npm run dev:client
```

The client runs at `http://localhost:5173` and the API runs at `http://localhost:4000` by default.

Production client build:

```bash
npm run build
```

Production API start:

```bash
npm run start:server
```

Health check:

```text
GET http://localhost:4000/api/health
```

## API surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/password`
- `POST /api/auth/logout`
- `GET /api/users/search?q=`
- `GET /api/users/:username`
- `PUT /api/users/profile`
- `POST /api/users/:id/follow`
- `DELETE /api/users/:id/follow`
- `PUT /api/users/settings`
- `DELETE /api/users/account`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/like`
- `DELETE /api/posts/:id/like`
- `GET /api/comments/post/:postId`
- `POST /api/comments/post/:postId`
- `DELETE /api/comments/:id`
- `GET /api/saved`
- `POST /api/saved/:postId`
- `DELETE /api/saved/:postId`
- `GET /api/messages/conversations`
- `GET /api/messages/:userId`
- `POST /api/messages`
- `PUT /api/messages/:id/read`
- `DELETE /api/messages/:id`
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

All successful responses use `{ success: true, data?, message?, meta? }`; errors use `{ success: false, message, code?, fieldErrors? }`.

The authentication contract is available as [docs/openapi.yaml](./docs/openapi.yaml) and can be imported into Swagger UI, Redoc, Postman, or Insomnia.

## Authentication flow

### Register

`POST /api/auth/register` creates a user and returns a JWT access token. The request must include a full name, a 3–24 character lowercase username, a valid email, a valid phone number, and a password with at least 8 characters:

```bash
curl -X POST http://localhost:4000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"fullName":"Ada Lovelace","username":"ada_lovelace","email":"ada@example.com","phoneNumber":"+1 555 010 0200","password":"a-long-password"}'
```

A successful registration returns `201` with `{ success: true, data: { user, token } }`.

### Login

`POST /api/auth/login` accepts either the email address or username as `identifier`:

```bash
curl -X POST http://localhost:4000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"identifier":"ada@example.com","password":"a-long-password"}'
```

A successful login returns `200` with `{ success: true, data: { user, token } }`. Invalid credentials return `401` with `code: "INVALID_CREDENTIALS"`.

### Using and ending a session

Send the returned token to protected endpoints as a bearer token:

```text
Authorization: Bearer <access-token>
```

The client stores the token in local storage under `divinehub.accessToken` and the shared Axios client attaches it automatically. `GET /api/auth/me` restores the current session. `POST /api/auth/logout` returns `204`; logout also clears the local token even if the request cannot reach the server. A later `401` clears the session and sends the user back to login.

`PUT /api/auth/password` requires `currentPassword` and a new password of at least 8 characters. `DELETE /api/users/account` is destructive, requires authentication, and requires the current username in the request body for confirmation; it removes the user’s posts, comments, saves, messages, conversations, notifications, and follow references before returning `204`.

Authentication routes are rate-limited to 60 requests per 15-minute window. Validation errors return `400` with `code: "VALIDATION_ERROR"` and optional `fieldErrors`; duplicate emails or usernames return `409`. If MongoDB is unavailable, database-backed auth routes return `503` with `code: "DATABASE_UNAVAILABLE"`.

## Socket.IO

The client connects only after a JWT-authenticated user exists and sends the token through the Socket.IO `auth` payload. The server verifies the token, joins the socket to `user:{userId}`, and tracks connection counts so a second tab does not incorrectly mark a user offline.

Events used by DivineHub:

- Server → client: `message:new`, `message:read`, `message:deleted`, `typing:start`, `typing:stop`, `presence:update`, `notification:new`
- Client → server: `typing:start`, `typing:stop`, `message:read`

Messages are persisted through REST before being emitted. The client deduplicates incoming messages by id, cleans all listeners on unmount, and keeps REST as the source of truth for history.

## Uploads

Multer stores files in `server/uploads` with generated UUID filenames. Allowed categories are JPEG, PNG, GIF, WebP, MP4, WebM, and QuickTime video. The configured byte limit defaults to 50 MB. The client also validates category and size before publishing. The server never trusts the original filename for storage.

For production, put uploads behind object storage (S3-compatible storage or a managed media service), add content-signature scanning, and serve them from a dedicated CDN or media host.

## Deployment

- Build the client with `npm run build` and serve `client/dist` through a static host or CDN.
- Run the server with `npm run start:server` on a Node 22 runtime.
- Set `CLIENT_URL` to the deployed client origin and configure CORS accordingly.
- Use MongoDB Atlas or a managed MongoDB provider.
- Store `JWT_SECRET` and `MONGODB_URI` in the deployment secret manager.
- Replace local disk uploads with durable object storage before running multiple server instances.
- Add a reverse proxy with HTTPS, request logging, health checks, and process supervision.

## Current limitations and follow-up hardening

- Uploaded media currently uses local disk storage; production deployments should use durable object storage.
- Content-signature scanning and virus scanning are not included; the MIME allowlist and generated names reduce risk but are not a substitute for scanning.
- Password reset and email verification flows are not included because no mail provider was specified.
- The activity view is represented through the existing profile, notification, and saved surfaces; a dedicated derived activity endpoint can be added if audit history needs its own UI.
- Automated integration tests are not included yet; the API contracts and build checks are ready for Supertest/Vitest coverage.
