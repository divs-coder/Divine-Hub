import { MoreHorizontal } from 'lucide-react'
import { formatTimestamp } from '../../utils/formatters.js'
import IconButton from '../ui/IconButton.jsx'

export default function MessageBubble({ message, isMine, showTimestamp, onDelete }) {
  return <div className={`group flex ${isMine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[min(78%,520px)] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}><div className={`relative rounded-[16px] px-3.5 py-2.5 text-sm leading-6 ${isMine ? 'rounded-br-[5px] bg-[var(--dh-primary)] text-white' : 'rounded-bl-[5px] bg-[var(--dh-surface)] text-[var(--dh-text)]'}`}><p className="whitespace-pre-wrap">{message.text}</p>{isMine && !message.deletedAt && <IconButton label="Message options" className="absolute -right-11 top-0 hidden min-h-8 min-w-8 group-hover:inline-flex" onClick={() => onDelete?.(message)}><MoreHorizontal size={14} /></IconButton>}</div>{showTimestamp && <span className="meta mt-1 px-1">{formatTimestamp(message.createdAt)}{isMine && <span className="ml-2">{message.isRead ? 'Read' : message.deliveryState === 'failed' ? 'Not sent' : 'Sent'}</span>}</span>}</div></div>
}
