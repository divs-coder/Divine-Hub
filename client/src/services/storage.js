const TOKEN_KEY = 'divinehub.accessToken'

export function getAccessToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}
