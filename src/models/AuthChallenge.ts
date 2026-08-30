import { Schema, model, models, type InferSchemaType } from 'mongoose'

const AuthChallengeSchema = new Schema(
  {
    phone: { type: String, required: true, index: true },
    name: { type: String, trim: true, maxlength: 120, default: '' },
    provider: { type: String, enum: ['termii', 'twilio'], required: true },
    providerChallengeId: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
)

AuthChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
AuthChallengeSchema.index({ phone: 1, createdAt: -1 })

export type AuthChallengeDocument = InferSchemaType<typeof AuthChallengeSchema>

const AuthChallenge = models.AuthChallenge || model('AuthChallenge', AuthChallengeSchema)

export default AuthChallenge
