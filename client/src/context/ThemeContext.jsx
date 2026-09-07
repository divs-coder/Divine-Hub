import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'divinehub.theme'

function getInitialPreference() {
  return window.localStorage.getItem(STORAGE_KEY) || 'system'
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(getInitialPreference)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const resolvedTheme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event) => setSystemDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
    window.localStorage.setItem(STORAGE_KEY, preference)
  }, [preference, resolvedTheme])

  const value = useMemo(() => ({
    preference,
    resolvedTheme,
    setPreference: (next) => setPreferenceState(next),
  }), [preference, resolvedTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used within ThemeProvider')
  return value
}
