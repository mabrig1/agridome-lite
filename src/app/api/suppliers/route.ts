import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import SupplierOffer from '@/models/SupplierOffer'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category')
  const region = request.nextUrl.searchParams.get('region')

  await dbConnect()
  const query: Record<string, unknown> = { verified: true, active: true }
  if (category) query.category = category
  if (region) query.region = { $in: [region, 'all'] }

  const offers = await SupplierOffer.find(query)
    .select('supplierName title category region url affiliateCode')
    .sort({ updatedAt: -1 })
    .limit(12)
    .lean()

  return Response.json({ offers })
}
