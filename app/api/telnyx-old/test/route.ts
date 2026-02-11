import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Test endpoint to verify Telnyx webhook is reachable
export async function GET() {
  return NextResponse.json({
    status: 'Telnyx webhook endpoint is active',
    endpoint: '/api/telnyx/webhook',
    method: 'POST',
    expectedPayload: {
      data: {
        event_type: 'message.received',
        payload: {
          from: { phone_number: '+1234567890' },
          to: [{ phone_number: '+18128183171' }],
          text: 'Hello',
          id: 'msg_uuid'
        }
      }
    }
  })
}

// POST - Simple test that logs and returns success
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('=== TELNYX WEBHOOK TEST ===')
    console.log('Received:', JSON.stringify(body, null, 2))
    
    return NextResponse.json({ 
      received: true, 
      timestamp: new Date().toISOString(),
      message: 'Webhook is working! Check Vercel logs to see the payload.'
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json({ 
      received: true,
      error: 'Could not parse JSON, but webhook is reachable'
    })
  }
}
