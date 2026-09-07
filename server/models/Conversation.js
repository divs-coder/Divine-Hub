import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageText: { type: String, default: '' },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lastMessageAt: { type: Date, default: null },
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
)

conversationSchema.index({ participants: 1, lastMessageAt: -1 })

export default mongoose.model('Conversation', conversationSchema)
