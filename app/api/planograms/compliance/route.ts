import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ComplianceSchema = z.object({
  directiveId: z.string().uuid(),
  storeId: z.string().uuid(),
  managerId: z.string().uuid(),
  complianceImage: z.string().url(),
  s3Key: z.string(),
  notes: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = ComplianceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const compliance = await prisma.planogramCompliance.create({
      data: parsed.data
    })

    return NextResponse.json({ success: true, compliance })
  } catch (error: unknown) {
    console.error('Error submitting compliance:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}