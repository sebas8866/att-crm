import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'Test webhook works!' });
}

export async function POST() {
  return NextResponse.json({ received: true });
}
