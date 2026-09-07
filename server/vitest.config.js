import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
    testTimeout: 15000,
    hookTimeout: 120000,
    envFile: false,
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret-key-for-integration-tests',
      JWT_EXPIRES_IN: '7d',
      MONGODB_URI: '',
      CLIENT_URL: 'http://localhost:5173',
      UPLOAD_DIR: 'server/uploads',
      MAX_FILE_SIZE: '52428800',
      PORT: '4000',
    },
  },
})
