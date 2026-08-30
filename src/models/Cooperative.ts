import { Schema, model, models, type InferSchemaType } from 'mongoose'

const CooperativeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    adminUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    region: { type: String, required: true, trim: true, maxlength: 160 },
    memberUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    subscriptionStatus: {
      type: String,
      enum: ['inactive', 'trial', 'active', 'past_due', 'cancelled'],
      default: 'inactive',
    },
  },
  { timestamps: true, versionKey: false }
)

CooperativeSchema.index({ adminUserId: 1, name: 1 })

export type CooperativeDocument = InferSchemaType<typeof CooperativeSchema>

const Cooperative = models.Cooperative || model('Cooperative', CooperativeSchema)

export default Cooperative
