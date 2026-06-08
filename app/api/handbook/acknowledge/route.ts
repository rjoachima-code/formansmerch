import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Capture server timestamp and IP Address
    const timestamp = new Date();
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown IP';

    // Generate an immutable cryptographic digital signature based on user identity, timing, and network source
    const dataToHash = `${userId}:${ipAddress}:${timestamp.toISOString()}`;
    const cryptographicHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // Store immutable record
    const signature = await prisma.handbookSignature.create({
      data: {
        userId,
        ipAddress,
        timestamp,
        cryptographicHash
      }
    });

    return NextResponse.json({ 
      success: true, 
      signatureId: signature.id, 
      hash: cryptographicHash,
      timestamp 
    });

  } catch (error: any) {
    console.error('Error recording handbook acknowledgment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
