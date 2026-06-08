import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock function for system notifications
async function notifyRolesForAcknowledgment(policyId: string, version: number) {
  console.log(`[SYSTEM NOTIFICATION] Policy ${policyId} published at version ${version}.`);
  console.log(`[SYSTEM NOTIFICATION] Digital acknowledgment signature required from affected roles.`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Parse the JSON array for escalationProcess safely
    let parsedEscalationProcess;
    try {
      parsedEscalationProcess = JSON.parse(body.escalationProcess);
      if (!Array.isArray(parsedEscalationProcess)) {
        throw new Error("Must be an array");
      }
    } catch (e) {
      return NextResponse.json({ error: 'escalationProcess must be a valid JSON array' }, { status: 400 });
    }

    // Try to find an existing policy with the same title to treat as a version upgrade
    // In a real system, you'd probably pass a policyId if editing, but for this exercise we match by title
    const existingPolicy = await prisma.corporatePolicy.findFirst({
      where: { title: body.title },
      orderBy: { version: 'desc' }
    });

    let savedPolicy;

    if (existingPolicy) {
      // Archive previous version and increment version integer
      savedPolicy = await prisma.$transaction(async (tx) => {
        // Create an audit log
        await tx.policyAudit.create({
          data: {
            policyId: existingPolicy.id,
            version: existingPolicy.version,
            updatedBy: 'system-admin', // Mock user
            archivedContent: JSON.parse(JSON.stringify(existingPolicy)),
          }
        });

        // Update the policy record with new data and increment version
        return tx.corporatePolicy.update({
          where: { id: existingPolicy.id },
          data: {
            purpose: body.purpose,
            scope: body.scope,
            policyStatement: body.policyStatement,
            responsibilities: body.responsibilities,
            procedures: body.procedures,
            complianceAndEnforcement: body.complianceAndEnforcement,
            definitions: body.definitions,
            effectiveDate: new Date(body.effectiveDate),
            escalationProcess: parsedEscalationProcess,
            version: existingPolicy.version + 1
          }
        });
      });
    } else {
      // Create a brand new policy at version 1
      savedPolicy = await prisma.corporatePolicy.create({
        data: {
          title: body.title,
          purpose: body.purpose,
          scope: body.scope,
          policyStatement: body.policyStatement,
          responsibilities: body.responsibilities,
          procedures: body.procedures,
          complianceAndEnforcement: body.complianceAndEnforcement,
          definitions: body.definitions,
          effectiveDate: new Date(body.effectiveDate),
          escalationProcess: parsedEscalationProcess,
          version: 1
        }
      });
    }

    // Trigger automated system notification
    await notifyRolesForAcknowledgment(savedPolicy.id, savedPolicy.version);

    return NextResponse.json({ success: true, policyId: savedPolicy.id, version: savedPolicy.version });

  } catch (error: any) {
    console.error('Error publishing policy:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
