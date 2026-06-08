import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const directives = await prisma.planogramDirective.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: {
        startDate: 'desc'
      }
    })
    return NextResponse.json({ directives })
  } catch (error: unknown) {
    console.error('Error fetching planograms:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}