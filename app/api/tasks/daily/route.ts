import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // In real app, get storeId from session
    // For demo, we just get the first store
    const store = await prisma.store.findFirst();
    
    if (!store) {
       return NextResponse.json({ tasks: [], store: null });
    }

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const tasks = await prisma.taskInstance.findMany({
      where: {
        storeId: store.id,
        date: today
      },
      include: {
        template: true
      },
      orderBy: {
        template: {
          scheduledTime: 'asc'
        }
      }
    });

    return NextResponse.json({ tasks, store, serverTime: new Date().toISOString() });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
