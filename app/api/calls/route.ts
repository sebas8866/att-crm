import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const calls = await prisma.call.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { callId, notes, answeredBy } = await req.json();

    const updatedCall = await prisma.call.update({
      where: { id: callId },
      data: {
        notes,
        answeredBy,
      },
    });

    return NextResponse.json({ success: true, call: updatedCall });
  } catch (error) {
    console.error('Error updating call:', error);
    return NextResponse.json(
      { error: 'Failed to update call' },
      { status: 500 }
    );
  }
}
