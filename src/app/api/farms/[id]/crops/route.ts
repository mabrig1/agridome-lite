import { Types } from 'mongoose'
import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getRequestUserId, unauthorizedIdentityResponse } from '@/lib/requestUser'
import Farm from '@/models/Farm'
import User from '@/models/User'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  const body = await request.json()
  const { id: cropId, cropType, variety, plantingDate, expectedHarvestDate, expectedYieldKg, status, plotLabel, plotSizeAcres, updatedAt } = body

  if (!cropType || !plantingDate || !expectedHarvestDate) {
    return Response.json({ error: 'cropType, plantingDate and expectedHarvestDate are required.' }, { status: 400 })
  }
  if (cropId && !Types.ObjectId.isValid(cropId)) {
    return Response.json({ error: 'Invalid client crop id.' }, { status: 400 })
  }

  await dbConnect()
  const [farm, userResult, activePlotCount] = await Promise.all([
    Farm.findOne({ _id: params.id, userId }),
    User.findById(userId).lean(),
    Farm.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $unwind: '$crops' },
      { $match: { 'crops.status': { $in: ['Planted', 'Growing'] } } },
      { $count: 'count' },
    ]),
  ])

  if (!farm) return Response.json({ error: 'Farm not found.' }, { status: 404 })

  if (cropId) {
    const existing: any = (farm as any).crops.id(cropId)
    if (existing) return Response.json({ farm, crop: existing, replayed: true })
  }

  const user = userResult as any
  const tier = user?.subscription?.tier ?? 'free'
  const activeCount = activePlotCount[0]?.count ?? 0
  const incomingStatus = status ?? 'Planted'
  if (tier === 'free' && ['Planted', 'Growing'].includes(incomingStatus) && activeCount >= 2) {
    return Response.json(
      { error: 'Lite tier supports up to 2 active crop plots. Upgrade to Pro for unlimited plots.', code: 'FREE_PLOT_LIMIT' },
      { status: 402 }
    )
  }

  ;(farm as any).crops.push({
    ...(cropId ? { _id: new Types.ObjectId(cropId) } : {}),
    cropType: String(cropType).trim(),
    variety: String(variety ?? '').trim(),
    plantingDate: new Date(plantingDate),
    expectedHarvestDate: new Date(expectedHarvestDate),
    expectedYieldKg: Number(expectedYieldKg ?? 0),
    status: incomingStatus,
    plotLabel: String(plotLabel ?? '').trim(),
    plotSizeAcres: Number(plotSizeAcres ?? 0),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
  })
  await farm.save()

  return Response.json({ farm, crop: (farm as any).crops[(farm as any).crops.length - 1] }, { status: 201 })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  const body = await request.json()
  const { cropId, patch, taskId, taskPatch, updatedAt } = body
  if (!cropId) return Response.json({ error: 'cropId is required.' }, { status: 400 })

  await dbConnect()
  const farm: any = await Farm.findOne({ _id: params.id, userId })
  if (!farm) return Response.json({ error: 'Farm not found.' }, { status: 404 })

  const crop: any = farm.crops.id(cropId)
  if (!crop) return Response.json({ error: 'Crop not found.' }, { status: 404 })

  const clientUpdatedAt = new Date(updatedAt ?? patch?.updatedAt ?? taskPatch?.updatedAt ?? Date.now())
  const targetUpdatedAt = taskId ? crop.tasks.id(taskId)?.updatedAt : crop.updatedAt

  if (targetUpdatedAt && new Date(targetUpdatedAt).getTime() > clientUpdatedAt.getTime()) {
    return Response.json({ farm, conflict: 'server_newer', applied: false })
  }

  if (taskId) {
    const task: any = crop.tasks.id(taskId)
    if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 })
    Object.assign(task, taskPatch ?? {}, { updatedAt: clientUpdatedAt })
  } else {
    const allowed = ['variety', 'expectedHarvestDate', 'expectedYieldKg', 'status', 'plotLabel', 'plotSizeAcres', 'tasks']
    for (const key of allowed) {
      if (patch?.[key] !== undefined) crop[key] = patch[key]
    }
    crop.updatedAt = clientUpdatedAt
  }

  await farm.save()
  return Response.json({ farm, crop, applied: true })
}
