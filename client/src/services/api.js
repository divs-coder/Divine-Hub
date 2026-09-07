import axios from 'axios'
import { getAccessToken } from './storage.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 15000,
})

let unauthorizedHandler = null
let isHandlingUnauthorized = false

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = error.code === 'ECONNABORTED'
        ? 'The DivineHub API took too long to respond. Check that the backend and MongoDB are running.'
        : 'The DivineHub API is unreachable. Start it with npm run dev:server and check MongoDB.'
    }
    if (error.response?.status === 401 && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true
      unauthorizedHandler?.()
      window.setTimeout(() => {
        isHandlingUnauthorized = false
      }, 1000)
    }
    return Promise.reject(error)
  },
)

export function getApiError(error, fallback = 'Something went wrong') {
  return error?.response?.data || { message: error?.message || fallback }
}

export default api
