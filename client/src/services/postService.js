import api from './api.js'

export async function listPosts(params = {}, signal) {
  const { data } = await api.get('/posts', { params, signal })
  return data
}

export async function createPost(payload, onUploadProgress) {
  const { data } = await api.post('/posts', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
  return data.data.post
}

export async function deletePost(postId) {
  await api.delete(`/posts/${postId}`)
}

export async function likePost(postId) {
  const { data } = await api.post(`/posts/${postId}/like`)
  return data.data.post
}

export async function unlikePost(postId) {
  const { data } = await api.delete(`/posts/${postId}/like`)
  return data.data.post
}

export async function listComments(postId) {
  const { data } = await api.get(`/comments/post/${postId}`)
  return data.data
}

export async function createComment(postId, text) {
  const { data } = await api.post(`/comments/post/${postId}`, { text })
  return data.data.comment
}

export async function deleteComment(commentId) {
  await api.delete(`/comments/${commentId}`)
}

export async function savePost(postId) {
  const { data } = await api.post(`/saved/${postId}`)
  return data.data
}

export async function unsavePost(postId) {
  const { data } = await api.delete(`/saved/${postId}`)
  return data.data
}

export async function listSavedPosts() {
  const { data } = await api.get('/saved')
  return data.data
}
