import Button from './Button.jsx'
import Modal from './Modal.jsx'

export default function ConfirmationDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm delete', loading = false }) {
  return <Modal open={open} onClose={onClose} title={title} size="sm"><p className="text-sm leading-6 text-[var(--dh-muted)]">{description}</p><div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="danger" onClick={onConfirm} loading={loading} loadingLabel="Deleting…">{confirmLabel}</Button></div></Modal>
}
