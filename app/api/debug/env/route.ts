import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    adminEmailSet: !!process.env.ADMIN_EMAIL,
    adminEmailValue: process.env.ADMIN_EMAIL,
    adminPasswordSet: !!process.env.ADMIN_PASSWORD,
    adminPasswordLength: process.env.ADMIN_PASSWORD?.length,
    databaseUrlSet: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
  })
}
