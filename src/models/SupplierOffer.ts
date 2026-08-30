import { Schema, model, models, type InferSchemaType } from 'mongoose'

const SupplierOfferSchema = new Schema(
  {
    supplierName: { type: String, required: true, trim: true, maxlength: 160 },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    category: {
      type: String,
      enum: ['Seeds', 'Fertilizer', 'Pesticide', 'Equipment', 'General'],
      required: true,
      index: true,
    },
    region: { type: String, trim: true, default: 'all', index: true },
    url: { type: String, required: true, trim: true },
    affiliateCode: { type: String, trim: true, default: null },
    verified: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
)

SupplierOfferSchema.index({ category: 1, region: 1, verified: 1, active: 1 })

export type SupplierOfferDocument = InferSchemaType<typeof SupplierOfferSchema>

const SupplierOffer = models.SupplierOffer || model('SupplierOffer', SupplierOfferSchema)

export default SupplierOffer
