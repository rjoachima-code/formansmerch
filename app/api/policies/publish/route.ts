import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PolicySchema = z.object({
  title: z.string().min(1),
  purpose: z.string().optional(),
  scope: z.string().optional(),
  policyStatement: z.string().optional(),
  responsibilities: z.string().optional(),
  procedures: z.string().optional(),
  complianceAndEnforcement: z.string().optional(),
  definitions: z.string().optional(),
  effectiveDate: z.string().datetime(),
  escalationProcess: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
        ctx.addIssue({ code: 'custom', message: 'Must be a JSON array' });
        return z.NEVER;
      }
      return parsed;
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Must be valid JSON' });
      return z.NEVER;
    }
  })
});

async function notifyRolesForAcknowledgment(policyId: string, version: number) {
  console.log(`[SYSTEM NOTIFICATION] Policy ${policyId} published at version ${version}.`);
  console.log(`[SYSTEM NOTIFICATION] Digital acknowledgment signature required from affected roles.`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = PolicySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const existingPolicy = await prisma.corporatePolicy.findFirst({
      where: { title: parsed.data.title },
      orderBy: { version: 'desc' }
    });

    let savedPolicy;

    if (existingPolicy) {
      savedPolicy = await prisma.$transaction(async (tx) => {
        await tx.policyAudit.create({
          data: {
            policyId: existingPolicy.id,
            version: existingPolicy.version,
            updatedBy: 'system-admin',
            archivedContent: JSON.parse(JSON.stringify(existingPolicy)),
          }
        });

        return tx.corporatePolicy.update({
          where: { id: existingPolicy.id },
          data: {
            purpose: parsed.data.purpose,
            scope: parsed.data.scope,
            policyStatement: parsed.data.policyStatement,
            responsibilities: parsed.data.responsibilities,
            procedures: parsed.data.procedures,
            complianceAndEnforcement: parsed.data.complianceAndEnforcement,
            definitions: parsed.data.definitions,
            effectiveDate: new Date(parsed.data.effectiveDate),
            escalationProcess: parsed.data.escalationProcess,
            version: existingPolicy.version + 1
          }
        });
      });
    } else {
      savedPolicy = await prisma.corporatePolicy.create({
        data: {
          title: parsed.data.title,
          purpose: parsed.data.purpose,
          scope: parsed.data.scope,
          policyStatement: parsed.data.policyStatement,
          responsibilities: parsed.data.responsibilities,
          procedures: parsed.data.procedures,
          complianceAndEnforcement: parsed.data.complianceAndEnforcement,
          definitions: parsed.data.definitions,
          effectiveDate: new Date(parsed.data.effectiveDate),
          escalationProcess: parsed.data.escalationProcess,
          version: 1
        }
      });
    }

    await notifyRolesForAcknowledgment(savedPolicy.id, savedPolicy.version);

    return NextResponse.json({ success: true, policyId: savedPolicy.id, version: savedPolicy.version });

  } catch (error: unknown) {
    console.error('Error publishing policy:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
