import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Simple test endpoint to verify Telnyx webhook is working
export async function POST(req: NextRequest) {
  console.log('=== TELNYX WEBHOOK DEBUG ===')
  
  try {
    // Log raw request info
    console.log('Headers:', Object.fromEntries(req.headers.entries()))
    
    // Try to parse body
    let body
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const text = await req.text()
      console.log('Raw body:', text)
      try {
        body = JSON.parse(text)
      } catch {
        body = { raw: text }
      }
    }
    
    console.log('Parsed body:', JSON.stringify(body, null, 2))
    
    // Return detailed response for debugging
    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      contentType,
      bodyReceived: !!body,
      eventType: body?.data?.event_type || 'unknown',
      hasFrom: !!body?.data?.payload?.from?.phone_number,
      hasText: !!body?.data?.payload?.text,
      message: 'Check Vercel logs for full payload'
    })
    
  } catch (error) {
    console.error('Debug webhook error:', error)
    return NextResponse.json({
      received: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Debug endpoint active',
    usage: 'POST Telnyx webhooks here to debug',
    endpoint: '/api/telnyx/webhook-debug',
    productionEndpoint: '/api/telnyx/webhook'
  })
}
