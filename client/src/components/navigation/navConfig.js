import { Bookmark, Bell, Compass, Home, MessageCircle, Settings, SquarePen, UserRound } from 'lucide-react'

export const navItems = [
  { label: 'Home', to: '/', icon: Home, end: true },
  { label: 'Explore', to: '/explore', icon: Compass },
  { label: 'Messages', to: '/messages', icon: MessageCircle, badge: 'messages' },
  { label: 'Notifications', to: '/notifications', icon: Bell, badge: 'notifications' },
  { label: 'Create', to: '/create', icon: SquarePen },
  { label: 'Saved', to: '/saved', icon: Bookmark },
  { label: 'Profile', to: '/profile/me', icon: UserRound },
  { label: 'Settings', to: '/settings', icon: Settings },
]
