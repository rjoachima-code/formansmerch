import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { filterSopsByDepartmentAccess } from '@/lib/departmentAccess';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const userId = url.searchParams.get('userId') || req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user context. Provide userId query param or x-user-id header.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, assignedDepartments: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    let sops;

    if (query && query.trim() !== '') {
      const sanitizedQuery = query.replace(/[^\w\s]/gi, '').trim();
      const formattedQuery = sanitizedQuery.split(/\s+/).join(' & ');

      if (formattedQuery) {
        sops = await prisma.storeSOP.findMany({
          where: {
            OR: [
              { title: { search: formattedQuery } },
              { description: { search: formattedQuery } },
              { content: { search: formattedQuery } }
            ]
          }
        });
      } else {
        sops = await prisma.storeSOP.findMany();
      }
    } else {
      sops = await prisma.storeSOP.findMany();
    }

    const authorizedSops = filterSopsByDepartmentAccess(sops, {
      assignedDepartments: user.assignedDepartments
    });

    return NextResponse.json({ sops: authorizedSops });
  } catch (error: any) {
    console.error('Error fetching SOPs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
