import { Types } from 'mongoose'
import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getRequestUserId, unauthorizedIdentityResponse } from '@/lib/requestUser'
import Farm from '@/models/Farm'

export const runtime = 'nodejs'

function summarize(logs: any[]) {
  const expenses = logs.filter(log => log.type === 'Expense').reduce((sum, log) => sum + Number(log.amount || 0), 0)
  const revenue = logs.filter(log => log.type === 'Revenue').reduce((sum, log) => sum + Number(log.amount || 0), 0)
  const netProfit = revenue - expenses
  const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0
  return { expenses, revenue, netProfit, marginPercent }
}

function summarizeByCrop(farm: any) {
  return (farm.crops ?? []).map((crop: any) => {
    const cropId = String(crop._id)
    const cropLogs = (farm.financialLogs ?? []).filter((log: any) => log.cropId && String(log.cropId) === cropId)
    return {
      cropId,
      cropType: crop.cropType,
      variety: crop.variety,
      plotLabel: crop.plotLabel,
      plotSizeAcres: crop.plotSizeAcres,
      ...summarize(cropLogs),
    }
  })
}

export async function GET(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  const farmId = request.nextUrl.searchParams.get('farmId')
  if (!farmId) return Response.json({ error: 'farmId is required.' }, { status: 400 })

  await dbConnect()
  const farm: any = await Farm.findOne({ _id: farmId, userId }).lean()
  if (!farm) return Response.json({ error: 'Farm not found.' }, { status: 404 })

  return Response.json({
    logs: farm.financialLogs ?? [],
    summary: summarize(farm.financialLogs ?? []),
    byCrop: summarizeByCrop(farm),
  })
}

export async function POST(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  const body = await request.json()
  const { id: logId, farmId, type, category, amount, date, description, cropId, updatedAt } = body
  if (!farmId || !['Expense', 'Revenue'].includes(type) || !category || Number(amount) < 0) {
    return Response.json({ error: 'Invalid finance payload.' }, { status: 400 })
  }
  if (logId && !Types.ObjectId.isValid(logId)) {
    return Response.json({ error: 'Invalid client finance id.' }, { status: 400 })
  }

  await dbConnect()
  const farm: any = await Farm.findOne({ _id: farmId, userId })
  if (!farm) return Response.json({ error: 'Farm not found.' }, { status: 404 })

  if (logId) {
    const existing: any = farm.financialLogs.id(logId)
    if (existing) {
      return Response.json({
        log: existing,
        replayed: true,
        summary: summarize(farm.financialLogs),
        byCrop: summarizeByCrop(farm),
      })
    }
  }

  farm.financialLogs.push({
    ...(logId ? { _id: new Types.ObjectId(logId) } : {}),
    type,
    category,
    amount: Number(amount),
    date: date ? new Date(date) : new Date(),
    description: String(description ?? '').trim(),
    cropId: cropId || null,
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
  })
  await farm.save()

  return Response.json(
    {
      log: farm.financialLogs[farm.financialLogs.length - 1],
      summary: summarize(farm.financialLogs),
      byCrop: summarizeByCrop(farm),
    },
    { status: 201 }
  )
}

export async function PATCH(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  const body = await request.json()
  const { farmId, logId, patch, updatedAt } = body
  if (!farmId || !logId) return Response.json({ error: 'farmId and logId are required.' }, { status: 400 })

  await dbConnect()
  const farm: any = await Farm.findOne({ _id: farmId, userId })
  if (!farm) return Response.json({ error: 'Farm not found.' }, { status: 404 })

  const log: any = farm.financialLogs.id(logId)
  if (!log) return Response.json({ error: 'Financial log not found.' }, { status: 404 })

  const clientUpdatedAt = new Date(updatedAt ?? patch?.updatedAt ?? Date.now())
  if (log.updatedAt && new Date(log.updatedAt).getTime() > clientUpdatedAt.getTime()) {
    return Response.json({
      log,
      conflict: 'server_newer',
      applied: false,
      summary: summarize(farm.financialLogs),
      byCrop: summarizeByCrop(farm),
    })
  }

  for (const key of ['type', 'category', 'amount', 'date', 'description', 'cropId']) {
    if (patch?.[key] !== undefined) log[key] = patch[key]
  }
  log.updatedAt = clientUpdatedAt
  await farm.save()

  return Response.json({
    log,
    applied: true,
    summary: summarize(farm.financialLogs),
    byCrop: summarizeByCrop(farm),
  })
}
