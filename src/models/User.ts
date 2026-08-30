import { Schema, model, models, type InferSchemaType } from 'mongoose'

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, default: null, index: true },
    role: {
      type: String,
      enum: ['farmer', 'coop_admin', 'agronomist'],
      default: 'farmer',
      index: true,
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'sw', 'ha', 'fr'],
      default: 'en',
    },
    cooperativeId: { type: Schema.Types.ObjectId, ref: 'Cooperative', default: null, index: true },
    subscription: {
      tier: { type: String, enum: ['free', 'pro'], default: 'free' },
      paystackCustomerCode: { type: String, default: null },
      status: {
        type: String,
        enum: ['inactive', 'active', 'past_due', 'cancelled'],
        default: 'inactive',
      },
      renewalDate: { type: Date, default: null },
    },
  },
  { timestamps: true, versionKey: false }
)

UserSchema.index({ phone: 1 }, { unique: true })
UserSchema.index({ cooperativeId: 1, role: 1 })

export type UserDocument = InferSchemaType<typeof UserSchema>

const User = models.User || model('User', UserSchema)

export default User
