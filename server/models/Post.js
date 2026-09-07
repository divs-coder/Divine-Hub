import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    originalName: String,
    size: Number,
    mimeType: String,
  },
  { _id: false },
)

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '', maxlength: 5000, trim: true },
    media: { type: mediaSchema, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
)

postSchema.index({ createdAt: -1 })

export default mongoose.model('Post', postSchema)
