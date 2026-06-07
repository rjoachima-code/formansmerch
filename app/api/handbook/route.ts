import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const state = url.searchParams.get('state') || 'ALL';

    // Fetch modular sections that apply to the user's specific state or globally (ALL)
    const sections = await prisma.handbookSection.findMany({
      where: {
        OR: [
          { applicableStates: { has: state } },
          { applicableStates: { has: 'ALL' } }
        ]
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    return NextResponse.json({ sections });
  } catch (error: any) {
    console.error('Error fetching handbook sections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
