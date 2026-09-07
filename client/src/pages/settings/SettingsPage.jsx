import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SettingsSection from '../../components/settings/SettingsSection.jsx'
import ThemeSelector from '../../components/settings/ThemeSelector.jsx'
import PasswordChangeForm from '../../components/settings/PasswordChangeForm.jsx'
import DangerZone from '../../components/settings/DangerZone.jsx'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { deleteAccount, updateSettings } from '../../services/userService.js'
import { changePassword } from '../../services/authService.js'
import { useToast } from '../../components/ui/ToastProvider.jsx'
import { getErrorMessage } from '../../utils/errors.js'

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth()
  const { preference, setPreference } = useTheme()
  const { push } = useToast()
  const [privacy, setPrivacy] = useState({ accountVisibility: user.accountVisibility || 'public', messagePermission: user.messagePermission || 'everyone' })
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const savePrivacy = async (event) => { event.preventDefault(); setSavingPrivacy(true); try { const data = await updateSettings({ ...privacy, themePreference: preference }); setUser(data.user); push({ tone: 'success', message: 'Privacy settings updated' }) } catch (error) { push({ tone: 'error', message: getErrorMessage(error) }) } finally { setSavingPrivacy(false) } }
  const changeTheme = async (next) => { setPreference(next); try { const data = await updateSettings({ ...privacy, themePreference: next }); setUser(data.user) } catch (error) { push({ tone: 'error', message: getErrorMessage(error, 'Theme preference could not be saved.') }) } }
  const handleDelete = async (username) => { try { await deleteAccount(username); await logout() } catch (error) { push({ tone: 'error', message: getErrorMessage(error, 'Account could not be deleted.') }) } }
  return <><PageHeader eyebrow="Settings" title="Your account, your way" description="Manage how DivineHub looks, who can reach you, and how your account stays safe." /><div className="grid lg:grid-cols-[180px_minmax(0,1fr)]"><aside className="hidden border-r border-[var(--dh-border)] px-5 py-8 lg:block"><nav className="sticky top-8 space-y-1 text-sm">{['account', 'privacy', 'appearance', 'security', 'danger'].map((id) => <a key={id} href={`#${id}`} className="block rounded-control px-3 py-2 capitalize text-[var(--dh-muted)] hover:bg-[color-mix(in_srgb,var(--dh-primary)_8%,transparent)] hover:text-[var(--dh-text)]">{id === 'danger' ? 'Danger zone' : id}</a>)}</nav></aside><div><SettingsSection id="account" title="Account" description="Your basic profile information is always available from your profile page."><div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => window.location.href = `/profile/${user.username}`}>Edit profile</Button><p className="self-center text-sm text-[var(--dh-muted)]">Signed in as @{user.username}</p></div></SettingsSection><SettingsSection id="privacy" title="Privacy" description="Choose who can discover and message you."><form className="max-w-xl space-y-4" onSubmit={savePrivacy}><label className="block space-y-1.5 text-sm font-medium">Account visibility<select className="field" value={privacy.accountVisibility} onChange={(event) => setPrivacy((current) => ({ ...current, accountVisibility: event.target.value }))}><option value="public">Public — anyone can see your posts</option><option value="private">Private — approve followers first</option></select></label><label className="block space-y-1.5 text-sm font-medium">Message permissions<select className="field" value={privacy.messagePermission} onChange={(event) => setPrivacy((current) => ({ ...current, messagePermission: event.target.value }))}><option value="everyone">Everyone</option><option value="followers">People who follow you</option><option value="nobody">Nobody</option></select></label><Button type="submit" loading={savingPrivacy} loadingLabel="Saving…">Save changes</Button></form></SettingsSection><SettingsSection id="appearance" title="Appearance" description="Use a theme that feels right for the room you are in."><ThemeSelector value={preference} onChange={changeTheme} /></SettingsSection><SettingsSection id="security" title="Security" description="Update your password or end this session on the current device."><PasswordChangeForm onSave={async (payload) => { await changePassword(payload); push({ tone: 'success', message: 'Password changed' }) }} /></SettingsSection><SettingsSection id="danger" title="Danger zone" description="These actions cannot be undone."><DangerZone username={user.username} onDelete={handleDelete} onLogout={logout} /></SettingsSection></div></div></>
}
