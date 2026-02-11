import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json({ 
    status: 'V2 test route working',
    ringcentral_configured: !!process.env.RINGCENTRAL_CLIENT_ID,
    timestamp: new Date().toISOString()
  });
}
