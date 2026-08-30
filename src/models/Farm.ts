import { Schema, model, models, type InferSchemaType } from 'mongoose'

const TaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['Watering', 'Fertilizer', 'Pesticide', 'Harvest', 'General'],
      default: 'General',
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true, versionKey: false }
)

const CropSchema = new Schema(
  {
    cropType: { type: String, required: true, trim: true, index: true },
    variety: { type: String, trim: true, default: '' },
    plantingDate: { type: Date, required: true },
    expectedHarvestDate: { type: Date, required: true },
    expectedYieldKg: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['Planted', 'Growing', 'Harvested', 'Failed'],
      default: 'Planted',
    },
    plotLabel: { type: String, trim: true, default: '' },
    plotSizeAcres: { type: Number, min: 0, default: 0 },
    tasks: { type: [TaskSchema], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true, versionKey: false }
)

const FinancialLogSchema = new Schema(
  {
    type: { type: String, enum: ['Expense', 'Revenue'], required: true },
    category: {
      type: String,
      enum: ['Seeds', 'Fertilizer', 'Labor', 'Equipment', 'Crop_Sales'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    cropId: { type: Schema.Types.ObjectId, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true, versionKey: false }
)

const FarmSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cooperativeId: { type: Schema.Types.ObjectId, ref: 'Cooperative', default: null, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value: number[]) => value.length === 2,
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
      region: { type: String, required: true, trim: true, maxlength: 160 },
    },
    totalSizeAcres: { type: Number, required: true, min: 0 },
    crops: { type: [CropSchema], default: [] },
    financialLogs: { type: [FinancialLogSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
)

FarmSchema.index({ location: '2dsphere' })
FarmSchema.index({ userId: 1, updatedAt: -1 })
FarmSchema.index({ cooperativeId: 1, updatedAt: -1 })

export type FarmDocument = InferSchemaType<typeof FarmSchema>

const Farm = models.Farm || model('Farm', FarmSchema)

export default Farm
