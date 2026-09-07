import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import IconButton from './IconButton.jsx'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])
  const push = useCallback((toast) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current.slice(-3), { id, tone: 'info', duration: 4500, ...toast }])
    if (toast.duration !== 0) window.setTimeout(() => dismiss(id), toast.duration || 4500)
    return id
  }, [dismiss])
  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])
  return <ToastContext.Provider value={value}>{children}<div className="fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">{toasts.map((toast) => {
    const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? XCircle : Info
    return <div key={toast.id} className="flex items-start gap-3 rounded-[14px] border border-[var(--dh-border)] bg-[var(--dh-surface)] p-3 text-sm text-[var(--dh-text)] shadow-dialog"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${toast.tone === 'error' ? 'text-[var(--dh-liked)]' : toast.tone === 'success' ? 'text-[var(--dh-presence)]' : 'text-[var(--dh-primary)]'}`} /><span className="min-w-0 flex-1 leading-5">{toast.message}</span><IconButton label="Dismiss" onClick={() => dismiss(toast.id)}><X size={15} /></IconButton></div>
  })}</div></ToastContext.Provider>
}

export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used within ToastProvider')
  return value
}
