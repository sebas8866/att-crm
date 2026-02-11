import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Emergency migration endpoint - runs SQL to fix schema
export async function POST(req: NextRequest) {
  try {
    // Check for simple auth via header
    const authHeader = req.headers.get('x-migration-key')
    if (authHeader !== 'fix-schema-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Running emergency schema fix...')

    // Run raw SQL to add missing columns
    const results = []

    // Check if provider column exists
    try {
      await prisma.$executeRaw`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT 'telnyx'`
      results.push('Added provider column')
    } catch (e: any) {
      results.push(`Provider column: ${e.message}`)
    }

    // Check if external_id column exists
    try {
      await prisma.$executeRaw`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "external_id" TEXT`
      results.push('Added external_id column')
    } catch (e: any) {
      results.push(`External_id column: ${e.message}`)
    }

    // Try to rename twilio_sid if it exists
    try {
      await prisma.$executeRaw`ALTER TABLE "messages" RENAME COLUMN "twilio_sid" TO "external_id"`
      results.push('Renamed twilio_sid to external_id')
    } catch (e: any) {
      results.push(`Rename twilio_sid: ${e.message}`)
    }

    // Create index
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_messages_provider" ON "messages"("provider")`
      results.push('Created index on provider')
    } catch (e: any) {
      results.push(`Index: ${e.message}`)
    }

    console.log('Migration results:', results)

    return NextResponse.json({
      success: true,
      message: 'Schema migration attempted',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Migration endpoint ready',
    usage: 'POST with header x-migration-key: fix-schema-2025'
  })
}
