import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.taskItem.findMany({
      include: {
        sop: true
      }
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
