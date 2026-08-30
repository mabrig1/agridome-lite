import { Types } from 'mongoose'
import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getRequestUserId, unauthorizedIdentityResponse } from '@/lib/requestUser'
import Farm from '@/models/Farm'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  await dbConnect()
  const farms = await Farm.find({ userId }).sort({ updatedAt: -1 }).lean()
  return Response.json({ farms })
}

export async function POST(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  const body = await request.json()
  const { id, name, location, totalSizeAcres, cooperativeId, updatedAt } = body

  if (!name || !location?.coordinates || !location?.region || Number(totalSizeAcres) < 0) {
    return Response.json({ error: 'Invalid farm payload.' }, { status: 400 })
  }
  if (id && !Types.ObjectId.isValid(id)) {
    return Response.json({ error: 'Invalid client farm id.' }, { status: 400 })
  }

  const [longitude, latitude] = location.coordinates.map(Number)
  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    longitude < -180 || longitude > 180 ||
    latitude < -90 || latitude > 90
  ) {
    return Response.json({ error: 'Invalid GeoJSON coordinates.' }, { status: 400 })
  }

  await dbConnect()

  if (id) {
    const existing = await Farm.findOne({ _id: id, userId })
    if (existing) return Response.json({ farm: existing, replayed: true })
  }

  const farm = await Farm.create({
    ...(id ? { _id: new Types.ObjectId(id) } : {}),
    userId,
    cooperativeId: cooperativeId || null,
    name: String(name).trim(),
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
      region: String(location.region).trim(),
    },
    totalSizeAcres: Number(totalSizeAcres),
    ...(updatedAt ? { updatedAt: new Date(updatedAt) } : {}),
  })

  return Response.json({ farm }, { status: 201 })
}
