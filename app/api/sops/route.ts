import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    let sops;

    if (query && query.trim() !== '') {
      // Format query for PostgreSQL full-text search (joining words with & for AND condition)
      // Removes special characters that might break the tsquery syntax
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
      // Return all if no query
      sops = await prisma.storeSOP.findMany();
    }

    return NextResponse.json({ sops });
  } catch (error: any) {
    console.error('Error fetching SOPs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
