import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'Inbound SMS webhook active' });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ received: true, message: 'SMS processed' });
}
