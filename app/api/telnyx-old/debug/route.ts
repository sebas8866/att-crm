import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Check environment variables (safely)
  const checks = {
    hasTelnyxKey: !!process.env.TELNYX_API_KEY,
    telnyxKeyLength: process.env.TELNYX_API_KEY?.length || 0,
    telnyxNumber: process.env.TELNYX_PHONE_NUMBER || 'NOT SET',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
  }

  // Test Telnyx API directly
  let apiTest = { success: false, error: null as string | null }
  
  if (process.env.TELNYX_API_KEY) {
    try {
      const response = await fetch('https://api.telnyx.com/v2/available_phone_numbers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      
      apiTest.success = response.ok
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        apiTest.error = error.errors?.[0]?.detail || `HTTP ${response.status}`
      }
    } catch (e: any) {
      apiTest.error = e.message
    }
  }

  return NextResponse.json({
    environment: checks,
    apiConnection: apiTest,
    message: 'Check if API key is valid and has outbound permissions',
    timestamp: new Date().toISOString()
  })
}
