function stringId(value) {
  return value?._id?.toString?.() || value?.toString?.() || null
}

export function serializeUser(user, viewerId = null) {
  if (!user) return null
  const source = user.toObject ? user.toObject() : user
  const id = stringId(source)
  const viewer = stringId(viewerId)
  const followers = (source.followers || []).map(stringId)
  const following = (source.following || []).map(stringId)
  const relationship = id === viewer ? 'self' : followers.includes(viewer) ? 'following' : 'not-following'

  return {
    id,
    fullName: source.fullName,
    username: source.username,
    ...(id === viewer ? { email: source.email, phoneNumber: source.phoneNumber } : {}),
    profilePicture: source.profilePicture || null,
    bio: source.bio || '',
    followersCount: followers.length,
    followingCount: following.length,
    postsCount: source.postsCount ?? 0,
    relationship,
    accountVisibility: source.accountVisibility,
    messagePermission: source.messagePermission,
    themePreference: source.themePreference,
    isOnline: Boolean(source.isOnline),
    lastSeen: source.lastSeen || null,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  }
}

export function serializePost(post, viewerId = null, savedIds = new Set()) {
  if (!post) return null
  const source = post.toObject ? post.toObject() : post
  const likes = (source.likes || []).map(stringId)
  const id = stringId(source)
  return {
    id,
    author: serializeUser(source.author, viewerId),
    text: source.text || '',
    media: source.media || null,
    likesCount: likes.length,
    commentsCount: source.commentsCount || 0,
    isLiked: viewerId ? likes.includes(stringId(viewerId)) : false,
    isSaved: savedIds.has(id),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  }
}

export function serializeMessage(message) {
  if (!message) return null
  const source = message.toObject ? message.toObject() : message
  return {
    id: stringId(source),
    conversationId: stringId(source.conversation),
    senderId: stringId(source.sender),
    recipientId: stringId(source.recipient),
    text: source.deletedAt ? 'Message deleted' : source.text,
    isRead: Boolean(source.isRead),
    deliveryState: source.deletedAt ? 'deleted' : 'sent',
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  }
}

export function serializeNotification(notification) {
  if (!notification) return null
  const source = notification.toObject ? notification.toObject() : notification
  const actor = source.actor && source.actor.fullName ? serializeUser(source.actor) : source.actor
  return {
    id: stringId(source),
    type: source.type,
    actor,
    postId: stringId(source.post),
    messageId: stringId(source.message),
    isRead: Boolean(source.isRead),
    createdAt: source.createdAt,
  }
}
