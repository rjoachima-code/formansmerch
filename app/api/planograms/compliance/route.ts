import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { directiveId, storeId, managerId, complianceImage, s3Key, notes } = body

    if (!directiveId || !storeId || !managerId || !complianceImage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const compliance = await prisma.planogramCompliance.create({
      data: {
        directiveId,
        storeId,
        managerId,
        complianceImage,
        s3Key,
        notes
      }
    })

    return NextResponse.json({ success: true, compliance })
  } catch (error: any) {
    console.error('Error submitting compliance:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}