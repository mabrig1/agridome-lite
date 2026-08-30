import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { buildDailyAdvice, type ForecastPoint } from '@/lib/agronomy'
import { getRequestUserId, unauthorizedIdentityResponse } from '@/lib/requestUser'
import Farm from '@/models/Farm'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  const farmId = request.nextUrl.searchParams.get('farmId')
  if (!farmId) return Response.json({ error: 'farmId is required.' }, { status: 400 })

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) return Response.json({ error: 'OPENWEATHER_API_KEY is not configured.' }, { status: 503 })

  await dbConnect()
  const farm: any = await Farm.findOne({ _id: farmId, userId }).lean()
  if (!farm) return Response.json({ error: 'Farm not found.' }, { status: 404 })

  const [longitude, latitude] = farm.location.coordinates
  const url = new URL('https://api.openweathermap.org/data/2.5/forecast')
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))
  url.searchParams.set('appid', apiKey)
  url.searchParams.set('units', 'metric')

  const weatherResponse = await fetch(url, { next: { revalidate: 900 } })
  if (!weatherResponse.ok) {
    return Response.json({ error: 'Weather provider is unavailable.' }, { status: 502 })
  }

  const payload = await weatherResponse.json()
  const forecast: ForecastPoint[] = (payload.list ?? []).slice(0, 16).map((item: any) => ({
    timestamp: new Date(item.dt * 1000).toISOString(),
    temperatureC: Number(item.main?.temp ?? 0),
    humidity: Number(item.main?.humidity ?? 0),
    precipitationProbability: Math.round(Number(item.pop ?? 0) * 100),
    condition: String(item.weather?.[0]?.description ?? 'Unknown'),
  }))

  const crops = (farm.crops ?? []).map((crop: any) => ({
    cropType: crop.cropType,
    expectedHarvestDate: crop.expectedHarvestDate,
    status: crop.status,
  }))

  return Response.json({
    farmId,
    region: farm.location.region,
    fetchedAt: new Date().toISOString(),
    forecast,
    advice: buildDailyAdvice(forecast, crops),
  })
}
