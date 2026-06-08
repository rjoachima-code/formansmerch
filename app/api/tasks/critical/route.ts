import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ task: null });

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const task = await prisma.taskInstance.findFirst({
      where: {
        storeId: store.id,
        date: today,
        template: {
          isCritical: true
        },
        status: {
          not: "COMPLETED"
        }
      },
      include: {
        template: true
      }
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Failed to fetch critical task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
