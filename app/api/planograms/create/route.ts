import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PlanogramSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  department: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  requiredFixtures: z.array(z.string()).optional(),
  referenceImage: z.string().url(),
  s3Key: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = PlanogramSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const directive = await prisma.planogramDirective.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || '',
        requiredFixtures: parsed.data.requiredFixtures || [],
        referenceImage: parsed.data.referenceImage
      }
    })

    return NextResponse.json({ success: true, directive })
  } catch (error: unknown) {
    console.error('Error creating planogram:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}