import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, department, startDate, endDate, requiredFixtures, referenceImage, s3Key } = body

    if (!title || !department || !startDate || !endDate || !referenceImage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const directive = await prisma.planogramDirective.create({
      data: {
        title,
        description: description || '',
        department,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        requiredFixtures: requiredFixtures || [],
        referenceImage,
        s3Key
      }
    })

    return NextResponse.json({ success: true, directive })
  } catch (error: any) {
    console.error('Error creating planogram:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}