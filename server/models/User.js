import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 24, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phoneNumber: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    profilePicture: { type: String, default: null },
    bio: { type: String, default: '', maxlength: 280, trim: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    accountVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    messagePermission: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
    themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    lastSeen: { type: Date, default: null },
  },
  { timestamps: true },
)

userSchema.index({ fullName: 'text', username: 'text' })
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash
    delete ret.__v
    return ret
  },
})

export default mongoose.model('User', userSchema)
