import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // In a real scenario, this would be protected by an API key or Vercel Cron secret
    // to prevent unauthorized invocation.
    
    // Get the current UTC date and start of the day
    const now = new Date();
    // Normalize to date-only (00:00:00)
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Fetch all stores and all active templates
    const stores = await prisma.store.findMany();
    const templates = await prisma.taskTemplate.findMany();

    let createdCount = 0;

    for (const store of stores) {
      for (const template of templates) {
        // Find existing to avoid duplicates
        const existing = await prisma.taskInstance.findUnique({
          where: {
            templateId_storeId_date: {
              templateId: template.id,
              storeId: store.id,
              date: today,
            }
          }
        });

        if (!existing) {
          await prisma.taskInstance.create({
            data: {
              templateId: template.id,
              storeId: store.id,
              date: today,
              status: "PENDING",
              currentStep: 0,
            }
          });
          createdCount++;
        }
      }
    }

    return NextResponse.json({ success: true, createdCount });
  } catch (error: unknown) {
    console.error("Failed to generate tasks:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
