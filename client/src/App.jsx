import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/routeGuards.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import LoadingSpinner from './components/ui/LoadingSpinner.jsx'

const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'))
const HomePage = lazy(() => import('./pages/home/HomePage.jsx'))
const ExplorePage = lazy(() => import('./pages/explore/ExplorePage.jsx'))
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage.jsx'))
const ConversationPage = lazy(() => import('./pages/messages/ConversationPage.jsx'))
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage.jsx'))
const CreatePage = lazy(() => import('./pages/create/CreatePage.jsx'))
const SavedPage = lazy(() => import('./pages/saved/SavedPage.jsx'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage.jsx'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

function PageFallback() {
  return <div className="min-h-screen grid place-items-center bg-[var(--dh-page)]"><LoadingSpinner label="Loading page" /></div>
}

export default function App() {
  return <Suspense fallback={<PageFallback />}><Routes>
    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="messages/:userId" element={<ConversationPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="create" element={<CreatePage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="profile/:username" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Route>
    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes></Suspense>
}
