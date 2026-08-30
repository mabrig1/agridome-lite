import { Types } from 'mongoose'
import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getRequestUserId, unauthorizedIdentityResponse } from '@/lib/requestUser'
import User from '@/models/User'
import Farm from '@/models/Farm'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  await dbConnect()
  const user: any = await User.findById(userId).lean()
  if (!user || user.role !== 'coop_admin' || !user.cooperativeId) {
    return Response.json({ error: 'Cooperative admin access required.' }, { status: 403 })
  }

  const cooperativeId = new Types.ObjectId(user.cooperativeId)
  const [summary, cropMix, inputTasks] = await Promise.all([
    Farm.aggregate([
      { $match: { cooperativeId } },
      {
        $group: {
          _id: null,
          farms: { $sum: 1 },
          totalAcreage: { $sum: '$totalSizeAcres' },
          projectedHarvestKg: { $sum: { $sum: '$crops.expectedYieldKg' } },
        },
      },
    ]),
    Farm.aggregate([
      { $match: { cooperativeId } },
      { $unwind: '$crops' },
      { $match: { 'crops.status': { $in: ['Planted', 'Growing'] } } },
      {
        $group: {
          _id: '$crops.cropType',
          activePlots: { $sum: 1 },
          acres: { $sum: '$crops.plotSizeAcres' },
          projectedHarvestKg: { $sum: '$crops.expectedYieldKg' },
        },
      },
      { $sort: { acres: -1 } },
    ]),
    Farm.aggregate([
      { $match: { cooperativeId } },
      { $unwind: '$crops' },
      { $unwind: '$crops.tasks' },
      { $match: { 'crops.tasks.completed': false } },
      { $group: { _id: '$crops.tasks.category', pendingTasks: { $sum: 1 } } },
      { $sort: { pendingTasks: -1 } },
    ]),
  ])

  return Response.json({
    cooperativeId: String(user.cooperativeId),
    summary: summary[0] ?? { farms: 0, totalAcreage: 0, projectedHarvestKg: 0 },
    cropMix,
    inputRequirements: inputTasks,
  })
}
